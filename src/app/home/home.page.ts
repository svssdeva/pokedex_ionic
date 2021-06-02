import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../services/api-service/api-service.service';
import {Router} from '@angular/router';
import {GlobalService} from '../services/global-service/global-service.service';
import {Subscription} from 'rxjs';
import {LoadingController, ModalController} from '@ionic/angular';
import {NetworkAlertModalComponent} from './network-alert-modal/network-alert-modal.component';
import {SearchDetailsModalComponent} from './search-details-modal/search-details-modal.component';
import {PokemonDetailModal} from '../details/details.page';
import {StorageService} from '../services/storage/storage.service';
import {lastValueFrom} from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  offset: number;
  limit: number;
  type: string;
  processing: boolean;
  pokemons: Array<PokemonListModal> = [];
  canPaginate: boolean;
  isNetworkConnected: boolean;
  networkSubscription: Subscription;
  cacheIndex = 0;

  constructor(private apiService: ApiService,
              private router: Router,
              private globalService: GlobalService,
              private modalController: ModalController,
              private loadingController: LoadingController,
              private storageService: StorageService) {
    this.offset = 0;
    this.limit = 20;
    this.type = 'pokemon';
   this.networkSubscription = this.globalService.getNetworkConnectionValue().subscribe(res => {
      this.isNetworkConnected = res;
      console.log(this.isNetworkConnected);
      if (this.isNetworkConnected === false) {
        this.openNetworkAlertModal();
      }
    });
  }
  async ngOnInit() {
    this.canPaginate = true;
    if (this.isNetworkConnected === true) {
      await this.getPokemons();
    } else {
      this.processing = true;
      const lastCachedIndex = await this.storageService.getItem('lastCachedIndex');
      console.log(lastCachedIndex);
      for(let i = this.cacheIndex; i < +lastCachedIndex; i++) {
        const data = await this.storageService.getItem(JSON.stringify(i));
        this.pokemons = [...this.pokemons, ...JSON.parse(data)];
      }
      this.processing = false;
      this.offset = this.pokemons.length - this.limit;
    }
  }
  async ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }
  async getPokemons() {
    if (this.isNetworkConnected === false) {
      await this.globalService.showMessage('toast', {message: `Pokedex can't fetch data while offline...`});
      return;
    }
    if (this.offset === 0) {
      this.processing = true;
    }
    const items: Array<PokemonListModal> = [];
    try {
      const res = await lastValueFrom(this.apiService.getPokemons(this.offset, this.limit, this.type));
      if (res.length < 20) {
        this.canPaginate = false;
      }
      res.forEach(data => {
        items.push(new PokemonListModal(data));
      });
      this.pokemons = [...this.pokemons, ...items];
    } catch (e) {
      console.log(e);
    } finally {
      this.processing = false;
      await this.storageService.setItem(JSON.stringify(this.cacheIndex), JSON.stringify(items));
      await this.storageService.setItem('lastCachedIndex', JSON.stringify(this.cacheIndex));
    }
  }
  loadMore(event) {
    if (event) {
      event.target.complete();
      if (this.canPaginate === true) {
        this.cacheIndex++;
        this.offset = this.offset + this.limit;
        this.getPokemons();
      } else {
        event.target.disabled = true;
      }
    }
  }
  async goToDetails(pokemon: PokemonListModal) {
   if (this.isNetworkConnected === true) {
     await this.router.navigate([`home/${pokemon.index}/details`, {name: pokemon.name}]);
   } else {
     await this.globalService.showMessage('toast', {message: `Can't find details. Please connect to internet first`});
   }
  }

  async searchPokemon(event) {
    const value = event.target.value.toLowerCase().trim();
    if (value === '') {
      await this.globalService.showMessage('toast', {message: `Please enter a name/id!!!`});
    } else {
      event.target.disabled = true;
      try {
        const res = await lastValueFrom(this.apiService.findPokemon(value));
        const pokemon = new PokemonDetailModal(res);
        if (pokemon?.name?.length > 0) {
          await this.openSearchedPokemonModal(pokemon , event);
        }
      } catch (e) {
        event.target.disabled = false;
        if (e && e?.error === 'Not Found') {
          await this.globalService.showMessage('alert', {message: `No Pokemon Found. Try something else ...`});
        }
      }
    }
  }
  async openSearchedPokemonModal(pokemon: PokemonDetailModal, event) {
    const modal = await this.modalController.create({
      component: SearchDetailsModalComponent,
      cssClass: 'search-modal',
      backdropDismiss: false,
      componentProps: {pokemon}
    });
    await modal.present();
    const { role ,data } = await modal.onDidDismiss();

    event.target.disabled = false;
    if (data && data?.data === 'showMore') {
      await this.router.navigate([`home/${pokemon.id}/details`, {name: pokemon.name}]);
    }
  }
  async openNetworkAlertModal() {
    const modal = await this.modalController.create({
      component: NetworkAlertModalComponent,
      cssClass: 'network-modal'
    });
    await modal.present();
    const { role ,data } = await modal.onDidDismiss();
    console.log(role, data);
  }
}

export class PokemonListModal {
  name: string;
  index: number;
  image: string;

  url: string;
  constructor(pokemon) {
    pokemon = pokemon || {};
    this.name = pokemon.name || '';
    this.image = pokemon.image || '';
    this.index = pokemon.index || 0;
    this.url = pokemon.url || '';
  }
}

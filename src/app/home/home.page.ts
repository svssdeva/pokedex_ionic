import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../services/api-service/api-service.service';
import {Router} from '@angular/router';
import {GlobalService} from '../services/global-service/global-service.service';
import {Subscription} from "rxjs";
import {ModalController} from "@ionic/angular";
import {NetworkAlertModalComponent} from "./network-alert-modal/network-alert-modal.component";

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
  constructor(private apiService: ApiService,
              private router: Router,
              private globalService: GlobalService,
              private modalController: ModalController) {
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
    await this.getPokemons();

  }
  async ngOnDestroy() {
    if (this.networkSubscription) {
      this.networkSubscription.unsubscribe();
    }
  }
  async getPokemons() {
    if (this.isNetworkConnected === false) {
      await this.globalService.showMessage('toast', {message: `Pokedex can't fetch data while offline...`});
      return ;
    }
    if (this.offset === 0) {
      this.processing = true;
    }
    try {
      const items: Array<PokemonListModal> = [];
      const res = await this.apiService.getPokemons(this.offset, this.limit, this.type).toPromise();
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
      console.log(this.pokemons);
    }
  }
  loadMore(event) {
    if (event) {
      event.target.complete();
      if (this.canPaginate === true) {
        this.offset = this.offset + this.limit;
        this.getPokemons();
      } else {
        event.target.disabled = true;
      }
    }
  }
  async goToDetails(pokemon: PokemonListModal) {
    await this.router.navigate([`home/${pokemon.index}/details`, {name: pokemon.name}]);
  }

  async searchPokemon(event) {
    const value = event.target.value.trim();
    if (value === '') {
      await this.globalService.showMessage('toast', {message: `Please enter a name!!!`});
    } else {
      try {
        const res = await this.apiService.findPokemon(value).toPromise();
        const pokemon = new PokemonListModal(res);
      } catch (e) {
      console.log(e);
      } finally {

      }
    }
  }
  async openNetworkAlertModal() {
    const modal = await this.modalController.create({
      component: NetworkAlertModalComponent,
      cssClass: 'network-modal',
    });
    await modal.present();
    const { role ,data } = await modal.onDidDismiss();
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

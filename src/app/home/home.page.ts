import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../services/api-service/api-service.service';
import {Router} from '@angular/router';
import {GlobalService} from '../services/global-service/global-service.service';

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

  constructor(private apiService: ApiService,
              private router: Router,
              private globalService: GlobalService) {
    this.offset = 0;
    this.limit = 20;
    this.type = 'pokemon';
  }
  async ngOnInit() {
    this.canPaginate = true;
    await this.getPokemons();

  }
  async ngOnDestroy() {

  }
  async getPokemons() {
    if (this.offset === 0) {
      this.processing = true;
    }
    try {
      const res = await this.apiService.getPokemons(this.offset, this.limit, this.type).toPromise();
      if (res.length < 20) {
        this.canPaginate = false;
      }
      const items: Array<PokemonListModal> = [];
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

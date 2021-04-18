import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, retry, map} from 'rxjs/operators';
import {handleError} from '../error-handler/error-handler.service';
import {Observable} from 'rxjs';
import {PokemonListModal} from '../../home/home.page';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string;
  private imageUrl: string;
  constructor(private httpClient: HttpClient) {
    this.baseUrl = 'https://pokeapi.co/api/v2';
    this.imageUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  }
  getPokemons(offset = 0, limit = 20, type = 'pokemon') {
    return this.httpClient.get(`${this.baseUrl}/${type}?offset=${offset}&limit=${limit}`).pipe(
      map(res => res['results']),
      map(pokemons => pokemons.map((poke, index) => {
          poke.index = offset + index + 1;
          poke.image = this.getPokeImage(poke.index);
          return poke;
        })), retry(1), catchError(handleError)
    );
  }

  getPokeImage(index: number) {
    return `${this.imageUrl}${index}.png`;
  }

  findPokemon(name: string) {
    return this.httpClient.get(`${this.baseUrl}/pokemon/${name}`).pipe(
      map(pokemon => {
        pokemon['index'] = pokemon['id'];
        pokemon['image'] = this.getPokeImage(pokemon['index']);
        return pokemon;
      })
    );
  }

  getDetails(index: number) {
    return this.httpClient.get(`${this.baseUrl}/pokemon/${index}`).pipe(
      map(poke => {
       const sprites = Object.keys(poke['sprites']);
       poke['images'] = sprites
         .map(spriteKey => poke['sprites'][spriteKey])
         .filter(img => img);
       return poke;
      })
    );
  }
}

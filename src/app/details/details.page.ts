import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../services/api-service/api-service.service';
import {NavController} from '@ionic/angular';
import {GlobalService} from '../services/global-service/global-service.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  index: number;
  name: string;
  pokemon: PokemonDetailModal;
  processing: boolean;
  showGif: boolean;
  activeType: string;
  slideOpts = {
    autoplay: {
      delay: 1200,
      disableOnInteraction: false
    }
  };
  constructor(private activatedRoute: ActivatedRoute,
              private apiService: ApiService,
              private navController: NavController,
              private globalService: GlobalService) {
    this.pokemon = new PokemonDetailModal({});
    this.activeType = '';
  }

  ngOnInit() {
    this.showGif = false;
    this.index = +this.activatedRoute.snapshot.paramMap.get('index') || 0;
    this.name = this.activatedRoute.snapshot.paramMap.get('name') || '';
    if (this.index === 0) {
      this.globalService.showMessage('toast', {message: `There was some issue with index`});
      this.navController.pop();
    } else {
        this.fetchDetails();
    }
  }
  async fetchDetails() {
    this.processing = true;
    try {
      const res = await this.apiService.getDetails(this.index).toPromise();
      console.log(res);
      this.pokemon = new PokemonDetailModal(res);
      if (this.pokemon.types.length > 0) {
        this.setActiveType(this.pokemon.types[0].type.name);
      }
    } catch (e) {
      console.log(e);
    } finally {
      this.processing = false;
      console.log(this.pokemon);
    }
  }
  setActiveType(name: string) {
    this.activeType = name;
  }
  toggleGif(event) {
    console.log(event);
    this.showGif = event.detail.checked;
  }
}

export class PokemonDetailModal {
  name: string;
  gifImage: string;

  baseExperience: number;
  height: number;
  weight: number;
  id: number;
  images: Array<string> = [];
  abilities: Array<AbilityModal> = [];
  types: Array<TypesModal> = [];
  species: {
    name: string;
    url: string;
  };
  stats: Array<StatsModal> = [];
  moves: Array<MoveModal> = [];
  constructor(pokemon) {
    pokemon = pokemon || {};
    this.name = pokemon.name || '';
    this.baseExperience = pokemon.base_experience || 0;
    this.height = pokemon.height || 0;
    this.weight = pokemon.weight || 0;
    this.id = pokemon.id || 0;
    this.species = pokemon.species || {};
    this.gifImage = `https://projectpokemon.org/images/normal-sprite/${this.name}.gif`;
    if (pokemon) {
      if (pokemon.images) {
        pokemon.images.forEach(item => {
          if (typeof item === 'string') {
            this.images.push(item);
          }
        });
      } else {
        this.images = [];
      }
      if (pokemon.abilities) {
        pokemon.abilities.forEach(item => {
          this.abilities.push(new AbilityModal(item));
        });
      } else {
        this.abilities = [];
      }
      if (pokemon.stats) {
        pokemon.stats.forEach(item => {
          this.stats.push(new StatsModal(item));
        });
      } else {
        this.stats = [];
      }
      if (pokemon.moves) {
        pokemon.moves.forEach(item => {
          this.moves.push(new MoveModal(item));
        });
      } else {
        this.moves = [];
      }
      if (pokemon.types) {
        pokemon.types.forEach(item => {
          this.types.push(new TypesModal(item));
        });
      } else {
        this.types = [];
      }
    } else {
      this.moves = [];
      this.stats = [];
      this.abilities = [];
      this.images = [];
      this.types = [];
    }
    this.images.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.id}.png`);
    // eslint-disable-next-line max-len
    this.images.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${this.id}.svg`);
  }
}

export class AbilityModal {
  ability: {
    name: string;
    url: string;
  };
  constructor(props) {
    props = props || {};
    this.ability = props.ability || {name: '', url: ''};
  }
}
export class TypesModal {
  type: {
    name: string;
    url: string;
  };
  constructor(props) {
    props = props || {};
    this.type = props.type || {name: '', url: ''};
  }
}

export class StatsModal {
  baseStat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
  constructor(props) {
    props = props || {};
    this.baseStat = props.base_stat || 0;
    this.effort = props.effort || 0;
    this.stat = props.stat || {name: '', url: ''};
  }
}
export class MoveModal {
  move: {
    name: string;
    url: string;
  };
  constructor(props) {
    props = props || {};
    this.move = props.move || {name: '', url: ''};
  }
}

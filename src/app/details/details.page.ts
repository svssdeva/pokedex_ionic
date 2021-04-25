import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../services/api-service/api-service.service';
import {NavController} from '@ionic/angular';
import {GlobalService} from '../services/global-service/global-service.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit, OnDestroy {
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
  speciesDetails: SpeciesModal;
  activeSegment: string;
  evolutionChain: ChainModal;
  constructor(private activatedRoute: ActivatedRoute,
              private apiService: ApiService,
              private navController: NavController,
              private globalService: GlobalService) {
    this.pokemon = new PokemonDetailModal({});
    this.speciesDetails = new SpeciesModal({});
    this.evolutionChain = new ChainModal({});
    this.activeType = '';
    this.activeSegment = 'stats';
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
      this.getSpecies();
    }
  }

  ngOnDestroy() {
    speechSynthesis.cancel();
  }

  async getSpecies() {
    try {
      const res = await this.apiService.getSpecies(this.name).toPromise();
      this.speciesDetails = new SpeciesModal(res);
      await this.getEvolutionDetails(this.speciesDetails.evolutionChainUrl);
    } catch (e) {
      console.log(e);
    } finally {
      if (this.speciesDetails.evolvesFrom.name.length > 0) {
        this.speciesDetails.evolvesFrom.gifImage = `https://projectpokemon.org/images/normal-sprite/${this.speciesDetails.evolvesFrom.name}.gif`;
      }
    }
  }
  async getEvolutionDetails(url: string) {
    if (url === '') {
      return ;
    }
    try {
      const res = await this.apiService.getEvolutionDetails(url).toPromise();
      if (res && res['chain']) {
        this.evolutionChain = new ChainModal(res['chain']);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  }
  async fetchDetails() {
    this.processing = true;
    try {
      const res = await this.apiService.getDetails(this.index).toPromise();
      this.pokemon = new PokemonDetailModal(res);
      if (this.pokemon.types.length > 0) {
        this.setActiveType(this.pokemon.types[0].type.name);
      }
    } catch (e) {
      console.log(e);
    } finally {
      this.processing = false;
    }
  }

  setActiveType(name: string) {
    this.activeType = name;
  }

  toggleGif(event) {

    this.showGif = event.detail.checked;
  }

  changeSegment(event) {
    this.activeSegment = event.detail.value;
  }

  returnDescription(flavorTextEntries: Array<FlavorTextEntries>) {
    const details = flavorTextEntries.filter(item => item.language === 'en' && (item.version === 'emerald' || item.version === 'heartgold')).map(item => item.flavorText);
    return [...new Set(details)].join(' ');
  }

  speakUp(data: string) {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const message = new SpeechSynthesisUtterance(data);
      message.rate = 1.3;
      message.volume = 10;
      message.lang = 'en-UK';
      speechSynthesis.speak(message);
    } else {
      this.globalService.showMessage('toast', {message: `Speak Up not Supported by your device`});
    }
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

export class SpeciesModal {
  flavorTextEntries: Array<FlavorTextEntries> = [];
  evolutionChainUrl: string;
  evolvesFrom: {
    name: string;
    url: string;
    gifImage: string;
  };
  isLegendary: boolean;
  isMythical: boolean;
  habitat: string;
  baseHappiness: number;
  captureRate: number;
  id: number;
  constructor(props) {
    props = props || {};
    if (props && props.flavor_text_entries && props.flavor_text_entries.length > 0) {
      props.flavor_text_entries.forEach(item => {
        this.flavorTextEntries.push(new FlavorTextEntries(item));
      });
    } else {
      this.flavorTextEntries = [];
    }
    this.evolutionChainUrl = props?.evolution_chain?.url;
    if (props && props.evolves_from_species) {
      this.evolvesFrom = props.evolves_from_species || {name:'',  url: '', gifImage: ''};
    } else {
      this.evolvesFrom = {name:'',  url: '', gifImage: ''};
    }
    this.isLegendary = props?.is_legendary || false;
    this.isMythical = props?.is_mythical || false;
    this.habitat = props?.habitat?.name || '';
    this.id = props?.id || 0;
    this.baseHappiness = props?.base_happiness || 0;
    this.captureRate = props?.capture_rate || 0;
  }
}

class FlavorTextEntries {
  flavorText: string;
  language: string;
  version: string;
  constructor(props) {
    props = props || {};
    this.flavorText = props?.flavor_text || '';
    this.language = props?.language?.name || '';
    this.version = props?.version?.name || '';
  }
}

class ChainModal {
  evolutionDetails: Array<any> = [];
  evolvesTo: Array<EvolveModal> = [];
  species: {
    name: string;
    url: string;
  };
  constructor(props) {
    props = props || {};
    this.evolutionDetails = props?.evolution_details || [];
    if (props && props.evolves_to && props.evolves_to.length > 0) {
      props.evolves_to.forEach(item => {
        this.evolvesTo.push(new EvolveModal(item));
      });
    }
    this.species = props?.species || {name:'',  url: ''};
  }
}

class EvolveModal {
  evolvesTo: Array<EvolveModal> = [];
  species: {
    name: string;
    url: string;
  };
  constructor(props) {
    props = props || {};
    if (props && props.evolves_to && props.evolves_to.length > 0) {
      props.evolves_to.forEach(item => {
        this.evolvesTo.push(new EvolveModal(item));
      });
    }
    this.species = props?.species || {name:'',  url: ''};
  }
}

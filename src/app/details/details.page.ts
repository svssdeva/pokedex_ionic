import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../services/api-service/api-service.service';
import {NavController, Platform} from '@ionic/angular';
import {GlobalService} from '../services/global-service/global-service.service';

import {HapticsService} from '../services/haptics/haptics.service';
import {Media} from '@ionic-native/media/ngx';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-details',
  templateUrl: 'details.page.html',
  styleUrls: ['details.page.scss'],
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
  currentMedia: any;
  cryUrl: string;
  platForm: any;
  constructor(private activatedRoute: ActivatedRoute,
              private apiService: ApiService,
              private navController: NavController,
              private globalService: GlobalService,
              private hapticService: HapticsService,
              private platform: Platform,
              private media: Media) {
    this.platForm = this.platform;
    this.pokemon = new PokemonDetailModal({});
    this.speciesDetails = new SpeciesModal({});
    this.evolutionChain = new ChainModal({});
    this.activeType = '';
    this.activeSegment = 'stats';
    this.index = +this.activatedRoute.snapshot.paramMap.get('index') || 0;
    this.name = this.activatedRoute.snapshot.paramMap.get('name') || '';
  }

  ngOnInit() {
    this.showGif = false;
    if (this.platform.is('android')) {
      this.cryUrl = `/android_asset/public/assets/cries/${this.index}.obb`;
    } else {
      this.cryUrl = `assets/cries/${this.index}.obb`;
    }
    this.currentMedia = this.media.create(this.cryUrl);
    if (this.index === 0) {
      this.globalService.showMessage('toast', {message: `There was some issue with index`});
      this.navController.pop();
    } else {
      this.fetchDetails();
      this.getSpecies();
    }
  }

  ngOnDestroy() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
  playAudio() {
    this.currentMedia.play();
  }
  async getSpecies() {
    try {
      const res = await this.apiService.getSpecies(this.name).toPromise();
      this.speciesDetails = new SpeciesModal(res);
      if (this.speciesDetails.evolvesFrom.name.length > 0) {
        await this.getEvolutionDetails(this.speciesDetails.evolutionChainUrl);
      }
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
    const details = flavorTextEntries.filter(item => item.language === 'en' && (item.version === 'emerald' || item.version === 'heartgold' || item.version === 'sword' || item.version === 'aplha-sapphire')).map(item => item.flavorText);
    return [...new Set(details)].join(' ');
  }
  returnAbilityDescription(flavorTextEntries: Array<FlavorTextEntries>) {
    const details = flavorTextEntries.filter(item => item.language === 'en' && (item.version === 'sword' || item.version === 'ultra-sun-ultra-moon')).map(item => item.flavorText);
    return [...new Set(details)].join(' ');
  }
  returnEffectDescription(effectEntry: Array<EffectEntryModal>) {
    const details = effectEntry.filter(item => item.language.name === 'en').map(item => item.effect);
    return [...new Set(details)].join(' ');
  }
  returnMoveEffectDescription(effectEntry: Array<EffectEntryModal>, effectChance: number) {
    const details = effectEntry.filter(item => item.language.name === 'en').map(item => item.effect);
    return [...new Set(details)].join(' ').replace('$effect_chance%', JSON.stringify(effectChance) + '%');
  }
  speakUp(data: string) {
    if ('speechSynthesis' in window) {
      if (this.platform.is('hybrid')) {
        this.hapticService.hapticsImpactLight();
      }
      speechSynthesis.cancel();
    const message = new SpeechSynthesisUtterance(data);
      message.volume = 10;
      message.lang = 'en-UK';
      speechSynthesis.speak(message);
    } else {
      if (this.platform.is('hybrid')) {
        this.hapticService.hapticsImpactMedium();
      }
      this.globalService.showMessage('toast', {message: `Speak Up not Supported by your device`});
    }
  }
  async sharePokemon() {
    if (this.platform.is('hybrid')) {
      await this.hapticService.hapticsImpactMedium();
    }
    await Share.share({
      title: this.pokemon.name,
      text: `Check out this pokemon.`,
      url: 'http://ionicframework.com/',
      dialogTitle: 'Share with fellow trainers...'
    });
  }
  async showMoves(move: MoveModal) {
    move.show = !move.show;
    if (move.show === true) {
      if (move.moveDetail) {
        await this.openMove(move);
      }
    }
  }
  async openMove(move: MoveModal) {
    move.processing = true;
    try {
      const res = await this.apiService.getMove(move.move.url).toPromise();
      move.moveDetail = new MoveDetailModal(res);
    } catch (e) {
      console.log(e);
    } finally {
      move.processing = false;
      console.log(move);
    }
  }
 async showAbility(ability: AbilityModal) {
    ability.show = !ability.show;
    if (ability.show === true) {
      if (ability.abilityDetail.effectEntries.length === 0 && ability.abilityDetail.flavorTextEntries.length === 0) {
       await this.openAbility(ability);
      }
    }
  }
  async openAbility(ability: AbilityModal) {
    ability.processing = true;
    try {
      const res = await this.apiService.getAbility(ability.ability.url).toPromise();
      const abilityDetail = new AbilityDetailModal(res);
      ability.abilityDetail = {...abilityDetail};
    } catch (e) {
      console.log(e);
    } finally {
      ability.processing = false;
    }
  }
  returnGenus(genera: Array<GenusModal>) {
    if (genera.length > 0) {
      return genera.filter(item => item.language.name === 'en')[0].genus;
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
  ability: NameUrlModal;
  show: boolean;
  processing: boolean;
  abilityDetail: AbilityDetailModal;
  constructor(props) {
    props = props || {};
    this.ability = new NameUrlModal(props.ability) || {name: '', url: ''};
    this.show = false;
    this.processing  = true;
    this.abilityDetail = new AbilityDetailModal({});
  }
}

export class TypesModal {
  type: NameUrlModal;

  constructor(props) {
    props = props || {};
    this.type = new NameUrlModal(props.type) || {name: '', url: ''};
  }
}

export class StatsModal {
  baseStat: number;
  effort: number;
  stat: NameUrlModal;

  constructor(props) {
    props = props || {};
    this.baseStat = props.base_stat || 0;
    this.effort = props.effort || 0;
    this.stat = new NameUrlModal(props.stat) || {name: '', url: ''};
  }
}

export class MoveModal {
  move: NameUrlModal;
  show: boolean;
  processing: boolean;
  moveDetail: MoveDetailModal;
  constructor(props) {
    props = props || {};
    this.move = new NameUrlModal(props.move) || {name: '', url: ''};
    this.show = false;
    this.processing  = true;
    this.moveDetail = new MoveDetailModal({});
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
  generation: NameUrlModal;
  growthRate: NameUrlModal;
  shape: NameUrlModal;
  genera: Array<GenusModal> = [];
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
    this.generation = new NameUrlModal(props?.generation) || {name: '', url: ''};
    this.growthRate = new NameUrlModal(props?.growth_rate) || new NameUrlModal({});
    this.shape = new NameUrlModal(props?.shape) || new NameUrlModal({});
    if (props && props.genera && props.genera.length > 0) {
      this.genera = [...props.genera.map(item => new GenusModal(item))];
    }
  }
}
class GenusModal {
 genus: string;
 language: NameUrlModal;
 constructor(props) {
   props = props || {};
   this.genus = props.genus || '';
   this.language = new NameUrlModal(props.language) || {name: '', url: ''};
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
    this.version = props?.version?.name ||  props?.version_group?.name || '';
  }
}

class ChainModal {
  evolutionDetails: Array<any> = [];
  evolvesTo: Array<EvolveModal> = [];
  species: NameUrlModal;
  constructor(props) {
    props = props || {};
    this.evolutionDetails = props?.evolution_details || [];
    if (props && props.evolves_to && props.evolves_to.length > 0) {
      props.evolves_to.forEach(item => {
        this.evolvesTo.push(new EvolveModal(item));
      });
    }
    this.species = new NameUrlModal(props?.species) || {name:'',  url: ''};
  }
}

class EvolveModal {
  evolvesTo: Array<EvolveModal> = [];
  species: NameUrlModal;
  constructor(props) {
    props = props || {};
    if (props && props.evolves_to && props.evolves_to.length > 0) {
      props.evolves_to.forEach(item => {
        this.evolvesTo.push(new EvolveModal(item));
      });
    }
    this.species = new NameUrlModal(props?.species) || {name:'',  url: ''};
  }
}

class NameUrlModal {
  name: string;
  url: string;
  constructor(props) {
    props = props || {};
    this.name = props.name || '';
    this.url = props.url || '';
  }
}


export class AbilityDetailModal {
  effectEntries: Array<EffectEntryModal> = [];
  flavorTextEntries: Array<FlavorTextEntries> = [];
  constructor(props) {
    props = props || {};
    if (props?.effect_entries?.length > 0) {
      props.effect_entries.forEach(item => {
        this.effectEntries.push(new EffectEntryModal(item));
      });
    }
    if (props && props.flavor_text_entries && props.flavor_text_entries.length > 0) {
      props.flavor_text_entries.forEach(item => {
        this.flavorTextEntries.push(new FlavorTextEntries(item));
      });
    } else {
      this.flavorTextEntries = [];
    }
  }
}
export class EffectEntryModal {
  effect: string;
  shortEffect: string;
  language: NameUrlModal;
  constructor(props) {
    props = props || {};
    this.effect = props.effect || '';
    this.shortEffect = props.short_effect || '';
    this.language = new NameUrlModal(props.language) || new NameUrlModal({});
  }
}



export class MoveDetailModal {
  accuracy: number;
  power: number;
  pp: number;
  priority: number;
  type: string;
  effectChance: number;
  effectEntries: Array<EffectEntryModal> = [];
  flavorTextEntries: Array<FlavorTextEntries> = [];
  constructor(props) {
    props = props || {};
    this.accuracy = props.accuracy || 0;
    this.power = props.power || 0;
    this.pp = props.pp || 0;
    this.priority = props.priority || 0;
    this.effectChance = props.effect_chance || 0;
    this.type = props?.type?.name || '';
    if (props?.effect_entries?.length > 0) {
      props.effect_entries.forEach(item => {
        this.effectEntries.push(new EffectEntryModal(item));
      });
    }
    if (props && props.flavor_text_entries && props.flavor_text_entries.length > 0) {
      props.flavor_text_entries.forEach(item => {
        this.flavorTextEntries.push(new FlavorTextEntries(item));
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {PokemonDetailModal} from '../../details/details.page';

@Component({
  selector: 'app-search-details-modal',
  templateUrl: './search-details-modal.component.html',
  styleUrls: ['./search-details-modal.component.scss'],
})
export class SearchDetailsModalComponent implements OnInit {
  pokemon: PokemonDetailModal;
  constructor(private modalController: ModalController,
              private navParams: NavParams) { }

  ngOnInit() {
    this.pokemon = this.navParams.get('pokemon');
    console.log(this.pokemon);
  }
  dismiss(data?) {
    this.modalController.dismiss(data);
  }
}

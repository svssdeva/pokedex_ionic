import { Injectable } from '@angular/core';
import {
  Plugins,
  HapticsImpactStyle
} from '@capacitor/core';

const { Haptics } = Plugins;

@Injectable()
export class HapticsService {

  constructor() { }
  hapticImpact(style = HapticsImpactStyle.Heavy) {
    Haptics.impact({
      style
    });
  }

  hapticImpactMedium() {
    this.hapticImpact(HapticsImpactStyle.Medium);
  }

  hapticImpactLight() {
    this.hapticImpact(HapticsImpactStyle.Light);
  }

  hapticVibrate() {
    Haptics.vibrate();
  }

  hapticSelectionStart() {
    Haptics.selectionStart();
  }

  hapticSelectionChanged() {
    Haptics.selectionChanged();
  }

  hapticSelectionEnd() {
    Haptics.selectionEnd();
  }
}

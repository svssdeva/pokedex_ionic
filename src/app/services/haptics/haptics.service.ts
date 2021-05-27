import { Injectable } from '@angular/core';
import { Haptics, HapticsImpactStyle } from '@capacitor/haptics';

@Injectable()
export class HapticsService {

  constructor() { }
  hapticsImpactMedium = async () => {
    await Haptics.impact({ style: HapticsImpactStyle.Medium });
  };

  hapticsImpactLight = async () => {
    await Haptics.impact({ style: HapticsImpactStyle.Light });
  };

  hapticsVibrate = async () => {
    await Haptics.vibrate();
  };

  hapticsSelectionStart = async () => {
    await Haptics.selectionStart();
  };

  hapticsSelectionChanged = async () => {
    await Haptics.selectionChanged();
  };

  hapticsSelectionEnd = async () => {
    await Haptics.selectionEnd();
  };
}

import { FormControl } from '@angular/forms';
import { BgType, ThemeColors } from './ui-config.model';

export interface ThemeConfigModel {
  sectionsBg: BgType;
  themeColor: ThemeColors;
  enableAnimations: boolean;
  autoPaste: boolean;
}

export interface ThemeConfigFormModel {
  sectionsBg: FormControl<BgType>;
  themeColor: FormControl<ThemeColors>;
  enableAnimations: FormControl<boolean>;
  autoPaste: FormControl<boolean>;
}

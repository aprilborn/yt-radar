import { FormControl } from '@angular/forms';
import { Nullable } from '../../shared/models';

export interface SettingsModel {
  id?: number;
  enabled: boolean;
  metubeUrl: Nullable<string>;
  webhookUrl: Nullable<string>;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface SettingsFormModel {
  metubeUrl: FormControl<string>;
  webhookUrl: FormControl<Nullable<string>>;
}

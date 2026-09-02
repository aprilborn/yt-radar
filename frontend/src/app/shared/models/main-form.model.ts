import { FormControl } from '@angular/forms';
import { AudioFormats, Codecs, VideoQuality, Types, VideoFormats, AudioQuality } from './subscription.model';

export interface ManualFormModel {
  url: FormControl<string>;
  quality: FormControl<VideoQuality | AudioQuality>;
  type: FormControl<Types>;
  format: FormControl<VideoFormats | AudioFormats>;
  codec: FormControl<Codecs>;
  ytdlpArgs: FormControl<string>;
  prefix: FormControl<string>;
  destinationFolder: FormControl<string>;
  clipStart: FormControl<string>;
  clipEnd: FormControl<string>;
  removeSponsor: FormControl<boolean>;
  splitChapters: FormControl<boolean>;
}

export interface ManualDownloadModel {
  url: string;
  quality: VideoQuality | AudioQuality;
  type: Types;
  format: VideoFormats | AudioFormats;
  codec: Codecs;
  ytdlpArgs: string;
  prefix: string;
  destinationFolder: string;
  clipStart: string;
  clipEnd: string;
  removeSponsor: boolean;
  splitChapters: boolean;
}

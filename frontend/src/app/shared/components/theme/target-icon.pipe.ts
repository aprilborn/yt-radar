import { Pipe, PipeTransform } from '@angular/core';
import { BgType, SectionIcon } from '../../models/ui-config.model';
import { SECTION_OPTIONS } from './theme.constants';

@Pipe({
  name: 'targetIcon',
  standalone: true,
})
export class TargetIconPipe implements PipeTransform {
  transform(value: BgType): SectionIcon {
    return SECTION_OPTIONS.find((option) => option.value === value) || null;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'array',
})
export class ArrayPipe implements PipeTransform {
  transform(_: number[], length: number, start: number = 0): number[] {
    return Array.from({ length }, (_, index) => start + index);
  }
}

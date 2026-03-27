import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'day',
  standalone: true,
})
export class DayPipe implements PipeTransform {
  static readonly MAX_DAYS_DIFF = 2;
  static readonly formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  transform(inputDate: Date | string, format: string = 'MMM dd'): string {
    if (!inputDate) return '';
    if (typeof inputDate === 'string') inputDate = new Date(inputDate);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfInput = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

    const diffInDays = Math.round((startOfInput.getTime() - startOfToday.getTime()) / 86400000);

    const rtf = DayPipe.formatter;

    const result = rtf.format(diffInDays, 'day');
    return diffInDays >= DayPipe.MAX_DAYS_DIFF || diffInDays <= -DayPipe.MAX_DAYS_DIFF
      ? formatDate(inputDate, format, 'en-US')
      : result.charAt(0).toUpperCase() + result.slice(1);
  }
}

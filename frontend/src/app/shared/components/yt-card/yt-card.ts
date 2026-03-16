import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'yt-card',
  imports: [],
  template: `
    <div
      #ytCard
      class="h-min w-[90%] mx-auto"
      [class.cursor-pointer]="!!url()?.length"
      (mousemove)="move($event)"
      (mouseleave)="reset()"
    >
      <div
        [style.transform]="'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)'"
        class="yt-card-content relative {{ customClass() }}"
        (click)="openUrl()"
      >
        <img
          [src]="imageUrl()"
          alt="Source image"
          class="h-[inherit]! object-contain!"
          onerror="this.src = 'https://mockimage.tw/photo/310x235/1f1f1f/ff8800/Video%20Thumbnail'"
        />

        <div class="shine-line" [style.left.px]="shineX" [style.top.px]="shineY" [class.visible]="isShineVisible"></div>
      </div>
    </div>
  `,
  styleUrl: './yt-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YtCard {
  imageUrl = input.required<string>();
  url = input.required<string>();
  customClass = input<string>('rounded-md overflow-hidden h-[inherit]');
  card = viewChild<ElementRef<HTMLDivElement>>('ytCard');

  rotateY = 0;
  rotateX = 0;
  shineX = 0;
  shineY = 0;
  isShineVisible = false;

  move({ clientX, clientY }: MouseEvent) {
    const rotateRange = 15;
    const { width, height, left, top } = this.card()?.nativeElement.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const percentX = deltaX / (width / 2);
    const percentY = deltaY / (height / 2);

    this.rotateY = percentX * rotateRange;
    this.rotateX = -percentY * rotateRange;

    this.shineX = clientX - left;
    this.shineY = clientY - top;
    this.isShineVisible = true;
  }

  reset() {
    this.rotateX = 0;
    this.rotateY = 0;
    this.isShineVisible = false;
  }

  openUrl() {
    window.open(this.url(), '_blank');
  }
}

import { Component, effect, ElementRef, input, OnInit, signal, viewChild } from '@angular/core';

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
        <img [src]="imageUrl()" alt="Source image" class="h-[inherit]! object-contain!" (error)="handleImageError()" />

        <div class="shine-line" [style.left.px]="shineX" [style.top.px]="shineY" [class.visible]="isShineVisible"></div>
      </div>
    </div>
  `,
  styleUrl: './yt-card.css',
})
export class YtCard implements OnInit {
  imageSourceUrl = input.required<string>();
  url = input.required<string>();
  imgSize = input<string>('250x250');
  mockMessage = input<string>('Image%20not%20found');
  customClass = input<string>('rounded-md overflow-hidden h-[inherit]');
  card = viewChild<ElementRef<HTMLDivElement>>('ytCard');

  imageUrl = signal<string>('');

  rotateY = 0;
  rotateX = 0;
  shineX = 0;
  shineY = 0;
  isShineVisible = false;

  constructor() {
    effect(() => {
      if (this.imageSourceUrl().length) {
        this.imageUrl.set(null);
        this.imageUrl.set(this.imageSourceUrl());
      }
    });
  }

  ngOnInit(): void {
    this.imageUrl.set(this.imageSourceUrl());
  }

  handleImageError() {
    // const message = this.imageUrl().includes('channel') ? 'Channel%20Avatar' : 'Video%20Thumbnail';
    this.imageUrl.set(`https://mockimage.tw/photo/${this.imgSize()}/1f1f1f/ff8800/${this.mockMessage()}`);
  }

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

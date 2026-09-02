import { BgAnimation } from './bg-animation.model';

/** Stars per section. They only twinkle, so they are cheap - density is free. */
const STAR_COUNT = 60;

/** Meteors are the moving part; two is enough for one to cross now and then. */
const METEOR_COUNT = 2;

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * The `stars` section background.
 *
 * Unlike [RainBgAnimation] and [SnowBgAnimation] nothing travels: the field
 * itself is still and only the brightness moves, so the stars are placed once
 * and left alone. The meteors are the exception - each one streaks across for a
 * moment and then idles for the rest of its cycle, and it is re-aimed on
 * `animationiteration`, which lands while it is faded out, so no two passes take
 * the same line.
 */
export class StarsBgAnimation implements BgAnimation {
  private readonly _layer: HTMLDivElement;

  constructor(private readonly _host: HTMLElement) {
    this._layer = document.createElement('div');
    this._layer.className = 'stars-bg-layer';
    this._layer.setAttribute('aria-hidden', 'true');

    this._layer.append(
      ...Array.from({ length: STAR_COUNT }, () => this._createStar()),
      ...Array.from({ length: METEOR_COUNT }, () => this._createMeteor()),
    );

    this._host.appendChild(this._layer);
  }

  destroy(): void {
    this._layer.remove();
  }

  private _createStar(): HTMLDivElement {
    const star = document.createElement('div');
    const size = randomInt(1, 3);

    star.className = 'stars-bg-star';
    star.style.top = `${randomInt(2, 98)}%`;
    star.style.left = `${randomInt(0, 100)}%`;
    star.style.width = star.style.height = `${size}px`;
    // The big ones are the near ones: brighter, and slower to pulse.
    star.style.setProperty('--stars-peak', `${randomInt(50, 70) + size * 10}%`);
    star.style.animationDuration = `${randomInt(15, 45) / 10}s`;
    star.style.animationDelay = `-${randomInt(0, 40) / 10}s`;

    return star;
  }

  private _createMeteor(): HTMLDivElement {
    const meteor = document.createElement('div');

    meteor.className = 'stars-bg-meteor';
    // A cycle is mostly waiting - the streak itself is the first fraction of it.
    meteor.style.animationDuration = `${randomInt(9, 16)}s`;
    meteor.style.animationDelay = `-${randomInt(0, 9)}s`;

    meteor.addEventListener('animationiteration', () => this._aimMeteor(meteor));
    this._aimMeteor(meteor);

    return meteor;
  }

  /** Meteors start high and to the left, since the keyframe carries them down-right. */
  private _aimMeteor(meteor: HTMLElement): void {
    meteor.style.top = `${randomInt(-5, 40)}%`;
    meteor.style.left = `${randomInt(-20, 40)}%`;
  }
}

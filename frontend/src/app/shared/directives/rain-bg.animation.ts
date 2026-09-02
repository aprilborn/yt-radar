import { BgAnimation } from './bg-animation.model';

/**
 * Drops per section. Low enough to stay cheap on a page with several sections,
 * high enough to read as rain - the drops are 1px wide, so density is what sells
 * it rather than size.
 */
const DROP_COUNT = 30;

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * The `rain` section background.
 *
 * Same shape as [FireBgAnimation]: one injected layer, all motion in CSS, and
 * the class itself only rolls per-drop variation. Nothing has to be re-rolled
 * over time here - every drop starts on a negative delay, so they are already
 * mid-fall and out of step when the section appears, and one 1px line looks
 * like any other once it wraps.
 */
export class RainBgAnimation implements BgAnimation {
  private readonly _layer: HTMLDivElement;

  constructor(private readonly _host: HTMLElement) {
    this._layer = document.createElement('div');
    this._layer.className = 'rain-bg-layer';
    this._layer.setAttribute('aria-hidden', 'true');

    this._layer.append(...Array.from({ length: DROP_COUNT }, () => this._createDrop()));

    this._host.appendChild(this._layer);
  }

  destroy(): void {
    this._layer.remove();
  }

  private _createDrop(): HTMLDivElement {
    const drop = document.createElement('div');
    const duration = randomInt(50, 110) / 100;

    drop.className = 'rain-bg-drop';
    // Percentages rather than the pixel columns of the original: a section is
    // whatever width the layout gives it, and the drops have to fill it.
    drop.style.left = `${randomInt(0, 100)}%`;
    // Shorter, fainter, slower drops read as further away.
    drop.style.height = `${randomInt(30, 90)}px`;
    drop.style.opacity = `${randomInt(25, 75) / 100}`;
    drop.style.animationDuration = `${duration}s`;
    // Negative, so the rain is already falling on the first frame instead of
    // arriving as one wave from the top edge.
    drop.style.animationDelay = `-${randomInt(0, Math.round(duration * 100)) / 100}s`;

    return drop;
  }
}

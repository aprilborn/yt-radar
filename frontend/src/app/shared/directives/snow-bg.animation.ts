import { BgAnimation } from './bg-animation.model';

/**
 * Flakes per section. Fewer than rain: a flake is a few pixels across rather
 * than a 1px line, so it takes far less of them to fill the section.
 */
const FLAKE_COUNT = 40;

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * The `snow` section background.
 *
 * Rain with two differences: a flake takes its time, and it drifts on the way
 * down. The drift is why each flake is a pair of elements - one transform
 * cannot both fall at a steady rate and sway back and forth, so the outer one
 * falls and the inner one sways inside it.
 *
 * As in [RainBgAnimation] the motion lives in the stylesheet and nothing is
 * re-rolled over time; the negative delays are what keep the flakes out of step.
 */
export class SnowBgAnimation implements BgAnimation {
  private readonly _layer: HTMLDivElement;

  constructor(private readonly _host: HTMLElement) {
    this._layer = document.createElement('div');
    this._layer.className = 'snow-bg-layer';
    this._layer.setAttribute('aria-hidden', 'true');

    this._layer.append(...Array.from({ length: FLAKE_COUNT }, () => this._createFlake()));

    this._host.appendChild(this._layer);
  }

  destroy(): void {
    this._layer.remove();
  }

  private _createFlake(): HTMLDivElement {
    const flake = document.createElement('div');
    const body = document.createElement('div');
    const size = randomInt(2, 6);
    // Big flakes are the near ones, so they fall faster and sway wider.
    const fall = randomInt(16 - size, 22 - size);
    const sway = randomInt(20, 40) / 10;

    flake.className = 'snow-bg-flake';
    flake.style.left = `${randomInt(0, 100)}%`;
    flake.style.animationDuration = `${fall}s`;
    // Negative, so the section is already snowing on the first frame instead of
    // filling from the top edge.
    flake.style.animationDelay = `-${randomInt(0, fall)}s`;

    body.className = 'snow-bg-flake-body';
    body.style.width = body.style.height = `${size}px`;
    body.style.opacity = `${randomInt(35, 90) / 100}`;
    body.style.setProperty('--snow-sway', `${size * randomInt(3, 6)}px`);
    body.style.animationDuration = `${sway}s`;
    body.style.animationDelay = `-${randomInt(0, Math.round(sway * 10)) / 10}s`;

    flake.appendChild(body);

    return flake;
  }
}

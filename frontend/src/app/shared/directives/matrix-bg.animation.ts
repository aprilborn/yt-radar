import { BgAnimation } from './bg-animation.model';

const KATAKANA =
  'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';

const ALPHABET = KATAKANA + LATIN + DIGITS;

/** Glyph box, in CSS pixels: one column is this wide, one step this tall. */
// const FONT_SIZE = window.innerWidth / 128;

/** ~20fps. rAF would run the rain far too fast to read. */
const FRAME_MS = 50;

/** How much of the previous frame is erased each step, i.e. how fast a trail fades. */
const TRAIL_FADE = 0.08;

/** Odds a column that has run off the bottom starts over on any given frame. */
const RESPAWN_CHANCE = 0.02;

/** How often the theme colour is re-read, in ms - the user can change it mid-run. */
const COLOR_POLL_MS = 1000;

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const randomGlyph = (): string => ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));

/** Half way to white - bright enough to read as the leading glyph, still tinted. */
const mixToWhite = (channel: number): number => Math.round(channel + (255 - channel) * 0.5);

/**
 * The `matrix` section background.
 *
 * The odd one out: [FireBgAnimation] and friends hand their particles to CSS,
 * but a glyph per column per frame is far more nodes than a section should
 * carry, so this one paints into a canvas of its own instead.
 *
 * Colour still comes from the theme - the canvas inherits `color` from
 * .matrix-bg-layer, which is where --rt-accent is picked up - and the canvas
 * itself stays transparent: trails are erased with `destination-out` rather
 * than painted over, so the section's own background shows through.
 */
export class MatrixBgAnimation implements BgAnimation {
  private readonly _layer: HTMLCanvasElement;
  private readonly _context: CanvasRenderingContext2D | null;
  private readonly _resizeObserver: ResizeObserver;

  /** Row each column has fallen to, in glyphs. Its length is the column count. */
  private _drops: number[] = [];

  /** The glyph currently at the head of each column, kept so it can be dimmed. */
  private _heads: string[] = [];

  /** How many glyphs fit top to bottom; a column past it has run off the edge. */
  private _rows = 0;

  private _frameId = 0;
  private _lastFrame = 0;
  private _lastColorRead = 0;

  private _glyphColor = 'rgb(0, 255, 70)';
  private _headColor = 'rgb(180, 255, 200)';
  private _fontSize = 0;

  constructor(private readonly _host: HTMLElement) {
    this._fontSize = Math.floor(this._host.clientWidth / 96);
    this._layer = document.createElement('canvas');
    this._layer.className = 'matrix-bg-layer';
    this._layer.setAttribute('aria-hidden', 'true');

    this._host.appendChild(this._layer);

    // Only once it is in the document does it have a size or an inherited colour.
    this._context = this._layer.getContext('2d');
    this._readColors();
    this._resize();

    // Sections are resizable, and a stale canvas would stretch rather than reflow.
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this._host);

    this._frameId = requestAnimationFrame((time) => this._draw(time));
  }

  destroy(): void {
    cancelAnimationFrame(this._frameId);
    this._resizeObserver.disconnect();
    this._layer.remove();
  }

  /**
   * Canvas takes colour strings, not custom properties, so the theme is read
   * off the element: `color` computes to an rgb() the canvas can parse
   * whatever --rt-accent was written as.
   */
  private _readColors(time = 0): void {
    this._lastColorRead = time;

    const color = getComputedStyle(this._layer).color;
    const [red, green, blue] = color.match(/[\d.]+/g)?.map(Number) ?? [];

    if (red === undefined || green === undefined || blue === undefined) return;

    this._glyphColor = `rgb(${red}, ${green}, ${blue})`;
    // The leading glyph is the freshly lit one, so it burns towards white.
    this._headColor = `rgb(${mixToWhite(red)}, ${mixToWhite(green)}, ${mixToWhite(blue)})`;
  }

  /**
   * Matches the backing store to the section. The canvas is sized in device
   * pixels and scaled back down, so glyphs stay sharp on retina displays.
   */
  private _resize(): void {
    const { clientWidth, clientHeight } = this._host;

    if (!this._context || clientWidth === 0 || clientHeight === 0) return;

    const ratio = window.devicePixelRatio || 1;

    this._layer.width = Math.round(clientWidth * ratio);
    this._layer.height = Math.round(clientHeight * ratio);

    this._context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this._context.font = `${this._fontSize}px monospace`;
    this._context.textBaseline = 'top';

    // Widening keeps the columns already falling and staggers the new ones in
    // above the fold; narrowing just drops the ones that no longer fit.
    const columns = Math.ceil(clientWidth / this._fontSize);

    this._rows = Math.ceil(clientHeight / this._fontSize);
    this._drops = Array.from({ length: columns }, (_, column) => this._drops[column] ?? randomInt(-this._rows, 0));
  }

  private _draw(time: number): void {
    this._frameId = requestAnimationFrame((next) => this._draw(next));

    if (!this._context || time - this._lastFrame < FRAME_MS) return;

    this._lastFrame = time;

    // The accent follows the theme, and switching it does not rebuild this class.
    if (time - this._lastColorRead > COLOR_POLL_MS) this._readColors(time);

    const context = this._context;

    // Thin what is already there instead of painting over it: the canvas has no
    // background of its own to fade towards.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = `rgba(0, 0, 0, ${TRAIL_FADE})`;
    context.fillRect(0, 0, this._layer.width, this._layer.height);
    context.restore();

    this._drops.forEach((row, column) => {
      // A column that has run off the bottom waits its turn to start again, so
      // the rain stays ragged rather than falling in lockstep.
      if (row > this._rows) {
        if (Math.random() < RESPAWN_CHANCE) this._drops[column] = 0;
        return;
      }

      this._drops[column] = row + 1;

      if (row < 0) return;

      const head = this._heads[column];

      // Repainting the glyph left behind in the body colour is what gives the
      // column its gradient: one bright glyph leading a trail that fades out.
      if (row > 0 && head) {
        context.fillStyle = this._glyphColor;
        context.fillText(head, column * this._fontSize, (row - 1) * this._fontSize);
      }

      this._heads[column] = randomGlyph();
      context.fillStyle = this._headColor;
      context.fillText(this._heads[column], column * this._fontSize, row * this._fontSize);
    });
  }
}

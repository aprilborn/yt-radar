export enum BgType {
  DOTTED = 'dotted',
  STRIPED = 'striped',
  GLASS = 'glass',
  GRADIENT = 'gradient',
  FIRE = 'fire',
  STARS = 'stars',
  SNOW = 'snow',
  RAIN = 'rain',
  MATRIX = 'matrix',
  NONE = 'none',
}

export enum ThemeColors {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange',
  PINK = 'pink',
}

export interface UiConfig {
  sectionsBg: BgType;
  themeColor: ThemeColors;
  enableAnimations: boolean;
  autoPaste: boolean;
}

export interface SectionIcon {
  svgIcon: string | null;
  fontIcon: string | null;
  color: string;
  label: string;
  value: BgType;
}

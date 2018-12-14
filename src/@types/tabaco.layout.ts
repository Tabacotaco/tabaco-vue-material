const mobileReg: RegExp = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;

export const isMobileLayout = (): boolean => {
  return mobileReg.test(navigator.userAgent || navigator.vendor);
};

// TODO: All color theme of Tabaco-Material
export enum Color {
  PRIMARY   = 'primary',
  INFO      = 'info',
  SUCCESS   = 'success',
  DANGER    = 'danger',
  WARNING   = 'warning',
  DARK      = 'dark',
  LIGHT     = 'light',
  SECONDARY = 'secondary'
};

// TODO: RWD Grid Column Options
export type SizeType = number | boolean;
export type TColumnSize = ColumnSize | undefined;

export class ColumnSize {
  constructor(private size: {
    def? : SizeType;
    sm?  : SizeType;
    md?  : SizeType;
    lg?  : SizeType;
    xl?  : SizeType;
  } = {def: 12}) {
    if (Object.keys(this.size).filter(type => this.getSizeValue(type) !== undefined).length === 0)
      this.size = {def: 12};
  }

  get columnCls(): string[] {
    return Object.keys(this.size).map(s => {
      const value  = this.getSizeValue(s);
      const column = 'def' === s ? '' : `-${s}`;

      return !value ? undefined : value === false ? `d${column}-none` : `col${column}-${value}`;
    }).filter(cls => 'string' === typeof cls) as string[];
  }

  private getSizeValue(size: string): SizeType | undefined {
    switch (size) {
    case 'def' : return this.size.def;
    case 'sm'  : return this.size.sm;
    case 'md'  : return this.size.md;
    case 'lg'  : return this.size.lg;
    case 'xl'  : return this.size.xl;
    default    :
      throw new Error(`Error size code: ${size}.`);
    }
  }
}
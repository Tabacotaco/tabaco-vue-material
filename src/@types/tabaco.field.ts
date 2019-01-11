import { Vue, Prop } from 'vue-property-decorator';
import moment, { Moment } from 'moment';
import Numeral from 'numeral';

import { Color, SizeType, getThemeColor } from '@/@types/tabaco.layout';


type DisplayFormat<T> = ((value: T) => string);
type Validation<T> = ((value: T) => string | void);
type EmptyValue<ValueType> = ValueType | null;
type RequestPromise<M> = (paramValues: string[]) => Promise<M[]>;
type HoverAt = number | null;

enum ArrowCode { LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40 }
enum CarlendarDateArrow { LEFT = -1, UP = -7, RIGHT = 1, DOWN = 7 }
enum CarlendarYmArrow { LEFT = -1, UP = -4, RIGHT = 1, DOWN = 4 }
enum CarlendarDisplay { YEAR, MONTH, DATE }

interface ICarlendarMenu {
  hoverAt   : number;
  selected? : string;
}

interface IGroupOptions<T> {
  disabled?    : boolean;    color?  : Color;               def? : SizeType;
  required?    : boolean;    label?  : string;              sm?  : SizeType;
  mainClass?   : string;     empty?  : () => boolean;       md?  : SizeType;
  dispClass?   : string;     valid?  : Validation<T>;       lg?  : SizeType;
  dispHeight?  : number;     format? : DisplayFormat<T>;    xl?  : SizeType;
  dispScrlTop? : number;
};

abstract class TabacoFieldVue extends Vue {
  @Prop() def? : SizeType;
  @Prop() sm?  : SizeType;
  @Prop() md?  : SizeType;
  @Prop() lg?  : SizeType;
  @Prop() xl?  : SizeType;

  @Prop() color?: Color;

  @Prop() label?: string;
  @Prop() required?: boolean;
  @Prop() disabled?: boolean;
  @Prop() format?: DisplayFormat<any>;
  @Prop() valid?: Validation<any>;

  abstract isEmpty(): boolean;

  get themeColor(): string {
    return getThemeColor(this.color);
  }

  get isDisabled(): boolean {
    return this.disabled === true;
  }

  getGroupOpts(specifyOpts?: IGroupOptions<any>): IGroupOptions<any> {
    const {
      def, sm, md, lg, xl, color, label, disabled, required, isEmpty,
      format = ((v: any) => v as string),
      valid  = ((v: any) => {})
    } = this;

    return {
      def, sm, md, lg, xl, color, label, disabled, required, format, valid, empty: isEmpty,
      ...(specifyOpts ? specifyOpts : {})
    };
  }
}

class CarlendarRemote {
  private static DefaultFormat = 'YYYYMMDD';
  private static YearPageSize  = 20;

  private dscode: CarlendarDisplay = CarlendarDisplay.DATE;
  private selecting = false;
  private temp?: Moment;
  private selected!: string;

  constructor(
    private hover: Moment = moment.utc(),
    private refreshFn: (res: ICarlendarMenu) => void
  ) {
    if (!this.hover.isValid())
      this.hover = moment.utc();
    else
      this.selected = this.hover.format(CarlendarRemote.DefaultFormat);

    this.refreshFn({hoverAt: this.hoverID});
  }

  get year()      : number { return parseFloat(this.hover.format('YYYY' )); }
  get month()     : number { return parseFloat(this.hover.format('MM'   )); }
  get date()      : number { return parseFloat(this.hover.format('DD'   )); }
  get startYear() : number { return Math.floor((this.year - 1) / CarlendarRemote.YearPageSize) * CarlendarRemote.YearPageSize + 1; }

  get display(): CarlendarDisplay { return this.dscode; }
  get showWeekHeader(): boolean { return CarlendarDisplay.DATE === this.dscode; }
  get textAlign(): string[] { return [CarlendarDisplay.DATE === this.dscode ? 'text-right' : 'text-center']; }
  get switcherIcon(): string { return CarlendarDisplay.DATE === this.dscode ? 'fa-caret-down' : 'fa-caret-up'; }
  get switcherLabel(): string {
    switch (this.dscode) {
      case CarlendarDisplay.DATE  : return this.hover.format('MMM YYYY' );
      case CarlendarDisplay.MONTH : return this.hover.format('YYYY'     );
      case CarlendarDisplay.YEAR  : return `${this.startYear} - ${this.startYear + CarlendarRemote.YearPageSize - 1}`;
    }
  }

  get arrowOptions(): ({
    up   : () => void; down  : () => void; confirm: () => void;
    left : () => void; right : () => void;
  }) {
    return {
      up      : () => this.asArrow('UP'    ),
      down    : () => this.asArrow('DOWN'  ),
      left    : () => this.asArrow('LEFT'  ),
      right   : () => this.asArrow('RIGHT' ),
      confirm : () => this.asSelected(this.hoverID)
    };
  }

  get selectedID(): number {
    return parseFloat(this.selected);
  }

  get hoverID(): number {
    switch (this.dscode) {
      case CarlendarDisplay.YEAR  : return this.year;
      case CarlendarDisplay.MONTH : return parseFloat(this.hover.format('YYYYMM'));
      case CarlendarDisplay.DATE  : return parseFloat(this.hover.format(CarlendarRemote.DefaultFormat));
    }
  }


  asSwitch(): void {
    switch (this.dscode) {
      case CarlendarDisplay.DATE:
        this.temp   = moment(this.hover);
        this.dscode = CarlendarDisplay.YEAR;
        break;
      default:
        this.dscode    = CarlendarDisplay.DATE;
        this.hover     = moment(this.temp);
        this.selecting = true;
    }
    this.refreshFn({hoverAt: this.hoverID});
  }

  asPaging(kind: 'next' | 'prev'): void {
    switch (this.dscode) {
      case CarlendarDisplay.DATE  : this.hover.add(1 * ('next' === kind ? 1 : -1), 'month' ); break;
      case CarlendarDisplay.MONTH : this.hover.add(1 * ('next' === kind ? 1 : -1), 'year'  ); break;
      case CarlendarDisplay.YEAR  : this.hover.add(CarlendarRemote.YearPageSize * ('next' === kind ? 1 : -1), 'year');
    }
    this.selecting = true;
    this.refreshFn({hoverAt: this.hoverID});
  }

  asHover(newID: number, slient: boolean = false): void {
    let hoverDate: string = '';

    switch (this.dscode) {
      case CarlendarDisplay.DATE  : hoverDate = `${Numeral(newID).format('00000000')}`; break;
      case CarlendarDisplay.MONTH : hoverDate = `${Numeral(newID).format('000000')}01`; break;
      case CarlendarDisplay.YEAR  : hoverDate = `${Numeral(newID).format('0000')}0101`;
    }
    this.hover     = moment.utc(hoverDate, CarlendarRemote.DefaultFormat);
    this.selecting = true;
    
    if (slient !== true) this.refreshFn({hoverAt: this.hoverID});
  }

  asSelected(targetID: number): void {
    this.asHover(targetID, true);

    switch (this.dscode) {
      case CarlendarDisplay.YEAR:
        this.dscode = CarlendarDisplay.MONTH;
        this.refreshFn({hoverAt: this.hoverID});

        break;
      case CarlendarDisplay.MONTH:
        this.dscode = CarlendarDisplay.DATE;
        this.refreshFn({hoverAt: this.hoverID});

        break;
      case CarlendarDisplay.DATE:
        this.selected = this.hover.format(CarlendarRemote.DefaultFormat);
        this.hover    = moment.invalid();

        this.refreshFn({hoverAt: this.hoverID, selected: this.selected});
    }
  }

  getItemClass(itemID: number, hoverAt: number | null): ({hover: boolean; active: boolean}) {
    return {
      hover  : (this.selecting || isNaN(this.selectedID) || CarlendarDisplay.DATE !== this.dscode) && hoverAt === itemID,
      active : this.selectedID === itemID
    };
  }

  getCarlendars(): EmptyValue<{id: number; text: number | string;}>[][] {
    switch (this.dscode) {
      case CarlendarDisplay.DATE  : return this.generateCarlendarDate();
      case CarlendarDisplay.MONTH : return this.generateCarlendarMonth();
      case CarlendarDisplay.YEAR  : return this.generateCarlendarYear();
    }
  }


  private asArrow(arrowKey: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): void {
    switch (this.dscode) {
      case CarlendarDisplay.MONTH : this.hover.add(CarlendarYmArrow[arrowKey]   , 'month' );   break;
      case CarlendarDisplay.YEAR  : this.hover.add(CarlendarYmArrow[arrowKey]   , 'year'  );   break;
      case CarlendarDisplay.DATE  : this.hover.add(CarlendarDateArrow[arrowKey] , 'day'   );
    }
    this.selecting = true;
    this.refreshFn({hoverAt: this.hoverID});
  }

  private generateCarlendarDate(): EmptyValue<{id: number; text: number | string;}>[][] {
    const result: EmptyValue<{id: number; text: number | string;}>[][] = [];
    const cnt = moment(this.hover).daysInMonth();
    const sd  = moment(this.hover).startOf('month');

    for (let di = 1; di <= cnt; ) {
      const week: EmptyValue<{id: number; text: number;}>[] = [null, null, null, null, null, null, null];

      for (let wi = sd.isoWeekday() % 7; wi < 7 && di <= cnt; sd.add(1, 'day')) week[wi++] = {
        id   : parseFloat(sd.format(CarlendarRemote.DefaultFormat)),
        text : di++
      };
      result.push(week);
    }
    return result;
  }

  private generateCarlendarMonth(): EmptyValue<{id: number; text: number | string;}>[][] {
    const result: EmptyValue<{id: number; text: number | string;}>[][] = [];
    const curr = moment(`${this.hover.format('YYYY')}0101`, CarlendarRemote.DefaultFormat);

    for (let mi = 0; mi < 12; ) {
      const line: EmptyValue<{id: number; text: string;}>[] = [null, null, null, null];

      for (let i = 0; i < line.length; i++, mi++, curr.add(1, 'month')) line[i] = {
        id   : parseFloat(curr.format('YYYYMM')),
        text : curr.format('MMM')
      };
      result.push(line);
    }
    return result;
  }

  private generateCarlendarYear(): EmptyValue<{id: number; text: number | string;}>[][] {
    const result: EmptyValue<{id: number; text: number | string;}>[][] = [];
    let   startY = this.startYear;
    const maxY   = startY + CarlendarRemote.YearPageSize;
    
    while (startY < maxY) {
      const line: EmptyValue<{id: number; text: number;}>[] = [null, null, null, null];

      for (let i = 0; i < line.length; i++) line[i] = {
        id   : startY,
        text : startY++
      };
      result.push(line);
    }
    return result;
  }
}


export {
  ArrowCode,
  DisplayFormat,
  Validation,
  EmptyValue,
  RequestPromise,
  HoverAt,
  ICarlendarMenu,
  IGroupOptions,
  CarlendarRemote
};
export default TabacoFieldVue;
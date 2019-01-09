import { Vue, Prop } from 'vue-property-decorator';
import moment, { Moment, unitOfTime } from 'moment';
import Numeral from 'numeral';

import { Color, SizeType, getColorCode } from '@/@types/tabaco.layout';


type DisplayFormat<T> = ((value: T) => string);
type Validation<T> = ((value: T) => string | void);
type EmptyValue<ValueType> = ValueType | null;
type RequestPromise<M> = (paramValues: string[]) => Promise<M[]>;
type HoverAt = number | null;

enum ArrowCode { LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40 }
enum CarlendarDisplay { YEAR, MONTH, DATE }

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

  get colorCode(): string {
    return getColorCode(this.color);
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

class FocusMoment {
  static dateFormat  = 'YYYYMMDD';

  private dscode: CarlendarDisplay = CarlendarDisplay.DATE;
  readonly yearsCount = 20;

  constructor(private value: Moment = moment.utc()) {
    if (!this.value.isValid())
      this.value = moment.utc();
  }

  get year()      : number { return parseFloat(this.value.format('YYYY')); }
  get month()     : number { return parseFloat(this.value.format('MM')); }
  get date()      : number { return parseFloat(this.value.format('DD')); }
  get startYear() : number { return Math.floor((this.year - 1) / this.yearsCount) * this.yearsCount + 1; }

  get id(): number {
    switch (this.dscode) {
    case CarlendarDisplay.MONTH : return parseFloat(this.value.format('YYYYMM'));
    case CarlendarDisplay.YEAR  : return this.year;
    default: return parseFloat(this.value.format(FocusMoment.dateFormat));
    }
  }

  get display(): CarlendarDisplay { return this.dscode; }
  get switcherIcon(): string { return CarlendarDisplay.DATE === this.dscode ? 'fa-caret-down' : 'fa-caret-up'; }
  get switcherLabel(): string {
    switch (this.dscode) {
    case CarlendarDisplay.DATE  : return this.value.format('MMM YYYY');
    case CarlendarDisplay.MONTH : return this.value.format('YYYY');
    case CarlendarDisplay.YEAR  : return `${this.startYear} - ${this.startYear + this.yearsCount - 1}`;
    default: return '';
    }
  }

  add(unit: unitOfTime.DurationConstructor, days: number): number {
    this.value.add(unit, days);

    return this.id;
  }

  switchDisplay(): Promise<{display: CarlendarDisplay; id: number;}> {
    return new Promise<{display: CarlendarDisplay; id: number;}>(resolve => {
      switch (this.dscode) {
      case CarlendarDisplay.DATE:
        this.dscode = CarlendarDisplay.YEAR;
        break;
      default:
        this.dscode = CarlendarDisplay.DATE;
      }
      resolve({display: this.dscode, id: this.id});
    });
  }

  years(): EmptyValue<{id: number; year: number;}>[][] {
    const result: EmptyValue<{id: number; year: number;}>[][] = [];
    let startYear = this.startYear;
    const maxYear = startYear + this.yearsCount;
    
    while (startYear < maxYear) {
      const line: EmptyValue<{id: number; year: number;}>[] = [null, null, null, null];

      for (let i = 0; i < line.length; i++) line[i] = {
        id   : startYear,
        year : startYear++
      };
      result.push(line);
    }
    return result;
  }

  carlendars(): EmptyValue<{id: number; date: number;}>[][] {
    const result: EmptyValue<{id: number; date: number;}>[][] = [];
    const cnt = moment(this.value).daysInMonth();
    const sd  = moment(this.value).startOf('month');

    for (let di = 1; di <= cnt; ) {
      const week: EmptyValue<{id: number; date: number;}>[] = [null, null, null, null, null, null, null];

      for (let wi = sd.isoWeekday() % 7; wi < 7 && di <= cnt; sd.add('day', 1)) week[wi++] = {
        id   : parseFloat(sd.format(FocusMoment.dateFormat)),
        date : di++
      };
      result.push(week);
    }
    return result;
  }
}


export {
  ArrowCode,
  CarlendarDisplay,
  DisplayFormat,
  Validation,
  EmptyValue,
  RequestPromise,
  HoverAt,
  IGroupOptions,
  FocusMoment
};
export default TabacoFieldVue;
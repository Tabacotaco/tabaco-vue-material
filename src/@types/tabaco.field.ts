import { Vue, Prop } from 'vue-property-decorator';
import moment, { Moment } from 'moment';

import { Color, SizeType, getColorCode } from '@/@types/tabaco.layout';


type DisplayFormat<T> = ((value: T) => string);
type Validation<T> = ((value: T) => string | void);
type EmptyValue<ValueType> = ValueType | null;
type RequestPromise<M> = (paramValues: string[]) => Promise<M[]>;
type ArrowEvent = () => void;
type HoverAt = number | null;

enum ArrowCode {
  LEFT  = 37,
  UP    = 38,
  RIGHT = 39,
  DOWN  = 40
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
  static monthFormat = 'YYYYMM';

  constructor(private value: Moment = moment.utc()) {
    if (!this.value.isValid())
      this.value = moment.utc();
  }

  get year(): number { return this.getYear(this.value); }
  get month(): number { return this.getMonth(this.value); }
  get date(): number { return this.getDate(this.value); }

  get monthFormat(): string { return this.value.format(FocusMoment.monthFormat); }

  get datesInWeek(): EmptyValue<number>[][] {
    const result: EmptyValue<number>[][] = [];

    for (
      let weekIndex = moment(this.value).startOf('month').isoWeek(), date = moment().day('Sunday').week(weekIndex);
      this.getMonth(date) <= this.month && this.getYear(date) === this.year;
      weekIndex++, date = moment().day('Sunday').week(weekIndex)
    ) {
      const week: EmptyValue<number>[] = [];

      for (let i = 0; i < 7; i++, date.add('day', 1))
        week.push(this.getYear(date) === this.year && this.getMonth(date) === this.month ? this.getDate(date) : null);

      result.push(week);
    }
    return result;
  }

  add(days: number): number {
    this.value.add('day', days);

    return this.date;
  }

  private getYear  (m: Moment): number { return parseFloat(m.format('YYYY')); }
  private getMonth (m: Moment): number { return parseFloat(m.format('MM')); }
  private getDate  (m: Moment): number { return parseFloat(m.format('DD')); }
}

class ArrowHover {

  constructor(private e: {
    up    : ArrowEvent;
    down  : ArrowEvent;
    left  : ArrowEvent;
    right : ArrowEvent;
  }) {}

  get(arrow: ArrowCode): ArrowEvent {
    const { up, down, left, right } = this.e;
    const emptyFn: ArrowEvent = () => {};

    switch (arrow) {
    case ArrowCode.UP    : return up    instanceof Function ? up   : emptyFn;
    case ArrowCode.DOWN  : return down  instanceof Function ? down : emptyFn;
    case ArrowCode.LEFT  : return left  instanceof Function ? left : emptyFn;
    case ArrowCode.RIGHT : return right instanceof Function ? right : emptyFn;
    }
  }
}

export {
  ArrowCode,
  DisplayFormat,
  Validation,
  EmptyValue,
  RequestPromise,
  HoverAt,
  IGroupOptions,
  FocusMoment
};
export default TabacoFieldVue;
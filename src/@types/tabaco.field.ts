import { Vue, Prop } from 'vue-property-decorator';
import moment, { Moment, unitOfTime } from 'moment';

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
  get id(): number { return parseFloat(this.value.format(FocusMoment.dateFormat)); }

  get monthFormat(): string { return this.value.format(FocusMoment.monthFormat); }

  add(unit: unitOfTime.DurationConstructor, days: number): number {
    this.value.add(unit, days);

    return this.id;
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

  private getYear  (m: Moment): number { return parseFloat(m.format('YYYY')); }
  private getMonth (m: Moment): number { return parseFloat(m.format('MM')); }
  private getDate  (m: Moment): number { return parseFloat(m.format('DD')); }
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
import { Vue, Prop } from 'vue-property-decorator';
import moment, { Moment } from 'moment';

import { Color, SizeType, getColorCode } from '@/@types/tabaco.layout';


type FormatType<T> = ((value: T) => string);
type ValidType<T> = ((value: T) => string | void);
type OptionValueType<ValueType> = ValueType | null;
type RequestType<M> = (paramValues: string[]) => Promise<M[]>;
type HoverCtrlType = number | null;

interface IGroupOptions<T> {
  color?         : Color;            def?   : SizeType;
  disabled?      : boolean;          sm?    : SizeType;
  label?         : string;           md?    : SizeType;
  required?      : boolean;          lg?    : SizeType;
  format?        : FormatType<T>;    xl?    : SizeType;
  mainClass?     : string;           empty? : () => boolean;
  displayClass?  : string;           valid? : ValidType<T>;
  displayHeight? : number;
  displayScrollTop? : number;
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
  @Prop() format?: FormatType<any>;
  @Prop() valid?: ValidType<any>;

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

  constructor(private value: Moment = moment.utc()) {}

  get fmWeek(): number { return moment(this.value).startOf('month').isoWeek(); }
  get toWeek(): number { return moment(this.value).endOf('month').isoWeek(); }
  get weekCount(): number { return this.toWeek - this.fmWeek + 1; }

  get year(): number { return this.getYear(this.value); }
  get month(): number { return this.getMonth(this.value); }
  get date(): number { return this.getDate(this.value); }

  get monthFormat(): string { return this.value.format(FocusMoment.monthFormat); }

  getDatesByWeekIndex(index: number): OptionValueType<number>[] {
    const result: OptionValueType<number>[] = [];
    const date = moment().day('Sunday').week(this.fmWeek + index);

    for (let i = 0; i < 7; i++, date.add('day', 1)) {
      result.push(this.getYear(date) === this.year && this.getMonth(date) === this.month ? this.getDate(date) : null);
    }
    return result;
  }

  private getYear  (m: Moment): number { return parseFloat(m.format('YYYY')); }
  private getMonth (m: Moment): number { return parseFloat(m.format('MM')); }
  private getDate  (m: Moment): number { return parseFloat(m.format('DD')); }
}

export {
  FormatType,
  ValidType,
  OptionValueType,
  RequestType,
  HoverCtrlType,
  IGroupOptions,
  FocusMoment
};
export default TabacoFieldVue;
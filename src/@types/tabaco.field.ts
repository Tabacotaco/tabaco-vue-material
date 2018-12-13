import { Vue, Prop } from 'vue-property-decorator';
import { Color, SizeType } from '@/@types/tabaco.layout';


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

  abstract isEmpty(): boolean;

  get colorCode(): string {
    return 'string' === typeof this.color && this.color.trim().length > 0? this.color : Color.PRIMARY;
  }

  get isDisabled(): boolean {
    return this.disabled === true;
  }
}

export default TabacoFieldVue;

export type FormatType<T> = ((value: T) => string);
export type OptionValueType<ValueType> = ValueType | null;
export type RequestType<M> = (paramValues: string[]) => Promise<M[]>;
export type HoverCtrlType = number | null;

export interface IGroupOptions<T> {
  def? : SizeType;    color?    : Color;
  sm?  : SizeType;    disabled? : boolean;
  md?  : SizeType;    label?    : string;
  lg?  : SizeType;    required? : boolean;
  xl?  : SizeType;    format?   : FormatType<T>;
};
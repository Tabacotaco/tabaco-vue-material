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
  @Prop() valid?: ValidType<any>;

  abstract isEmpty(): boolean;

  get colorCode(): string {
    return 'string' === typeof this.color && this.color.trim().length > 0? this.color : Color.PRIMARY;
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

export default TabacoFieldVue;

export type FormatType<T> = ((value: T) => string);
export type ValidType<T> = ((value: T) => string | void);
export type OptionValueType<ValueType> = ValueType | null;
export type RequestType<M> = (paramValues: string[]) => Promise<M[]>;
export type HoverCtrlType = number | null;

export interface IGroupOptions<T> {
  color?         : Color;            def?   : SizeType;
  disabled?      : boolean;          sm?    : SizeType;
  label?         : string;           md?    : SizeType;
  required?      : boolean;          lg?    : SizeType;
  format?        : FormatType<T>;    xl?    : SizeType;
  mainClass?     : string;           empty? : () => boolean;
  displayHeight? : number;           valid? : ValidType<T>;
};
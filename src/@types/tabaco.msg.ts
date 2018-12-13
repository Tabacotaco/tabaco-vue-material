import { Vue, Component, Prop } from 'vue-property-decorator';
import { ComponentOptions, DirectiveOptions, VNodeDirective, DirectiveFunction } from 'vue';

import { Color } from '@/@types/tabaco.layout';
import DialogContent from '@/@components/msg/DialogContent.vue';


enum MessageClass {
  SNACKBAR = 'tabaco-snackbar',
  DIALOG   = 'tabaco-dialog'
}

export enum ButtonType { CONFIRM, CANCEL }

export enum SnackbarPosition { TOP, TOP_LEFT, TOP_RIGHT, BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT }

type ConvertBtns = IButtonOpts[] | undefined;

type DialogContentType = Vue | Element | Vue[] | Element[];

type MessageResult = ButtonType | boolean | void;

interface IButtonOpts { type: ButtonType; text?: string; icon?: string; }

class LongPromise<T> {
  private param?: T;
  private thens: ((btn: T) => T)[] = [];
  private finallyFn: ((param: T) => void) = (param: T) => {};

  then(fn: ((param: T) => T)): LongPromise<T> {
    this.thens.push(fn);

    return this;
  }

  finally(fn: ((param: T) => void)): LongPromise<T> {
    this.finallyFn = fn;

    return this;
  }

  static execute<T>(param: T, longPromise: LongPromise<T>): Promise<T> {
    let promise = new Promise<T>(resolve => resolve(param));

    longPromise.param = param;
    longPromise.thens.forEach(then => promise = promise.then(then));

    return promise;
  }

  static finally<T>(longPromise: LongPromise<T>): void {
    longPromise.finallyFn(longPromise.param as T);
  }
}

abstract class MessageVue extends Vue {
  CancelType = ButtonType.CANCEL;

  closingPromise!: LongPromise<MessageResult>;

  abstract vueClass: MessageClass;
  abstract defaultBtns: IButtonOpts[];

  abstract show(): LongPromise<MessageResult>;
  abstract hide(type: ButtonType): void;

  @Prop() color?: Color;
  @Prop() title?: string;
  @Prop() content!: string;
  @Prop() btns!: IButtonOpts[];

  get isValidTitle(): boolean {
    return 'string' === typeof this.title && this.title.trim().length > 0;
  }

  get colorCode(): string {
    return 'string' === typeof this.color && this.color.trim().length > 0? this.color : Color.PRIMARY;
  }

  get textClass(): string {
    return `text-${['warning', 'light'].indexOf(this.colorCode) >= 0 ? 'dark' : 'white'}`;
  }

  isBtnIconValid(btn: IButtonOpts): boolean {
    return 'string' === typeof btn.icon && btn.icon.trim().length > 0;
  }
}

abstract class DirectiveRemote<Mvue extends MessageVue, BtnType, ContentType = string> implements DirectiveOptions {
  abstract BINDING_CLS: string;
  abstract VUE_CLS: string;

  abstract getDefaultProps(binding: VNodeDirective): any;
  abstract convertBtns(btns?: BtnType): ConvertBtns;

  private vue!: Mvue;

  constructor(private directiveOpts: ((tbcSnackbar: DirectiveRemote<Mvue, BtnType, ContentType>) => DirectiveOptions)) {}

  // TODO: Directives
  get bind()             : DirectiveFunction | undefined { return this.directiveOpts(this).bind; }
  get inserted()         : DirectiveFunction | undefined { return this.directiveOpts(this).inserted; }
  get update()           : DirectiveFunction | undefined { return this.directiveOpts(this).update; }
  get componentUpdated() : DirectiveFunction | undefined { return this.directiveOpts(this).componentUpdated; }
  get unbind()           : DirectiveFunction | undefined { return this.directiveOpts(this).unbind; }

  binding<V extends Vue>(
    PopupVue: (new (options: ComponentOptions<V>) => V),
    el: HTMLElement,
    binding: VNodeDirective
  ): void {
    if ($(el).parents(`.${this.BINDING_CLS}`).length > 0 || $(el).hasClass(this.BINDING_CLS)) return;
    if (this.vue) this.vue.$destroy();

    const $target = $(`div.${this.VUE_CLS}`);

    $(el).addClass(this.BINDING_CLS);
    this.vue = (new PopupVue({
      el        : $target.length > 0 ? $target[0] : $(`<div class="${this.VUE_CLS}" />`).appendTo('body')[0],
      propsData : this.getDefaultProps(binding)
    }) as any as Mvue);
  }

  primary(title: string, content: ContentType | string, btns?: BtnType): LongPromise<MessageResult> {
    return this.show(Color.PRIMARY, title, content, this.convertBtns(btns));
  }

  info(title: string, content: ContentType | string, btns?: BtnType): LongPromise<MessageResult> {
    return this.show(Color.INFO, title, content, this.convertBtns(btns));
  }

  success(title: string, content: ContentType | string, btns?: BtnType): LongPromise<MessageResult> {
    return this.show(Color.SUCCESS, title, content, this.convertBtns(btns));
  }

  warning(title: string, content: ContentType | string, btns?: BtnType): LongPromise<MessageResult> {
    return this.show(Color.WARNING, title, content, this.convertBtns(btns));
  }

  danger(title: string, content: ContentType | string, btns?: BtnType): LongPromise<MessageResult> {
    return this.show(Color.DANGER, title, content, this.convertBtns(btns));
  }

  secondary(title: string, content: ContentType | string, btns?: BtnType): LongPromise<MessageResult> {
    return this.show(Color.SECONDARY, title, content, this.convertBtns(btns));
  }

  light(title: string, content: ContentType | string, btns?: BtnType): LongPromise<MessageResult> {
    return this.show(Color.LIGHT, title, content, this.convertBtns(btns));
  }

  dark(title: string, content: ContentType | string, btns?: BtnType): LongPromise<MessageResult> {
    return this.show(Color.DARK, title, content, this.convertBtns(btns));
  }


  private show(
    color: Color,
    title: string,
    content: ContentType | string,
    btns: IButtonOpts[] = this.vue.defaultBtns
  ): LongPromise<MessageResult> {
    this.vue.$props.color = color;
    this.vue.$props.title = title;
    this.vue.$props.btns  = btns.length === 0 ? this.vue.defaultBtns : btns;

    if ('string' === typeof content)
      this.vue.$props.content = content;
    else if (this.vue instanceof Dialog && content instanceof DialogContent) {
      this.vue.$props.dialogCls = (content as any).sizeClass;
      this.vue.$props.content   = null;
      this.vue.$slots.default   = (content as any as DialogContent).$slots.default;
    } else throw new Error(
      'Invalid type of content, it must be a string or defined with <DialogContent />.'
    );
    this.vue.closingPromise = this.vue.show();

    return this.vue.closingPromise;
  }
}


// TODO: Snackbar Component
@Component
export class Snackbar extends MessageVue {
  private timerID!: number;

  vueClass    = MessageClass.SNACKBAR;
  defaultBtns = [{type: ButtonType.CANCEL, icon: 'fa fa-times'}];

  @Prop() delay!: number;
  @Prop() position!: SnackbarPosition;

  get displayClass(): string {
    return this.$data.isShown ? 'd-flex' : 'd-none';
  }

  get positionClass(): string {
    switch (this.position) {
    case SnackbarPosition.TOP          : return 'position-t';
    case SnackbarPosition.TOP_LEFT     : return 'position-t position-l';
    case SnackbarPosition.TOP_RIGHT    : return 'position-t position-r';
    case SnackbarPosition.BOTTOM       : return 'position-b';
    case SnackbarPosition.BOTTOM_LEFT  : return 'position-b position-l';
    case SnackbarPosition.BOTTOM_RIGHT : return 'position-b position-r';
    }
    return 'position-b';
  }

  data(): ({isShown: boolean;}) { return { isShown: false }; }

  show(): LongPromise<MessageResult> {
    clearTimeout(this.timerID);

    this.$data.isShown = true;
    this.timerID       = setTimeout(() => this.hide(ButtonType.CANCEL), this.delay);

    return new LongPromise<MessageResult>();
  }

  hide(btn: ButtonType): void {
    clearTimeout(this.timerID);
    this.$data.isShown = false;
    
    LongPromise.execute(btn, this.closingPromise).finally(() =>
      LongPromise.finally(this.closingPromise)
    );
  }
}


// TODO: Dialog Vue Component
@Component
export class Dialog extends MessageVue {
  @Prop() dialogCls?: string;

  closable    = true;
  vueClass    = MessageClass.DIALOG;
  defaultBtns = [
    {type: ButtonType.CANCEL  , icon: 'fa fa-times'},
    {type: ButtonType.CONFIRM , icon: 'fa fa-check'}
  ];

  get hasCancelBtn(): boolean {
    return (this.btns || []).filter(btn => ButtonType.CANCEL === btn.type).length > 0;
  }

  get btnStyle(): ({width: string}) {
    return {width: `${100 / this.btns.length}%`};
  }

  mounted(): void {
    $(this.$el)
      .on('hide.bs.modal', () => this.closable !== false)
      .on('hidden.bs.modal', () => LongPromise.finally(this.closingPromise));
  }

  getButtonCls(btn: IButtonOpts): string {
    return `${btn.type === ButtonType.CANCEL ? 'light' : 'bright'} tbc-${this.colorCode}`;
  }

  show(): LongPromise<MessageResult> {
    ($(this.$el) as any).modal('show');

    return new LongPromise();
  }

  hide(btn: ButtonType): void {
    LongPromise.execute(btn, this.closingPromise).then(res => {
      this.closable = res !== false;
      ($(this.$el) as any).modal('hide');
    });
  }

  closeByMask(e: Event): void {
    if (this.$refs.mask !== e.target) return;
    e.preventDefault();
    e.stopPropagation();

    this.hide(this.CancelType);
  }
}


// TODO: Snackbar Remote Controller
export class TbcSnackbar extends DirectiveRemote<Snackbar, IButtonOpts> {
  private static DefaultDelay = 5000;

  BINDING_CLS = 'tabaco-snackbar-binding';
  VUE_CLS     = MessageClass.SNACKBAR;

  convertBtns(btns?: IButtonOpts): ConvertBtns {
    return btns ? [btns] : undefined;
  }

  getDefaultProps(binding: VNodeDirective): ({delay: number; position: SnackbarPosition}) {
    const { delay    } = binding.value || {delay: TbcSnackbar.DefaultDelay};
    const { position } = binding.value || {position: SnackbarPosition.BOTTOM};

    return {
      delay    : delay    || TbcSnackbar.DefaultDelay,
      position : position || SnackbarPosition.BOTTOM
    };
  }
}

// TODO: Dialog Remote Controller
export class TbcDialog extends DirectiveRemote<Dialog, IButtonOpts[], DialogContentType> {
  BINDING_CLS = 'tabaco-dialog-binding';
  VUE_CLS     = MessageClass.DIALOG;

  convertBtns(btns?: IButtonOpts[]): ConvertBtns {
    return btns ? btns : undefined;
  }

  getDefaultProps(binding: VNodeDirective): any {
    return {};
  }
}

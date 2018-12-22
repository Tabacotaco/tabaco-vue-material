import { Vue, Prop } from 'vue-property-decorator';
import { ComponentOptions, DirectiveOptions, DirectiveFunction, VNodeDirective, VNode } from 'vue';

import { Color, getColorCode } from '@/@types/tabaco.layout';


enum Button { CONFIRM, CANCEL }

enum SnbPosition { TOP, TOP_LEFT, TOP_RIGHT, BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT }

interface IButtonOpts {
  type: Button;
  text?: string;
  icon?: string;
}

interface IDirectiveParams {
  el?: HTMLElement,
  binding?: VNodeDirective,
  vnode?: VNode,
  oldVnode?: VNode
};

interface IPopupRemote<Options> {
  primary   : (title: string, content: string, options?: Options) => LongPromise<PopupResult>;
  info      : (title: string, content: string, options?: Options) => LongPromise<PopupResult>;
  success   : (title: string, content: string, options?: Options) => LongPromise<PopupResult>;
  warning   : (title: string, content: string, options?: Options) => LongPromise<PopupResult>;
  danger    : (title: string, content: string, options?: Options) => LongPromise<PopupResult>;
  secondary : (title: string, content: string, options?: Options) => LongPromise<PopupResult>;
  light     : (title: string, content: string, options?: Options) => LongPromise<PopupResult>;
  dark      : (title: string, content: string, options?: Options) => LongPromise<PopupResult>;
}

type PopupResult = Button | false | void;

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

abstract class PopupVue extends Vue {
  abstract show(): LongPromise<PopupResult>;
  abstract hide(type: Button): void;

  abstract defaultBtns: IButtonOpts[];
  abstract readonly mainCLS: string[];

  closingPromise!: LongPromise<PopupResult>;

  @Prop() color?: Color;
  @Prop() title?: string;
  @Prop() content?: string;
  @Prop() btns?: IButtonOpts[];

  get isValidTitle(): boolean {
    return 'string' === typeof this.title && this.title.trim().length > 0;
  }

  get colorCode(): string {
    return getColorCode(this.color);
  }

  get textClass(): string {
    return `text-${['warning', 'light'].indexOf(this.colorCode) >= 0 ? 'dark' : 'white'}`;
  }

  isBtnIconValid(btn: IButtonOpts): boolean {
    return 'string' === typeof btn.icon && btn.icon.trim().length > 0;
  }
}

abstract class PopupRemoteDirective<V extends Vue, Options> implements DirectiveOptions, IPopupRemote<Options> {
  abstract generate(PopupVue: (new (options: ComponentOptions<V>) => V), directiveParams?: IDirectiveParams): V;
  private component!: V;

  constructor(
    private directiveOpts: (popupRemote: PopupRemoteDirective<V, Options>) => DirectiveOptions,
    private doSyncOptions: (component: V, options?: Options) => void
  ) {}

  // TODO: Directives
  get bind()             : DirectiveFunction | undefined { return this.directiveOpts(this).bind; }
  get inserted()         : DirectiveFunction | undefined { return this.directiveOpts(this).inserted; }
  get update()           : DirectiveFunction | undefined { return this.directiveOpts(this).update; }
  get componentUpdated() : DirectiveFunction | undefined { return this.directiveOpts(this).componentUpdated; }
  get unbind()           : DirectiveFunction | undefined { return this.directiveOpts(this).unbind; }

  createPopupVue(
    PopupVue: (new (options: ComponentOptions<V>) => V),
    directiveParams?: IDirectiveParams
  ): void {
    try {
      const component = this.generate(PopupVue, directiveParams);
  
      if (this.component) this.component.$destroy();
      this.component = component;
    } catch (e) {
      console.log(e);
    }
  }

  primary   (title: string, content: string, options?: Options) { return this.show(Color.PRIMARY   , title, content, options); }
  info      (title: string, content: string, options?: Options) { return this.show(Color.INFO      , title, content, options); }
  success   (title: string, content: string, options?: Options) { return this.show(Color.SUCCESS   , title, content, options); }
  warning   (title: string, content: string, options?: Options) { return this.show(Color.WARNING   , title, content, options); }
  danger    (title: string, content: string, options?: Options) { return this.show(Color.DANGER    , title, content, options); }
  secondary (title: string, content: string, options?: Options) { return this.show(Color.SECONDARY , title, content, options); }
  light     (title: string, content: string, options?: Options) { return this.show(Color.LIGHT     , title, content, options); }
  dark      (title: string, content: string, options?: Options) { return this.show(Color.DARK      , title, content, options); }

  private show(color: Color, title: string, content: string, options?: Options): LongPromise<PopupResult> {
    const component = this.component as any as PopupVue;

    component.$props.color   = color;
    component.$props.title   = title;
    component.$props.content = content;

    this.doSyncOptions(this.component, options);

    return component.show();
  }
}

class TbcSnackbar<V extends Vue> extends PopupRemoteDirective<V, IButtonOpts> {
  static BindingClass = 'binding-snackbar';

  constructor(
    directiveOpts: ((popupRemote: PopupRemoteDirective<V, IButtonOpts>) => DirectiveOptions)
  ) {
    super(directiveOpts, (component: V, btn?: IButtonOpts) =>
      component.$props.btns = btn ? [btn] : (component as any as PopupVue).defaultBtns
    );
  }

  generate(
    PopupComponent: (new (options: ComponentOptions<V>) => V),
    directiveParams: IDirectiveParams
  ): V {
    const $body = $('body');
    const mainCLS: string = (PopupComponent as any).MAIN_CLASS;

    if ($body.hasClass(TbcSnackbar.BindingClass)) throw new Error(
      'Snackbar has already been bound in <body>.'
    );

    $body.addClass(TbcSnackbar.BindingClass);
    $body.find(` > div.${mainCLS}`).remove();

    return new PopupComponent({
      el        : $(`<div class="${mainCLS}" />`).appendTo($body)[0],
      propsData : directiveParams.binding
    });
  }
}

class TbcDialog<V extends Vue> extends PopupRemoteDirective<V, IButtonOpts[]> {
  static BindingClass = 'binding-dialog';

  constructor(
    directiveOpts: ((popupRemote: PopupRemoteDirective<V, IButtonOpts[]>) => DirectiveOptions)
  ) {
    super(directiveOpts, (component: V, btns: IButtonOpts[] = (component as any as PopupVue).defaultBtns) =>
      component.$props.btns = btns
    );
  }
  
  generate(
    PopupComponent: (new (options: ComponentOptions<V>) => V),
    directiveParams: IDirectiveParams
  ): V {
    const $body = $('body');
    const mainCLS: string = (PopupComponent as any).MAIN_CLASS;

    if ($body.hasClass(TbcDialog.BindingClass)) throw new Error(
      'Dialog has already been bound in <body>.'
    );

    $body.addClass(TbcDialog.BindingClass);
    $body.find(` > div.${mainCLS}`).remove();

    return new PopupComponent({
      el        : $(`<div class="${mainCLS}" />`).appendTo($body)[0],
      propsData : directiveParams.binding
    });
  }

  open(dialogVue: Vue | Element | Vue[] | Element[]): LongPromise<PopupResult> {
    if (!(dialogVue instanceof PopupVue)) throw new Error(
      'The open target is not a component of <Dialog />.'
    );
    return dialogVue.show();
  }
}

export {
  Button,
  SnbPosition,
  IButtonOpts,
  PopupResult,
  LongPromise,
  PopupVue,
  TbcSnackbar,
  TbcDialog
}
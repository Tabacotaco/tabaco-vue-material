import { DirectiveOptions, VNodeDirective } from 'vue';

import { Color } from '@/@types/tabaco.layout';
import { TbcSnackbar, TbcDialog } from '@/@types/tabaco.msg';

import TabacoSnackbar from '@/@components/tool/Snackbar.vue';
import TabacoDialog from '@/@components/tool/Dialog.vue';


/** TODO: Append Loading Mask to the specify DOM.
  * 
  *   Binding this directive on the element whitch needs protecting by mask,
  *   and the option value is type of Boolean (true means Visible).
  */
export const loading: DirectiveOptions = ((): DirectiveOptions => {
  const cls       = 'tabaco-loading-mask';
  const rebinding = (el: HTMLElement, binding: VNodeDirective): void => {
    if (binding.value === true)
      $(el).addClass(cls);
    else
      $(el).removeClass(cls);
  };

  return {
    inserted: rebinding,
    update: rebinding
  };
})();


/** TODO: Main Theme
  *
  *   Binding this directive on <App> (The main element), and its option value would be the class of <body>.
  *   The option value is composed of two parts: ${Dark Level}-${Basic Color Name}:
  *     1. Dark Level: bright / light.
  *     2. Basic Color: primary / info / success / danger / warning / secondary / light / dark.
  */
export const theme: DirectiveOptions = ((): DirectiveOptions => {
  const rebinding = (el: HTMLElement, binding: VNodeDirective): void => {
    const { depth = true    } = binding.value || {};
    const { color = 'light' } = binding.value || {};
    const { basic = false   } = binding.value || {};
    const $target = basic ? $('body') : $(el);

    if (Object.keys(Color).indexOf(color.toUpperCase()) < 0)
      throw new Error(`Invalid theme option: ${binding.value}.`);

    $target
      .removeClass(['bright', 'light', ...Object.keys(Color).map(c => `tbc-${c.toLowerCase()}`)])
      .addClass([depth ? 'bright' : 'light', `tbc-${color}`, 'tbc-theme']);
  };

  return {
    inserted : rebinding,
    update   : rebinding
  };
})();


/** TODO: Snackbar
  *
  *   Snackbar is one kind of Message Boxes.
  *   It's not only provided with notification, but also could be ignored with doing nothing.
  *   It doesn't influence user working.
  * 
  *   Binding this directive on <App> (The main element), and its option value is composed as follows:
  *     1. delay: number, Snackbar would be closed voluntarily after this specify millisecond (default: 5000).
  *     2. position: string, set the fixed position of Snackbar by SnackbarPosition (default: SnackbarPosition.BOTTOM).
  */
export const snackbar = new TbcSnackbar((tbcSnackbar) => ({
  inserted : (el: HTMLElement, binding: VNodeDirective): void => tbcSnackbar.binding(TabacoSnackbar, el, binding)
}));


/** TODO: Dialog
  */
export const dialog = new TbcDialog((tbcDialog) => ({
  inserted : (el: HTMLElement, binding: VNodeDirective): void => tbcDialog.binding(TabacoDialog, el, binding)
}));
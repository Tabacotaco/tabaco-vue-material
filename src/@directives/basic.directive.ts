import { DirectiveOptions, VNodeDirective } from 'vue';

import { Color } from '@/@types/tabaco.layout';
import { TbcSnackbar, TbcDialog } from '@/@types/tabaco.popup';

import TabacoSnackbar from '@/@components/tool/Snackbar.vue';
import TabacoDialog from '@/@components/tool/Dialog.vue';


/** TODO: Append Loading Mask to the specify DOM.
  * 
  *   Binding this directive on the element whitch needs protecting by mask,
  *   and the option value is type of Boolean (true means Visible).
  */
const loading: DirectiveOptions = ((): DirectiveOptions => {
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
const theme: DirectiveOptions = ((): DirectiveOptions => {
  const rebinding = (el: HTMLElement, binding: VNodeDirective): void => {
    const { depth = true    } = binding.value || {};
    const { basic = false   } = binding.value || {};
    const { color = 'light' } = binding.value || {};

    if (Object.keys(Color).indexOf((color || 'light').toUpperCase()) < 0)
      throw new Error(`Invalid theme option: ${binding.value}.`);

    (basic === true ? $('body') : $(el))
      .removeClass(['bright', 'light', ...Object.keys(Color).map(c => `tbc-${c.toLowerCase()}`)])
      .addClass([depth ? 'bright' : 'light', `tbc-${color || 'light'}`, 'tbc-theme']);
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
const snackbar = new TbcSnackbar(tbcSnackbar => ({
  inserted : (el: HTMLElement, binding: VNodeDirective): void => tbcSnackbar.createPopupVue(TabacoSnackbar, {el, binding})
}));


/** TODO: Dialog
  */
const dialog = new TbcDialog(tbcDialog => ({
  inserted : (el: HTMLElement): void => tbcDialog.createPopupVue(TabacoDialog, {el})
}));


export {
  loading,
  theme,
  snackbar,
  dialog
};
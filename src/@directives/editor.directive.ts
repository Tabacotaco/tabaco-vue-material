import { DirectiveOptions, VNodeDirective } from 'vue';


// TODO: For Dropdown List, it'll set focused when menu open.
export const dropdown: DirectiveOptions = {
  inserted(el: HTMLElement, binding: VNodeDirective) {
    $(el).parent().on('show.bs.dropdown', () => binding.value(true));
    $(el).parent().on('hidden.bs.dropdown', () => binding.value(false));

    $(el).addClass('v-dropdown');
  }
};


// TODO: For Dropdown List, it'll not close when select any option.
export const keepDropdown: DirectiveOptions = {
  inserted(el: HTMLElement) {
    if ($(el).hasClass('v-dropdown')) $(el).parent().on('hide.bs.dropdown', (e) => {
      return !((e as any).clickEvent && $.contains(
        $(el).parent()[0],
        $((e as any).clickEvent.target)[0]
      ) === true);
    });
  }
};
import { DirectiveOptions, VNodeDirective, VNode } from 'vue';
import uuidv4 from 'uuid/v4';


// TODO: Auto Focus
export const autofocus: DirectiveOptions = {
  inserted(el: HTMLElement, binding: VNodeDirective) {
    el.focus();

    if (binding.value instanceof Function)
      binding.value();
  }
};

export const scrollTop: DirectiveOptions = ((): DirectiveOptions => {
  const fns: {[key in string] : () => void} = {};

  return {
    bind(el: HTMLElement, binding: VNodeDirective, vnode: VNode) {
      const uuid = uuidv4();

      fns[uuid] = () => (vnode.context as any)[binding.expression] = el.scrollTop;
      $(el).attr('data-scroll-top', uuid)[0].addEventListener('scroll', fns[uuid]);
    },

    inserted(el: HTMLElement, binding: VNodeDirective) {
      el.scrollTop = binding.value || 0;
    },

    update(el: HTMLElement, binding: VNodeDirective) {
      el.scrollTop = binding.value || 0;
    },

    unbind(el: HTMLElement) {
      const uuid = $(el).attr('data-scroll-top');

      el.removeEventListener('scroll', fns[uuid as string]);
      delete fns[uuid as string];
    }
  }
})();

export const scrollTopSync: DirectiveOptions = {
  inserted(el: HTMLElement, binding: VNodeDirective, vnode: VNode) {
    console.log(binding, vnode);
  }
};

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
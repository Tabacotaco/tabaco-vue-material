import { DirectiveOptions, VNodeDirective, VNode } from 'vue';
import { ArrowCode } from '@/@types/tabaco.field';

import $ from 'jquery';
import Popper, { Data } from 'popper.js';


const arrow: DirectiveOptions = {
  bind(el: HTMLElement, binding: VNodeDirective) {
    const call = (arrow: string): void => binding.value && binding.value[arrow.toLowerCase()] ?
      binding.value[arrow.toLowerCase()] : null;

    $(el).on('keypress', e => {
      switch (e.keyCode) {
      case ArrowCode.LEFT  : call('left');  break;
      case ArrowCode.UP    : call('up');    break;
      case ArrowCode.RIGHT : call('right'); break;
      case ArrowCode.DOWN  : call('down');  break;
      }
    });
  }
};

// TODO: Auto Focus
const autofocus: DirectiveOptions = {
  inserted(el: HTMLElement, binding: VNodeDirective) {
    el.focus();
    if (binding.value instanceof Function) binding.value();
  }
};

const autorevise: DirectiveOptions = {
  inserted(el: HTMLElement, binding: VNodeDirective) {
    if (binding.value !== false) new Popper($(el).parent().find(' > [data-toggle=dropdown]')[0], el, {
      placement       : 'bottom-start',
      removeOnDestroy : true,
      modifiers       : {
        offset        : {
          fn(data: Data): Data {
            const $scrollEl = $((data.instance as any).state.scrollElement);

            if ($scrollEl.length > 0) {
              const width       = $scrollEl.width();
              const scrollWidth = $scrollEl[0].scrollWidth;

              if ('number' === typeof width && scrollWidth > width)
                data.offsets.popper.left = width - scrollWidth - 8;
            }
            return data;
          }
        }
      }
    });
  }
};

// TODO: For Dropdown List, it'll set focused when menu open.
const dropdown: DirectiveOptions = {
  bind(el: HTMLElement, binding: VNodeDirective) {
    $(el).on('show.bs.dropdown'   , () => binding.value(true));
    $(el).on('hidden.bs.dropdown' , () => binding.value(false));

    $(el).addClass('v-dropdown');
  }
};

// TODO: For Dropdown List, it'll not close when select any option.
const dropdownLock: DirectiveOptions = {
  bind(el: HTMLElement) {
    if ($(el).hasClass('v-dropdown')) $(el).on('hide.bs.dropdown', (e: any) =>
      !(e.clickEvent && $.contains(el, $(e.clickEvent.target)[0]) === true)
    );
  }
};

const dropdownToggle: DirectiveOptions = {
  bind(el: HTMLElement, binding: VNodeDirective) {
    if (binding.value !== false)
      $(el).attr('data-toggle', 'dropdown');
  }
};

const scrollTop: DirectiveOptions = {
  bind(el: HTMLElement, binding: VNodeDirective, vnode: VNode) {
    $(el).on('scroll', () => (vnode.context as any)[binding.expression] = el.scrollTop)
  },

  inserted(el: HTMLElement, binding: VNodeDirective) {
    el.scrollTop = binding.value || 0;
  },

  update(el: HTMLElement, binding: VNodeDirective) {
    el.scrollTop = binding.value || 0;
  }
};

export {
  arrow,
  autofocus,
  autorevise,
  dropdown,
  dropdownLock,
  dropdownToggle,
  scrollTop
};
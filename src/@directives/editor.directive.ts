import { DirectiveOptions, VNodeDirective, VNode } from 'vue';
import { ArrowCode } from '@/@types/tabaco.field';

import $ from 'jquery';
import Popper, { Data } from 'popper.js';


const arrow: DirectiveOptions = {
  bind(el: HTMLElement, binding: VNodeDirective, vnode: VNode) {
    const call = (e: KeyboardEvent, arrow: string): void => {
      if (binding.value && binding.value[arrow.toLowerCase()] instanceof Function) {
        binding.value[arrow.toLowerCase()]();

        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.addEventListener('keydown', e => {
      switch (e.keyCode) {
      case ArrowCode.LEFT  : call(e, 'left');  break;
      case ArrowCode.UP    : call(e, 'up');    break;
      case ArrowCode.RIGHT : call(e, 'right'); break;
      case ArrowCode.DOWN  : call(e, 'down');  break;
      default              : if (e.keyCode === 13) call(e, 'confirm');
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
      !(e.clickEvent && ($(e.clickEvent.target).hasClass('dropdown-item') || el.contains(e.clickEvent.target)))
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
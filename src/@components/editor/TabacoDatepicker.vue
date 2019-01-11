<style lang="scss">
  div.tabaco-field-group.tabaco-datepicker {
    &:not(.disabled) > span.display { cursor: pointer; }

    & > div.editor > input[data-toggle] {
      display: block !important;
      width: 100%;
      padding-right: 18px;
      background-color: rgba(0, 0, 0, 0) !important;
      font-size: 1rem !important;
      line-height: 1.4;
      -webkit-box-shadow: none !important;
      box-shadow: none !important;
      outline: none !important;
      border-width: 0 !important;
      color: inherit;
    }
  }
</style>

<template>
  <TabacoFieldGroup v-model="date" :options="getGroupOpts({
    mainClass : 'tabaco-datepicker dd-group',
    dispClass : 'tbc-dropdown-datepicker',
    format    : overrideFormat
  })">
    <div ref="dropdown" slot="editor" slot-scope="{setFocused}" class="dropdown datepicker editor"
      v-dropdown="setFocused" v-dropdown-lock v-arrow="{
        up      : () => $refs.menu.asArrow('UP'   ), left  : () => $refs.menu.asArrow('LEFT'  ),
        down    : () => $refs.menu.asArrow('DOWN' ), right : () => $refs.menu.asArrow('RIGHT' ),
        confirm : () => $refs.menu.asSelected()
      }">

      <input ref="toggle" type="text" v-model="date" v-dropdown-toggle
        v-autofocus="() => $($refs.toggle).dropdown('toggle')" />

      <CarlendarMenu ref="menu" :color="color" :value="mval" @refresh="onMenuRefresh($event)" />
    </div>
    
    <CarlendarMenu slot="mbstress" :offset="false" ref="menu" :color="color" :value="mval" @refresh="onMenuRefresh($event)" />
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { VNodeDirective } from 'vue';
  import { Component, Prop } from 'vue-property-decorator';
  import moment, { Moment } from 'moment';
  import $ from 'jquery';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import CarlendarMenu from '@/@components/tool/CarlendarMenu.vue';

  import { arrow, autofocus, dropdown, dropdownLock, dropdownToggle } from '@/@directives/editor.directive';
  import TabacoFieldVue, { DisplayFormat, HoverAt, ICarlendarMenu } from '@/@types/tabaco.field';


  type TbcDate = string | number;

  @Component({
    inject: {
      $: {default: () => $}
    },
    components: {
      TabacoFieldGroup,
      CarlendarMenu
    },
    directives: {
      arrow,
      autofocus,
      dropdown,
      dropdownLock,
      dropdownToggle,
      dropdownClose: {
        bind: (el: HTMLElement, binding: VNodeDirective) =>
          binding.value instanceof Function ? $(el).on('hidden.bs.dropdown', binding.value) : null
      }
    }
  })
  export default class TabacoDatepicker extends TabacoFieldVue {
    private hoverAt: HoverAt = null;

    mval: Moment = moment.utc('');

    @Prop() value!: TbcDate;
    @Prop({default: 'YYYY/MM/DD'}) private moment?: string;

    set date(v: TbcDate) {
      this.mval = moment.utc(v, 'string' === typeof v ? this.moment : undefined);
    }

    get date(): TbcDate {
      return !this.mval || !this.mval.isValid ? '' : this.mval.format(this.moment);
    }

    get overrideFormat(): DisplayFormat<TbcDate> {
      return (v => {
        if (this.mval.isValid())
          return 'string' === typeof this.moment && this.mval ? this.mval.format(this.moment) : v.toString();

        return '';
      });
    }

    created() {
      this.date = this.value;
    }

    isEmpty(): boolean {
      return !this.mval.isValid();
    }

    onMenuRefresh(res: ICarlendarMenu): void {
      if ('string' === typeof res.selected) {
        this.date = res.selected;
        ($(this.$refs.dropdown) as any).dropdown('toggle');
      }
    }
  }
</script>
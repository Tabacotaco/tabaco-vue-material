<style lang="scss">
  div.tabaco-field-group.tabaco-numberfield {
    &.disabled > div.tabaco-number-spinner > button.btn { cursor: not-allowed; }
    & > input.editor, & > span.display { width: 100%; }
    & > input.editor { padding-top: calc(.375rem - 1px) !important; }

    & > .display {
      cursor: text;
      text-align: right;
    }

    & input.editor {
      text-align: right;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
      }
    }

    & > div.tabaco-number-spinner {
      float: right;
      margin-top: 4px;

      & + input.editor, & + span.display { width: calc(100% - 28px); }
      & > button.btn:first-child { border-radius: 0 .25rem 0 0; }
      & > button.btn:last-child { border-radius: 0 0 .25rem 0; }

      & > button.btn {
        line-height: 1;
        font-size: .875rem;
        padding: .75px 8px;
        border-radius: 0 .25rem .25rem 0;
      }
    }

    & > div.modal.mb-stress {
      & input.editor { width: calc(100% - 94px); margin: auto; }
      & button.btn.plus { float: left; }
      & button.btn.minus { float: right; }
    }
  }
</style>

<template>
  <TabacoFieldGroup v-model="number" :options="getGroupOpts({mainClass: 'tabaco-numberfield', format: overrideFormat})">
    <input v-autofocus slot="editor" slot-scope="{setFocused}" type="number" class="editor"
      v-model="number" @focus="setFocused(true)" @blur="setFocused(false)" />

    <div slot="tool" slot-scope="{isFocused, setFocused}" class="tabaco-number-spinner btn-group-vertical">
      <button type="button" class="btn" tabindex="-1" :class="[isFocused? `btn-${colorCode}` : 'btn-secondary']" :disabled="isDisabled"
        @click="onSpinner(true)" @focus="setFocused(true)" @blur="setFocused(false)">
        <i class="fa fa-caret-up" />
      </button>

      <button type="button" class="btn" tabindex="-1" :class="[isFocused? `btn-${colorCode}` : 'btn-secondary']" :disabled="isDisabled"
        @click="onSpinner(false)" @focus="setFocused(true)" @blur="setFocused(false)">
        <i class="fa fa-caret-down" />
      </button>
    </div>

    <template slot="mbstress">
      <button type="button" class="btn plus btn-outline-light" @click="onSpinner(true)">
        <i class="fa fa-plus" />
      </button>

      <input v-autofocus  type="number" class="editor" v-model="number" />

      <button type="button" class="btn minus btn-outline-light" @click="onSpinner(false)">
        <i class="fa fa-minus" />
      </button>
    </template>
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import { autofocus } from '@/@directives/editor.directive';

  import Numeral from 'numeral';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import TabacoFieldVue, { FormatType } from '@/@types/tabaco.field';


  type NullNumber = null | undefined;

  @Component({
    directives: {
      autofocus
    },
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoNumberfield extends TabacoFieldVue {
    @Prop() value!: number;

    @Prop() private max?: number;
    @Prop() private min?: number;
    @Prop() private step?: number;
    @Prop() private scale?: number;
    @Prop() private numeral?: string;

    set number(v: number) {
      v = parseFloat(v as any);

      if (!this.isNumber(v))
        this.$emit('input', null);
      else {
        const scale = this.isNumber(this.scale, false) ? Math.pow(10, this.scale as number) : 1;

        v = this.isNumber(this.max)   ? Math.min(this.max as number, v) : v;
        v = this.isNumber(this.min)   ? Math.max(this.min as number, v) : v;
        v = Math.round(v * scale) / scale;

        this.$emit('input', v);
      }
    }

    get number(): number {
      return this.isNumber(this.value) ? this.value : ((null as any) as number);
    }

    get stepNum(): number {
      return this.isNumber(this.step, false) ? Math.abs(this.step as number) : 1;
    }

    get overrideFormat(): FormatType<number> {
      return (v => {
        if (this.isNumber(v))
          return 'string' === typeof this.numeral ? Numeral(v).format(this.numeral) : v.toString();

        return '';
      });
    }

    isEmpty(): boolean {
      return !this.isNumber(this.number);
    }

    onSpinner(isAdd: boolean): void {
      this.number = (this.isNumber(this.number) ? this.number : 0) + (this.stepNum * (isAdd ? 1 : -1));
    }

    private isNumber(value: number | NullNumber, allowed0: boolean = true): boolean {
      return 'number' === typeof value
        && ((allowed0 && (value === 0 || !isNaN(value))) || (!allowed0 && !isNaN(value)));
    }
  }
</script>
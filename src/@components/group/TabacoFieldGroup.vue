<style lang="scss">
  div.tabaco-field-group {
    padding-top: 28px;
    position: relative;

    & > span.display {
      position: absolute;
      top: 28px;
      z-index: -1;
      line-height: 1.5 !important;
      width: calc(100% - 30px);
    }

    // TODO: Label
    &.focused, &:not(.empty) {
      & > label.tabaco-label {
        top: 12px;
        left: calc(15px * .8);
        transform: scale(.8, .8);
        animation: tabaco-actived-label .1s linear;
      }
    }

    &.empty:not(.focused) {
      & > label.tabaco-label {
        top: calc(28px + .375rem);
        left: calc(15px + .75rem);
        transform: scale(1, 1);
        color: inherit;
        animation: tabaco-unactived-label .1s linear;
      }
    }

    & > label.tabaco-label {
      position: absolute;
      z-index: -1;
      color: inherit;

      & > sup.fa {
        color: #dc3545;
        font-size: 8px;
      }
    }

    // TODO: Invalid Message Box
    & > span.tabaco-invalid-msg {
      display: block;
      font-size: 1rem;
      line-height: 1.5;

      &:empty::before {
        content: "";
        display: block;
        height: 24px;
      }
    }

    // TODO: Focused Case
    &.focused {
      &.theme-primary   > label.tabaco-label { color: #007bff; }
      &.theme-info      > label.tabaco-label { color: #17a2b8; }
      &.theme-success   > label.tabaco-label { color: #28a745; }
      &.theme-warning   > label.tabaco-label { color: #ffc107; }
      &.theme-danger    > label.tabaco-label { color: #dc3545; }
      &.theme-secondary > label.tabaco-label { color: #6c757d; }
      &.theme-light     > label.tabaco-label { color: #f8f9fa; }
      &.theme-dark      > label.tabaco-label { color: #343a40; }
    }
  }
</style>

<template>
  <div class="tabaco-field-group" :class="[...columnSizeClass, ...labelOnTopClass, `theme-${colorCode}`, lockClass]">
    <slot name="tool" :isFocused="focused" :setFocused="setFocused" />

    <slot name="editor" :isFocused="focused" :setFocused="setFocused" />

    <slot name="display" :value="value" :format="format">
      <span class="display" v-html="empty ? '' : format(value)" />
    </slot>

    <label class="tabaco-label">
      <sup v-if="options.required === true" class="fa fa-asterisk" /> {{options.label}}
    </label>

    <span class="tabaco-invalid-msg">{{invalidMsg}}</span>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  import { Color, ColumnSize, SizeType } from '@/@types/tabaco.layout';
  import { IGroupOptions, FormatType } from '@/@types/tabaco.field';


  @Component
  export default class TabacoFieldGroup extends Vue {
    private columnSize: ColumnSize | undefined;

    private invalidMsg = '';
    private focused    = false;

    @Prop() private value!: any;
    @Prop() private empty?: boolean;
    @Prop() private options!: IGroupOptions<any>;

    get labelOnTopClass(): string[] {
      return ['focused', 'empty'].filter(cls => ((this as any)[cls] as boolean) === true);
    }

    get colorCode(): string {
      return 'string' === typeof this.options.color && this.options.color.trim().length > 0? this.options.color : Color.PRIMARY;
    }

    get lockClass(): string {
      return this.options.disabled === true ? 'disabled' : '';
    }

    get format(): FormatType<any> {
      return this.options.format instanceof Function ? this.options.format : (v => v as string);
    }

    get columnSizeClass(): string[] {
      if (!this.columnSize) this.columnSize = new ColumnSize({
        def : this.options.def,
        sm  : this.options.sm,
        md  : this.options.md,
        lg  : this.options.lg,
        xl  : this.options.xl
      });
      return this.columnSize.columnCls;
    }

    setFocused(isFocused: boolean): void {
      this.focused = isFocused;

      if (this.focused) {
        this.$el.scrollIntoView();
      }
    }
  }
</script>
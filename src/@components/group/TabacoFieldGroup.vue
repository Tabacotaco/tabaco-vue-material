<style lang="scss">
  div.tabaco-field-group {
    padding-top: 28px;
    padding-bottom: 14px;
    position: relative;

    & > span.display {
      line-height: 1.5 !important;
      white-space: nowrap; 
      overflow-x: auto;
      text-overflow: clip;
    }

    &:not(.tabaco-textarea) > span.display::-webkit-scrollbar {
      display: none;
    }

    // TODO: Label
    &.focused, &:not(.empty) {
      & > label.tabaco-label {
        top: 8px;
        left: 15px;
        font-size: 80%;
        animation: tabaco-actived-label .1s linear;
      }
    }

    &.empty:not(.focused) > label.tabaco-label {
      top: 34px;
      left: 27px;
      max-width: calc(100% - 90px);
      font-size: 100%;
      color: inherit;
      animation: tabaco-unactived-label .1s linear;
    }

    & > label.tabaco-label {
      position: absolute;
      pointer-events: none;
      color: inherit;
      max-width: calc(100% - 30px);
      white-space: nowrap; 
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
      -moz-user-select: none;
      -khtml-user-select: none;
      -webkit-user-select: none;
      -o-user-select: none;

      & > sup.fa { color: #dc3545; font-size: 8px; }
    }

    // TODO: Invalid Message Box
    & span.tabaco-invalid-msg {
      display: block;
      color: #f44336;
      height: 24px;
      font-size: 1rem;
      line-height: 1.5;
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
  <div class="tabaco-field-group" :class="groupCLS">
    <!-- TODO: Label -->
    <label class="tabaco-label">
      {{options.label}} <sup v-if="options.required === true" class="fa fa-asterisk" />
    </label>

    <!-- TODO: Field Toolbar -->
    <slot v-if="!isMbStress" name="tool" :isFocused="focused" :setFocused="setFocused" />

    <!-- TODO: Editor -->
    <slot v-if="editable && !isMbStress" name="editor" :isFocused="focused" :setFocused="setFocused" />

    <!-- TODO: Display -->
    <slot v-if="!editable || isMbStress" name="display" :value="value" :format="options.format" :setFocused="setFocused" :displayClass="displayCLS">
      <span class="display" :class="displayCLS" v-scroll-top="options.dispScrlTop" :style="displayCSS" @click="setFocused(true)"
        v-html="options.empty() ? '' : options.format(value)" @scroll="$emit('display-scroll', $event.target.scrollTop)" />
    </slot>

    <!-- TODO: Invalid Message -->
    <span class="tabaco-invalid-msg">
      <i v-if="isInvalid" class="fa fa-exclamation-circle" /> {{options.valid(value)}}
    </span>

    <!-- TODO: Mobidle Stress Editor Modal -->
    <MbStressField v-if="isMbStress" ref="mbstress" :focused="focused" :value="value" :options="options" :editable="editable" @close="onCloseMbStress($event)">
      <slot name="mbstress" />
    </MbStressField>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  import { Color, ColumnSize, SizeType, isMobileLayout, getThemeColor } from '@/@types/tabaco.layout';
  import { IGroupOptions } from '@/@types/tabaco.field';
  import { Button } from '@/@types/tabaco.popup';
  import { scrollTop } from '@/@directives/editor.directive';

  import MbStressField from '@/@components/tool/MbStressField.vue';


  @Component({
    inject: {
      Button: {default: Button}
    },
    directives: {
      scrollTop
    },
    components: {
      MbStressField
    }
  })
  export default class TabacoFieldGroup extends Vue {
    static convert2CNumbers(code: string): number[] {
      const color = getComputedStyle(document.body).getPropertyValue(`--${code}`).replace('#', '');

      return [
        parseInt(color.substr(0, 2), 16),
        parseInt(color.substr(2, 2), 16),
        parseInt(color.substr(4, 2), 16)
      ]
    }

    private columnSize: ColumnSize | undefined;
    private invalidMsg = '';

    focused = false;
    oriValue: any = null;

    @Prop() private value!: any;
    @Prop() private options!: IGroupOptions<any>;

    get editable(): boolean { return this.options.disabled !== true && this.focused; }

    get isMbStress(): boolean { return isMobileLayout() && 'mbstress' in this.$slots; }

    get isInvalid(): boolean {
      const invalidMsg = (this.options.valid as Function)(this.value);

      return 'string' === typeof invalidMsg && invalidMsg.trim().length > 0;
    }

    get displayCLS(): string[] {
      return 'string' === typeof this.options.dispClass && this.options.dispClass.trim().length > 0 ?
        [this.options.dispClass] : [];
    }

    get displayCSS(): any {
      return 'number' !== typeof this.options.dispHeight || isNaN(this.options.dispHeight) ? {} : {
        height: `${this.options.dispHeight}px`
      };
    }

    get groupCLS(): string[] {
      const { def, sm, md, lg, xl } = this.options;
      const { mainClass = '', disabled, empty = (() => true) } = this.options;
      const { focused = false } = this;
      const labels = {empty: empty(), focused: focused && !this.isMbStress, disabled};

      return [
        mainClass,
        `theme-${getThemeColor(this.options.color)}`,
        ...(new ColumnSize({def, sm, md, lg, xl})).columnCls,
        ...Object.keys(labels).filter(cls => (labels as any)[cls] === true)
      ];
    }

    setFocused(isFocused: boolean): void {
      if (!isFocused || this.options.disabled === true) {
        this.focused = false;
        return;
      } else if (isMobileLayout() && this.isMbStress)
        ($((this.$refs.mbstress as any).$el) as any).modal('show');

      this.focused = true;
    }

    onCloseMbStress(value?: any): void {
      this.$emit('input', value);
      this.setFocused(false);
    }
  }
</script>
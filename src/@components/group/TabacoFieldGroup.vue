<style lang="scss">
  div.tabaco-field-group {
    padding-top: 28px;
    padding-bottom: 14px;
    position: relative;

    & > span.display {
      line-height: 1.5 !important;
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

    &.empty:not(.focused) > label.tabaco-label {
      top: calc(28px + .375rem);
      left: calc(15px + .75rem);
      transform: scale(1, 1);
      color: inherit;
      animation: tabaco-unactived-label .1s linear;
    }

    & > label.tabaco-label {
      position: absolute;
      pointer-events: none;
      color: inherit;
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

    & > div.modal.mb-stress {
      background-color: rgba(0, 0, 0, .5);

      & div.modal-content {
        background: none;

        & > div.modal-header {
          border-width: 0;

          & > h6 > sup.fa {
            color: #dc3545;
            font-size: 8px;
          }
        }

        & > div.modal-body {
          height: calc(100vh - 178px);
          overflow-y: auto;
          min-height: 110px;
        }

        & > div.modal-footer > div.btn-group {
          width: 100%;

          & > button.btn {
            width: 50%;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border-color: rgba(255, 255, 255, .2);
          }
        }
      }
    }
  }
</style>

<template>
  <div class="tabaco-field-group" :class="groupCLS">
    <label class="tabaco-label">
      <sup v-if="options.required === true" class="fa fa-asterisk" /> {{options.label}}
    </label>

    <slot v-if="!isMbStress" name="tool" :isFocused="focused" :setFocused="setFocused" />

    <slot v-if="editable && !isMbStress" name="editor" :isFocused="focused" :setFocused="setFocused" />

    <slot v-if="!editable || isMbStress" name="display" :value="value" :format="options.format" :setFocused="setFocused">
      <span class="display" v-html="options.empty() ? '' : options.format(value)" @click="setFocused(true)" :style="displayCSS" />
    </slot>

    <span class="tabaco-invalid-msg">
      <i v-if="isInvalid" class="fa fa-exclamation-circle" /> {{options.valid(value)}}
    </span>

    <div v-if="isMbStress" ref="mbstress" class="modal mb-stress" @click="onCloseStress(BType.CANCEL, $event)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header tbc-theme bright" :class="stressCLS" :style="stressCSS">
            <h6 class="modal-title tabaco-label">
              <sup v-if="options.required === true" class="fa fa-asterisk" /> {{options.label}}
            </h6>
          </div>

          <div class="modal-body text-white py-3">
            <slot v-if="editable && isMbStress" name="mbstress" :oriValue="$data._value" />

            <span v-if="isInvalid" class="tabaco-invalid-msg mt-3">
              <h5><i class="fa fa-exclamation-circle" /> {{options.valid(value)}}</h5>
            </span>
          </div>

          <div class="modal-footer p-0">
            <div class="btn-group">
              <button type="button" class="btn light" :class="stressBtnCLS" @click="onCloseStress(BType.CANCEL)">
                <i class="fa fa-times" />
              </button>

              <button type="button" class="btn bright" :class="stressBtnCLS" @click="onCloseStress(BType.CONFIRM)">
                <i class="fa fa-check" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  import { Color, ColumnSize, SizeType, isMobileLayout, getColorCode } from '@/@types/tabaco.layout';
  import { IGroupOptions, FormatType, ValidType } from '@/@types/tabaco.field';
  import { ButtonType } from '@/@types/tabaco.msg';


  type GroupData = {
    _focused: boolean;
    _value: any;
    _stressBtn?: ButtonType;
  };

  @Component
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
    private BType = ButtonType;

    @Prop() private value!: any;
    @Prop() private options!: IGroupOptions<any>;

    set focused(value: boolean) { this.$data._focused = value; }

    get focused(): boolean { return this.$data._focused; }

    get editable(): boolean { return this.options.disabled === false && this.focused; }

    get isMbStress(): boolean { return isMobileLayout() && 'mbstress' in this.$slots; }

    get isInvalid(): boolean {
      const invalidMsg = (this.options.valid as Function)(this.value);

      return 'string' === typeof invalidMsg && invalidMsg.trim().length > 0;
    }

    get displayCSS(): any {
      return 'number' !== typeof this.options.displayHeight || isNaN(this.options.displayHeight) ? {} : {
        height: `${this.options.displayHeight}px`
      };
    }

    get stressCSS(): any {
      return {'background-color': `rgba(${[
        TabacoFieldGroup.convert2CNumbers(getColorCode(this.options.color))
      ]}, .7) !important`};
    }

    get stressBtnCLS(): string[] { return [`tbc-${getColorCode(this.options.color)}`] }

    get stressCLS(): string[] {
      return [
        `tbc-${getColorCode(this.options.color)}`,
        `text-${'light' === getColorCode(this.options.color) ? 'dark' : 'white'}`
      ];
    }

    get groupCLS(): string[] {
      const { def, sm, md, lg, xl } = this.options;
      const { mainClass = '', disabled, empty = (() => true) } = this.options;
      const { focused = false } = this;
      const labels = {empty: empty(), focused: focused && !isMobileLayout(), disabled};

      return [
        mainClass,
        `theme-${getColorCode(this.options.color)}`,
        ...(new ColumnSize({def, sm, md, lg, xl})).columnCls,
        ...Object.keys(labels).filter(cls => (labels as any)[cls] === true)
      ];
    }

    data(): GroupData { return {_focused: false, _value: null}; }

    mounted(): void {
      $(this.$refs.mbstress)
        .on('show.bs.modal'   , () => this.$data._value = this.value)
        .on('hide.bs.modal'   , () => ButtonType.CANCEL === this.$data._stressBtn || !this.isInvalid)
        .on('hidden.bs.modal' , () => {
          switch (this.$data._stressBtn) {
          case ButtonType.CANCEL:
            this.$emit('input', this.$data._value);
          default:
            this.$data._stressBtn = undefined;
          }
          this.setFocused(false);
        });
    }

    setFocused(isFocused: boolean): void {
      if (!isFocused || this.options.disabled !== false) {
        this.focused = false;
        return;
      } else if (isMobileLayout())
        ($(this.$refs.mbstress) as any).modal('show');

      this.focused = true;
      this.$el.scrollIntoView();
    }

    onCloseStress(btn: ButtonType, e?: Event): void {
      if (e && this.$refs.mbstress === e.target) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!e || this.$refs.mbstress === e.target) {
        this.$data._stressBtn = btn;
        ($(this.$refs.mbstress) as any).modal('hide');
      }
    }
  }
</script>
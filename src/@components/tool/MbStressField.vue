<style lang="scss">
  div.modal.mb-stress {
    background-color: rgba(0, 0, 0, .5);
    height: 100vh;

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
</style>

<template>
  <div ref="mbstress" class="modal mb-stress" @click="onCloseStress(Button.CANCEL, $event)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header tbc-theme bright" :class="stressCLS" :style="stressCSS">
          <h6 class="modal-title tabaco-label">
            <sup v-if="options.required === true" class="fa fa-asterisk" /> {{options.label}}
          </h6>
        </div>

        <div class="modal-body text-white py-3">
          <slot v-if="editable" />

          <span v-if="isInvalid" class="tabaco-invalid-msg mt-3">
            <h5><i class="fa fa-exclamation-circle" /> {{options.valid(value)}}</h5>
          </span>
        </div>

        <div class="modal-footer p-0">
          <div class="btn-group">
            <button type="button" class="btn light" :class="stressBtnCLS" @click="onCloseStress(Button.CANCEL)">
              <i class="fa fa-times" />
            </button>

            <button type="button" class="btn bright" :class="stressBtnCLS" @click="onCloseStress(Button.CONFIRM)">
              <i class="fa fa-check" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  import { getColorCode } from '@/@types/tabaco.layout';
  import { IGroupOptions } from '@/@types/tabaco.field';
  import { Button } from '@/@types/tabaco.popup';

  @Component({
    inject: {
      Button: {default: Button}
    }
  })
  export default class MbStressField extends Vue {
    static convert2CNumbers(code: string): number[] {
      const color = getComputedStyle(document.body).getPropertyValue(`--${code}`).replace('#', '');

      return [
        parseInt(color.substr(0, 2), 16),
        parseInt(color.substr(2, 2), 16),
        parseInt(color.substr(4, 2), 16)
      ]
    }
  
    oriValue: any = null;
    finalBtn: Button | null = null;

    @Prop() private editable!: boolean;
    @Prop() private value!: any;
    @Prop() private options!: IGroupOptions<any>;

    get isInvalid(): boolean {
      const invalidMsg = (this.options.valid as Function)(this.value);

      return 'string' === typeof invalidMsg && invalidMsg.trim().length > 0;
    }

    get stressBtnCLS(): string[] { return [`tbc-${getColorCode(this.options.color)}`] }

    get stressCSS(): any {
      return {'background-color': `rgba(${[
        MbStressField.convert2CNumbers(getColorCode(this.options.color))
      ]}, .7) !important`};
    }

    get stressCLS(): string[] {
      return [
        `tbc-${getColorCode(this.options.color)}`,
        `text-${'light' === getColorCode(this.options.color) ? 'dark' : 'white'}`
      ];
    }

    mounted(): void {
      $(this.$refs.mbstress)
        .on('show.bs.modal'   , () => this.oriValue = this.value)
        .on('hide.bs.modal'   , () => Button.CANCEL === this.finalBtn || !this.isInvalid)
        .on('hidden.bs.modal' , () => {
          this.$emit('close', Button.CANCEL === this.finalBtn ? this.oriValue : this.value);
            this.finalBtn = null;
        });
    }

    onCloseStress(btn: Button, e?: Event): void {
      if (e && this.$refs.mbstress === e.target) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!e || this.$refs.mbstress === e.target) {
        this.finalBtn = btn;
        ($(this.$refs.mbstress) as any).modal('hide');
      }
    }
  }
</script>
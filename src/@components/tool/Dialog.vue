<style lang="scss">
  div.tbc-dialog > div.modal-dialog > div.modal-content {
    & > div.modal-header { border-width: 0; padding-bottom: .5rem; }
    & > div.modal-body { border-width: 0; padding-top: .5rem; }
    
    & > div.modal-header, & > div.modal-body, & > div.modal-footer { background-color: rgba(0, 0, 0, 0); }

    & > div.modal-footer > div.btn-group {
      width: 100%;

      & > button.btn {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-color: rgba(255, 255, 255, .2);
      }
    }
  }
</style>

<template>
  <div ref="mask" class="tabaco-msg modal" :class="mainCLS" @click="closeByMask($event)">
    <div v-if="isShown === true" class="modal-dialog">
      <div class="modal-content tbc-theme bright" :class="[`tbc-${themeColor}`]">
        <div class="modal-header">
          <h5 class="modal-title">{{title}}</h5>

          <button v-if="hasCancelBtn" type="button" class="close" @click="hide()">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div v-if="'string' === typeof content" class="modal-body">{{content}}</div>
        <div v-else class="modal-body"><slot /></div>

        <div class="modal-footer p-0">
          <div class="btn-group">
            <button v-for="btn in btns" :key="btn.uuid" type="button" class="btn" :class="[getButtonCls(btn)]" :style="btnStyle"
              @click="hide(btn.type)">

              <i v-if="isBtnIconValid(btn)" :class="[btn.icon]" /> {{btn.text}}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';

  import { Button, IButtonOpts, LongPromise, PopupResult, PopupVue } from '@/@types/tabaco.popup';


  const defaultBtns = [
    {type: Button.CANCEL  , icon: 'fa fa-times'},
    {type: Button.CONFIRM , icon: 'fa fa-check'}
  ];

  @Component
  export default class Dialog extends PopupVue {
    static MAIN_CLASS = 'tbc-dialog';

    @Prop({default: () => defaultBtns}) btns!: IButtonOpts[];

    closable    = true;
    isShown     = false;
    defaultBtns = defaultBtns;

    get mainCLS(): string[] {
      return [Dialog.MAIN_CLASS];
    }

    get hasCancelBtn(): boolean {
      return (this.btns || []).filter(btn => Button.CANCEL === btn.type).length > 0;
    }

    get btnStyle(): ({width: string}) {
      return {width: `${100 / (this.btns || []).length}%`};
    }

    mounted(): void {
      $(this.$el)
        .on('show.bs.modal'   , () => this.isShown = true)
        .on('hide.bs.modal'   , () => this.closable !== false)
        .on('hidden.bs.modal' , () => LongPromise.finally(this.closingPromise));
    }

    getButtonCls(btn: IButtonOpts): string {
      return `${btn.type === Button.CANCEL ? 'light' : 'bright'} tbc-${this.themeColor}`;
    }

    show(): LongPromise<PopupResult> {
      ($(this.$el) as any).modal('show');
      this.closingPromise = new LongPromise<PopupResult>();

      return this.closingPromise;
    }

    hide(btn: Button = Button.CANCEL): void {
      LongPromise.execute(btn, this.closingPromise).then(res => {
        this.closable = res !== false;
        this.isShown  = false;
        ($(this.$el) as any).modal('hide');
      });
    }

    closeByMask(e: Event): void {
      if (this.$refs.mask !== e.target) return;
      e.preventDefault();
      e.stopPropagation();

      this.hide();
    }
  }
</script>
<style lang="scss">
  div.tbc-snackbar {
    position: fixed;
    z-index: 1000;

    & > button.btn {
      background-color: rgba(0, 0, 0, 0);
    }

    & > button.btn:hover {
      opacity: .6;
    }

    & strong.snackbar-title {
      font-size: 1.2rem;
    }

    &.position-t { top    : 0; margin-top    : 48px; }
    &.position-b { bottom : 0; margin-bottom : 48px; }
    &.position-l { left   : 0; margin-left   : 48px; }
    &.position-r { right  : 0; margin-right  : 48px; }
  }

  @media (max-width: 575px) {
    div.tbc-snackbar {
      width: 90vw;
      margin-left: 5vw;
      margin-right: 5vw;
    }
  }

  @media (min-width: 576px) and (max-width: 767px) {
    div.tbc-snackbar {
      width: 80vw;
      margin-left: 10vw;
      margin-right: 10vw;
    }
  }

  @media (min-width: 767px) and (max-width: 991px) {
    div.tbc-snackbar {
      width: 60vw;
      margin-left: 20vw;
      margin-right: 20vw;
    }
  }

  @media (min-width: 992px) and (max-width: 1199px) {
    div.tbc-snackbar {
      width: 50vw;
      margin-left: 25vw;
      margin-right: 25vw;
    }
  }

  @media (min-width: 1200px) {
    div.tbc-snackbar {
      width: 40vw;
      margin-left: 30vw;
      margin-right: 30vw;
    }
  }
</style>

<template>
  <div class="tabaco-msg shadow rounded p-3" :class="mainCLS">
    <div class="mr-auto" :class="[isValidTitle ? 'd-block' : 'd-flex align-items-center']">
      <strong class="snackbar-title" v-if="isValidTitle">{{title}}<br/></strong> {{content}}
    </div>

    <button v-for="btn in btns" :key="btn.uuid" type="button" class="btn font-weight-bold" :class="[textClass]" @click="hide()">
      <i v-if="isBtnIconValid(btn)" :class="[btn.icon]" /> {{btn.text}}
    </button>
  </div>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';

  import { Button, SnbPosition, LongPromise, PopupResult, PopupVue } from '@/@types/tabaco.popup';


  @Component
  export default class Snackbar extends PopupVue {
    static MAIN_CLASS = 'tbc-snackbar';

    private timerID!: any;

    defaultBtns = [{type: Button.CANCEL, icon: 'fa fa-times'}];
    isShown     = false;

    @Prop() delay?: number;
    @Prop() position?: SnbPosition;

    get mainCLS(): string[] {
      return [
        Snackbar.MAIN_CLASS,
        `bg-${this.colorCode}`,
        this.textClass,
        this.isShown ? 'd-flex' : 'd-none',
        (() => {
          switch (this.position) {
          case SnbPosition.TOP          : return 'position-t';
          case SnbPosition.TOP_LEFT     : return 'position-t position-l';
          case SnbPosition.TOP_RIGHT    : return 'position-t position-r';
          case SnbPosition.BOTTOM_LEFT  : return 'position-b position-l';
          case SnbPosition.BOTTOM_RIGHT : return 'position-b position-r';
          }
          return 'position-b';
        })()
      ];
    }

    show(): LongPromise<PopupResult> {
      clearTimeout(this.timerID);

      this.isShown        = true;
      this.timerID        = setTimeout(() => this.hide(), this.delay || 5000);
      this.closingPromise = new LongPromise<PopupResult>();

      return this.closingPromise;
    }

    hide(btn: Button = Button.CANCEL): void {
      clearTimeout(this.timerID);
      this.isShown = false;
      
      LongPromise.execute(btn, this.closingPromise).finally(() =>
        LongPromise.finally(this.closingPromise)
      );
    }
  }
</script>
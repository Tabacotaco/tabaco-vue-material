<style lang="scss">
  div.tabaco-snackbar {
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
    div.tabaco-snackbar {
      width: 90vw;
      margin-left: 5vw;
      margin-right: 5vw;
    }
  }

  @media (min-width: 576px) and (max-width: 767px) {
    div.tabaco-snackbar {
      width: 80vw;
      margin-left: 10vw;
      margin-right: 10vw;
    }
  }

  @media (min-width: 767px) and (max-width: 991px) {
    div.tabaco-snackbar {
      width: 60vw;
      margin-left: 20vw;
      margin-right: 20vw;
    }
  }

  @media (min-width: 992px) and (max-width: 1199px) {
    div.tabaco-snackbar {
      width: 50vw;
      margin-left: 25vw;
      margin-right: 25vw;
    }
  }

  @media (min-width: 1200px) {
    div.tabaco-snackbar {
      width: 40vw;
      margin-left: 30vw;
      margin-right: 30vw;
    }
  }
</style>

<template>
  <div class="tabaco-msg shadow rounded p-3" :class="[vueClass, textClass, positionClass, displayClass, `bg-${colorCode}`]">
    <div class="mr-auto" :class="[isValidTitle ? 'd-block' : 'd-flex align-items-center']">
      <strong class="snackbar-title" v-if="isValidTitle">{{title}}<br/></strong> {{content}}
    </div>

    <button v-for="btn in btns" :key="btn.uuid" type="button" class="btn font-weight-bold" :class="[textClass]" @click="hide(CancelType)">
      <i v-if="isBtnIconValid(btn)" :class="[btn.icon]" /> {{btn.text}}
    </button>
  </div>
</template>

<script lang="ts">
  import { Snackbar } from '@/@types/tabaco.msg';

  export default Snackbar;
</script>
<style lang="scss">
  div.tabaco-dialog > div.modal-dialog > div.modal-content {
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
  <div ref="mask" class="tabaco-msg modal" :class="[vueClass]" @click="closeByMask($event)">
    <div class="modal-dialog" :class="[dialogCls]">
      <div class="modal-content tbc-theme bright" :class="[`tbc-${colorCode}`]">
        <div class="modal-header">
          <h5 class="modal-title">{{title}}</h5>

          <button v-if="hasCancelBtn" type="button" class="close" @click="hide(CancelType)">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div v-if="'string' === typeof content" class="modal-body">{{content}}</div>
        <div v-if="'string' !== typeof content" class="modal-body">
          <slot name="default" />
        </div>

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
  import { Dialog } from '@/@types/tabaco.msg';

  export default Dialog;
</script>
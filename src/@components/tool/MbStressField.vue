<style lang="scss">
  div.tabaco-mb-stress {
    & div.modal-content {
      & > div.modal-header {
        padding-bottom: .5rem;
        border-width: 0;

        & > h6 > sup.fa {
          color: #dc3545;
          font-size: 8px;
        }
      }

      & > div.modal-body {
        padding-top: .5rem;
        max-height: calc(100vh - 106px);
        overflow-y: auto;
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
  <div class="modal tabaco-mb-stress" :class="[options.mainClass]">
    <div class="modal-dialog modal-sm">
      <div v-if="$data.group !== null" class="modal-content tbc-theme bright"
        :class="[`tbc-${groupColor}`, `text-${'light' === groupColor ? 'dark' : 'white'}`]" :style="contentBackground">

        <div class="modal-header">
          <h6 class="modal-title">
            <sup v-if="options.required === true" class="fa fa-asterisk" /> {{options.label}}
          </h6>
        </div>

        <div class="modal-body">
          <slot name="default" />
        </div>

        <div class="modal-footer p-0">
          <div class="btn-group">
            <button v-for="btn in defaultBtns" :key="btn.uuid" type="button" class="btn" :class="[getButtonCls(btn)]" @click="hide(btn.type)">
              <i v-if="isBtnIconValid(btn)" :class="[btn.icon]" /> {{btn.text}}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

</script>
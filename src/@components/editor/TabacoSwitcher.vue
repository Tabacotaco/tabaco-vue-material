<style lang="scss">
  div.tabaco-field-group {
    & > span.switcher-display {
      width: calc(100% - 68px);

      & + span.display {
        width: calc(100% - 98px);
      }
    }

    &:not(.disabled) > div.tabaco-switcher {
      cursor: pointer;
    }

    & > div.tabaco-switcher {
      display: block;
      float: right;
      height: 38px;
      width: 60px;
      padding: 5px 5px;
      border-radius: 19px;

      & > span.rounded-circle {
        display: inline-block;
        width: 28px;
        height: 28px;
      }

      &.on {
        text-align: left;
        animation: tabaco-switch-turnon .1s linear;
      }

      &.off {
        text-align: right;
        animation: tabaco-switch-turnoff .1s linear;
      }
    }
  }
</style>

<template>
  <TabacoFieldGroup :empty="isEmpty()" :value="turnOn" :options="{
    def, sm, md, lg, xl,
    color,
    label,
    disabled,
    required,
    format: overrideFormat
  }">
    <span slot="editor" class="editor switcher-display">
      {{overrideFormat(turnOn)}}
    </span>

    <div slot="tool" slot-scope="{isFocused, setFocused}" class="tabaco-switcher"
      :class="[`bg-${turnOn ? colorCode : 'secondary'}`, turnOn ? 'on' : 'off']"
      @click="isDisabled ? null : setTurnOn(setFocused)">

      <span class="rounded-circle bg-white" />
    </div>
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import TabacoFieldVue, { FormatType } from '@/@types/tabaco.field';


  @Component({
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoSwitcher extends TabacoFieldVue {
    private delayID!: number;

    @Prop() value!: boolean;

    set turnOn(v: boolean) {
      this.$emit('input', v);
      this.$emit(v === true ? 'turnOn' : 'turnOff');
    }

    get turnOn(): boolean {
      return this.value === true;
    }

    get overrideFormat(): FormatType<boolean> {
      return this.format instanceof Function ? this.format : (v => v === true ? 'On' : 'Off');
    }

    isEmpty(): boolean { return false; }

    setTurnOn(setFocused: ((isFocused: boolean) => void)): void {
      clearTimeout(this.delayID);

      this.turnOn = !this.turnOn;
      setFocused(true);

      this.delayID = setTimeout(() => {
        setFocused(false);
        clearTimeout(this.delayID);
      }, 500);
    }
  }
</script>
<style lang="scss">
  div.tabaco-field-group.tabaco-switcher {
    & > span.editor,
    & > span.display {
      width: calc(100% - 68px);
    }

    &:not(.disabled) > span.display { cursor: default; }

    &:not(.disabled) > div.tabaco-switcher-btn {
      cursor: pointer;
    }

    & > div.tabaco-switcher-btn {
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
  <TabacoFieldGroup :value="turnOn" :options="getGroupOpts({mainClass: 'tabaco-switcher', format: overrideFormat})">
    <span slot="editor" class="editor">
      {{overrideFormat(turnOn)}}
    </span>

    <div slot="tool" slot-scope="{isFocused, setFocused}" class="tabaco-switcher-btn"
      :class="[`bg-${turnOn ? colorCode : 'secondary'}`, turnOn ? 'on' : 'off']"
      @click="isDisabled ? null : (setFocused(true) || setTurnOn().then(() => setFocused(false)))">

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
    private delayID!: any;

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

    setTurnOn(): Promise<void> {
      return new Promise<void>(resolve => {
        clearTimeout(this.delayID);
        this.turnOn = !this.turnOn;
        
        this.delayID = setTimeout(() => {
          resolve();

          clearTimeout(this.delayID);
        }, 500);
      });
    }

    // setTurnOn(setFocused: ((isFocused: boolean) => void)): void {
    //   clearTimeout(this.delayID);

    //   this.turnOn = !this.turnOn;
    //   setFocused(true);

    //   this.delayID = setTimeout(() => {
    //     setFocused(false);

    //     clearTimeout(this.delayID);
    //   }, 500);
    // }
  }
</script>
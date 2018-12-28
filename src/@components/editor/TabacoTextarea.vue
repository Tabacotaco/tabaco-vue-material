<style lang="scss">
  div.tabaco-field-group.tabaco-textarea {
    & textarea.editor {
      width: 100% !important;
      overflow-y: auto;
    }

    &:not(.disabled) > span.display { cursor: text; }

    & > span.display {
      overflow-y: auto;
      padding: .375rem .75rem !important;
      word-wrap: break-word;
      white-space: pre-wrap;
      overflow-x: hidden;
    }
  }
</style>

<template>
  <TabacoFieldGroup v-model="text" @display-scroll="dispScrlTop = $event" :options="getGroupOpts({
    mainClass   : 'tabaco-textarea',
    format      : overrideFormat,
    dispHeight  : heightPx,
    dispScrlTop : dispScrlTop
  })">
    <textarea v-autofocus slot="editor" slot-scope="{setFocused}" ref="editor" class="editor"
      v-scroll-top="dispScrlTop" :style="{height: `${heightPx}px`}"
      v-model="text" @focus="setFocused(true)" @blur="setFocused(false) || doSizeSync($refs.editor.clientHeight)" />

    <textarea v-autofocus slot="mbstress" ref="editor" class="editor" :rows="showRows" v-model="text" />
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import { autofocus, scrollTop } from '@/@directives/editor.directive';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import TabacoFieldVue, { DisplayFormat } from '@/@types/tabaco.field';


  @Component({
    directives: {
      autofocus,
      scrollTop
    },
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoTextarea extends TabacoFieldVue {
    dispScrlTop = 20;
    dispHeight  = 0;

    @Prop() rows?: number;
    @Prop() value!: string;

    mounted(): void { this.doSizeSync(); }

    set text(v: string) { this.$emit('input', v); }
    set heightPx(v: number) { this.dispHeight = v; }

    get text(): string { return this.value; }
    get heightPx(): number { return this.dispHeight; }
    get showRows(): number { return 'number' === typeof this.rows && !isNaN(this.rows) ? this.rows : 2; }
    get optionFormat(): DisplayFormat<string> { return this.format instanceof Function ? this.format : (v => v); }

    get overrideFormat(): DisplayFormat<string> {
      return (v => {
        const result = this.optionFormat(v);

        return 'string' === typeof result ? result.replace(new RegExp('\n', 'g'), '<br/>').replace(new RegExp('\r', 'g'), '<br/>') : result;
      });
    }

    isEmpty(): boolean { return 'string' !== typeof this.value || this.value.length === 0; }

    doSizeSync(height?: number): void {
      if ('number' === typeof height && !isNaN(height))
        this.heightPx = height;
      else {
        const $display      = $(this.$el).find(' > span.display');
        const paddingTop    = parseFloat($display.css('padding-top').replace('px', ''));
        const paddingBottom = parseFloat($display.css('padding-bottom').replace('px', ''));
        const lineHeight    = parseFloat($display.css('line-height').replace('px', ''));

        this.heightPx = paddingTop + (lineHeight * this.showRows) + paddingBottom;
      }
    }
  }
</script>
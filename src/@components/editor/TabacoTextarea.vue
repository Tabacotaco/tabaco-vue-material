<style lang="scss">
  div.tabaco-field-group.tabaco-textarea {
    & textarea.editor {
      width: 100% !important;
      overflow-y: auto;
    }

    & > span.display {
      cursor: text;
      overflow-y: auto;
      padding: .375rem .75rem !important;
    }
  }
</style>

<template>
  <TabacoFieldGroup v-model="text" :options="getGroupOpts({mainClass: 'tabaco-textarea', format: overrideFormat, displayHeight: heightPx})">
    <textarea v-autofocus slot="editor" slot-scope="{setFocused}" ref="editor" class="editor" :style="{height: `${heightPx}px`}"
      v-model="text" @focus="setFocused(true)" @blur="setFocused(false) || doSizeSync($refs.editor.clientHeight)" />

    <textarea v-autofocus slot="mbstress" ref="editor" class="editor" :rows="showRows" v-model="text" />
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import { autofocus } from '@/@directives/editor.directive';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import TabacoFieldVue, { FormatType } from '@/@types/tabaco.field';


  type TextareaData = {displayHeight: number;};

  @Component({
    directives: {
      autofocus
    },
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoTextarea extends TabacoFieldVue {
    @Prop() rows?: number;
    @Prop() value!: string;

    mounted(): void { this.doSizeSync(); }

    set text(v: string) { this.$emit('input', v); }
    set heightPx(v: number) { this.$data.displayHeight = v; }

    get text(): string { return this.value; }
    get heightPx(): number { return this.$data.displayHeight; }
    get showRows(): number { return 'number' === typeof this.rows && !isNaN(this.rows) ? this.rows : 2; }
    get optionFormat(): FormatType<string> { return this.format instanceof Function ? this.format : (v => v); }

    get overrideFormat(): FormatType<string> {
      return (v => {
        const result = this.optionFormat(v);

        return 'string' === typeof result ? result.replace(new RegExp('\n', 'g'), '<br/>').replace(new RegExp('\r', 'g'), '<br/>') : result;
      });
    }

    data(): TextareaData { return {displayHeight: 0}; }

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
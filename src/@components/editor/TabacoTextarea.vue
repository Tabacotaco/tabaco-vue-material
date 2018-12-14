<style lang="scss">
  div.tabaco-field-group {
    & > textarea.tabaco-textarea {
      width: 100% !important;
      overflow-y: auto;
    }

    & > span.display {
      overflow-y: auto;
      padding: .375rem .75rem !important;
    }
  }
</style>

<template>
  <TabacoFieldGroup :empty="isEmpty()" :value="text" :options="{
    def, sm, md, lg, xl,
    color,
    label,
    disabled,
    required,
    format: overrideFormat
  }">
    <textarea slot="editor" slot-scope="{setFocused}" ref="editor"
      class="tabaco-textarea editor" :rows="showRows"
      v-model="text" @focus="setFocused(true)" @blur="setFocused(false) || doSizeSync()" />
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
  export default class TabacoTextarea extends TabacoFieldVue {
    @Prop() rows?: number;
    @Prop() value!: string;

    mounted(): void {
      this.doSizeSync();
    }

    set text(v: string) {
      this.$emit('input', v);
    }

    get text(): string {
      return this.value;
    }

    get showRows(): number {
      return 'number' === typeof this.rows && !isNaN(this.rows) ? this.rows : 2;
    }

    get optionFormat(): FormatType<string> {
      return this.format instanceof Function ? this.format : (v => v);
    }

    get overrideFormat(): FormatType<string> {
      return (v => {
        const result = this.optionFormat(v);

        return 'string' === typeof result ? result.replace(new RegExp('\n', 'g'), '<br/>').replace(new RegExp('\r', 'g'), '<br/>') : result;
      });
    }

    isEmpty(): boolean {
      return 'string' !== typeof this.value || this.value.length === 0;
    }

    doSizeSync(): void {
      const $textarea = $(this.$refs.editor);

      $textarea.find(' + span.display').height($textarea.height() as number);
    }
  }
</script>
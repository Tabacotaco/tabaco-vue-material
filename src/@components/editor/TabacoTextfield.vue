<style lang="scss">
  div.tabaco-field-group.tabaco-textfield {
    & input.editor {
      width: 100%;
      padding-top: calc(.375rem - 1px);
    }

    &:not(.disabled) > span.display { cursor: text; }
  }
</style>

<template>
  <TabacoFieldGroup v-model="text" :options="getGroupOpts({mainClass: 'tabaco-textfield'})">
    <input v-autofocus slot="editor" slot-scope="{setFocused}" type="text" class="editor"
      v-model="text" @focus="setFocused(true)" @blur="setFocused(false)" />

    <input v-autofocus slot="mbstress" type="text" class="editor" v-model="text" />
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import { autofocus } from '@/@directives/editor.directive';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import TabacoFieldVue from '@/@types/tabaco.field';


  @Component({
    directives: {
      autofocus
    },
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoTextfield extends TabacoFieldVue {
    @Prop() value!: string;

    set text(v: string) { this.$emit('input', v); }

    get text(): string { return this.value; }

    isEmpty(): boolean {
      return 'string' !== typeof this.value || this.value.length === 0;
    }
  }
</script>
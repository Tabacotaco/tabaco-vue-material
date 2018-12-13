<style lang="scss">
  div.tabaco-field-group {
    & > input.tabaco-textfield {
      width: 100% !important;
      padding-top: calc(.375rem - 1px) !important;
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
    format
  }">
    <input slot="editor" slot-scope="{focused}"
      type="text" class="tabaco-textfield editor"
      v-model="text" @focus="focused(true)" @blur="focused(false)" />
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import TabacoFieldVue from '@/@types/tabaco.field';


  @Component({
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoTextfield extends TabacoFieldVue {
    @Prop() value!: string;

    set text(v: string) {
      this.$emit('input', v);
    }

    get text(): string {
      return this.value;
    }

    isEmpty(): boolean {
      return 'string' !== typeof this.value || this.value.length === 0;
    }
  }
</script>
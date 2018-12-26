<style lang="scss">
  ul.nav.selected-options {
    margin-bottom: 2px;

    & > li[contenteditable=true] {
      max-width: 100%;
      min-width: 40px;
      padding-right: 18px;
      line-height: 1.8;
      white-space: nowrap;
      overflow: hidden;
    }

    & > li.nav-item:not([contenteditable=true]) {
      margin: 2px 2px 2px 2px;

      & + li[contenteditable=true] { margin-left: 4px; }

      & > a.nav-link {
        font-size: .875rem;
        line-height: 1.2;
        padding: 4px 8px;

        & > button.close {
          outline: none !important;
          margin-top: -6px;
        }
      }
    }
  }
</style>

<template>
  <ul class="nav nav-pills selected-options" v-dropdown-toggle="toggle">
    <li v-for="(dataModel, index) in list" :key="`nav-${index}`" class="nav-item">
      <a class="nav-link" :class="[`bg-${getColorCode(color)}`, `text-${getTextColor(color)}`]">
        <button type="button" class="close ml-2" :class="[`text-${getTextColor(color)}`]" :disabled="disabled"
          @click="disabled ? null : $emit('remove', dataModel)">
          <span>&times;</span>
        </button>

        <slot name="option" :dataModel="dataModel" :index="index" />
      </a>
    </li>

    <slot name="lastItem" />
  </ul>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  import { Color, getColorCode, getTextColor } from '@/@types/tabaco.layout';
  import { dropdownToggle } from '@/@directives/editor.directive';

  @Component({
    inject: {
      getColorCode : {default: () => getColorCode},
      getTextColor : {default: () => getTextColor}
    },
    directives: {
      dropdownToggle
    }
  })
  export default class SelectedNav<DataModelType> extends Vue {
    @Prop() color?: Color;
    @Prop() toggle?: boolean;
    @Prop() disabled?: boolean;
    @Prop() list!: DataModelType[];
  }
</script>
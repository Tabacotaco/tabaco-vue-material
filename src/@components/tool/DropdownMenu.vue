<style lang="scss">
  div.tbc-dropdown-menu {
    & > a.dropdown-item {
      &:not(.disabled) { cursor: pointer; }
      &.disabled { cursor: not-allowed; }
      &:hover { background-color: unset; }
      &.hover:not(.disabled) {
        color: white !important;
        background-color: #6c757d !important;
      }
    }
  }
</style>

<template>
  <div v-autorevise="offset" class="tbc-dropdown-menu dropdown-menu light" :class="[`tbc-${getColorCode(color)}`]">
    <a v-for="(dataModel, index) in list" :key="`option-${index}`"
      @click="$emit('click', dataModel)"
      @mouseover="$emit('update:hoverAt', index)"
      @mouseout="$emit('update:hoverAt')"
      :class="{
        'dropdown-item' : true,
        hover           : hover === index,
        active          : isActived(dataModel, index)
      }">
      <slot name="option" :dataModel="dataModel" :index="index" />
    </a>

    <a v-if="list.length === 0" class="dropdown-item disabled text-center text-secondary">
      Data Not Found
    </a>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator';

  import { autorevise } from '@/@directives/editor.directive';

  import { Color, getColorCode } from '@/@types/tabaco.layout';
  import { HoverAt } from '@/@types/tabaco.field';


  type StatusFn<DataModelType> = (dataModel: DataModelType, index: number) => boolean;

  @Component({
    inject: {
      getColorCode : {default: () => getColorCode}
    },
    directives: {
      autorevise
    }
  })
  export default class DropdownMenu<DataModelType> extends Vue {
    @Prop() actived?: StatusFn<DataModelType>;
    @Prop() color?: Color;
    @Prop() list!: DataModelType[];

    @Prop({default: true}) offset?: boolean;
    @Prop({default: null}) hoverAt?: HoverAt;

    get isActived(): StatusFn<DataModelType> {
      return this.actived instanceof Function ? this.actived : ((dataModel: DataModelType, index: number) => false);
    }

    get hover(): HoverAt {
      const count = (this.list || []).length;

      return 'number' !== typeof this.hoverAt || (this.hoverAt !== 0 && isNaN(this.hoverAt)) ? null
        : ((this.hoverAt % count + count) % count);
    }
  }
</script>
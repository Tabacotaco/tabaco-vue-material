<style lang="scss">
  div.tabaco-field-group.tabaco-combobox {
    &:not(.disabled) > span.display { cursor: pointer; }

    & > div.editor > input.filter-text {
      display: block !important;
      width: 100%;
      padding-right: 18px;
    }
  }
</style>

<template>
  <TabacoFieldGroup v-model="option" :options="getGroupOpts({
    mainClass : 'tabaco-combobox dd-group',
    dispClass : 'tbc-dropdown',
    format    : displayFormat
  })">
    <div slot="editor" slot-scope="{setFocused}" class="dropdown editor tbc-dropdown" v-dropdown="setFocused" v-arrow="{
      up      : () => hoverAt = getDefaultHoverAt(0) - 1,
      down    : () => hoverAt = getDefaultHoverAt(-1) + 1,
      confirm : () => hoverAt === null? null : setSelected(datalist[hoverAt])
    }">
      <input ref="toggle" v-autofocus="() => $($refs.toggle).dropdown('toggle')" v-dropdown-toggle
        type="text" class="filter-text" @input="onTextfieldInput()" @blur="onFilterTextBlur()" v-model="filterText" />

      <DropdownMenu :hoverAt.sync="hoverAt" :color="color" :list="datalist" :actived="d => value === d[valueField]" @click="setSelected($event)">
        <template slot="option" slot-scope="{dataModel, index}">
          <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
            {{displayFormat(dataModel)}}
          </slot>
        </template>
      </DropdownMenu>
    </div>

    <DropdownMenu slot="mbstress" :offset="false" :color="color" :list="datalist" :actived="d => value === d[valueField]" @click="setSelected($event)">
      <template slot="option" slot-scope="{dataModel, index}">
        <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
          {{displayFormat(dataModel)}}
        </slot>
      </template>
    </DropdownMenu>
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';

  import { arrow, autofocus, dropdown, dropdownToggle } from '@/@directives/editor.directive';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import DropdownMenu from '@/@components/tool/DropdownMenu.vue';

  import TabacoFieldVue, { DisplayFormat, EmptyValue, RequestPromise, HoverAt } from '@/@types/tabaco.field';

  import $ from 'jquery';


  @Component({
    inject: {
      $: {default: () => $}
    },
    directives: {
      arrow,
      autofocus,
      dropdown,
      dropdownToggle
    },
    components: {
      TabacoFieldGroup,
      DropdownMenu
    }
  })
  export default class TabacoCombobox<DataModel, ValueType> extends TabacoFieldVue {
    private filterText = '';
    private allOptions: DataModel[] = [];
    private selectedOption: DataModel | null = null;
    private hoverAt: HoverAt = null;
    private delayID!: any;

    @Prop() private valueField!: string;
    @Prop() private options!: RequestPromise<DataModel> | Array<DataModel>;

    @Prop() value!: EmptyValue<ValueType>;

    set option(v: DataModel | null) {
      this.selectedOption = v;
      this.filterText     = this.selectedDisplay;

      this.$emit('input', v === null ? null : (v as any)[this.valueField]);
      this.$emit(this.selectedOption === null ? 'disselected' : 'selected', this.selectedOption);
    }

    get option(): DataModel | null { return this.selectedOption; }

    get isRemote(): boolean { return this.options instanceof Function; }

    get isFiltering(): boolean { return this.allOptions.filter(d => this.filterText === this.displayFormat(d)).length === 0; }

    get selectedDisplay(): string { return this.selectedOption !== null ? this.displayFormat(this.selectedOption) : ''; }

    get displayFormat(): DisplayFormat<DataModel> {
      return this.format instanceof Function ? this.format
        : ((dataModel: DataModel): string => dataModel ? (dataModel as any)[this.valueField] : null);
    }

    get datalist(): DataModel[] {
      const filters = this.filterText.split(' ').filter(param => param.trim().length > 0);
      const displayFormat = this.selectedDisplay;

      return this.isRemote ? this.allOptions : (this.options as DataModel[]).filter((model: any) =>
        filters.length === 0 || filters.filter((param: string) =>
          param === displayFormat || Object.keys(model).filter((fieldName: string) =>
            model[fieldName].toString().toUpperCase().indexOf(param.toUpperCase()) >= 0
          ).length > 0
        ).length > 0
      );
    }

    created() {
      if (!this.isEmpty()) {
        if (!this.isRemote) {
          const mappings = this.datalist.filter((dataModel: DataModel) => (dataModel as any)[this.valueField] === this.value);

          if (mappings.length === 0) 
            this.value = null;
          else {
            this.selectedOption = mappings[0];
            this.filterText     = this.selectedDisplay;
          }
        } else {

        }
      }
    }

    isEmpty(): boolean { return this.value === null; }

    setSelected(dataModel: DataModel): void {
      this.hoverAt = null;
      this.option     = dataModel;
    }

    getDefaultHoverAt(defaultNum: number): number {
      return 'number' === typeof this.hoverAt && (this.hoverAt === 0 || !isNaN(this.hoverAt)) ? this.hoverAt
        : this.selectedOption !== null ? this.datalist.indexOf(this.selectedOption) : defaultNum;
    }

    onFilterTextBlur(): void {
      const datalist = this.datalist;

      if (this.isFiltering && datalist.length === 1)
        this.setSelected(datalist[0]);
      else
        this.filterText = this.selectedDisplay;
    }

    onTextfieldInput(): void {
      this.hoverAt = 0;

      if ('string' !== typeof this.filterText || this.filterText.trim().length === 0)
        this.option = null;
      else if (this.isRemote && this.isFiltering) {
        clearTimeout(this.delayID);

        this.delayID = setTimeout(() =>
          (this.options as RequestPromise<DataModel>)(this.filterText.split(' ').filter(param => param.trim().length > 0))
            .then((datalist: DataModel[]) => this.allOptions = datalist)
            .then(() => clearTimeout(this.delayID)),
          400
        );
      }
    }
  }
</script>
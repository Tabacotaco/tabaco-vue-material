<style lang="scss">
  div.tabaco-field-group.tabaco-combobox {
    &:not(.disabled) > span.display { cursor: pointer; }

    & > div.editor {
      & > input.filter-text {
        display: block !important;
        width: 100%;
        padding-right: 18px;
      }
    }

    & > div.mb-stress {
      & div.dropdown-menu {
        position: static;
        display: block;
        float: none;
        margin: auto;
        width: 80%;
      }
    }
  }
</style>

<template>
  <TabacoFieldGroup v-model="option" :options="getGroupOpts({mainClass: 'tabaco-combobox', format: displayFormat})">
    <div slot="editor" slot-scope="{setFocused}" class="dropdown editor">
      <input ref="toggle" v-autofocus="onAutofocus" v-dropdown="setFocused"
        type="text" class="filter-text" data-toggle="dropdown" v-model="filterText"
        @input="onTextfieldInput()"
        @keyup.up="setOptionHover(hoverIndex === null ? -1 : (hoverIndex - 1))"
        @keyup.down="setOptionHover(hoverIndex === null ? 0 : (hoverIndex + 1))"
        @keyup.enter="hoverIndex === null? null : setSelected(datalist[hoverIndex])"
        @blur="onFilterTextBlur()" />

      <div ref="menu" class="dropdown-menu light" :class="[`tbc-${colorCode}`]">
        <a v-for="(dataModel, index) in datalist" :key="dataModel[valueField]"
          class="dropdown-item" :class="{hover: hoverIndex === index, active: value === dataModel[valueField]}"
          @click="setSelected(dataModel)"
          @mouseover="setOptionHover(index)"
          @mouseout="setOptionHover()">

          <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
            {{displayFormat(dataModel)}}
          </slot>
        </a>

        <a v-if="datalist.length === 0" class="dropdown-item disabled text-center text-secondary">
          Data Not Found
        </a>
      </div>
    </div>

    <div slot="mbstress" class="dropdown-menu light" :class="[`tbc-${colorCode}`]">
      <a v-for="(dataModel, index) in datalist" :key="dataModel[valueField]"
        class="dropdown-item" :class="{hover: hoverIndex === index, active: value === dataModel[valueField]}"
        @click="setSelected(dataModel)"
        @mouseover="setOptionHover(index)"
        @mouseout="setOptionHover()">

        <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
          {{displayFormat(dataModel)}}
        </slot>
      </a>

      <a v-if="datalist.length === 0" class="dropdown-item disabled text-center text-secondary">
        Data Not Found
      </a>
    </div>
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { DirectiveOptions, VNodeDirective, VNode } from 'vue';
  import { Component, Prop } from 'vue-property-decorator';

  import { autofocus } from '@/@directives/editor.directive';
  import { dropdown } from '@/@directives/editor.directive';
  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';

  import TabacoFieldVue, {
    FormatType,
    OptionValueType,
    RequestType,
    HoverCtrlType
  } from '@/@types/tabaco.field';


  @Component({
    directives: {
      autofocus,
      dropdown
    },
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoCombobox<DataModelType, ValueType> extends TabacoFieldVue {
    private filterText = '';
    private allOptions: DataModelType[] = [];
    private selectedOption: DataModelType | null = null;
    private hoverIndex: HoverCtrlType = null;
    private delayID!: any;

    @Prop() private valueField!: string;
    @Prop() private options!: RequestType<DataModelType> | Array<DataModelType>;

    @Prop() value!: OptionValueType<ValueType>;

    set option(v: DataModelType | null) {
      this.selectedOption = v;
      this.filterText     = this.selectedDisplay;

      this.$emit('input', v === null ? null : (v as any)[this.valueField]);
      this.$emit(this.selectedOption === null ? 'disselected' : 'selected', this.selectedOption);
    }

    get option(): DataModelType | null {
      return this.selectedOption;
    }

    get isRemote(): boolean {
      return this.options instanceof Function;
    }

    get isFiltering(): boolean {
      return this.allOptions.filter(dataModel => this.filterText === this.displayFormat(dataModel)).length === 0;
    }

    get selectedDisplay(): string {
      return this.selectedOption !== null ? this.displayFormat(this.selectedOption) : '';
    }

    get displayFormat(): FormatType<DataModelType> {
      return this.format instanceof Function ? this.format
        : ((dataModel: DataModelType): string => dataModel ? (dataModel as any)[this.valueField] : null);
    }

    get datalist(): DataModelType[] {
      const filters = this.filterText.split(' ').filter(param => param.trim().length > 0);
      const displayFormat = this.selectedDisplay;

      return this.isRemote ? this.allOptions : (this.options as DataModelType[]).filter((model: any) =>
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
          const mappings = this.datalist.filter((dataModel: DataModelType) => (dataModel as any)[this.valueField] === this.value);

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

    isEmpty(): boolean {
      return this.value === null;
    }

    setOptionHover(newIndex?: HoverCtrlType): void {
      if (newIndex === undefined || newIndex === null || 'number' !== typeof newIndex || isNaN(newIndex))
        this.hoverIndex = null;
      else {
        const count = $(this.$refs.menu).find(' > a.dropdown-item').length;

        this.hoverIndex = (newIndex + count) % count; 
      }
    }

    setSelected(dataModel: DataModelType): void {
      this.hoverIndex = null;
      this.option     = dataModel;
    }

    onAutofocus(): void {
      ($(this.$refs.toggle) as any).dropdown('toggle');
    }

    onFilterTextBlur(): void {
      const datalist = this.datalist;

      if (this.isFiltering && datalist.length === 1)
        this.setSelected(datalist[0]);
      else
        this.filterText = this.selectedDisplay;
    }

    onTextfieldInput(): void {
      this.hoverIndex = 0;

      if ('string' !== typeof this.filterText || this.filterText.trim().length === 0)
        this.option = null;
      else if (this.isRemote && this.isFiltering) {
        clearTimeout(this.delayID);

        this.delayID = setTimeout(() =>
          (this.options as RequestType<DataModelType>)(this.filterText.split(' ').filter(param => param.trim().length > 0))
            .then((datalist: DataModelType[]) => this.allOptions = datalist)
            .then(() => clearTimeout(this.delayID)),
          400
        );
      }
    }
  }
</script>
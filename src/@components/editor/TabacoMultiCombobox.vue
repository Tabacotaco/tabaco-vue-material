<style lang="scss">
  div.tabaco-field-group {
    & > div.tabaco-multi-combobox,
    & > div.tabaco-multi-combobox + span.display {
      padding: .375rem .75rem 0 .75rem !important;
    }

    & ul.nav.selected-options {
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
  }
</style>

<template>
  <TabacoFieldGroup :empty="isEmpty()" :value="selectedOptions" :options="{
    def, sm, md, lg, xl,
    color,
    label,
    disabled,
    required,
    format: displayFormat
  }">
    <div slot="editor" slot-scope="{setFocused}" class="tabaco-multi-combobox dropdown editor">
      <ul v-dropdown="setFocused" v-keep-dropdown class="nav nav-pills selected-options" data-toggle="dropdown" @click="$refs.filter.focus()">

        <!-- TODO: Selected Display -->
        <li v-for="(dataModel, index) in selectedOptions" :key="dataModel[valueField]" class="nav-item">
          <a class="nav-link" :class="['bg-' + colorCode, selectedTextColor]">
            <button type="button" class="close ml-2" :class="[selectedTextColor]" @click="setSelected(false, dataModel)">
              <span>&times;</span>
            </button>

            <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
              {{displayFormat(dataModel)}}
            </slot>
          </a>
        </li>

        <!-- TODO: Filter Input -->
        <li ref="filter" class="nav-item filter-text" contenteditable="true"
          @input="onTextfieldInput()"
          @blur="onFilterTextBlur()"
          @keyup.up="setOptionHover(hoverIndex === null ? -1 : (hoverIndex - 1))"
          @keyup.down="setOptionHover(hoverIndex === null ? 0 : (hoverIndex + 1))"
          @keyup.enter="hoverIndex === null? null : setSelected(true, datalist[hoverIndex])"
          @keyup.backspace="selectedOptions.length > 0 && !isFiltering? setSelected(false, selectedOptions[selectedOptions.length - 1]) : null" />
      </ul>

      <div ref="menu" class="dropdown-menu light" :class="[`tbc-${colorCode}`]">
        <a v-for="(dataModel, index) in datalist" :key="dataModel[valueField]"
          class="dropdown-item" :class="{hover: hoverIndex === index, active: isSelected(dataModel)}"
          @click="setSelected(!isSelected(dataModel), dataModel)"
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

    <template slot="display" slot-scope="{value, format}">
      <span class="display">
        <ul class="nav nav-pills selected-options">
          <li v-for="(dataModel, index) in value" :key="dataModel[valueField]" class="nav-item">
            <a class="nav-link" :class="['bg-' + colorCode, selectedTextColor]">
              <button type="button" class="close ml-2" :class="[selectedTextColor]" @click="setSelected(false, dataModel)">
                <span>&times;</span>
              </button>

              <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
                {{displayFormat(dataModel)}}
              </slot>
            </a>
          </li>
        </ul>
      </span>
    </template>
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { DirectiveOptions, VNodeDirective, VNode } from 'vue';
  import { Component, Prop } from 'vue-property-decorator';

  import { dropdown, keepDropdown } from '@/@directives/editor.directive';
  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';

  import TabacoFieldVue, {
    FormatType,
    OptionValueType,
    RequestType,
    HoverCtrlType
  } from '@/@types/tabaco.field';


  @Component({
    directives: {
      dropdown,
      keepDropdown
    },
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoMultiCombobox<DataModelType, ValueType> extends TabacoFieldVue {
    private filterText = '';
    private allOptions: DataModelType[] = [];
    private selectedOptions: DataModelType[] = [];
    private hoverIndex: HoverCtrlType = null;
    private delayID!: number;

    @Prop() private valueField!: string;
    @Prop() private options!: RequestType<DataModelType> | Array<DataModelType>;
    @Prop() private placeholder?: string;

    @Prop() value!: OptionValueType<ValueType[]>;

    set optValue(v: OptionValueType<ValueType[]>) {
      this.$emit('input', v);
    }

    get optValue(): OptionValueType<ValueType[]> {
      return this.value;
    }

    get isFiltering(): boolean {
      return 'string' === typeof this.filterText && this.filterText.length > 0;
    }

    get isRemote(): boolean {
      return this.options instanceof Function;
    }

    get selectedTextColor(): string {
      return `text-${['warning', 'light'].indexOf(this.colorCode) >= 0 ? 'dark' : 'white'}`;
    }

    get displayFormat(): FormatType<DataModelType> {
      return this.format instanceof Function ? this.format
        : ((dataModel: DataModelType): string => dataModel ? (dataModel as any)[this.valueField] : null);
    }

    get datalist(): DataModelType[] {
      const filters = this.filterText.split(' ').filter(param => param.trim().length > 0);

      return this.isRemote ? this.allOptions : (this.options as DataModelType[]).filter((model: any) =>
        filters.length === 0 || filters.filter((param: string) =>
          Object.keys(model).filter((fieldName: string) =>
            model[fieldName].toString().toUpperCase().indexOf(param.toUpperCase()) >= 0
          ).length > 0
        ).length > 0
      );
    }

    created() {
      if (!this.isEmpty()) {
        if (!this.isRemote) {
          const mappings = this.datalist.filter((dataModel: DataModelType) => (this.value as ValueType[]).indexOf((dataModel as any)[this.valueField]) >= 0);

          if (mappings.length === 0) 
            this.optValue = [];
          else
            this.selectedOptions = this.selectedOptions.concat(mappings);
        } else {

        }
      }
    }

    isEmpty(): boolean {
      return !(this.value instanceof Array) || this.value.length === 0;
    }

    isSelected(dataModel: DataModelType): boolean {
      return (this.selectedOptions instanceof Array ? this.selectedOptions : []).indexOf(dataModel) >= 0;
    }

    setOptionHover(newIndex?: HoverCtrlType): void {
      if (newIndex === undefined || newIndex === null || 'number' !== typeof newIndex || isNaN(newIndex))
        this.hoverIndex = null;
      else {
        const count = $(this.$refs.menu).find(' > a.dropdown-item').length;

        this.hoverIndex = (newIndex + count) % count; 
      }
    }

    setSelected(isChecked: boolean, dataModel: DataModelType): void {
      if (isChecked) {
        this.selectedOptions.push(dataModel);

        this.$emit('input', this.selectedOptions.map(selected => (selected as any)[this.valueField]));
        this.$emit('selected', this.selectedOptions);

        this.onFilterTextBlur(false);
      } else {
        this.selectedOptions.splice(this.selectedOptions.indexOf(dataModel), 1);

        this.$emit('input', this.selectedOptions.map(selected => (selected as any)[this.valueField]));
        this.$emit('disselected', dataModel);
      }
    }

    onFilterTextBlur(clearHoverIndex: boolean = true): void {
      this.filterText = '';
      this.hoverIndex = clearHoverIndex ? null : this.hoverIndex;

      $(this.$refs.filter).text('');
    }

    onTextfieldInput(): void {
      this.filterText = $(this.$refs.filter).text();

      if (this.isRemote) {
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
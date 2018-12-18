<style lang="scss">
  div.tabaco-field-group.tabaco-multi-combobox {
    & > div.editor,
    & > span.display {
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
  <TabacoFieldGroup v-model="option" :options="getGroupOpts({mainClass: 'tabaco-multi-combobox', format: displayFormat})">
    <div slot="editor" slot-scope="{setFocused}" class="dropdown editor">
      <ul ref="toggle" v-dropdown="setFocused" v-keep-dropdown class="nav nav-pills selected-options" data-toggle="dropdown" @click="$refs.filter.focus()">

        <!-- TODO: Selected Display -->
        <li v-for="(dataModel, index) in option" :key="dataModel[valueField]" class="nav-item">
          <a class="nav-link" :class="['bg-' + colorCode, selectedTextColor]">
            <button type="button" class="close ml-2" :class="[selectedTextColor]" @click="setSelected(dataModel)">
              <span>&times;</span>
            </button>

            <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
              {{displayFormat(dataModel)}}
            </slot>
          </a>
        </li>

        <!-- TODO: Filter Input -->
        <li ref="filter" v-autofocus="onAutofocus" class="nav-item filter-text" contenteditable="true"
          @input="onTextfieldInput()"
          @blur="onFilterTextBlur()"
          @keyup.up="setOptionHover(hoverIndex === null ? -1 : (hoverIndex - 1))"
          @keyup.down="setOptionHover(hoverIndex === null ? 0 : (hoverIndex + 1))"
          @keyup.enter="hoverIndex === null? null : setSelected(datalist[hoverIndex])"
          @keyup.backspace="option.length > 0 && !isFiltering? setSelected(option[option.length - 1]) : null" />
      </ul>

      <div ref="menu" class="dropdown-menu light" :class="[`tbc-${colorCode}`]">
        <a v-for="(dataModel, index) in datalist" :key="dataModel[valueField]"
          class="dropdown-item" :class="{hover: hoverIndex === index, active: isSelected(dataModel)}"
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

    <span slot="display" slot-scope="{format, setFocused}" class="display" @click="onClickDisplay($event, setFocused)">
      <ul class="nav nav-pills selected-options">
        <li v-for="(dataModel, index) in option" :key="dataModel[valueField]" class="nav-item">
          <a class="nav-link" :class="['bg-' + colorCode, selectedTextColor]">
            <button type="button" class="close ml-2" :class="[selectedTextColor]" :disabled="disabled"
              @click="disabled ? null : setSelected(dataModel)">
              <span>&times;</span>
            </button>

            <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
              {{displayFormat(dataModel)}}
            </slot>
          </a>
        </li>
      </ul>
    </span>

    <div slot="mbstress" class="dropdown-menu light" :class="[`tbc-${colorCode}`]">
      <a v-for="(dataModel, index) in datalist" :key="dataModel[valueField]"
        class="dropdown-item" :class="{hover: hoverIndex === index, active: isSelected(dataModel)}"
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
  import { Component, Prop } from 'vue-property-decorator';

  import { autofocus } from '@/@directives/editor.directive';
  import { dropdown, keepDropdown } from '@/@directives/editor.directive';
  import { isMobileLayout } from '@/@types/tabaco.layout';

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

    set option(v: DataModelType[]) {
      const sjson = this.selectedOptions.map(opt => JSON.stringify(opt));
      const vjson = v.map(opt => JSON.stringify(opt));
      const dis   = sjson.filter(opt => vjson.indexOf(opt) < 0);
      const sel   = vjson.filter(opt => sjson.indexOf(opt) < 0);

      this.selectedOptions = v;
      this.$emit('input', this.selectedOptions.map(opt => (opt as any)[this.valueField]));

      if (dis.length > 0) this.$emit('disselected' , dis.map(json => JSON.parse(json))[0]);
      if (sel.length > 0) this.$emit('selected'    , sel.map(json => JSON.parse(json))[0]);
    }

    get option(): DataModelType[] {
      return this.selectedOptions;
    }

    get isFiltering(): boolean { return 'string' === typeof this.filterText && this.filterText.length > 0; }
    get isRemote(): boolean { return this.options instanceof Function; }
    get selectedTextColor(): string { return `text-${['warning', 'light'].indexOf(this.colorCode) >= 0 ? 'dark' : 'white'}`; }

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
            this.option = [];
          else
            this.selectedOptions = this.selectedOptions.concat(mappings);
        } else {

        }
      }
    }

    isEmpty(): boolean { return !(this.value instanceof Array) || this.value.length === 0; }

    isSelected(dataModel: DataModelType): boolean {
      return this.option.indexOf(dataModel) >= 0;
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
      const option = ([] as DataModelType[]).concat(this.option);
      const index = option.indexOf(dataModel);

      index < 0 ? option.push(dataModel) : option.splice(index, 1);
      this.option = option;
    }

    onAutofocus(): void {
      ($(this.$refs.toggle) as any).dropdown('toggle');
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

    onClickDisplay(e: Event, setFocused: (isFocused: boolean) => void): void {
      const $target = $(e.target as Element);

      if (isMobileLayout() && ($target.is('button.close') || $target.parent('button.close').length > 0)) {
        e.preventDefault();
        e.stopPropagation();
      } else
        setFocused(true);
    }
  }
</script>
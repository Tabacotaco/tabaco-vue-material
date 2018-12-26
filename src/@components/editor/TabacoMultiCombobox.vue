<style lang="scss">
  div.tabaco-field-group.tabaco-multi-combobox {
    & > .tbc-dropdown { padding: .375rem .75rem 0 .75rem !important; }
  }
</style>

<template>
  <TabacoFieldGroup v-model="option" :options="getGroupOpts({
    mainClass    : 'tabaco-multi-combobox dd-group',
    displayClass : 'tbc-dropdown',
    format       : displayFormat
  })">
    <div slot="editor" slot-scope="{setFocused}" class="dropdown editor tbc-dropdown" v-dropdown="setFocused" v-keep-dropdown>
      <SelectedNav ref="toggle" :color="color" :disabled="disabled" :toggle="true" :list="option" @remove="setSelected($event)">
        <template slot="option" slot-scope="{dataModel, index}">
          <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
            {{displayFormat(dataModel)}}
          </slot>
        </template>

        <!-- TODO: Filter Input -->
        <li slot="lastItem" ref="filter" v-autofocus="() => $($refs.toggle.$el).dropdown('toggle')"
          class="nav-item filter-text" contenteditable="true"
          @input="onTextfieldInput()"
          @blur="onFilterTextBlur()"
          @keydown.enter="$event.preventDefault() || $event.stopPropagation()"
          @keyup.up="hoverAt = (hoverAt === null ? 0 : hoverAt) - 1"
          @keyup.down="hoverAt = (hoverAt === null ? -1 : hoverAt) + 1"
          @keyup.enter="hoverAt === null? null : setSelected(datalist[hoverAt])"
          @keyup.backspace="option.length > 0 && !isFiltering? setSelected(option[option.length - 1]) : null" />
      </SelectedNav>

      <DropdownMenu :hoverAt.sync="hoverAt" :color="color" :list="datalist" :actived="d => isSelected(d)" @click="setSelected($event)">
        <template slot="option" slot-scope="{dataModel, index}">
          <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
            {{displayFormat(dataModel)}}
          </slot>
        </template>
      </DropdownMenu>
    </div>

    <span slot="display" slot-scope="{format, setFocused, displayClass}" class="display" :class="displayClass" @click="onClickDisplay($event, setFocused)">
      <SelectedNav ref="toggle" :color="color" :disabled="disabled" :list="option" @remove="setSelected($event)">
        <template slot="option" slot-scope="{dataModel, index}">
          <slot name="option" :dataModel="dataModel" :displayText="displayFormat(dataModel)" :index="index">
            {{displayFormat(dataModel)}}
          </slot>
        </template>
      </SelectedNav>
    </span>

    <DropdownMenu slot="mbstress" :offset="false" :color="color" :list="datalist" :hoverAt.sync="hoverAt"
      :actived="d => isSelected(d)" @click="setSelected($event)">
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

  import { autofocus, dropdown, keepDropdown } from '@/@directives/editor.directive';
  import { isMobileLayout } from '@/@types/tabaco.layout';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import SelectedNav from '@/@components/tool/SelectedNav.vue';
  import DropdownMenu from '@/@components/tool/DropdownMenu.vue';

  import TabacoFieldVue, {
    FormatType,
    OptionValueType,
    RequestType,
    HoverCtrlType
  } from '@/@types/tabaco.field';

  import $ from 'jquery';


  @Component({
    inject: {
      $: {default: () => $}
    },
    directives: {
      autofocus,
      dropdown,
      keepDropdown
    },
    components: {
      TabacoFieldGroup,
      SelectedNav,
      DropdownMenu
    }
  })
  export default class TabacoMultiCombobox<DataModelType, ValueType> extends TabacoFieldVue {
    private filterText = '';
    private allOptions: DataModelType[] = [];
    private selectedOptions: DataModelType[] = [];
    private hoverAt: HoverCtrlType = null;
    private delayID!: any;

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
        this.hoverAt = null;
      else {
        const count = $(this.$refs.menu).find(' > a.dropdown-item').length;

        this.hoverAt = (newIndex + count) % count; 
      }
    }

    setSelected(dataModel: DataModelType): void {
      const option = ([] as DataModelType[]).concat(this.option);
      const index = option.indexOf(dataModel);

      index < 0 ? option.push(dataModel) : option.splice(index, 1);
      this.option = option;
    }

    onFilterTextBlur(clearHoverIndex: boolean = true): void {
      this.filterText = '';
      this.hoverAt = clearHoverIndex ? null : this.hoverAt;

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
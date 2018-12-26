<style lang="scss">
  div.tabaco-field-group.tabaco-datepicker {
    &:not(.disabled) > span.display { cursor: pointer; }

    & > div.editor {
      & > input[data-toggle] {
        display: block !important;
        width: 100%;
        padding-right: 18px;
        background-color: rgba(0, 0, 0, 0) !important;
        font-size: 1rem !important;
        line-height: 1.4;
        -webkit-box-shadow: none !important;
        box-shadow: none !important;
        outline: none !important;
        border-width: 0 !important;
        color: inherit;
      }

      & > div.dropdown-menu.dropdown-calendar {
        max-height: none !important;

        & > nav.navbar {
          min-width: 15rem;

          & button.tbc-dropdown {
            padding-right: 2rem;
          }
        }

        & table.table {
          & td, & th {
            padding: .25rem;
            width: 14.2857% !important;
            max-width: 40px !important;
          }

          & td {
            text-align: right;

            & > a.dropdown-item { border-radius: 50%; }
          }
        }
      }
    }
  }
</style>

<template>
  <TabacoFieldGroup v-model="date" :options="getGroupOpts({
    mainClass    : 'tabaco-datepicker dd-group',
    displayClass : 'tbc-dropdown-datepicker',
    format       : overrideFormat
  })">
    <div slot="editor" slot-scope="{setFocused}" class="dropdown datepicker editor" v-dropdown="setFocused">
      <input ref="toggle" v-autofocus="onAutofocus"
        type="text" data-toggle="dropdown" v-model="date" />

      <div ref="menu" v-autooffset class="dropdown-menu light py-0 dropdown-calendar" :class="[`tbc-${colorCode}`]">
        <nav class="navbar px-2" :class="navbarCLS">
          <form class="form-inline mr-auto">
            <button type="button" class="btn border-0 tbc-dropdown" :class="[`btn-${colorCode}`]">
              {{focus.monthFormat}}
            </button>
          </form>

          <form class="form-inline">
            <button type="button" class="btn border-0" :class="[`btn-${colorCode}`]">
              <i class="fa fa-caret-left" />
            </button>

            <button type="button" class="btn border-0" :class="[`btn-${colorCode}`]">
              <i class="fa fa-caret-right" />
            </button>
          </form>
        </nav>

        <table class="table">
          <thead class="bright" :class="[`tbc-${colorCode}`]">
            <tr>
              <th>S<sub>un</sub></th>
              <th>M<sub>on</sub></th>
              <th>T<sub>ue</sub></th>
              <th>W<sub>ed</sub></th>
              <th>T<sub>hu</sub></th>
              <th>F<sub>ri</sub></th>
              <th>S<sub>at</sub></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(w, wi) in focus.weekCount" :key="`week-${w}`">
              <td v-for="(d, di) in focus.getDatesByWeekIndex(wi)" :key="`date-${di}`">
                <a class="dropdown-item py-1 px-2">{{d}}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </TabacoFieldGroup>
</template>

<script lang="ts">
  import { Component, Prop } from 'vue-property-decorator';
  import moment, { Moment } from 'moment';

  import { autofocus, dropdown, autooffset } from '@/@directives/editor.directive';
  import { getTextColor } from '@/@types/tabaco.layout';
  import TabacoFieldVue, { FormatType, FocusMoment } from '@/@types/tabaco.field';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';


  type TbcDate = string | number;

  @Component({
    inject: {
      getTextColor: {default: () => getTextColor}
    },
    directives: {
      autofocus,
      autooffset,
      dropdown
    },
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoDatepicker extends TabacoFieldVue {
    private focus!: FocusMoment;

    momentVal: Moment | null = null;

    @Prop() value!: TbcDate;
    @Prop() private moment?: string;

    set date(v: TbcDate) {
      this.momentVal = v ? moment.utc(v, 'string' === typeof v ? this.moment : undefined) : null;
      this.focus     = new FocusMoment(this.momentVal === null ? undefined : this.momentVal);
    }

    get date(): TbcDate {
      return this.momentVal === null ? '' : this.momentVal.format(this.moment);
    }

    get navbarCLS(): string[] {
      const color = this.colorCode;

      return [
        `bg-${color}`,
        `navbar-${['warning', 'light'].indexOf(color) < 0 ? 'dark' : 'light'}`
      ]
    }

    get overrideFormat(): FormatType<TbcDate> {
      return (v => {
        if (this.isDate(v))
          return 'string' === typeof this.moment && this.momentVal ? this.momentVal.format(this.moment) : v.toString();

        return '';
      });
    }

    created() {
      this.date = this.value;
    }

    isEmpty(): boolean {
      return !this.isDate(this.date);
    }

    onAutofocus(): void {
      ($(this.$refs.toggle) as any).dropdown('toggle');
    }

    formatYearMonth(mvalue: Moment): string {
      return mvalue ? mvalue.format('MMM YYYY') : '';
    }

    getWeekCounts(mvalue: Moment): number {
      return mvalue ? (mvalue.isoWeek() - moment(mvalue).startOf('month').isoWeek() + 1) : 0;
    }

    private isDate(value: any): boolean {
      return true;
    }
  }
</script>
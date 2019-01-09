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

          & th { text-align: center; }

          & td {
            text-align: right;

            & > a.dropdown-item {
              cursor: pointer; border-radius: 50%;

              &:not(.disabled) { cursor: pointer; }
              &.disabled { cursor: not-allowed; }
              &:hover { background-color: unset; }
              &.hover:not(.disabled) {
                color: white !important;
                text-align: center !important;
                background-color: #6c757d !important;
              }
            }
          }
        }
      }
    }
  }
</style>

<template>
  <TabacoFieldGroup v-model="date" :options="getGroupOpts({
    mainClass : 'tabaco-datepicker dd-group',
    dispClass : 'tbc-dropdown-datepicker',
    format    : overrideFormat
  })">
    <div slot="editor" slot-scope="{setFocused}" class="dropdown datepicker editor" v-dropdown="setFocused">
      <input ref="toggle" type="text" v-model="date" v-dropdown-toggle
        v-autofocus="() => $($refs.toggle).dropdown('toggle')" v-arrow="{
        up    : () => hoverAt = focus.add('day', -7),
        down  : () => hoverAt = focus.add('day',  7),
        left  : () => hoverAt = focus.add('day', -1),
        right : () => hoverAt = focus.add('day',  1)
      }" />

      <div ref="menu" v-autorevise class="dropdown-menu light py-0 dropdown-calendar" :class="[`tbc-${colorCode}`]">
        <nav class="navbar px-2" :class="navbarCLS">
          <form class="form-inline mr-auto">
            <button type="button" class="btn border-0 tbc-dropdown" :class="[`btn-${colorCode}`]">
              {{focus.monthFormat}}
            </button>
          </form>

          <form class="form-inline">
            <button type="button" class="btn border-0" :class="[`btn-${colorCode}`]" @click="hoverAt = focus.add('month', -1)">
              <i class="fa fa-caret-left" />
            </button>

            <button type="button" class="btn border-0" :class="[`btn-${colorCode}`]" @click="hoverAt = focus.add('month', 1)">
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
            <tr v-for="(w, wi) in focus.carlendars()" :key="`week-${wi}`">
              <td v-for="(d, di) in w" :key="`date-${di}`">
                <a v-if="d !== null" class="dropdown-item py-1 px-2" :class="{
                  hover: hoverAt === d.id
                }">{{d.date}}</a>
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

  import { arrow, autofocus, dropdown, dropdownToggle, autorevise } from '@/@directives/editor.directive';
  import { getTextColor } from '@/@types/tabaco.layout';
  import TabacoFieldVue, { DisplayFormat, FocusMoment, HoverAt } from '@/@types/tabaco.field';

  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';
  import $ from 'jquery';


  type TbcDate = string | number;

  @Component({
    inject: {
      $            : {default: () => $},
      getTextColor : {default: () => getTextColor}
    },
    directives: {
      arrow,
      autofocus,
      autorevise,
      dropdown,
      dropdownToggle
    },
    components: {
      TabacoFieldGroup
    }
  })
  export default class TabacoDatepicker extends TabacoFieldVue {
    private focus!: FocusMoment;
    private hoverAt: HoverAt = null;

    mval: Moment = moment.utc('');

    @Prop() value!: TbcDate;
    @Prop({default: 'YYYY/MM/DD'}) private moment?: string;

    set date(v: TbcDate) {
      this.mval    = moment.utc(v, 'string' === typeof v ? this.moment : undefined);
      this.focus   = new FocusMoment(this.mval);
      this.hoverAt = this.focus.id;
    }

    get date(): TbcDate {
      return !this.mval || !this.mval.isValid ? '' : this.mval.format(this.moment);
    }

    get navbarCLS(): string[] {
      return [`bg-${this.color}`, `navbar-${getTextColor(this.color)}`];
    }

    get overrideFormat(): DisplayFormat<TbcDate> {
      return (v => {
        if (this.mval.isValid())
          return 'string' === typeof this.moment && this.mval ? this.mval.format(this.moment) : v.toString();

        return '';
      });
    }

    created() {
      this.date = this.value;
    }

    isEmpty(): boolean {
      return !this.mval.isValid();
    }
  }
</script>
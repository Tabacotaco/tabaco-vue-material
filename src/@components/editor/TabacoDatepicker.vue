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
            line-height: 1.2;
            width: 14.2857% !important;
            max-width: 35px !important;
          }

          & th { text-align: center; }

          & td > a.dropdown-item {
            cursor: pointer; border-radius: 13.5px;

            &.hover, &.active { text-align: center !important; }
            &:not(.disabled) { cursor: pointer; }
            &.disabled { cursor: not-allowed; }
            &:hover { background-color: unset; }
            &.hover:not(.disabled) {
              color: white !important;
              background-color: #6c757d !important;
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
    <div ref="dropdown" slot="editor" slot-scope="{setFocused}" class="dropdown datepicker editor"
      v-dropdown="setFocused" v-dropdown-lock v-arrow="focus.getArrowOptions(doRefreshMenu)">
      <input ref="toggle" type="text" v-model="date" v-dropdown-toggle
        v-autofocus="() => $($refs.toggle).dropdown('toggle')" />

      <div ref="menu" v-autorevise class="dropdown-menu light py-0 dropdown-calendar" :class="[`tbc-${colorCode}`]">
        <nav class="navbar px-2" :class="navbarCLS">
          <form class="form-inline mr-auto">
            <button type="button" class="btn border-0" :class="[`btn-${colorCode}`]"
              @click="focus.asSwitch().then(doRefreshMenu)">
              {{focus.switcherLabel}} <i class="fa" :class="[focus.switcherIcon]" />
            </button>
          </form>

          <form class="form-inline">
            <button type="button" class="btn border-0" :class="[`btn-${colorCode}`]"
              @click="focus.asPaging('prev').then(doRefreshMenu)">
              <i class="fa fa-angle-left" />
            </button>

            <button type="button" class="btn border-0" :class="[`btn-${colorCode}`]"
              @click="focus.asPaging('next').then(doRefreshMenu)">
              <i class="fa fa-angle-right" />
            </button>
          </form>
        </nav>

        <table class="table">
          <thead v-if="focus.showWeekHeader" class="bright" :class="[`tbc-${colorCode}`]">
            <tr>
              <th>S<sub>un</sub></th>  <th>M<sub>on</sub></th>
              <th>T<sub>ue</sub></th>  <th>W<sub>ed</sub></th>
              <th>T<sub>hu</sub></th>  <th>F<sub>ri</sub></th>
              <th>S<sub>at</sub></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(list, row) in focus.getCarlendars()" :key="`week-${row}`">
              <td v-for="(item, col) in list" :key="`cell-${col}`" :class="focus.textAlign">
                <a v-if="item !== null" class="dropdown-item p-1" :data-id="item.id"
                  @mouseenter="focus.asHover(item.id).then(doRefreshMenu)"
                  @click="focus.asSelected(item.id).then(doRefreshMenu)" :class="{
                    hover  : hoverAt === item.id,
                    active : focus.selectedID === item.id
                  }">
                  {{item.text}}
                </a>
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
  import $ from 'jquery';

  import { getTextColor } from '@/@types/tabaco.layout';
  import TabacoFieldGroup from '@/@components/group/TabacoFieldGroup.vue';

  import { arrow, autofocus, dropdown, dropdownLock, dropdownToggle, autorevise } from '@/@directives/editor.directive';
  import TabacoFieldVue, { DisplayFormat, FocusMoment, HoverAt, ICarlendarMenu } from '@/@types/tabaco.field';

  type TbcDate = string | number;

  @Component({
    inject: {
      $            : {default: () => $},
      getTextColor : {default: () => getTextColor}
    },
    components: {
      TabacoFieldGroup
    },
    directives: {
      arrow,
      autofocus,
      dropdown,
      dropdownLock,
      dropdownToggle,
      autorevise
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
      this.hoverAt = this.focus.hoverID;
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

    doRefreshMenu(res: ICarlendarMenu): void {
      this.hoverAt = res.hoverAt;

      if ('string' === typeof res.selected && res.selected.trim().length > 0) {
        this.date = res.selected;
        ($(this.$refs.dropdown) as any).dropdown('toggle');
      }
    }
  }
</script>
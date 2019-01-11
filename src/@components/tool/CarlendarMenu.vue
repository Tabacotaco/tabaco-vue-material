<style lang="scss">
  div.dropdown-menu.dropdown-calendar {
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
        &:hover:not(.active) { background-color: unset; }
        &.hover:not(.disabled) {
          color: white !important;
          background-color: #6c757d !important;
        }
      }
    }
  }
</style>

<template>
  <div v-autorevise="offset" class="dropdown-menu light py-0 dropdown-calendar" :class="[`tbc-${getThemeColor(color)}`]">
    <nav class="navbar px-2" :class="navbarCLS">
      <form class="form-inline mr-auto">
        <button type="button" class="btn border-0" :class="[`btn-${getThemeColor(color)}`]"
          @click="asSwitch()">
          {{switchText}} <i class="fa" :class="switchIcon" />
        </button>
      </form>

      <form class="form-inline">
        <button type="button" class="btn border-0" :class="[`btn-${getThemeColor(color)}`]" @click="asPaging('PREV')">
          <i class="fa fa-angle-left" />
        </button>

        <button type="button" class="btn border-0" :class="[`btn-${getThemeColor(color)}`]" @click="asPaging('NEXT')">
          <i class="fa fa-angle-right" />
        </button>
      </form>
    </nav>

    <table class="table">
      <thead v-if="Display.DATE === display" class="bright" :class="[`tbc-${getThemeColor(color)}`]">
        <tr>
          <th>S<sub>un</sub></th>  <th>M<sub>on</sub></th>
          <th>T<sub>ue</sub></th>  <th>W<sub>ed</sub></th>
          <th>T<sub>hu</sub></th>  <th>F<sub>ri</sub></th>
          <th>S<sub>at</sub></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(list, row) in carlendar" :key="`week-${row}`">
          <td v-for="(item, col) in list" :key="`cell-${col}`" :class="itemAlign">
            <a v-if="item !== null" class="dropdown-item p-1" :class="getItemClass(item.id)"
              @mouseenter="asHover(item.id)"
              @click="asSelected(item.id)">
              {{item.text}}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
  import moment, { Moment } from 'moment';
  import Numeral from 'numeral';

  import { Color, getThemeColor, getTextColor } from '@/@types/tabaco.layout';
  import { EmptyValue, ICarlendarMenu } from '@/@types/tabaco.field';
  
  import { autorevise } from '@/@directives/editor.directive';


  enum Display { YEAR, MONTH, DATE }
  enum ArrowDateCount { LEFT = -1, UP = -7, RIGHT = 1, DOWN = 7 }
  enum ArrowPageCount { LEFT = -1, UP = -4, RIGHT = 1, DOWN = 4 }
  interface ICarlendar { id: number; text: number | string; };

  @Component({
    inject: {
      getThemeColor : {default: () => getThemeColor},
      getTextColor  : {default: () => getTextColor},
      Display       : {default: () => Display}
    },
    directives: {
      autorevise
    }
  })
  export default class CarlendarMenu extends Vue {
    private static FormatStr = 'YYYYMMDD';
    private static PageSize  = 20;

    private static carlendar4Dates(hover: Moment): EmptyValue<ICarlendar>[][] {
      const result: EmptyValue<{id: number; text: number | string;}>[][] = [];
      const cnt = moment(hover).daysInMonth();
      const sd  = moment(hover).startOf('month');

      for (let di = 1; di <= cnt; ) {
        const week: EmptyValue<{id: number; text: number;}>[] = [null, null, null, null, null, null, null];

        for (let wi = sd.isoWeekday() % 7; wi < 7 && di <= cnt; sd.add(1, 'day')) week[wi++] = {
          id   : parseFloat(sd.format(CarlendarMenu.FormatStr)),
          text : di++
        };
        result.push(week);
      }
      return result;
    }

    private static carlendar4Months(hover: Moment): EmptyValue<ICarlendar>[][] {
      const result: EmptyValue<{id: number; text: number | string;}>[][] = [];
      const curr = moment(`${hover.format('YYYY')}0101`, CarlendarMenu.FormatStr);

      for (let mi = 0; mi < 12; ) {
        const line: EmptyValue<{id: number; text: string;}>[] = [null, null, null, null];

        for (let i = 0; i < line.length; i++, mi++, curr.add(1, 'month')) line[i] = {
          id   : parseFloat(curr.format('YYYYMM')),
          text : curr.format('MMM')
        };
        result.push(line);
      }
      return result;
    }

    private static carlendar4Years(startYear: number): EmptyValue<ICarlendar>[][] {
      const result: EmptyValue<{id: number; text: number | string;}>[][] = [];
      const maxY = startYear + CarlendarMenu.PageSize;
      
      while (startYear < maxY) {
        const line: EmptyValue<{id: number; text: number;}>[] = [null, null, null, null];

        for (let i = 0; i < line.length; i++) line[i] = {
          id   : startYear,
          text : startYear++
        };
        result.push(line);
      }
      return result;
    }

    @Prop() color?: Color;

    @Prop({default: true})
    offset?: boolean;

    @Prop({default: moment.utc()}) 
    value!: Moment;

    private display   = Display.DATE;
    private selecting = false;
    private selected  = moment.invalid().format(CarlendarMenu.FormatStr);

    private currHover = moment.utc();
    private tempHover?: Moment;


    @Watch('value', {immediate: true})
    onChange(newValue: Moment, oldValue: Moment): void {
      this.currHover = moment(newValue);
      this.selecting = false;

      if (!this.currHover.isValid())
        this.currHover = moment.utc();
      else
        this.selected = this.currHover.format(CarlendarMenu.FormatStr);

      this.$emit('refresh', {hoverAt: this.hoverID} as ICarlendarMenu);
    }

    get navbarCLS(): string[] { return [`bg-${getThemeColor(this.color)}`, `navbar-${getTextColor(this.color)}`]; }
    get itemAlign(): string[] { return [Display.DATE === this.display ? 'text-right' : 'text-center']; }

    get switchIcon(): string[] { return [Display.DATE === this.display ? 'fa-caret-down' : 'fa-caret-up']; }
    get switchText(): string {
      switch (this.display) {
        case Display.DATE  : return this.currHover.format('MMM YYYY' );
        case Display.MONTH : return this.currHover.format('YYYY'     );
        case Display.YEAR  : return `${this.getPageStartY()} - ${this.getPageStartY() + CarlendarMenu.PageSize - 1}`;
      }
    }

    get selectedID(): number { return parseFloat(this.selected); }
    get hoverID(): number {
      switch (this.display) {
        case Display.YEAR  : return this.getHoverYear();
        case Display.MONTH : return parseFloat(this.currHover.format('YYYYMM'));
        case Display.DATE  : return parseFloat(this.currHover.format(CarlendarMenu.FormatStr));
      }
    }

    get carlendar(): EmptyValue<ICarlendar>[][] {
      switch (this.display) {
        case Display.DATE  : return CarlendarMenu.carlendar4Dates  (this.currHover);
        case Display.MONTH : return CarlendarMenu.carlendar4Months (this.currHover);
        case Display.YEAR  : return CarlendarMenu.carlendar4Years  (this.getPageStartY());
      }
    }


    getItemClass(itemID: number): ({hover: boolean; active: boolean}) {
      return {
        hover  : (this.selecting || isNaN(this.selectedID) || Display.DATE !== this.display) && this.hoverID === itemID,
        active : this.selectedID === itemID
      };
    }

    asSwitch(): void {
      switch (this.display) {
        case Display.DATE:
          this.tempHover = moment(this.currHover);
          this.display   = Display.YEAR;
          break;
        default:
          this.display   = Display.DATE;
          this.currHover = moment(this.tempHover);
          this.selecting = true;
      }
      this.$emit('refresh', {hoverAt: this.hoverID} as ICarlendarMenu);
    }

    asPaging(kind: 'NEXT' | 'PREV', hover: Moment = this.currHover.clone()): void {
      switch (this.display) {
        case Display.DATE: return this.asHover(
          parseFloat(hover.add(1 * ('NEXT' === kind ? 1 : -1), 'month').format(CarlendarMenu.FormatStr))
        );
        case Display.MONTH: return this.asHover(
          parseFloat(hover.add(1 * ('NEXT' === kind ? 1 : -1), 'year').format('YYYYMM'))
        );
        case Display.YEAR: return this.asHover(
          parseFloat(hover.add(CarlendarMenu.PageSize * ('NEXT' === kind ? 1 : -1), 'year').format('YYYY'))
        );
      }
    }

    asHover(newID: number, slient: boolean = false): void {
      let hoverDate: string = '';

      switch (this.display) {
        case Display.DATE  : hoverDate = `${Numeral(newID).format('00000000')}`; break;
        case Display.MONTH : hoverDate = `${Numeral(newID).format('000000')}01`; break;
        case Display.YEAR  : hoverDate = `${Numeral(newID).format('0000')}0101`;
      }
      this.currHover = moment.utc(hoverDate, CarlendarMenu.FormatStr);
      this.selecting = true;
      
      if (slient !== true) this.$emit('refresh', {hoverAt: this.hoverID} as ICarlendarMenu);
    }

    asSelected(targetID: number = this.hoverID): void {
      this.asHover(targetID, true);

      switch (this.display) {
        case Display.YEAR:
          this.display = Display.MONTH;
          this.$emit('refresh', {hoverAt: this.hoverID} as ICarlendarMenu);

          break;
        case Display.MONTH:
          this.display = Display.DATE;
          this.$emit('refresh', {hoverAt: this.hoverID} as ICarlendarMenu);

          break;
        case Display.DATE:
          this.selected  = this.currHover.format(CarlendarMenu.FormatStr);
          this.currHover = moment.invalid();

          this.$emit('refresh', {hoverAt: this.hoverID, selected: this.selected} as ICarlendarMenu);
      }
    }


    private getHoverYear(): number {
      return parseFloat(this.currHover.format('YYYY' ));
    }

    private getPageStartY(): number {
      return Math.floor((this.getHoverYear() - 1) / CarlendarMenu.PageSize) * CarlendarMenu.PageSize + 1;
    }

    asArrow(arrowKey: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', hover: Moment = this.currHover.clone()): void {
      switch (this.display) {
        case Display.DATE: return this.asHover(
          parseFloat(hover.add(ArrowDateCount[arrowKey], 'day'   ).format(CarlendarMenu.FormatStr))
        );
        case Display.MONTH: return this.asHover(
          parseFloat(hover.add(ArrowPageCount[arrowKey], 'month' ).format('YYYYMM'))
        );
        case Display.YEAR: return this.asHover(
          parseFloat(hover.add(ArrowPageCount[arrowKey], 'year'  ).format('YYYY'))
        );
      }
    }
  }
</script>
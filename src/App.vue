<style lang="scss">
  @import '../node_modules/font-awesome/css/font-awesome.min.css';
  @import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
  @import './css/tabaco.vue.material.scss';

  div#app {
    & div.row.tbc-theme {
      margin-left: -7px;
      margin-right: -7px;
      margin-bottom: 8px;
      border-radius: 0 0 .25rem .25rem;
    }

    & fieldset > legend {
      cursor: pointer;

      &.collapsed { margin-bottom: -1rem !important; }
    }
  }
</style>

<template>
  <div id="app" v-theme="{basic: true, depth: bright, color: mainColor}" v-loading="loading" v-snackbar="{position: SnbPosition.TOP}" v-dialog>

    <div class="container p-3">
      <fieldset class="border rounded container mb-5" :class="[`border-${getTextColor(mainColor)}`]">
        <legend class="w-auto px-2" data-toggle="collapse" data-target="#theme">
          <h5><i class="fa fa-paint-brush" /> Theme</h5>
        </legend>

        <div id="theme" class="row collapse show" v-theme="{depth: false, color: mainColor}">
          <TabacoSwitcher label="Theme Type" :color="themeColor" :def="6" :sm="4" v-model="bright" :disabled="disabled"
            :format="v => v? 'Bright' : 'Light'" />

          <TabacoCombobox label="Main Theme" :color="themeColor" :def="6" :sm="4" :disabled="disabled"
            valueField="code" :options="comboOpts.filter(opt => opt.code != themeColor)" :format="dataModel => dataModel.text" v-model="mainColor">

            <span slot="option" slot-scope="{dataModel, displayText, index}">
              <i class="fa fa-paint-brush mr-2" /> {{displayText}}
            </span>
          </TabacoCombobox>

          <TabacoCombobox label="Field Theme" :color="themeColor" :def="6" :sm="4" :disabled="disabled"
            valueField="code" :options="comboOpts.filter(opt => opt.code != mainColor)" :format="dataModel => dataModel.text" v-model="themeColor">

            <span slot="option" slot-scope="{dataModel, displayText, index}">
              <i class="fa fa-paint-brush mr-2" /> {{displayText}}
            </span>
          </TabacoCombobox>
        </div>
      </fieldset>

      <fieldset class="border rounded container mb-5" :class="[`border-${getTextColor(mainColor)}`]">
        <legend class="w-auto px-2" data-toggle="collapse" data-target="#member">
          <h5><i class="fa fa-user" /> Member</h5>
        </legend>

        <div id="member" class="row collapse show">
          <TabacoTextfield label="Member Name" :color="themeColor" :def="6" :sm="4" :required="true" :disabled="disabled" v-model="memberName" />

          <TabacoNumberfield label="Age" numeral="0,0.00" :color="themeColor" :def="6" :sm="4" :step=".1" :scale="2" :disabled="disabled"
            v-model="numberValue" :valid="isNumberValid" />

          <TabacoDatepicker label="Join Date (Building)" moment="YYYY/MM/DD" :color="themeColor" :def="6" :sm="4" :disabled="disabled" v-model="joinDate" />

          <div class="tabaco-field-group col-12 col-sm-4 text-right text-sm-center">
            <button type="button" class="btn" :class="[`btn-outline-${getTextColor(mainColor)}`]">
              <i class="fa fa-user-plus" /> Add Member
            </button>
          </div>

          <TabacoMultiCombobox label="Members" :color="themeColor" :disabled="disabled"
            valueField="code" :options="multiOpts" :format="dataModel => dataModel.fullName" v-model="memberGroup">

            <span slot="option" slot-scope="{dataModel, displayText, index}">
              <i class="fa fa-paint-brush mr-2" /> {{displayText}}
            </span>
          </TabacoMultiCombobox>
        </div>
      </fieldset>

      <fieldset class="border rounded container mb-5" :class="[`border-${getTextColor(mainColor)}`]">
        <legend class="w-auto px-2" data-toggle="collapse" data-target="#protect">
          <h5><i class="fa fa-lock" /> Protect</h5>
        </legend>

        <div id="protect" class="row collapse show">
          <TabacoSwitcher label="Disabled" :color="themeColor" :def="6" :sm="4" v-model="disabled" />

          <div class="tabaco-field-group col-6 col-sm-4 text-center">
            <button type="button" class="btn" :class="[`btn-outline-${getTextColor(mainColor)}`]" @click="showLoadingMask()">
              <i class="fa fa-spinner" /> Loading
            </button>
          </div>
        </div>
      </fieldset>

      <fieldset class="border rounded container mb-5" :class="[`border-${getTextColor(mainColor)}`]">
        <legend class="w-auto px-2" data-toggle="collapse" data-target=".popup">
          <h5><i class="fa fa-commenting" /> Popup</h5>
        </legend>

        <div class="row collapse show popup">
          <TabacoTextfield label="Title" :color="themeColor" :md="6" :disabled="disabled" v-model="popupTitle" />

          <TabacoTextarea label="Content" :required="true" :color="themeColor" :md="6" :disabled="disabled" v-model="popupContent" :rows="3" />
        </div>

        <div class="modal-footer border-0 p-0 pb-3 collapse show popup">
          <button type="button" class="btn btn-primary" :class="{disabled: !isPopupValid()}" :disabled="!isPopupValid()" @click="showSnackbar()">
            <i class="fa fa-bullhorn" /> Alert
          </button>

          <button type="button" class="btn btn-warning" :class="{disabled: !isPopupValid(true)}" :disabled="!isPopupValid(true)" @click="showDialog()">
            <i class="fa fa-question" /> Confirm
          </button>

          <button type="button" class="btn btn-danger" @click="dialog.open($refs.comment)">
            <i class="fa fa-pencil-square-o" /> Prompt
          </button>
        </div>

        <Dialog ref="comment" :color="themeColor" title="Dialog (HTML Content)">
          Hello. <br/><br/>
          This content could be defined by as follows:
          <ul>
            <li>Set a string value as this text.</li>
            <li>Defined elements in DialogContent Component, and set into the dialog by $refs.</li>
          </ul>

          <TabacoTextarea label="Comments" :required="true" :color="modalFieldColor" v-model="comments" :rows="3" />
        </Dialog>
      </fieldset>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Provide } from 'vue-property-decorator';

  import { getTextColor } from '@/@types/tabaco.layout';
  import { Button, SnbPosition } from '@/@types/tabaco.popup';
  import { theme, loading, snackbar, dialog } from '@/@directives/basic.directive';

  import TabacoTextfield from '@/@components/editor/TabacoTextfield.vue';
  import TabacoTextarea from '@/@components/editor/TabacoTextarea.vue';
  import TabacoNumberfield from '@/@components/editor/TabacoNumberfield.vue';
  import TabacoCombobox from '@/@components/editor/TabacoCombobox.vue';
  import TabacoMultiCombobox from '@/@components/editor/TabacoMultiCombobox.vue';
  import TabacoSwitcher from '@/@components/editor/TabacoSwitcher.vue';
  import TabacoDatepicker from '@/@components/editor/TabacoDatepicker.vue';

  import Dialog from '@/@components/tool/Dialog.vue';


  interface IComboBoxModel {
    code: string;
    text: string;
  }

  interface IMultiModel {
    code: string;
    fullName: string;
  }

  @Component({
    inject: {
      Button       : {default: Button},
      SnbPosition  : {default: SnbPosition},
      dialog       : {default: dialog},
      getTextColor : {default: () => getTextColor}
    },
    directives: {
      theme,      // 基礎色調 - 僅需設置於頂層 Element
      snackbar,   // 對話框 1 - 僅需設置於頂層 Element
      dialog,     // 對話框 2 - 僅需設置於頂層 Element
      loading     // 讀取圖示 - 設置於想呈現 Loading Mask 的 Element
    },
    components: {
      TabacoTextfield   , TabacoTextarea      ,
      TabacoNumberfield , TabacoSwitcher      ,
      TabacoCombobox    , TabacoMultiCombobox ,
      TabacoDatepicker  , Dialog
    }
  })
  export default class App extends Vue {
    private delayID!: any;

    // Theme                        // Member                          // Protect                   // Popup
    private themeColor = 'info';    private memberName  = '';          private disabled = false;    private popupTitle   = '';
    private mainColor  = 'dark';    private numberValue = null;        private loading  = false;    private popupContent = '';
    private bright     = true;      private memberGroup = ['I843'];                                 private comments     = '';
                                    private joinDate    = '2018/11/20';

    private comboOpts: IComboBoxModel[] = [
      {code: 'primary' , text: 'Blue'  }, {code: 'info'      , text: 'Cyan'   },
      {code: 'success' , text: 'Green' }, {code: 'warning'   , text: 'Yellow' },
      {code: 'danger'  , text: 'Red'   }, {code: 'dark'      , text: 'Black'  },
      {code: 'light'   , text: 'White' }, {code: 'secondary' , text: 'Gray'   }
    ];

    private multiOpts: IMultiModel[] = [
      {code: 'A001' , fullName: 'Tom'      }, {code: 'B231' , fullName: 'Mary'    },
      {code: 'A324' , fullName: 'John'     }, {code: 'B243' , fullName: 'Jane'    },
      {code: 'C002' , fullName: 'Tommy'    }, {code: 'J110' , fullName: 'Taco'    },
      {code: 'I843' , fullName: 'June'     }, {code: 'K333' , fullName: 'Daniel'  },
      {code: 'K233' , fullName: 'Daisy'    }, {code: 'C100' , fullName: 'Abraham' },
      {code: 'G100' , fullName: 'Nicholas' }, {code: 'Q203' , fullName: 'Mami'    }
    ];

    get modalFieldColor(): string {
      return 'light' === this.themeColor ? 'dark' : 'light';
    }

    isPopupValid(checkTitle?: boolean): boolean {
      return 'string' === typeof this.popupContent && this.popupContent.trim().length > 0
        && (checkTitle !== true || 'string' === typeof this.popupTitle && this.popupTitle.trim().length > 0);
    }

    isNumberValid(v: number): string | void {
      return v === 0 ? 'Can\'t be 0' : undefined;
    }

    showLoadingMask(): void {
      this.loading = true;
      clearTimeout(this.delayID);

      this.delayID = setTimeout(() => {
        this.loading = false;
        clearTimeout(this.delayID);
      }, 3000);
    }

    showSnackbar(): void {
      switch (this.themeColor) {
      case 'primary'   : snackbar.primary   (this.popupTitle, this.popupContent); break;
      case 'info'      : snackbar.info      (this.popupTitle, this.popupContent); break;
      case 'success'   : snackbar.success   (this.popupTitle, this.popupContent); break;
      case 'warning'   : snackbar.warning   (this.popupTitle, this.popupContent); break;
      case 'danger'    : snackbar.danger    (this.popupTitle, this.popupContent); break;
      case 'dark'      : snackbar.dark      (this.popupTitle, this.popupContent); break;
      case 'light'     : snackbar.light     (this.popupTitle, this.popupContent); break;
      case 'secondary' : snackbar.secondary (this.popupTitle, this.popupContent); break;
      }
    }

    showDialog(): void {
      switch (this.themeColor) {
      case 'primary'   : dialog.primary   (this.popupTitle, this.popupContent); break;
      case 'info'      : dialog.info      (this.popupTitle, this.popupContent); break;
      case 'success'   : dialog.success   (this.popupTitle, this.popupContent); break;
      case 'warning'   : dialog.warning   (this.popupTitle, this.popupContent); break;
      case 'danger'    : dialog.danger    (this.popupTitle, this.popupContent); break;
      case 'dark'      : dialog.dark      (this.popupTitle, this.popupContent); break;
      case 'light'     : dialog.light     (this.popupTitle, this.popupContent); break;
      case 'secondary' : dialog.secondary (this.popupTitle, this.popupContent); break;
      }
    }
  }
</script>

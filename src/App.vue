<style lang="scss">
  @import '../node_modules/font-awesome/css/font-awesome.min.css';
  @import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
  @import './css/tabaco.vue.material.scss';
</style>

<template>
  <div id="app" class="container p-3" v-theme="{basic: true, depth: bright, color: mainColor}" v-loading="loading" v-snackbar v-dialog>
    <div class="row">
      <TabacoSwitcher label="Disabled" :color="themeColor" :def="6" :sm="4" v-model="disabled" />
  
      <TabacoTextfield label="Full Name" :color="themeColor" :def="6" :sm="4" :required="true" :disabled="disabled" v-model="textValue" />

      <TabacoNumberfield label="Age" numeral="0,0.00" :color="themeColor" :def="6" :sm="4" :step=".1" :scale="2" :disabled="disabled"
        v-model="numberValue" :valid="isNumberValid" />
    </div>

    <div class="row">
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

    <div class="row px-3">
      <div class="col-12 p-0" v-theme="{depth: false, color: mainColor}">
        <TabacoMultiCombobox label="Members" :color="themeColor" :disabled="disabled"
          valueField="code" :options="multiOpts" :format="dataModel => dataModel.fullName" v-model="multiValues">

          <span slot="option" slot-scope="{dataModel, displayText, index}">
            <i class="fa fa-paint-brush mr-2" /> {{displayText}}
          </span>
        </TabacoMultiCombobox>

        <TabacoTextarea label="Description" :color="themeColor" :disabled="disabled" v-model="multiText" :rows="3" />
      </div>
    </div>

    <div class="row">
      <div class="col-12 p-3 btn-group justify-content-center">
        <button type="button" class="btn btn-secondary" @click="showLoadingMask()">
          <i class="fa fa-spinner" /><br/> Loading
        </button>

        <button type="button" class="btn btn-light" :class="[isPopupValid ? '' : 'disabled']" :disabled="!isPopupValid" @click="showSnackbar()">
          <i class="fa fa-comment" /><br/> Snackbar
        </button>

        <button type="button" class="btn btn-secondary" @click="dialog.open($refs.comment)">
          <i class="fa fa-commenting" /><br/> Dialog
        </button>

        <button type="button" class="btn btn-light" :class="[isPopupValid ? '' : 'disabled']" :disabled="!isPopupValid" @click="showDialog()">
          <i class="fa fa-comment" /><br/> Dialog
        </button>
      </div>
    </div>

    <Dialog ref="comment" :color="themeColor" title="Dialog (HTML Content)">
      Hello, {{textValue}}. <br/><br/>
      This content could be defined by as follows:
      <ul>
        <li>Set a string value as this text.</li>
        <li>Defined elements in DialogContent Component, and set into the dialog by $refs.</li>
      </ul>

      <TabacoTextarea label="Comments" :required="true" :color="modalFieldColor" v-model="comments" :rows="3" />
    </Dialog>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Provide } from 'vue-property-decorator';

  import { Button, SnbPosition } from '@/@types/tabaco.popup.ts';
  import { theme, loading, snackbar, dialog } from '@/@directives/basic.directive';

  import TabacoTextfield from '@/@components/editor/TabacoTextfield.vue';
  import TabacoTextarea from '@/@components/editor/TabacoTextarea.vue';
  import TabacoNumberfield from '@/@components/editor/TabacoNumberfield.vue';
  import TabacoCombobox from '@/@components/editor/TabacoCombobox.vue';
  import TabacoMultiCombobox from '@/@components/editor/TabacoMultiCombobox.vue';
  import TabacoSwitcher from '@/@components/editor/TabacoSwitcher.vue';

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
      Button: {default: Button},
      dialog: {default: dialog}
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
      Dialog
    }
  })
  export default class App extends Vue {
    private delayID!: any;
    private snackbarPosition = SnbPosition.TOP_LEFT;

    private themeColor  = 'info';
    private mainColor   = 'dark';
    private textValue   = '';
    private multiText   = '';
    private comments    = '';
    private disabled    = false;
    private loading     = false;
    private bright      = true;
    private numberValue = null;
    private multiValues = ['I843'];

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

    get isPopupValid(): boolean {
      return 'string' === typeof this.multiText && this.multiText.trim().length > 0;
    }

    get mainTheme(): string {
      return `${this.bright ? 'bright' : 'light'}-${this.mainColor}`;
    }

    get modalFieldColor(): string {
      return 'light' === this.themeColor ? 'dark' : 'light';
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
      const title = 'string' === typeof this.textValue && this.textValue.trim().length > 0 ? `Hello, ${this.textValue}` : '';

      switch (this.themeColor) {
      case 'primary'   : snackbar.primary   (title, this.multiText); break;
      case 'info'      : snackbar.info      (title, this.multiText); break;
      case 'success'   : snackbar.success   (title, this.multiText); break;
      case 'warning'   : snackbar.warning   (title, this.multiText); break;
      case 'danger'    : snackbar.danger    (title, this.multiText); break;
      case 'dark'      : snackbar.dark      (title, this.multiText); break;
      case 'light'     : snackbar.light     (title, this.multiText); break;
      case 'secondary' : snackbar.secondary (title, this.multiText); break;
      }
    }

    showDialog(): void {
      switch (this.themeColor) {
      case 'primary'   : dialog.primary   ('Dialog (Text Content)', this.multiText); break;
      case 'info'      : dialog.info      ('Dialog (Text Content)', this.multiText); break;
      case 'success'   : dialog.success   ('Dialog (Text Content)', this.multiText); break;
      case 'warning'   : dialog.warning   ('Dialog (Text Content)', this.multiText); break;
      case 'danger'    : dialog.danger    ('Dialog (Text Content)', this.multiText); break;
      case 'dark'      : dialog.dark      ('Dialog (Text Content)', this.multiText); break;
      case 'light'     : dialog.light     ('Dialog (Text Content)', this.multiText); break;
      case 'secondary' : dialog.secondary ('Dialog (Text Content)', this.multiText); break;
      }
    }
  }
</script>

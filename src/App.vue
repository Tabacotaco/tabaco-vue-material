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

      <TabacoNumberfield label="Age" :color="themeColor" :def="6" :sm="4" :step=".1" :scale="2" :disabled="disabled" v-model="numberValue" />
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

        <button type="button" class="btn btn-light" :class="[isSnackbarValid ? '' : 'disabled']" :disabled="!isSnackbarValid" @click="showSnackbar()">
          <i class="fa fa-comment" /><br/> Snackbar
        </button>

        <button type="button" class="btn btn-secondary" :class="[isDialogValid ? '' : 'disabled']" :disabled="!isDialogValid" @click="showDialog()">
          <i class="fa fa-commenting" /><br/> Dialog
        </button>
      </div>
    </div>

    <DialogContent ref="content">
      Hello, {{textValue}}. <br/><br/>
      This content could be defined by as follows:
      <ul>
        <li>Set a string value as this text.</li>
        <li>Defined elements in DialogContent Component, and set into the dialog by $refs.</li>
      </ul>

      <TabacoTextarea label="Comments" :color="modalFieldColor" :required="true" v-model="comments" :rows="3" />
    </DialogContent>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';

  import { ButtonType, SnackbarPosition } from '@/@types/tabaco.msg.ts';
  import { theme, loading, snackbar, dialog } from '@/@directives/basic.directive';

  import DialogContent from '@/@components/tool/DialogContent.vue';

  import TabacoTextfield from '@/@components/editor/TabacoTextfield.vue';
  import TabacoTextarea from '@/@components/editor/TabacoTextarea.vue';
  import TabacoNumberfield from '@/@components/editor/TabacoNumberfield.vue';
  import TabacoCombobox from '@/@components/editor/TabacoCombobox.vue';
  import TabacoMultiCombobox from '@/@components/editor/TabacoMultiCombobox.vue';
  import TabacoSwitcher from '@/@components/editor/TabacoSwitcher.vue';


  interface IComboBoxModel {
    code: string;
    text: string;
  }

  interface IMultiModel {
    code: string;
    fullName: string;
  }

  @Component({
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
      DialogContent
    }
  })
  export default class App extends Vue {
    private delayID!: number;
    private snackbarPosition = SnackbarPosition.TOP_LEFT;

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

    get isSnackbarValid(): boolean {
      return 'string' === typeof this.multiText && this.multiText.trim().length > 0;
    }

    get isDialogValid(): boolean {
      return 'string' === typeof this.textValue && this.textValue.trim().length > 0;
    }

    get mainTheme(): string {
      return `${this.bright ? 'bright' : 'light'}-${this.mainColor}`;
    }

    get modalFieldColor(): string {
      return 'light' === this.themeColor ? 'dark' : 'light';
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
      case 'primary'   : dialog.primary   ('Dialog Example', this.$refs.content); break;
      case 'info'      : dialog.info      ('Dialog Example', this.$refs.content); break;
      case 'success'   : dialog.success   ('Dialog Example', this.$refs.content); break;
      case 'warning'   : dialog.warning   ('Dialog Example', this.$refs.content); break;
      case 'danger'    : dialog.danger    ('Dialog Example', this.$refs.content); break;
      case 'dark'      : dialog.dark      ('Dialog Example', this.$refs.content); break;
      case 'light'     :
        dialog.light('Dialog Example', this.$refs.content).then(btn =>
          btn === ButtonType.CANCEL || 'string' === typeof this.comments && this.comments.trim().length > 0
        ).finally(btn => {
          if (btn === ButtonType.CONFIRM)
            dialog.light('Finally Example', `Your comments: ${this.comments}`);

          this.comments = '';
        });
        break;
      case 'secondary' :
        dialog.secondary('Dialog Example', this.$refs.content, [{
          type: ButtonType.CONFIRM,
          icon: 'fa fa-check',
          text: 'Click to close'
        }]).then(btn => btn === ButtonType.CONFIRM);
        
        break;
      }
    }
  }
</script>

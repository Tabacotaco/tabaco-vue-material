<template></template>

<script lang="ts">
  import { Component, Vue, Prop } from 'vue-property-decorator';
  import { dialog } from '@/@directives/basic.directive';


  @Component
  export default class DialogContent extends Vue {
    @Prop() private dialogSize?: string;

    get sizeClass(): string {
      switch ((this.dialogSize || 'MEDIUM').toUpperCase()) {
      case 'SMALL'  : return 'modal-sm';
      case 'LARGE'  : return 'modal-lg';
      case 'MEDIUM' : return '';
      default       : throw new Error(`Error dialog size: ${this.dialogSize}, the allowed value is 'SMALL / MEDIUM / LARGE'.`);
      }
    }
  }
</script>
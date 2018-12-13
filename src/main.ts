import Vue from 'vue';
import App from './App.vue';

import $ from 'jquery';

import 'popper.js/dist/umd/popper.min.js';
import 'hammerjs/hammer.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';


Vue.config.productionTip = false;

new Vue({
  render: (h) => {
    (window as any).$ = $;

    return h(App);
  }
}).$mount('#app');

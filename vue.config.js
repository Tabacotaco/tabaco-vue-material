const ProvidePlugin = require('webpack').ProvidePlugin;
const path = require('path');

module.exports = {
  baseUrl   : '/tabaco-vue-material/',
  outputDir : path.resolve(__dirname, 'docs'),
  devServer : {
    port: 3000
  },
  configureWebpack: {}
}

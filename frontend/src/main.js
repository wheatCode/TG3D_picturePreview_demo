import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import Loading from 'vue-loading-overlay';
import uploader from 'vue-simple-uploader';
import i18n from './i18n/i18n';
import './plugins/vuetify';
import Confirm from './plugins/Confirm';
import Snackbar from './plugins/Snackbar';
import App from './App.vue';
import router from './router';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.config.productionTip = false;

axios.defaults.baseURL = process.env.VUE_APP_API_ENDPOINT;
Vue.use(VueAxios, axios);
Vue.use(Snackbar);
Vue.use(Confirm);
Vue.use(uploader);
Vue.use(Loading, {
  canCancel: false,
  color: '#2dbdcb',
  loader: 'bars', //spinner/dots/bars
  width: 50,
  height: 50,
  backgroundColor: 'transparent',
  isFullPage: true,
  opacity: 0.8,
});
document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    i18n,
    router,
    render: h => h(App),
  }).$mount('#app');
});

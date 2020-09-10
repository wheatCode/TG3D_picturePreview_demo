import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from './en';
import zhTW from './zh-tw';

Vue.use(VueI18n);

let lang = navigator.language;

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: lang.toLowerCase(), // set locale
  fallbackLocale: 'en',
  messages: {
    'en-us': en,
    'zh-tw': zhTW,
    en,
  },
});

export default i18n;

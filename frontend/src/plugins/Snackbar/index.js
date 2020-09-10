import Snackbar from './Snackbar';

const Plugin = function(Vue) {
  this.Vue = Vue;
  this.mounted = false;
  this.$root = {};
};

Plugin.prototype.mountIfNotMounted = function() {
  if (this.mounted === true) {
    return;
  }

  this.$root = (() => {
    const SnackbarConstructor = this.Vue.extend(Snackbar);
    const node = document.createElement('div');
    document.querySelector('#app').appendChild(node);

    return new SnackbarConstructor().$mount(node);
  })();

  this.mounted = true;
};

Plugin.prototype.destroy = function() {
  if (this.mounted === true) {
    let elem = this.$root.$el;
    this.$root.$destroy();
    this.$root.$off();
    elem.remove();
    this.mounted = false;
  }
};

Plugin.prototype.alert = function(message, timeout) {
  this.mountIfNotMounted();
  this.$root.open(message, true, timeout);
};

Plugin.prototype.info = function(message, timeout) {
  this.mountIfNotMounted();
  this.$root.open(message, false, timeout);
};

Plugin.install = function(Vue, options) {
  Vue.snackbar = new Plugin(Vue, options);
  Vue.prototype.$snackbar = Vue.snackbar;
};

export default Plugin;

import Confirm from './Confirm';

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
    const ConfirmConstructor = this.Vue.extend(Confirm);
    const node = document.createElement('div');
    document.querySelector('#app').appendChild(node);

    return new ConfirmConstructor().$mount(node);
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

Plugin.prototype.open = function(content, title) {
  return new Promise(resolve => {
    this.mountIfNotMounted();
    this.$root.open({
      content,
      title,
      resolve,
    });
  });
};

Plugin.install = function(Vue, options) {
  Vue.confirm = new Plugin(Vue, options);
  Vue.prototype.$confirm = Vue.confirm;
};

export default Plugin;

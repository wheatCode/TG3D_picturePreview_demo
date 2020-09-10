<template>
  <v-dialog v-model="show" persistent no-click-animation max-width="450">
    <v-card class="root">
      <!-- Dialog head -->
      <div class="head mx-auto">{{ title }}</div>
      <div class="body">{{ content }}</div>
      <!-- Edit actions -->
      <v-layout class="btn-container" justify-center align-center>
        <toggle-btn
          :btn-title="btnCancel.btnTitle"
          :btn-color="btnCancel.btnColor"
          :btn-outline="btnCancel.btnOutline"
          :btn-size-small="true"
          @getBtn="cancel"
        />
        <toggle-btn
          :btn-title="btnConfirm.btnTitle"
          :btn-color="btnConfirm.btnColor"
          :btn-text-white="btnConfirm.btnTextWhite"
          :btn-size-small="true"
          @getBtn="confirm"
        />
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
import i18n from '../../i18n/i18n';
import hasDialog from '../../mixins/has-dialog';
import ToggleBtn from '@/components/common/ToggleBtn';

export default {
  name: 'Confirm',
  mixins: [hasDialog],
  components: {
    ToggleBtn,
  },
  data: () => ({
    show: false,
    content: '',
    title: '',
    resolve: null,
    confirmText: i18n.t('cancel'),
    cancelText: i18n.t('confirm'),
    btnCancel: {
      btnTitle: i18n.t('cancel'),
      btnColor: '#2dbdcb',
      btnOutline: true,
    },
    btnConfirm: {
      btnTitle: i18n.t('confirm'),
      btnColor: '#2dbdcb',
      btnTextWhite: true,
    },
  }),
  methods: {
    open({ content = '', title = '', resolve }) {
      const displaying = this.show;
      if (displaying) {
        return;
      }
      this.show = true;
      this.content = content;
      this.title = title || '';
      this.resolve = resolve || null;
    },
    confirm() {
      this.show = false;
      if (typeof this.resolve === 'function') {
        this.resolve(true);
      }
    },
    cancel() {
      this.show = false;
      if (typeof this.resolve === 'function') {
        this.resolve(false);
      }
    },
  },
  watch: {
    show(nv) {
      this.toggleRootOverflowHidden(nv);
    },
  },
};
</script>

<style lang="scss" scoped>
.root {
  overflow: hidden;
  position: relative;
}
.head {
  margin: 24px auto 40px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #4a4a4a;
}
.body {
  text-align: center;
  position: relative;
  padding-left: 76px;
  padding-right: 76px;
}
.btn-container {
  width: 100%;
  height: 60px;
  background-color: white;
  margin-top: 40px;
}
</style>

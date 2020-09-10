<template>
  <div class="side-menu">
    <div class="sidenav-upper-info">
      <div>
        <div class="md-subhead white-text sidenav-account-title">{{ $t('account') }}</div>
        <div id="mtm_user_email" class="md-subhead white-text sidenav-email">{{ account }}</div>
      </div>
      <button class="sidenav-logout-btn" @click="logout">
        <v-tooltip left>
          <span slot="activator" class="sidenav-icon sidenav-icon-logout"></span>
          <span>{{ $t('logout') }}</span>
        </v-tooltip>
      </button>
    </div>
    <v-layout column wrap justify-center align-center></v-layout>
  </div>
</template>

<script>
export default {
  name: 'SideMenu',
  props: {
    account: {
      type: String,
    },
  },
  data: () => ({}),
  methods: {
    logout() {
      localStorage.removeItem('id_token');
      this.$router.push({ path: '/login' });
    },
  },
};
</script>

<style lang="scss" scoped>
.side-menu {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
.sidenav-upper-info {
  height: 70px;
  max-height: 70px;
  position: relative;
  font-size: 20px;
  letter-spacing: 0.005em;
  box-sizing: border-box;
  font-weight: 400;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 8px 16px;
  margin: 0;
  background-color: #44cfdb;
}
.sidenav-account-title,
.sidenav-email {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #fff;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 24px;
}
.sidenav-email {
  margin: 0;
  font-weight: 500;
}
.sidenav-logout-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
}
.sidenav-icon {
  display: inline-block;
  vertical-align: middle;
  width: 34px;
  height: 34px;
  background-size: contain;
  background: no-repeat center;
}
.fill-width {
  width: 100%;
}
.sidenav-icon-logout {
  background-image: url('../../assets/ic-menu-exit-n.svg');
  &:hover {
    background-image: url('../../assets/ic-menu-exit-h.svg');
  }
  &:active {
    background-image: url('../../assets/ic-menu-exit-p.svg');
  }
}
.menu-item {
  color: #000;
}
.md-button {
  box-sizing: border-box;
  user-select: none;
  position: relative;
  outline: 0;
  border: 0;
  display: inline-block;
  align-items: center;
  padding: 0 6px;
  margin: 6px 8px;
  background: 0 0;
  white-space: nowrap;
  text-align: center;
  text-transform: uppercase;
  font-weight: 500;
  font-style: inherit;
  font-variant: inherit;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  font-size: 1em;
  min-width: 142px;
  min-height: 32px;
  border-radius: 0;
  height: 32px;
  line-height: 32px;
  letter-spacing: 0.01em;
}
</style>

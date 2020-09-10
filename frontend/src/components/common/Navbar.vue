<template>
  <headroom class="headroom" :speed="100" :downTolerance="10000">
    <img v-if="banner" class="banner" :src="bannerSrc" alt="Banner" />
    <div class="page-title">{{ pageTitle }}</div>
    <div class="placeholder"></div>
  </headroom>
</template>

<script>
import { headroom } from 'vue-headroom';
import LabelingTool from '@/assets/labeling-tool-banner.svg';

export default {
  name: 'Navbar',
  components: {
    headroom,
  },
  props: {
    pageTitle: String,
    banner: {
      type: String,
      default: 'LabelingTool',
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('id_token');
      this.$router.push({ path: '/login' });
    },
  },
  computed: {
    bannerSrc() {
      return LabelingTool;
    },
  },
};
</script>

<style scoped lang="scss">
.app-container {
  height: 100%;
}
.headroom {
  position: relative;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%);
  background-color: #2a2a2a;
  background-size: cover;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  height: 132px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.26);
  z-index: 10 !important;
  overflow: hidden;
  /deep/ {
    .v-content__wrap {
      background-color: #ededed;
      padding-top: 132px;
    }
  }
}
.page-title {
  font-size: 36px;
  font-weight: bold;
}
$HEADROOM_HEIGHT: 67px;
.headroom--not-top {
  height: $HEADROOM_HEIGHT;
  .banner {
    visibility: hidden;
  }
  .page-title {
    position: absolute;
    font-size: 24px;
    left: 91px;
  }
}
.banner {
  position: absolute;
  width: 1920px;
  min-height: 132px;
  top: -$HEADROOM_HEIGHT;
  z-index: -1;
}
@media screen and (min-width: 1921px) {
  .banner {
    left: 50%;
    transform: translateX(-50%) scale(1.5);
  }
}
@media screen and (min-width: 2800px) {
  .banner {
    transform: translateX(-50%) scale(2);
  }
}
@media screen and (min-width: 3800px) {
  .banner {
    transform: translateX(-50%) scale(2.5);
  }
}
</style>

<style lang="scss">
html,
body,
.v-content__wrap {
  background-color: #ededed;
}
.v-content__wrap {
  padding-top: 132px;
}
.v-navigation-drawer.v-navigation-drawer--fixed.v-navigation-drawer--temporary {
  z-index: 20;
}
.v-expansion-panel__header {
  position: relative;
  text-align: center;
  color: #4a4a4a;
  font-weight: 500;
  padding-left: 0;
  padding-right: 0;
  .header__icon {
    position: absolute;
    right: 5px;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    .v-icon {
      color: #d8d8d8 !important;
    }
  }
  .part-icon {
    display: none;
  }
}
.v-expansion-panel__container--active {
  .v-expansion-panel__header {
    height: auto;
    padding-top: 17px;
    .part-icon {
      display: block;
    }
    .part-name {
      display: none;
    }
    .header__icon {
      align-items: flex-start;
      padding-top: 12px;
    }
  }
}
</style>

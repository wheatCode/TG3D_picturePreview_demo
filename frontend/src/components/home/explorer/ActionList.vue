<template>
  <v-list class="Zindex10">
    <v-list-tile
      class="action-item"
      v-for="action in actions"
      :key="action.title"
      @click.stop="takeAction(action)"
      :data-test-id="`action-${action.event}`"
    >
      <v-list-tile-action>
        <img width="20" height="20" class="svg-icon" v-if="action.icon" :src="action.icon" />
      </v-list-tile-action>
      <v-list-tile-title>{{ action.title }}</v-list-tile-title>
    </v-list-tile>
  </v-list>
</template>

<script>
export default {
  name: 'ActionList',
  props: {
    actions: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    takeAction(action) {
      this.$emit('take-action', action);
    },
  },
};
</script>

<style lang="scss" scoped>
.action-item {
  text-align: center;
  min-width: 143px;
  /deep/ .v-list__tile__action {
    min-width: 30px;
  }
  /deep/ .v-list__tile--link {
    padding: 0 10px;
    margin: 0;
    position: relative;
  }
  &:not(:last-child):after {
    content: '';
    border-bottom: 1px solid #f3f3f3;
    width: 90%;
    height: 1px;
    display: block;
    margin: 0 auto;
  }
}
.Zindex10 {
  z-index: 10;
}
</style>

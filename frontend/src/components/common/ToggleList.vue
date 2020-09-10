<template>
  <v-list>
    <v-list-tile
      class="action-item"
      v-for="(action, key) in actions"
      :key="key"
      @click="getList(key)"
    >
      <v-list-tile-title>{{ action.title }}</v-list-tile-title>
    </v-list-tile>
  </v-list>
</template>

<script>
export default {
  name: 'togglelist',
  props: {
    actions: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getList(id) {
      this.$emit('getList', id);
    },
  },
};
</script>

<style lang="scss" scoped>
// .action-item {
//   text-align: center;
//   min-width: 143px;
//   /deep/ .v-list__tile__action {
//     min-width: 30px;
//   }
//   /deep/ .v-list__tile--link {
//     padding: 0 10px;
//     margin: 0;
//     position: relative;
//   }
//   &:not(:last-child):after {
//     content: '';
//     border-bottom: 1px solid #f3f3f3;
//     width: 90%;
//     height: 1px;
//     display: block;
//     margin: 0 auto;
//   }
// }
</style>

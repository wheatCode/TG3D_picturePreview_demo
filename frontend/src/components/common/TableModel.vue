<template>
  <v-layout>
    <v-flex xs-12>
      <v-data-table
        dark
        class="elevation-1"
        show-select
        :headers="tableHeaders"
        :items="tableContent"
        hide-actions
        :class="{ tableModel: true }"
      >
        <template v-slot:items="props">
          <tr class="hover-style">
            <td
              class="pa-2"
              v-for="num in countTag"
              :key="num"
              @click.self="doSomeThing(props.item.id)"
            >
              <v-layout align-center @click.self="doSomeThing(props.item.id)">
                <slot :name="`slot_tag${num}_${props.item.id}_start`"></slot>
                <span style="width:100%" v-html="showTag(props.item, num)"></span>
                <slot :name="`slot_tag${num}_${props.item.id}_end`"></slot>
              </v-layout>
              <!-- slot_tag[1~5]_id_start/end-->
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'togglemodel',
  props: {
    tableHeaders: {
      type: Array,
      default: () => [
        {
          text: 'Project name',
          sortable: false, //sort
          align: 'center',
          value: 'tag1', //sortable = true => use this
        },
      ],
    },
    tableContent: {
      type: Array,
      default: () => [
        {
          id: 0,
          checkbox: false, //slot use
          tag2: 'a', //tag 1 ~ 5
          tag3: 159,
          tag4: 6.0,
          tag5: '',
        },
      ],
    },
    tableTd: {
      type: Array,
      default: () => [
        { tag: true },
        { tag: true },
        { tag: true },
        { tag: true },
        { tag: true },
        { tag: true },
      ],
    },
  },
  mounted() {
    this.tableContent.forEach(item => {
      this.checkbox.push(item.checkbox);
    });
  },
  data() {
    return {
      checkbox: [],
    };
  },
  methods: {
    doSomeThing(id) {
      this.$emit('doSomeThing', id);
    },
    showTag(item, num) {
      return num === 1
        ? item.tag1
        : num === 2
        ? item.tag2
        : num === 3
        ? item.tag3
        : num === 4
        ? item.tag4
        : '';
    },
  },
  computed: {
    countTag() {
      let num = 0;

      this.tableTd.forEach(item => {
        item.tag ? num++ : '';
      });
      return num;
    },
  },
};
</script>

<style lang="scss" scoped>
.hover-style:hover {
  cursor: pointer;
}
.tableModel {
  /deep/.column.text-xs-left {
    padding: 10px !important;
  }
}
</style>

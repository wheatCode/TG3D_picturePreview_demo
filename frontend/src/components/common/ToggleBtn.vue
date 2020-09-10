<template>
  <v-menu offset-y class="border-inline">
    <template v-slot:activator="{ on }">
      <v-btn
        :class="{ active: active }"
        :icon="btnCheckIconCircle"
        :round="btnRound"
        :color="btnColor"
        :outline="btnOutline"
        :dark="btnTextWhite"
        :small="btnSizeSmall"
        :data-id="id"
        v-on="on"
        @click="getBtn"
        @keyup.enter="getBtnByEnter"
      >
        <slot></slot>
        <v-icon v-if="!!btnIconStart" @click="getIcon">{{ btnIconStart }}</v-icon>
        <span v-if="!!btnTitle" v-html="btnTitle"></span>
        <v-icon v-if="!!btnIconEnd" @click="getIcon">{{ btnIconEnd }}</v-icon>
      </v-btn>
    </template>
    <toggle-list v-if="actions.length" :actions="actions" @getList="getList" />
  </v-menu>
</template>

<script>
import ToggleList from '@/components/common/ToggleList';

export default {
  name: 'togglebtn',
  components: {
    ToggleList,
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    id: {
      type: [Number, String],
      default: 0,
    },
    btnIconStart: {
      type: String,
      default: '',
    },
    btnIconEnd: {
      type: String,
      default: '',
    },
    btnCheckIconCircle: {
      type: Boolean,
      default: false,
    },
    btnTitle: {
      type: String,
      default: '',
    },
    btnRound: {
      type: Boolean,
      default: false,
    },
    btnColor: {
      type: String,
      default: '',
    },
    btnTextWhite: {
      type: Boolean,
      default: false,
    },
    btnSizeSmall: {
      type: Boolean,
      default: true,
    },
    btnOutline: {
      type: Boolean,
      default: false,
    },
    actions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      listData: -1,
    };
  },
  methods: {
    getBtn() {
      this.$emit('getBtn', this.id);
    },
    getIcon() {
      this.$emit('getIcon', this.id);
    },
    getList(id) {
      this.$emit('getList', { btnId: this.id, listId: id });
    },
    getBtnByEnter() {
      this.$emit('getBtnByEnter', this.id);
    },
  },
  computed: {
    checkBtnIcon() {
      return this.btnCheckIcon ? true : false;
    },
  },
};
</script>
<style>
.v-btn.active {
  border: 1px solid #2dbdcb !important;
}
button {
  box-sizing: border-box;
}
</style>

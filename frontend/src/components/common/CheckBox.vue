<template>
  <div>
    <div ref="checkbox" class="Fill-1" :style="[checkXY]">
      <img src="@/assets/no.png" alt="" @click="getLeftBtn" />
      <img
        src="@/assets/yes.png"
        style="margin-bottom:1px;margin-right:1.5px"
        alt=""
        @click="getRightBtn"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checkXY: {
        bottom: -33 + 'px',
        right: 0 + 'px',
      },
      propSize: 0,
    };
  },
  methods: {
    getLeftBtn() {
      this.$emit('getLeftBtn');
    },
    getRightBtn() {
      this.$emit('getRightBtn');
    },
  },
  watch: {},
};
</script>

<style scoped lang="scss">
.Fill-1 {
  position: absolute;
  padding: 0 1px;
  height: 33px;
  min-width: 78px;
  max-width: 83px;
  background-color: #3f3b3a;
  display: inline-block;
  cursor: pointer;
}
</style>

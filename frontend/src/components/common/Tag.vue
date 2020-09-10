<template>
  <div
    @click="$emit('click')"
    @dblclick="$emit('update')"
    class="tag"
    :class="{ create, edit, removable }"
  >
    <span class="tag-text" v-if="!edit" :title="text">{{ text }}</span>
    <input
      ref="input"
      v-else
      class="input"
      type="text"
      v-model="value"
      @compositionstart="composing = true"
      @compositionend="composing = false"
      @keydown.enter="done"
      @blur="done"
    />
    <span v-if="create" class="tag-icon add"></span>
    <span v-if="removable" class="tag-icon remove" @click="$emit('remove', id)"></span>
  </div>
</template>

<script>
export default {
  name: 'Tag',
  props: {
    id: {
      type: [String, Number],
    },
    removable: {
      type: Boolean,
      default: false,
    },
    edit: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    value: '',
    composing: false,
  }),
  mounted() {
    if (this.$refs.input) {
      this.$refs.input.focus();
    }
  },
  methods: {
    done() {
      //enter & blur
      if (this.composing) {
        return;
      }
      this.$emit('done', this.value);
    },
  },
  watch: {
    edit() {
      if (this.edit) {
        this.value = this.text;
        this.$nextTick(() => {
          if (this.$refs.input) {
            this.$refs.input.focus();
          }
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$BLUE: #2dbdcb;
.tag {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 50px;
  height: 30px;
  border: 1px solid #b4b4b4;
  border-radius: 19.5px;
  color: #4a4a4a;
  font-size: 14px;
  padding: 4px 9px;
  .input {
    margin-bottom: 0px;
    background: transparent;
    border: 0px;
  }
  .tag-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-size: contain;
    margin-left: 9px;
  }
  &.create {
    justify-content: space-between;
    cursor: pointer;
    border: none;
    color: white;
    background-color: $BLUE;
    &:hover,
    &:focus {
      background-color: #44d6e4;
    }
    &:active {
      background-color: #2497a2;
    }
    .add {
      background-image: url('../../assets/ic-add.svg');
    }
  }
  &.edit {
    justify-content: space-between;
    border: 1px solid $BLUE;
    .input {
      outline: 0;
      width: 100%;
    }
  }
  &.removable {
    justify-content: space-between;
    cursor: default;
    &:hover,
    &:focus {
      border: 1px solid $BLUE;
    }
    .remove {
      cursor: pointer;
      background-image: url('../../assets/ic-remove-n.svg');
      background-position: center center;
      background-size: 80%;
      width: 16px;
      height: 16px;
      &:active {
        background-size: 100%;
        background-image: url('../../assets/ic-remove-p.svg');
      }
    }
  }
  .tag-text {
    overflow: hidden;
    max-width: 300px;
    text-overflow: ellipsis;
  }
}
</style>

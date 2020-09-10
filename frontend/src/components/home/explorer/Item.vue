<template>
  <v-flex
    class="list-item"
    :class="listItemStyle"
    @click="click"
    @contextmenu.prevent.stop="toggleMenu"
    data-test-id="grid-item"
  >
    <!-- TODO: make what to display as props -->
    <!-- List Item -->
    <v-layout v-if="isListView()" row justify-space-between align-center>
      <v-flex v-if="canSelect" xs1 class="hidden checkbox" :class="{ 'so-hidden': isEditing }">
        <v-checkbox
          hide-details
          v-model="item.selected"
          color="cyan light-1"
          @click.stop="select"
        ></v-checkbox>
      </v-flex>
      <!-- Thumbnail -->
      <v-flex xs5 class="first-column">
        {{ item.name }}
      </v-flex>
      <!-- File Type -->
      <v-flex xs5>
        {{ item.createdAt | toDateYMD }}
      </v-flex>
      <v-flex xs2>
        {{ complete }}
      </v-flex>
      <v-spacer></v-spacer>
      <v-flex v-if="!readonly && !isEditing" xs1 class="hidden text-xs-right more">
        <v-btn icon @click.stop.prevent="toggleMenu">
          <v-icon :data-id="item.id">more_vert</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-flex>
</template>

<script>
import { DateTimeFormatter } from '@/modules/utils';

const VIEW_MODE_LIST = 0;
const VIEW_MODE_GRID = 1;

export default {
  name: 'Item',
  props: {
    viewType: Number,
    clean: Boolean,
    readonly: Boolean,
    canSelect: Boolean,
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  filters: {
    toDateYMD(value) {
      if (value) {
        try {
          return DateTimeFormatter.format(new Date(value));
        } catch (e) {
          return '';
        }
      }
      return '';
    },
  },
  mounted() {
    if (this.isNewFolder) {
      this.startChangingName();
    }
  },
  data: () => ({
    changingName: false,
    newName: '',
    composingName: false,
  }),
  methods: {
    startChangingName(currentName) {
      if (this.changingName) {
        return;
      }
      this.changingName = true;
      this.newName = currentName || '';
      this.$nextTick(() => {
        this.$refs.newNameInput.focus();
        setTimeout(() => {
          document.execCommand('selectall', null, false);
        }, 0);
      });
    },
    cancelChangingName() {
      if (this.composingName || !this.changingName) {
        return;
      }
      this.newName = '';
      this.doneChangingName();
    },
    doneChangingName() {
      if (this.composingName || !this.changingName) {
        return;
      }
      this.changingName = false;
      this.$emit(this.isNewFolder ? 'new-folder' : 'new-name', this.newName);
    },
    select() {
      if (this.isEditing) {
        return;
      }
      this.$emit('select', this.item);
    },
    click() {
      if (this.isEditing) {
        return;
      }
      this.$emit('click', this.item);
    },
    toggleMenu($event) {
      if (!this.clean || this.isEditing) {
        return;
      }
      this.$emit('menu', $event, this.item);
    },
    isGridView() {
      return this.viewType === VIEW_MODE_GRID;
    },
    isListView() {
      return this.viewType === VIEW_MODE_LIST;
    },
    onImageLoad($event) {
      $event.target.style.visibility = 'visible'; // eslint-disable-line
    },
  },
  watch: {
    item: {
      handler(newValue) {
        if (newValue.isChangingName && !this.changingName) {
          this.startChangingName(newValue.name);
        }
      },
      deep: true,
    },
  },
  computed: {
    complete() {
      return (
        (this.item.labeled ? Math.round((this.item.labeled / this.item.total) * 100) : 0) + '%'
      );
    },
    listItemStyle() {
      return {
        active: this.item.current,
        selected: this.item.selected,
        grid: this.isGridView(),
        dir: this.isGridView() && this.item.is_dir,
        clean: this.clean,
        'text-xs-center': this.isGridView(),
        'py-2': this.isListView(),
      };
    },
    isNewFolder() {
      return this.item.new;
    },
    isChangingName() {
      return this.item.isChangingName;
    },
    isEditing() {
      return this.isNewFolder || this.isChangingName;
    },
  },
};
</script>

<style scoped lang="scss">
.new-name {
  outline: 0;
  padding: 0 5px;
  border-bottom: 2px solid black;
}
.hidden {
  opacity: 0;
}
.so-hidden {
  visibility: hidden !important;
}
.visible {
  opacity: 1 !important;
}
.grid {
  max-width: 136px;
  width: 100%;
  margin: 15px 8px;
  border: none !important;
  display: inline-block;
  vertical-align: top;
  user-select: none;
  &.dir {
    max-width: 284px;
    margin-left: 10px;
    margin-right: 10px;
    .menuToggler {
      top: 0;
      right: -3px;
      z-index: 4;
    }
    .thumbnail {
      border-radius: 4px;
      position: relative;
      width: 284px;
    }
    .preview-image {
      width: 137px;
      height: 132px;
      position: absolute;
      top: 0;
      &.pic1 {
        left: 0;
      }
      &.pic2 {
        left: 90px;
      }
      &.mask {
        left: 178px;
        top: -3px;
        width: 140px;
        height: 140px;
      }
    }
    .total-count {
      color: white;
      font-size: 96px;
      line-height: 0.6;
      position: absolute;
      bottom: 2px;
      right: -7px;
    }
  }
  .thumbnail {
    position: relative;
    width: 136px;
    height: 136px;
    .thumbnail-image {
      width: 133px;
      height: 133px;
      &.mask {
        position: absolute;
        margin: 0 auto;
        left: -1px;
        right: 0;
      }
      &.selected {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        margin: 0 auto;
        width: 52px;
      }
    }
  }
  .checkbox {
    position: absolute;
    top: 0;
    left: 5px;
    /deep/ .v-icon {
      color: white;
    }
  }
  .menuToggler {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 5px;
    right: 4px;
    width: 40px;
    height: 40px;
    color: white;
    &:hover {
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(155, 155, 155, 0.4);
        opacity: 0.32;
        border-radius: 40px;
      }
    }
  }
  $font-size: 18px;
  $line-height: 1.4;
  $lines-to-show: 2;
  .grid-item-name {
    margin-top: 8px;
    word-break: break-word;
    text-align: center;
    user-select: text;
    display: block;
    display: -webkit-box;
    height: $font-size * $line-height * $lines-to-show;
    font-size: $font-size;
    line-height: $line-height;
    -webkit-box-orient: vertical;
    // line-clamp: $lines-to-show;
    -webkit-line-clamp: $lines-to-show;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.checkbox {
  max-width: 50px;
}
.first-column {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .item-name {
    margin-left: 20px;
  }
}
.thumbnail {
  position: relative;
  width: 100px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  .actual {
    visibility: hidden;
  }
  &.dir {
    overflow: hidden;
    border: none;
    border-radius: 4px;
    .preview-image {
      width: 57px;
      height: 56px;
      display: inline-block;
      position: absolute;
      top: 0;
      &.pic1 {
        left: 0;
      }
      &.pic2 {
        left: 37px;
      }
      &.mask {
        width: 62px;
        left: 70px;
        top: -3px;
        height: 62px;
      }
    }
  }
  .thumbnail-image {
    width: 51px;
    height: 52px;
    position: relative;
    &.placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    &.mask {
      position: absolute;
      margin: 0 auto;
      left: 0;
      right: 0;
    }
    &.selected {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      width: 25%;
      margin: 0 auto;
    }
  }
}
.list-item {
  cursor: pointer;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(74, 74, 74, 0.25);
  }
  &.selected,
  &:hover {
    .hidden:not(.more) {
      @extend .visible;
    }
  }
  &.clean:hover,
  &.active {
    .hidden.more {
      @extend .visible;
    }
  }
}
.item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
  user-select: text;
}
</style>

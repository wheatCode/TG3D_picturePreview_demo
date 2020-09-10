<template>
  <div class="main mx-auto">
    <!-- Top -->
    <v-layout row justify-space-between class="py-2">
      <!-- <v-flex v-if="canImport && !filter && !readonly"
              xs1
              class="import">
        <slot name="import-menu"></slot>
      </v-flex> -->
      <slot name="top-button"></slot>
      <!-- Bread crumb -->
      <!-- <v-flex v-if="!filter">
        <div v-for="(path, index) in paths"
             class="breadcrumbs__item"
             :key="index"
             :class="{ active: index === paths.length - 1 }"
             @click="jump(index)">
          {{ path.name }}
        </div>
      </v-flex>
      <v-flex v-else>
        <span></span>
        <t-button class="mx-3"
                  @click="cancelSearch"
                  :style="{ 'min-width': '60px' }">
        </t-button>
      </v-flex> -->
      <!-- Search Field -->
      <v-flex v-if="canSearch" xs2 class="my-2 d-flex align-center">
        <div class="search" :class="{ full: isSearching }" @click="startSearching">
          <img class="search-icon ml-auto" src="@/assets/ic-search.svg" alt="search" />
          <input
            v-if="isSearching"
            class="search-input"
            type="text"
            v-model="search"
            ref="search"
            @keydown.enter="changeSearchValue"
            @compositionstart="composing = true"
            @compositionend="composing = false"
            @keydown.esc="cancelSearch"
          />
        </div>
      </v-flex>
    </v-layout>

    <div class="main-container">
      <!-- Item Selection Related -->
      <v-layout class="head" row justify-space-between align-center>
        <!-- Select All Checkbox -->
        <v-flex v-if="canSelectAll" xs1 class="toggle-all">
          <v-checkbox
            hide-details
            label=""
            v-model="selectAll"
            color="cyan light-1"
            @click.stop.prevent="$emit('toggle-all', !selectAll)"
          ></v-checkbox>
        </v-flex>
        <!-- Sorting Conditions -->
        <template v-if="isListView() && columns.length === 0">
          <v-flex
            xs4
            @click="changeSortingOptions(sortingNameKey)"
            class="sort"
            :class="{ 'in-use': sort.by === sortingNameKey, asc: sort.asc }"
            id="sort-by-name"
          >
          </v-flex>
          <v-flex
            xs3
            class="sort"
            @click="changeSortingOptions(sortingDirKey)"
            :class="{ 'in-use': sort.by === sortingDirKey, asc: sort.asc }"
            id="sort-by-type"
          >
          </v-flex>
          <v-flex
            xs2
            class="sort"
            @click="changeSortingOptions(sortingDateKey)"
            :class="{ 'in-use': sort.by === sortingDateKey, asc: sort.asc }"
            id="sort-by-date"
          >
          </v-flex>
        </template>
        <template v-else-if="columns.length > 0">
          <v-flex
            v-for="(column, index) in columns"
            :key="index"
            class="sort"
            :class="[{ 'in-use': sort.by === sortingDirKey, asc: sort.asc }, `xs${column.width}`]"
            >{{ column.name }}</v-flex
          >
        </template>
        <!--<template v-else>-->
        <!--<v-flex xs1>{{ $t('fabric.explorer__field__name') }}</v-flex>-->
        <!--</template>-->
        <v-spacer></v-spacer>
        <!-- Items count -->
        <v-flex v-if="!somethingChecked" xs1 class="text-xs-right">
          <span>
            {{ $tc('item_count', items.length, { count: items.length }) }}
          </span>
        </v-flex>
        <v-flex v-else xs1 class="d-flex text-xs-right selection-count" align-center>
          <span> </span>
          <!-- Action Menu Toggle -->
          <v-menu v-if="!readonly" bottom left>
            <v-btn icon slot="activator">
              <v-icon>more_vert</v-icon>
            </v-btn>
            <action-list :actions="allProjectActions" @take-action="takeActionWithMultipleFiles" />
          </v-menu>
        </v-flex>
        <!-- View Mode Switcher -->
        <v-flex v-if="!fixViewMode" xs1 class="text-xs-right">
          <div
            class="view-mode-switcher"
            :class="{ 'grid-view': isGridView() }"
            @click="toggleViewMode()"
            data-test-id="view-mode-switch"
          ></div>
        </v-flex>
      </v-layout>
      <v-progress-linear
        color="cyan lighten-1"
        v-if="isRequesting"
        class="requesting-bar"
        :indeterminate="true"
      ></v-progress-linear>
      <!-- Grid Content -->
      <v-layout
        ref="container"
        class="grid-container"
        v-bind="layoutConfig"
        :style="padding"
        @click.self="$emit('toggle-all', false)"
        @contextmenu.prevent="toggleMenu(null, $event)"
      >
        <!-- Items -->
        <slot
          :items="items"
          :mode="viewMode"
          :clean="!somethingChecked"
          :click="clickItem"
          :dblclick="dblClickItem"
          :select="select"
          :readonly="readonly"
          :toggle="toggleMenu"
          :can-select="canSelect"
          :done-adding-folder="doneAddingFolder"
          :done-renaming="doneRenaming"
        >
        </slot>
        <!-- Action Menu -->
        <v-menu v-model="showMenu" offset-y absolute :position-x="menuX" :position-y="menuY">
          <action-list :actions="availableActions" @take-action="takeAction" />
        </v-menu>
      </v-layout>
      <!-- Pagination -->
      <v-layout
        class="pagination-section py-3"
        row
        justify-end
        align-center
        v-if="showPagination"
        @contextmenu.prevent="toggleMenu(null, $event)"
      >
        <!-- Page Navigation -->
        <v-flex class="page-navigation" xs6>
          <div class="d-flex justify-center align-center">
            <div
              @click.stop.prevent="gotoPage(-1)"
              class="arrow mx-3"
              :class="{ disable: noPrevPage }"
            >
              <img width="9" height="18" src="@/assets/page-left.svg" alt="Previous Page" />
            </div>
            <div class="goto-page">
              <v-select
                :items="totalPages"
                :value="page"
                label="Select"
                single-line
                @change="getData"
                hide-details
                :max-width="70"
                color="black"
              ></v-select>
            </div>
            <div class="total-page">{{ totalPages.length }}</div>
            <div
              @click.stop.prevent="gotoPage(1)"
              class="arrow mx-3"
              :class="{ disable: noNextPage }"
            >
              <img width="9" height="18" src="@/assets/page-right.svg" alt="Next Page" />
            </div>
          </div>
          <!-- Page Size Toggle -->
          <div class="page-size-toggle">
            <template v-for="(pageSize, i) in pageSizes">
              <div :key="i">
                <span
                  class="page-size"
                  :class="{
                    'cyan--text text--lighten-1': currentPageSize === pageSize,
                  }"
                  @click="changePageSize(pageSize)"
                  >{{ pageSize }}</span
                >
                <span class="mx-2" v-if="pageSizes.length - i > 1">|</span>
              </div>
            </template>
          </div>
        </v-flex>
      </v-layout>
      <!-- Tags -->
      <!-- <v-layout v-if="tags.length > 0"
                class="tags"
                row
                justify-center
                align-center>
        <div class="mx-1 my-3 tag"
             v-for="tag in tags"
             :key="tag.id">
          <v-chip outline>{{ tag.name }}</v-chip>
        </div>
      </v-layout>
      <v-layout v-else></v-layout>
      <div v-show="isRequesting"
           class="loading-overlay"></div> -->
    </div>
    <!-- Optional Actions -->
    <v-layout></v-layout>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import ActionList from './ActionList';
// import Edit from '../../../assets/ic-edit.svg';
// import Delete from '../../../assets/ic-delete.svg';

const VIEW_MODE_LIST = 0;
const VIEW_MODE_GRID = 1;

const GRID_MARGIN = 8;
const GRID_WIDTH = 136 + GRID_MARGIN * 2;

export default {
  name: 'Explorer',
  components: {
    ActionList,
  },
  props: {
    items: Array,
    totalItems: Number,
    paths: Array,
    actions: Array,
    tags: Array,
    totalPages: Array,
    columns: {
      type: Array,
      default: () => [],
    },
    currentPage: Number,
    range: Object,
    isSearching: Boolean,
    readonly: Boolean,
    canSelectAll: Boolean,
    canTraverse: {
      type: Boolean,
      default: true,
    },
    fixViewMode: {
      type: String,
      default: '',
    },
    sortingNameKey: {
      type: String,
      default: 'name',
    },
    sortingDirKey: {
      type: String,
      default: 'is_dir',
    },
    sortingDateKey: {
      type: String,
      default: 'updated_at',
    },
    selectAll: {
      type: Boolean,
      default: false,
    },
    canSelect: Boolean,
    canSearch: {
      type: Boolean,
      default: true,
    },
    canImport: {
      type: Boolean,
      default: true,
    },
    filter: String,
    isRequesting: Boolean,
    sort: {
      type: Object,
      default: () => {},
    },
    pageSizes: {
      type: Array,
      default: () => [],
    },
    currentPageSize: Number,
    showPagination: {
      type: Boolean,
      default: true,
    },
    noPadding: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    if (this.fixViewMode === 'list') {
      this.toggleViewMode(VIEW_MODE_LIST);
    } else if (this.fixViewMode === 'grid') {
      this.toggleViewMode(VIEW_MODE_GRID);
    }
  },
  mounted() {
    window.addEventListener('resize', this.addPadding);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.addPadding);
  },
  watch: {
    items() {
      this.addPadding();
    },
  },
  data: () => ({
    viewMode: VIEW_MODE_GRID,
    showMenu: false,
    search: '',
    menuX: 0,
    menuY: 0,
    actionMenuTarget: null,
    padding: null,
    composing: false,
    allProjectActions: [
      {
        event: 'Delete',
        icon: '../../../../assets/ic-delete.svg',
        title: 'Delete',
      },
    ],
  }),
  methods: {
    addPadding() {
      const $container = this.$refs.container;
      if (!this.isGridView() || !$container || this.noPadding) {
        this.padding = null;
        return;
      }
      const width = $container.clientWidth;
      const count = Math.floor(width / GRID_WIDTH);
      const padding = `${(width - GRID_WIDTH * count) / 2}px`;
      this.padding = { paddingLeft: padding, paddingRight: padding };
    },
    jump(index) {
      if (index < this.paths.length - 1) {
        this.$emit('go-back', index);
      }
    },
    getData(page) {
      const newPage = parseInt(page, 10);
      if (newPage === this.currentPage) {
        return;
      }
      this.$emit('get-data', newPage);
    },
    changeSearchValue() {
      if (this.composing) {
        return;
      }
      this.$emit('change-search-value', this.search);
    },
    cancelSearch() {
      this.$emit('cancel-search');
      this.search = '';
    },
    changeSortingOptions(newCondition) {
      this.$emit('change-sorting-options', newCondition);
    },
    toggleMenu(item, e) {
      this.showMenu = false;
      setTimeout(() => {
        this.menuX = item.clientX;
        this.menuY = item.clientY;
        this.actionMenuTarget = e;
        this.showMenu = true;
      }, 100);
    },
    doneAddingFolder(item, name) {
      this.$emit('done-adding-folder', item, name);
    },
    doneRenaming(item, name) {
      this.$emit('done-renaming', item, name);
    },
    startSearching() {
      this.$emit('start-searching');
      this.$nextTick(() => {
        this.$refs.search.focus();
      });
    },
    select(item) {
      this.showMenu = false;
      this.$emit('select', item);
    },
    clickItem(item) {
      this.showMenu = false;
      const { is_dir } = item;
      this.$emit(is_dir ? 'click-dir' : 'click-item', item); // eslint-disable-line
    },
    dblClickItem(item) {
      this.showMenu = false;
      this.$emit('dblclick', item);
    },
    takeAction(action) {
      if (!action.event) {
        return;
      }
      this.$emit(action.event, this.actionMenuTarget);
      this.showMenu = false;
    },
    takeActionWithMultipleFiles(action) {
      this.$emit(action.event, this.selection);
    },
    toggleViewMode(viewMode) {
      if (typeof viewMode === 'number') {
        this.viewMode = viewMode;
      } else {
        this.viewMode = this.viewMode === VIEW_MODE_LIST ? VIEW_MODE_GRID : VIEW_MODE_LIST;
      }
      this.addPadding();
    },
    isGridView() {
      return this.viewMode === VIEW_MODE_GRID;
    },
    isListView() {
      return this.viewMode === VIEW_MODE_LIST;
    },
    changePageSize(pageSize) {
      this.$emit('change-page-size', pageSize);
    },
    gotoPage(page) {
      const newPage = this.currentPage + page;
      if (this.totalPages.indexOf(`${newPage}`) < 0) {
        return;
      }
      this.getData(newPage);
    },
  },
  computed: {
    availableActions() {
      let actions = this.readonly ? this.actions.filter(action => action.readonly) : this.actions;
      if (this.actionMenuTarget) {
        actions = actions.filter(action => !action.context || action.common);
        const target = this.actionMenuTarget;
        const { is_dir: isDir } = target;
        return isDir
          ? actions.filter(
              action =>
                action.dir ||
                action.common ||
                (typeof action.check === 'function' && action.check(target))
            )
          : actions.filter(action =>
              typeof action.check === 'function' ? action.check(target) : true
            );
      }
      return actions.filter(action => action.context);
    },
    layoutConfig() {
      return {
        column: this.isListView(),
        wrap: this.isGridView(),
        class: {
          // eslint-disable-line
          'grid-view': this.isGridView(),
          'list-view': this.isListView(),
          'no-padding': this.noPadding,
        },
      };
    },
    selection() {
      return this.items.filter(item => item.selected);
    },
    somethingChecked() {
      return !!this.items.find(item => item.selected);
    },
    page() {
      return `${this.currentPage}`;
    },
    noPrevPage() {
      return this.currentPage === 1;
    },
    noNextPage() {
      const lastPage = this.totalPages[this.totalPages.length - 1];
      return lastPage === `${this.currentPage}`;
    },
    actionsWithMultipleFiles() {
      return this.actions.filter(action => action.multiple);
    },
  },
};
</script>

<style scoped lang="scss">
$headHeight: 48px;
$paddingLR: 20px;

.main-container {
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.2);
  background-color: white;
  position: relative;
  height: 100%;
}
.head {
  min-height: $headHeight;
  background-color: rgba(98, 195, 203, 0.1);
  padding: 0 $paddingLR;
  // .pl {
  /*padding-left: 100px;*/
  // }
}
.selection-count {
  max-width: 120px;
  word-break: keep-all;
  overflow: visible;
  white-space: nowrap;
}
.view-mode-switcher {
  cursor: pointer;
  margin-left: auto;
  width: 34px;
  height: 18px;
  background-size: contain;
  background-position: center;
  background-image: url('../../../assets/ic-listview-n.svg');
  &:hover {
    background-image: url('../../../assets/ic-listview-h.svg');
  }
  &.grid-view {
    background-image: url('../../../assets/ic-gridview-n.svg');
    &:hover {
      background-image: url('../../../assets/ic-gridview-h.svg');
    }
  }
}
.hidden {
  opacity: 0;
}
.visible {
  opacity: 1 !important;
}
.import {
  min-width: 120px;
}
.requesting-bar {
  position: absolute;
  width: 100%;
  top: $headHeight - 6px;
  margin: 0;
}
.grid-container {
  user-select: none;
  &.list-view {
    padding: 0 $paddingLR;
  }
  &.grid-view {
    display: block;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  &.no-padding {
    padding-left: 0;
    padding-right: 0;
  }
}
.sort {
  cursor: pointer;
  display: flex;
  align-items: center;
  &.in-use {
    &:after {
      margin-left: 5px;
      content: '';
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid black;
    }
    &.asc:after {
      border-top: none;
      border-bottom: 5px solid black;
    }
  }
}
.toggle-all {
  max-width: 50px;
}
.pagination-listInfo {
  font-size: 1.2rem;
}
.main {
  max-width: 1280px;
  width: 100%;
  min-width: 800px;
  padding: 0 20px 20px;
}
.search-icon {
  width: 19px;
  height: 19px;
}
.search {
  display: flex;
  // justify-content: flex-end;
  align-items: center;
  padding-right: 10px;
  height: 28px;
  .search-icon {
    cursor: pointer;
  }
  &.full {
    margin-left: auto;
    max-width: 142px;
    border-radius: 14px;
    border: solid 1px #4a4a4a;
    padding: 0 6px;
    display: flex;
    align-items: center;
    .search-icon {
      cursor: initial;
    }
    .search-input {
      margin-left: 5px;
      padding-right: 30px;
      margin-bottom: 0px;
      outline: 0;
      border: 0px;
      background: transparent;
    }
  }
}

.breadcrumbs__item {
  color: inherit;
  border: 1px solid #d8d8d8;
  border-radius: 2px;
  background-color: #ededed;
  padding: 6px 5px;
  cursor: pointer;
  align-items: center;
  display: inline-flex;
  text-decoration: none;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  &.active {
    background-color: #d8d8d8;
  }
}
.pagination-section {
  font-size: 14px;
  padding: 0 $paddingLR;
}
.page-navigation {
  display: flex;
  justify-content: flex-end;
  .arrow {
    display: flex;
    align-items: center;
    &.disable {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }
  .goto-page {
    margin: 0 15px 0 5px;
    /deep/ .v-input {
      padding: 0;
      margin: 0;
    }
    /deep/ .v-input__slot {
      &:before {
        background-color: black;
      }
    }
    /deep/ .v-select__selections input {
      display: none;
    }
    /deep/ .v-select__selection--comma {
      padding: 0;
      font-weight: bolder;
      font-size: 14px;
      margin: 0 0 1px;
    }
    /deep/ .v-select__selections {
      padding-left: 15px;
      padding-top: 2px;
    }
    /deep/ .v-input__append-inner {
      padding-left: 0;
    }
    /deep/ .v-input__icon {
      width: 20px;
      min-width: 20px;
    }
    /deep/ .v-icon {
      font-size: 18px;
      padding: 0;
      margin-right: -10px;
      font-weight: bolder;
      color: black !important;
    }
  }
  .total-page {
    font-weight: 300;
    opacity: 0.4;
    margin: 0 10px;
  }
}
.page-size,
.arrow {
  cursor: pointer;
}
.page-size-toggle {
  margin-left: 60px;
  display: flex;
  align-items: center;
}
.list {
  padding: 0;
}
.tags {
  margin: 0 $paddingLR;
  border-top: 1px solid #4a4a4a;
}
.loading-overlay {
  z-index: 3;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  opacity: 0.4;
}
</style>

<style lang="scss">
button {
  outline: 0;
}
.chip__content {
  color: black;
}
.v-input--checkbox {
  margin-top: 0;
}
</style>

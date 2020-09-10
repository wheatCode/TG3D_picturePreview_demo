<template>
  <v-dialog
    v-model="showDialog.projectDialog"
    no-click-animation
    persistent
    fullscreen
    content-class="project-dialog"
  >
    <!-- Project NavBar -->
    <v-layout class="NavBar" justify-end>
      <!-- NavBar Title -->
      <span v-html="title" class="mr-auto"></span>
      <!-- NavBar Close Btn -->
      <toggle-btn
        :btn-check-icon-circle="btnClose.btnCheckIconCircle"
        :btn-round="btnClose.btnRound"
        :btn-color="btnClose.btnColor"
        :btn-text-white="btnClose.btnTextWhite"
        @getBtn="closeDialog"
        id="closeBtn"
      >
        <img src="../../assets/ic-windows-close-n@3x.png" alt="" width="25" height="25"
      /></toggle-btn>
    </v-layout>
    <!-- Project Content-->
    <v-container fluid class="content">
      <div style="height:80px;"></div>
      <!-- Project Name -->
      <v-layout justify-center>
        <v-flex xs8 class="contentBg">
          <!-- Project Name Title-->
          <h2 class="content-pd title-bg mb-3">{{ $t('project_name') }}</h2>
          <div class="content-pd">
            <v-text-field
              v-model="singleProductDialog.name"
              id="projectName"
              required
            ></v-text-field>
          </div>
        </v-flex>
      </v-layout>
      <!-- Project Set -->
      <v-layout justify-center class="mt-4">
        <v-flex xs8 class="contentBg">
          <!-- Project Set Title-->
          <h2 class="content-pd title-bg">{{ $t('configuration') }}</h2>
          <v-layout row wrap class="content-pd">
            <!-- Project Set Labeling Type-->
            <v-flex class="dotted-line mt-5" xs4>
              <h3 class="mb-4">{{ $t('labeling_type') }}</h3>
              <v-radio-group
                :mandatory="false"
                v-model="singleProductDialog.labelingType"
                class="mt-4"
              >
                <v-radio
                  v-for="(radioLabel, key) in labeling_type"
                  :label="radioLabel.name"
                  :disabled="!radioLabel.canCheck || hasLabels"
                  :value="key"
                  :key="key"
                  color="#2dbdcb"
                ></v-radio>
              </v-radio-group>
            </v-flex>
            <!-- Project Set Classes-->
            <v-flex class="mt-5 pl-3" xs8>
              <h3 class=" mb-4">{{ $t('classification_name') }}</h3>
              <v-layout justify-start class="mt-4">
                <v-flex xs3>
                  <toggle-btn
                    :btn-icon-end="btnAdd.btnIcon"
                    :btn-check-icon-circle="btnAdd.btnCheckIconCircle"
                    :btn-title="btnAdd.btnTitle"
                    :btn-round="btnAdd.btnRound"
                    :btn-color="btnAdd.btnColor"
                    :btn-text-white="btnAdd.btnTextWhite"
                    @getBtn="showInput"
                  />
                </v-flex>
                <v-flex xs4 v-if="checkInput" class="mt-1">
                  <tag :removable="true" :edit="true" @done="addTag" />
                </v-flex>
              </v-layout>
              <div class="loading">
                <div ref="tag" class="loading-son"></div>
                <v-layout wrap alighn-center row style="max-height:200px;overflow:scroll;">
                  <tag
                    v-for="(tag, index) in items"
                    :key="tag.id"
                    :removable="true"
                    :id="tag.id"
                    :text="tag.name"
                    :edit="tag.edit"
                    :ref="`tag${index}`"
                    @update="showUpdateInput(tag, index)"
                    @remove="deleteTag"
                    @done="updateTag(tag, $event)"
                    class="mr-1 mt-2"
                  />
                </v-layout>
              </div>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>

      <!-- Project +import -->
      <v-layout justify-center>
        <v-flex xs8>
          <v-layout class="pt-5 pb-3" justify-end>
            <!-- <toggle-btn :actions="btnImport.actions"
                        :btn-icon-start="btnImport.btnIcon"
                        :btn-check-icon-circle="btnImport.btnCheckIconCircle"
                        :btn-title="btnImport.btnTitle"
                        :btn-round="btnImport.btnRound" /> -->
            <div class="search py-3 pr-5" :class="{ full: isSearching }" @click="startSearching">
              <img class="search-icon ml-auto" src="@/assets/ic-search.svg" alt="search" />
              <input
                v-if="isSearching"
                class="search-input"
                type="text"
                v-model="search"
                ref="input"
                @keydown.enter="changeSearchValue"
                @compositionstart="composing = true"
                @compositionend="composing = false"
                @keydown.esc="cancelSearch"
              />
            </div>
          </v-layout>
        </v-flex>
      </v-layout>
      <!-- Project Images -->
      <v-layout justify-center>
        <v-flex xs8 class="contentBg">
          <v-layout class="content-pd title-bg" justify-space-between align-center>
            <!-- Project Images Title-->
            <h2>{{ $t('data_list') }}</h2>
            <!-- Project Filter Icon  -->

            <v-flex xs3>
              <v-layout>
                <v-flex xs5>
                  <v-layout justify-end>
                    <h4 class="mt-3">{{ totalItems }}</h4>
                  </v-layout>
                </v-flex>
                <v-layout justify-space-between class="ml-2">
                  <span class="pt-3">{{ $t('imported') }}</span>
                  <div class="img-menu">
                    <v-btn icon @click="showListMenu">
                      <img src="@/assets/stroke-1.svg" alt="" />
                    </v-btn>
                    <action-list
                      v-if="showList"
                      :actions="actions"
                      :class="{ imgMenuList: true }"
                      @take-action="filterImgs"
                    />
                  </div>
                </v-layout>
              </v-layout>
            </v-flex>
          </v-layout>
          <!-- Project Images List-->
          <div class="loading">
            <div ref="img" class="loading-son"></div>
            <v-layout wrap class="content-pd mt-5">
              <v-flex xs3 class="mt-3" v-for="image in images" :key="image.id">
                <v-layout justify-center>
                  <v-flex xs10>
                    <label v-if="image.fileName" class="useLabel" @click="openCUBBoxDialog(image)">
                      <template v-if="image.status === 0">
                        <span class="noLabel ml-3">{{ image.fileName }}</span>
                      </template>
                      <template v-if="image.status === 1">
                        <img src="@/assets/not-labeled.svg" />
                        <span class="noLabel ml-3">{{ image.fileName }}</span>
                      </template>
                      <template v-else-if="image.status === 2">
                        <img src="@/assets/label-copy-29.svg" />
                        <span class="hasLabel ml-3">{{ image.fileName }}</span>
                      </template>
                    </label>
                    <div v-else v-html="image" class="text-xs-center"></div>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </div>

          <!-- Pagination -->
          <v-layout
            class="pagination-section py-3"
            row
            justify-end
            align-center
            v-show="singleProductDialog.name"
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
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
    <div style="height:100px;background:#ededed"></div>
    <!-- Project Footer-->
    <v-layout class="footerBg py-2" justify-center>
      <toggle-btn
        :btn-title="btnCancel.btnTitle"
        :btn-color="btnCancel.btnColor"
        :btn-outline="btnCancel.btnOutline"
        :btn-size-small="true"
        @getBtn="closeDialog"
      />
      <toggle-btn
        :btn-title="btnConfirm.btnTitle"
        :btn-color="btnConfirm.btnColor"
        :btn-text-white="btnConfirm.btnTextWhite"
        :btn-size-small="true"
        @getBtn="submitProject"
      />
    </v-layout>
  </v-dialog>
</template>

<script>
import i18n from '@/i18n/i18n';
import ActionList from '@/components/home/explorer/ActionList';
import ToggleBtn from '@/components/common/ToggleBtn';
import Tag from '@/components/common/Tag';
import explorer from '@/components/home/mixin/explorer';
import noLabel from '@/assets/not-labeled.svg';
import hasLabel from '@/assets/label-copy-29.svg';

export default {
  name: 'dialogmodel',
  components: {
    ToggleBtn,
    Tag,
    ActionList,
  },
  props: {
    showDialog: {
      type: Object,
      default: () => {},
    },
    singleProductDialog: {
      type: Object,
      default: () => ({
        name: '',
        labelingType: -1,
        classes: [],
      }),
    },
  },
  mixins: [explorer],
  data() {
    return {
      newTag: '',
      title: '',
      search: '',
      tagName: '',
      labelType: '',
      loadingProjectDialog: '',
      items: [],
      data: [],
      images: [],
      showList: false,
      checkInput: false,
      btnCancel: {
        btnTitle: i18n.t('cancel'),
        btnColor: '#2dbdcb',
        btnOutline: true,
      },
      btnConfirm: {
        btnTitle: i18n.t('confirm'),
        btnColor: '#2dbdcb',
        btnTextWhite: true,
      },
      btnClose: {
        btnIcon: 'close',
        btnCheckIconCircle: true,
        btnRound: true,
        btnColor: 'transparent',
        btnTextWhite: true,
      },
      btnAdd: {
        btnIcon: 'add_circle_outline',
        btnCheckIconCircle: false,
        btnTitle: 'Add',
        btnRound: true,
        btnColor: '#2dbdcb',
        btnTextWhite: true,
      },
      btnImport: {
        btnIcon: 'add',
        btnCheckIconCircle: false,
        btnTitle: 'Import',
        btnRound: true,
        actions: [
          {
            title: 'Local file',
          },
          {
            title: 'Scanatic platform',
          },
        ],
      },
      // btnChipClose: {
      //   btnIcon: 'close',
      //   btnCheckIconCircle: true,
      //   btnRound: true,
      //   btnColor: 'blue-grey lighten-3',
      //   btnTextWhite: true,
      //   btnSizeSmall:true
      // },
      labeling_type: [
        {
          canCheck: true,
          name: i18n.t('classification__only'),
        },
        {
          canCheck: true,
          name: i18n.t('classification__bbox'),
        },
        {
          canCheck: false,
          name: i18n.t('classification__px'),
        },
      ],
      actions: [
        {
          title: i18n.t('labeled'),
          icon: hasLabel,
          label: 1,
        },
        {
          title: i18n.t('not_labeled'),
          icon: noLabel,
          label: 2,
        },
        {
          title: i18n.t('all'),
        },
      ],
    };
  },
  methods: {
    // Project init()
    resetProjectData() {
      this.labelType = '';
      this.currentPage = 1;
      this.refreshItems();
    },
    refreshItems() {
      this.items = [];

      if (this.singleProductDialog.classes) {
        this.singleProductDialog.classes.forEach(item => {
          this.items.push({
            id: item.id,
            name: item.name,
          });
        });
      }
    },
    // touch ADD Btn Show Input
    showInput() {
      this.checkInput = true;
    },
    // touch Tag Show Update Input
    showUpdateInput(tag) {
      this.$set(tag, 'edit', true);
    },
    async addTag(tagText) {
      const tag = tagText.trim();

      await this.$nextTick(async () => {
        if (!tag || this.newTag === tag) {
          // console.log(1);
        } else if (this.singleProductDialog.id) {
          let loader = this.$loading.show({
            container: this.$refs.tag,
          });
          this.updateProjectAddTag(tag);
          await this.refreshClasses();
          this.refreshItems();
          loader.hide();
        } else {
          this.items.push({
            id: (this.items.length !== 0 ? this.items[this.items.length - 1].id : 0) + 1,
            name: tag,
          });
        }
        this.newTag = tag;
        this.checkInput = false;
      });
    },
    // DobbleClick Tag to update Create/Update Project Tag
    async updateTag(tag, value) {
      if (this.tagName == value) return;
      this.tagName = value;
      let loader = this.$loading.show({
        container: this.$refs.tag,
      });

      if (!this.singleProductDialog.id) {
        this.items.forEach(item => {
          if (item.id === tag.id) {
            item.name = value;
          }
        });
        this.$set(tag, 'edit', false);
        return;
      }
      const itemClass = this.items.filter(item => {
        return item.name === tag.name;
      });
      try {
        await this.$http.post(
          '/api/v1/projects/' + this.singleProductDialog.id + '/classes/' + itemClass[0].id,
          { name: value }
        );
        this.$snackbar.info(i18n.t('classification_updated'));
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      } finally {
        await this.refreshClasses();
        this.refreshItems();
        await this.$set(tag, 'edit', false);
        loader.hide();
      }
    },
    // call Delete Single Tag API
    async deleteTag(id) {
      if (this.singleProductDialog.id) {
        let loader = this.$loading.show({
          container: this.$refs.tag,
        });
        try {
          await this.$http.delete(
            '/api/v1/projects/' + this.singleProductDialog.id + '/classes/' + id
          );
          this.$snackbar.info(i18n.t('classification_removed'));
        } catch (e) {
          const { response } = e;
          const { status } = response || {};
          if (status === 401) {
            this.$router.push('/login');
          }
        } finally {
          await this.refreshClasses();
          this.refreshItems();
          loader.hide();
        }
      } else {
        this.items.forEach((item, key) => {
          if (item.id === id) {
            this.items.splice(key, 1);
          }
        });
      }
    },
    // call Single Add Tag API
    async updateProjectAddTag(tag) {
      try {
        const { data } = await this.$http.post(
          '/api/v1/projects/' + this.singleProductDialog.id + '/classes',
          {
            name: tag,
          }
        );
        if (data) {
          this.$snackbar.info(i18n.t('classification_added'));
        }
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      }
    },
    // call Create/Update Project API
    submitProject() {
      if (!this.singleProductDialog.id) {
        this.items.forEach(item => {
          this.singleProductDialog.classes.push(item.name);
        });
      }
      if (this.singleProductDialog.name.length === 0) {
        this.$snackbar.alert(i18n.t('should_has_projectTitle'));
      } else if (this.singleProductDialog.labelingType === -1) {
        this.$snackbar.alert(i18n.t('should_has_labelingType'));
      } else if (this.items.length === 0) {
        this.$snackbar.alert(i18n.t('should_has_tag'));
      } else {
        this.$emit('CUproject', this.singleProductDialog);
        this.closeDialog();
      }
    },
    // Change Create/Update Project Title
    changeTitle() {
      if (this.singleProductDialog.name) {
        this.title = '';
      } else {
        this.title = i18n.t('new_project');
      }
    },
    // open Bbox to Update Single Image Label
    openCUBBoxDialog(image) {
      this.$emit('openCUBBoxDialog', { ...this.singleProductDialog, fromSingleImage: true }, image);
    },
    changeSearchValue() {
      if (this.composing) {
        return;
      }
      this.filter = this.search;
      this.refreshImages();
    },
    cancelSearch() {
      this.isSearching = false;
      this.filter = '';
      this.search = '';
      this.refreshImages();
    },
    //call All Product Images API
    async getData(page, firstLoad, labelStatus) {
      let loader = this.$loading.show({
        container: this.$refs.img,
      });
      if (!this.singleProductDialog.name) {
        return;
      }
      const newPage = parseInt(page, 10);
      if (!firstLoad) {
        if (newPage === this.currentPage) {
          return;
        }
      }
      this.selectAll = false;
      const params = Object.assign({}, this.pagination);
      if (this.filter) {
        params.filter = this.filter;
      }
      if (newPage) {
        params.offset = (page - 1) * this.pagination.limit;
        this.currentPage = newPage;
      }

      switch (labelStatus) {
        case 1:
          params.labeled = true;
          break;
        case 2:
          params.labeled = false;
          break;
      }
      try {
        this.isRequesting = true;
        const realm = 'images';
        const { data } = await this.$http.get(
          '/api/v1/projects/' + this.singleProductDialog.id + '/images',
          { params }
        );
        const { total } = data;
        this.images = data[realm].map(item => this.makeExplorerItem(item));
        this.totalItems = total;
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      } finally {
        this.isRequesting = false;
        loader.hide();
      }
    },
    //position toggle Page List
    toggleMenu(item, e) {
      this.showMenu = false;
      setTimeout(() => {
        this.menuX = item.clientX;
        this.menuY = item.clientY;
        this.actionMenuTarget = e;
        this.showMenu = true;
      }, 100);
    },
    //go to Next Page
    gotoPage(page) {
      const newPage = this.currentPage + page;
      if (this.totalPages.indexOf(`${newPage}`) < 0) {
        return;
      }
      this.getData(newPage);
    },
    makeExplorerItem(source) {
      return {
        ...source,
        selected: false,
        current: false,
      };
    },
    async refreshClasses() {
      try {
        const response = await this.$http.get(
          `/api/v1/projects/${this.singleProductDialog.id}/classes`
        );
        const { data } = response;
        const { classes } = data;
        if (data) {
          this.singleProductDialog.classes = [...classes];
        }
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      }
    },
    //refresh Images to page1
    async refreshImages() {
      if (this.singleProductDialog.name) {
        await this.getData(this.page, true, this.labelType);
      } else {
        this.images = [];
        this.totalItems = 0;
      }
    },
    closeDialog() {
      this.$emit('closeDialog', 'projectDialog', false);
    },
    showListMenu() {
      this.showList = true;
    },
    filterImgs($event) {
      this.labelType = $event.label;
      this.getData(1, true, $event.label);
      this.showList = false;
    },
    handleClick(e) {
      const { target } = e;

      if (target.classList.value !== 'v-list__tile__action') {
        this.showList = false;
      }
    },
    loading(canLoading) {
      if (canLoading) {
        this.loadingProjectDialog = this.$loading.show({
          backgroundColor: 'white',
        });
      } else {
        this.loadingProjectDialog.hide();
      }
    },
  },
  computed: {
    hasLabels() {
      return !!this.images.find(i => i.status === 2);
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
  },
  watch: {
    async 'showDialog.projectDialog'(nv) {
      if (nv) {
        if (!this.singleProductDialog.id) {
          this.resetProjectData();
          this.changeTitle();
          await this.refreshImages();
        }
      }
    },
    async 'singleProductDialog.id'(nv) {
      if (nv) {
        if (this.showDialog.projectDialog) {
          this.resetProjectData();
          this.changeTitle();
          await this.refreshImages();
          this.loading(false);
        }
      } else {
        this.resetProjectData();
        this.changeTitle();
        await this.refreshImages();
      }
    },
    isSearching(nv) {
      if (nv) {
        this.$nextTick(() => {
          this.$refs.input.focus();
        });
      }
    },
    showList(nv) {
      const $dialog = document.querySelector('.project-dialog');
      if (nv) {
        setTimeout(() => {
          $dialog.addEventListener('click', this.handleClick);
        }, 300);
      } else {
        $dialog.removeEventListener('click', this.handleClick);
      }
    },
  },
};
</script>

<style scoped lang="scss">
$paddingLR: 20px;
.NavBar {
  position: fixed;
  width: 100vw;
  color: white;
  background-color: #1ac5d4;
  padding: 20px 40px;
  font-size: 30px;
  z-index: inherit;
}
.content {
  background-color: #ededed;
}
.title-bg {
  background: #eff9f9;
}
.contentBg {
  color: black;
  background: white;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.2);
  .content-pd {
    padding: 20px 30px;
  }
  /deep/ input {
    margin-bottom: 0px;
  }
}
.v-text-field__slot {
  /deep/ input {
    margin-bottom: 0px;
  }
}
.img-menu {
  position: relative;
  /deep/.imgMenuList {
    position: absolute;
    top: 0px;
    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14),
      0px 3px 14px 2px rgba(0, 0, 0, 0.12);
  }
}
.dotted-line {
  border-right: 1px dashed #d4d4d4;
}
.useLabel {
  cursor: pointer;
  .hasLabel {
    color: #b5b5b5;
  }
  .noLabel {
    color: black;
  }
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
    border-radius: 20px;
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
.loading {
  position: relative;
  .loading-son {
    position: absolute;
    left: 45%;
    top: 45%;
    height: 50px;
    width: 50px;
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
.footerBg {
  position: fixed;
  bottom: 0px;
  min-width: 100vw;
  background: white;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.2);
}
</style>

<style>
.project-dialog {
  background-color: #ededed;
}
</style>

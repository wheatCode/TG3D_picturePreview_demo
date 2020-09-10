<template>
  <v-container fluid class="home--bg">
    <!-- Image Uploader -->
    <Upload :items="items"></Upload>
    <!-- Home Navbar -->
    <Navbar />
    <!-- Home Content -->
    <v-layout justify-center>
      <v-flex>
        <!-- Project Lists -->
        <explorer
          :items="items"
          :total-items="totalItems"
          :total-pages="totalPages"
          :current-page="currentPage"
          :tags="tags"
          :actions="actions"
          :page-sizes="pageSizes"
          :current-page-size="pageSize"
          :sort="sortingOptions"
          :is-searching="isSearching"
          :filter="filter"
          :is-requesting="isRequesting"
          :can-select="false"
          :can-import="true"
          :can-select-all="false"
          :can-search="true"
          :select-all="selectAll"
          :fix-view-mode="'list'"
          :columns="columns"
          put-action-menu-to-end
          no-breadcrumbs
          @editView="openCUprojectDialog"
          @deleteView="deleteProject"
          @start-searching="startSearching"
          @change-search-value="changeSearchValue"
          @cancel-search="cancelSearch"
          @change-sorting-options="changeSortingOptions"
          @change-page-size="changePageSize"
          @get-data="getData"
          @click-dir="traverse"
          @go-back="goBack"
        >
          <template>
            <v-btn
              class="mx-0 my-3"
              slot="top-button"
              round
              outline
              @click="openCUprojectDialog(false)"
            >
              <v-icon>add</v-icon>
              {{ $t('add_project') }}
            </v-btn>
          </template>
          <!-- Single List -->
          <template slot-scope="{ items, mode, clean, click, select, toggle, canSelect }">
            <customer-item
              v-for="item in items"
              :key="item.id"
              :view-type="mode"
              :item="item"
              :clean="clean"
              :can-select="canSelect"
              @click="openCUBBoxDialog"
              @select="select"
              @menu="toggle"
            />
          </template>
        </explorer>
      </v-flex>
    </v-layout>
    <v-layout style="height:50px"></v-layout>
    <!-- Project Dialog -->
    <project-dialog
      ref="projectDialog"
      :showDialog="dialog.checkDialog"
      :singleProductDialog="dialog.singleProductDialog"
      @closeDialog="closeDialog"
      @CUproject="CUproject"
      @openCUBBoxDialog="openCUBBoxDialog"
    />
    <!-- Bbox Dialog -->
    <bbox-dialog
      ref="boxDialog"
      :showDialog="dialog.checkDialog"
      :singleProductDialog="dialog.singleBBoxDialog"
      @openCUBBoxDialog="openCUBBoxDialog"
      @closeDialog="closeDialog"
    />
  </v-container>
</template>

<script>
import i18n from '@/i18n/i18n';
import Navbar from '@/components/common/Navbar';
import Upload from '@/components/common/Upload';
import ProjectDialog from '@/components/home/DialogModel';
import BboxDialog from '@/components/bbox&classification/BboxAndClassification';
import Explorer from '@/components/home/explorer/Explorer';
import explorer from '@/components/home/mixin/explorer';
import CustomerItem from '@/components/home/explorer/Item';
import editImg from '@/assets/ic-edit.svg';
// import deleteImg from '@/assets/ic-delete.svg';

const COLUMNS = [
  { name: i18n.t('project_name'), width: 5, key: 'name' },
  { name: i18n.t('created_at'), width: 5, key: 'created_at' },
  { name: i18n.t('completion'), width: 2, key: 'completion' },
];

const ITEMS_PER_PAGE = [40, 80];

export default {
  name: 'home',
  components: {
    ProjectDialog,
    BboxDialog,
    CustomerItem,
    Explorer,
    Navbar,
    Upload,
  },
  mixins: [explorer],
  data() {
    return {
      items: [],
      selected: [],
      tabs: [],
      tags: [],
      totalItems: 0,
      pageSizes: ITEMS_PER_PAGE,
      actions: [
        {
          event: 'editView',
          icon: editImg,
          title: i18n.t('actions__edit_view'),
        },
        // {
        //   event: 'deleteView',
        //   icon: deleteImg,
        //   title: i18n.t('actions__remove')
        // }
      ],
      dialog: {
        checkDialog: {
          projectDialog: false,
          bBoxAndClassification: false,
        },
        singleProductDialog: {},
        singleBBoxDialog: {},
      },
    };
  },
  async mounted() {
    await this.refreshAllProjects();
  },
  methods: {
    // get All Products
    async getData(page, folder) {
      this.selectAll = false;
      const params = Object.assign({}, this.pagination);
      // const { by, asc } = this.sortingOptions;
      // if (by) {
      //   params.sort = asc ? by : `-${by}`;
      // }
      if (this.filter && !folder) {
        params.filter = this.filter;
      }
      if (page) {
        params.offset = (page - 1) * this.pagination.limit;
        this.currentPage = page;
      }
      try {
        this.scrollToTop();
        this.isRequesting = true;
        const realm = 'projects';
        const { data } = await this.$http.get('/api/v1/projects', { params });
        const { total } = data;
        this.items = data[realm].map(item => this.makeExplorerItem(item));
        this.totalItems = total;
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      } finally {
        this.isRequesting = false;
      }
    },
    // will open Project Dialog Toggle Create/Update
    async openCUprojectDialog(item) {
      this.dialog.checkDialog.projectDialog = true;
      item ? await this.openUpdateProjectDialog(item) : this.openCreateProjectDialog();
    },
    //open Null Project Data Project Dialog
    openCreateProjectDialog() {
      this.dialog.singleProductDialog = {
        name: '',
        labelingType: -1,
        classes: [],
      };
    },
    //open has Single Project Data Prjoct Dialog
    async openUpdateProjectDialog(item) {
      this.$refs.projectDialog.loading(true);
      try {
        const response = await this.$http.get(`/api/v1/projects/${item.id}`);
        if (response.data) {
          this.dialog.singleProductDialog = { ...response.data };
        }
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      }
    },
    // will call Project Dialog Create/Update API
    CUproject(item) {
      item.id ? this.updateProject(item) : this.createProject(item);
    },
    //call Create Project API
    async createProject(item) {
      try {
        const { classes, ...payload } = item;
        if (Array.isArray(classes) && classes.filter(c => c).length > 0) {
          payload.classes = classes;
        }
        await this.$http.post('/api/v1/projects', payload);
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      }
    },
    //call Update Project API
    async updateProject(item) {
      const data = {
        name: item.name,
        labelingType: item.labelingType,
        classes: item.classes,
      };
      try {
        await this.$http.post(`/api/v1/projects/${item.id}`, data);
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      }
    },
    // will open Bbox Dialog Toggle Create/Update
    async openCUBBoxDialog(item, image) {
      this.$refs.boxDialog.moveImgToCenter();
      this.$refs.boxDialog.loadingImg(true);
      this.dialog.checkDialog.bBoxAndClassification = true;
      image ? await this.openUpdateBBoxDialog(item, image) : await this.openCreateBBoxDialog(item);

      if (this.dialog.singleBBoxDialog.next || this.dialog.singleBBoxDialog.labels) {
        this.dialog.checkDialog.bBoxAndClassification = true;
      } else {
        this.dialog.checkDialog.bBoxAndClassification = false;
        this.$refs.boxDialog.loadingImg(false);
        setTimeout(() => {
          this.$refs.boxDialog.singleProduct = {};
          this.$snackbar.info(i18n.t('no_next'));
        }, 300);
      }
    },
    //  open Null Image Data BBox Dialog
    async openCreateBBoxDialog(item) {
      const data = { imageId: '', labels: [] };

      const { data: respData } = await this.$http.post(`/api/v1/projects/${item.id}/labels`, data);
      this.dialog.singleBBoxDialog = { ...item, ...respData };
    },
    //  open has Single Image Data BBox Dialog
    async openUpdateBBoxDialog(item, image) {
      const next = { ...image };
      const { data } = await this.$http.get(
        `/api/v1/projects/${item.id}/images/${image.id}/labels`
      );
      this.dialog.singleBBoxDialog = {
        ...item,
        ...data,
        next,
        fromSingleImage: true,
      };
    },
    //closoe Project/Bbox Dialog
    closeDialog(type, status) {
      const checkDialog = this.dialog.checkDialog;
      this.refreshAllProjects();
      switch (type) {
        case 'projectDialog':
          this.dialog.singleProductDialog = {};
          checkDialog.projectDialog = status;
          break;
        case 'bBoxAndClassification':
          this.dialog.singleBBoxDialog = {};
          checkDialog.bBoxAndClassification = status;
          if (checkDialog.projectDialog) {
            this.$refs.projectDialog.refreshImages();
          }
          break;
      }
    },
    //call Delete Single Project API
    async deleteProject(item) {
      try {
        await this.$http.delete(`/api/v1/projects/${item.id}`);
        await this.refreshAllProjects();
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      }
    },
    makeExplorerItem(source) {
      return {
        ...source,
        selected: false,
        current: false,
      };
    },
    //refresh Projects to page1
    async refreshAllProjects() {
      this.items = [];
      await this.getData(1);
    },
    cancelSearch() {
      this.isSearching = false;
      this.filter = '';
      this.refreshAllProjects();
    },
  },
  computed: {
    columns() {
      return COLUMNS;
    },
  },
};
</script>
<style lang="scss" scoped>
.home--bg {
  min-height: 100vh;
  background-color: #ededed;
  height: 100%;
  padding: 0;
}
</style>

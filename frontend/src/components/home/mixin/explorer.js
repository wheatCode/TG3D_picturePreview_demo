import scrollToTop from './scroll-to-top';

const ITEMS_PER_PAGE = [40, 80];

const explorer = {
  mixins: [scrollToTop],
  data: () => ({
    currentTab: '',
    isRequesting: false,
    isSearching: false,
    showMoveItemDialog: false,
    selectAll: false,
    canSelectFolder: true,
    canTraverse: true,
    filter: '',
    itemsData: {},
    totalItems: 0,
    currentPage: 1,
    currentItem: {},
    currentItems: [],
    pageSizes: ITEMS_PER_PAGE,
    sortingOptions: {
      by: 'name',
      asc: true,
    },
    pagination: {
      offset: 0,
      limit: ITEMS_PER_PAGE[0],
    },
  }),
  methods: {
    async getOne(id) {
      try {
        this.isRequesting = true;
        const { data } = await this.$http.get(`${this.endPoint}/${id}`);
        this.isRequesting = false;
        return data;
      } catch (e) {
        this.isRequesting = false;
        return null;
      }
    },
    async getData(page, folder) {
      this.selectAll = false;
      const params = Object.assign({}, this.pagination);
      const { by, asc } = this.sortingOptions;
      if (by) {
        params.sort = asc ? by : `-${by}`;
      }
      if (this.filter && !folder) {
        params.filter = this.filter;
      } else {
        const currentFolder = folder || this.currentFolder;
        if (currentFolder.id) {
          params.parent_id = currentFolder.id;
        }
      }
      if (page) {
        params.offset = (page - 1) * this.pagination.limit;
        this.currentPage = page;
      }
      try {
        this.scrollToTop();
        this.isRequesting = true;
        const realm = this.realm;
        Object.assign(params, this.params);
        const { data } = await this.$http.get(this.endPoint, {
          params,
        });
        const { total } = data;
        const folders = [];
        this.items = data[realm].map((item, index) => {
          if (item.is_dir && !item.dir_metadata) {
            folders.push(index);
          }
          return this.makeExplorerItem(item);
        });
        this.totalItems = total;
        // await this.getPreviewsFromFolders(folders, realm);
      } catch (e) {
        this.$snackbar.alert(e.message);
      } finally {
        this.isRequesting = false;
      }
    },
    // async getPreviewsFromFolders(folderIndices, realm) {
    // if (!Array.isArray(folderIndices) || folderIndices.length === 0) {
    //   return;
    // }
    // const responses = await axios.all(
    //   folderIndices.map(idx => {
    //     const target = this.items[idx];
    //     if (!target || !target.id) {
    //       return Promise.resolve();
    //     }
    //     const params = Object.assign(
    //       { parent_id: target.id, limit: 1000 },
    //       this.params
    //     );
    //     return this.$http.get(this.endPoint, { params });
    //   })
    // );
    // responses.forEach((resp, idx) => {
    //   const { data } = resp;
    //   const items = data[realm] || [];
    //   const thumbnails = [];
    //   const children = {};
    //   items.forEach(item => {
    //     const thumbnail = item[this.previewTargetName];
    //     if (thumbnails.length < 2 && thumbnail) {
    //       thumbnails.push(thumbnail);
    //     }
    //     children[item.id] = true;
    //   });
    //   const index = folderIndices[idx];
    //   const target = this.items[index];
    //   if (target) {
    //     target.totalItems = items.length;
    //     target.preview = thumbnails;
    //     target.children = children;
    //   }
    // });
    // },
    async traverse(folder) {
      if (!this.filter) {
        if (this.isSearching) {
          this.isSearching = false;
        }
        if (!this.currentPath.find(existing => existing.id === folder.id)) {
          this.currentPath.push(folder);
        }
      }
      await this.getData(1, folder, this.isSearching);
    },
    async goBack(index) {
      if (this.isRequesting) {
        return;
      }
      this.currentPath.splice(index + 1);
      await this.getData(1, this.currentFolder);
    },
    makeExplorerItem() {
      // makeExplorerItem(source) {
      // const item = {
      //   ...source,
      //   selected: false,
      //   current: false,
      // };
      // if (source.is_dir) {
      //   item.preview = [];
      //   item.totalItems = 0;
      //   if (source.dir_metadata) {
      //     const { child_count = 0, thumbnails = [] } = source.dir_metadata;
      //     item.totalItems = child_count;
      //     item.preview = thumbnails.map(t => t[this.previewTargetName]);
      //   }
      // }
      // return item;
    },
    async refresh(folder) {
      await this.getData(1, folder);
    },
    handleToggleAll(selected) {
      this.selectAll = selected;
      this.items.forEach(item => {
        if (!this.canSelectFolder && item.is_dir) {
          return;
        }
        item.selected = selected; // eslint-disable-line
        // this.handleSelectionChange(item);
      });
    },
    selectItem(item) {
      if (!this.canSelectFolder && item.is_dir) {
        this.selectAll = false;
        return;
      }
      item.selected = !item.selected; // eslint-disable-line
      if (!item.selected) {
        this.selectAll = false;
      }
      // this.handleSelectionChange(item);
    },
    // handleSelectionChange(item) {},
    changeSortingOptions(newCondition) {
      const { by, asc } = this.sortingOptions;
      if (newCondition && newCondition === by) {
        this.sortingOptions.asc = !asc;
      } else {
        this.sortingOptions.by = newCondition;
        this.sortingOptions.asc = false;
      }
      this.refresh();
    },
    changePageSize(pageSize) {
      this.pagination.limit = pageSize;
      this.currentPage = 1;
      this.refresh();
    },
    setCurrentItem(item) {
      if (Array.isArray(item)) {
        this.currentItems = item;
        this.currentItems.forEach(target => {
          target.current = true;
        });
      } else {
        this.currentItem = item;
        this.currentItem.current = true;
      }
    },
    unsetCurrentItem() {
      if (this.currentItem.id) {
        this.currentItem.current = false;
      }
      this.currentItem = {};
      this.currentItems.forEach(item => {
        item.current = false;
      });
      this.currentItems = [];
      this.selectAll = false;
    },
    onTabChanged(tab) {
      this.currentTab = tab;
      this.$nextTick(() => {
        this.refresh();
      });
    },
    startSearching() {
      if (this.isSearching) {
        return;
      }
      this.filter = '';
      this.isSearching = true;
    },
    changeSearchValue(newFilter) {
      this.filter = newFilter;
      this.refresh();
    },
    cancelSearch() {
      this.isSearching = false;
      this.filter = '';
      this.refresh(this.currentFolder);
    },
    appendTags(newTags) {
      this.currentItems.forEach(item => {
        item.tag_list.push(...newTags);
      });
    },
    async updateData(id, newData, skipLocalUpdate = false) {
      this.isRequesting = true;
      let url = this.endPoint;
      const params = {};
      let toUpdate = [];
      if (Array.isArray(id)) {
        params.ids = id.join(',');
        toUpdate = id;
      } else if (id) {
        url = `${this.endPoint}/${id}`;
        toUpdate = [id];
      }
      // update data optimistically
      if (!skipLocalUpdate && toUpdate.length > 0) {
        toUpdate.forEach(itemId => {
          this.updateDataInList(itemId, newData);
        });
      }
      try {
        await this.$http.post(url, newData, {
          params,
        });
        if (!id) {
          await this.refresh();
        }
        this.$bus.$emit('update-data', true);
        // update data if it has not been updated already
        if (skipLocalUpdate && toUpdate.length > 0) {
          toUpdate.forEach(itemId => {
            this.updateDataInList(itemId, newData);
          });
        }
      } catch (e) {
        this.$snackbar.alert(e.message);
        this.$bus.$emit('update-data', false);
      } finally {
        this.isRequesting = false;
      }
    },
    async deleteData(data) {
      try {
        const confirm = await this.$confirm
          .open
          // i18n.t('fabric.confirm_delete__content'),
          // i18n.t('fabric.confirm_delete__title')
          ();
        if (!confirm) {
          return;
        }
        const params = {};
        let url = '';
        let toDelete;
        if (Array.isArray(data)) {
          params.ids = data.map(item => item.id).join(',');
          url = this.endPoint;
          toDelete = data;
        } else {
          url = `${this.endPoint}/${data.id}`;
          toDelete = [data];
        }
        await this.$http.delete(url, {
          params,
        });
        toDelete.forEach(item => {
          this.removeItemFromList(item);
        });
        this.selectAll = false;
      } catch (e) {
        this.$snackbar.alert(e.message);
      }
    },
    createNewFolder() {
      const item = this.makeExplorerItem({
        is_dir: true,
        new: true,
        isChangingName: true,
      });
      this.items.unshift(item);
    },
    async doneAddingFolder(item, name) {
      const index = this.items.findIndex(item => item.new);
      if (index < 0) {
        return;
      }
      if (!name) {
        this.items.splice(index, 1);
      } else {
        this.isRequesting = true;
        try {
          const payload = {
            is_dir: true,
            name,
          };
          const currentFolder = this.currentFolder;
          if (currentFolder.id) {
            payload.parent_id = currentFolder.id;
          }
          const { data } = await this.$http.post(this.endPoint, payload);
          const folder = this.makeExplorerItem(data);
          // this.$set(this.items, index, Object.assign(this.items[index], {...data, ...payload, new: false }));
          this.$set(this.items, index, folder);
        } catch (e) {
          this.$snackbar.alert(e.message);
        } finally {
          this.isRequesting = false;
        }
      }
    },
    addNewFolderToList(folder, parentID) {
      const { id, root } = this.currentFolder;
      if ((root && parentID) || (id && parentID && id !== parentID)) {
        return;
      }
      const item = this.makeExplorerItem(folder);
      this.items.unshift(item);
    },
    updateDataInList(id, data) {
      const index = this.items.findIndex(item => item.id === id);
      if (index >= 0) {
        this.$set(this.items, index, Object.assign(this.items[index], data));
      }
    },
    removeItemFromList(data) {
      const index = this.items.findIndex(item => item.id === data.id);
      if (index >= 0) {
        this.items.splice(index, 1);
      }
    },
    updateFolderPreviewInfo(parentID) {
      const target = this.items.find(item => item.id === parentID);
      if (!target) {
        return;
      }
      if (this.currentItems.length > 0) {
        target.totalItems = target.totalItems + this.currentItems.length;
        for (let i = 0; i < this.currentItems.length; i++) {
          const item = this.currentItems[i];
          if (target.preview.length >= 2 || !item) {
            return;
          }
          const previewImage = item[this.previewTargetName];
          if (previewImage) {
            target.preview.push(previewImage);
          }
        }
      } else {
        const previewImage = this.currentItem[this.previewTargetName];
        if (previewImage && target.preview.length < 2) {
          target.preview.push(previewImage);
        }
        target.totalItems++;
      }
    },
    openMoveItemDialog(item) {
      this.showMoveItemDialog = true;
      this.setCurrentItem(item);
    },
    async moveItem(parentID) {
      if (
        (this.currentFolder.id && this.currentFolder.id === parentID) ||
        (!this.currentFolder.id && !parentID)
      ) {
        this.closeMoveItemDialog();
        return;
      }
      let targetIds;
      if (this.multipleItemsSelected) {
        targetIds = this.currentItems.map(item => item.id);
      } else if (this.currentItem.id) {
        targetIds = this.currentItem.id;
      } else {
        this.closeMoveItemDialog();
        return;
      }
      await this.updateData(
        targetIds,
        {
          parent_id: parentID,
        },
        true
      );
      this.updateFolderPreviewInfo(parentID);
      if (this.multipleItemsSelected) {
        this.currentItems.forEach(item => {
          this.removeItemFromList(item);
        });
      } else {
        this.removeItemFromList(this.currentItem);
      }
      this.closeMoveItemDialog();
    },
    closeMoveItemDialog() {
      this.showMoveItemDialog = false;
      this.unsetCurrentItem();
    },
    startRenaming(target) {
      this.$set(target, 'isChangingName', true);
    },
    async doneRenaming(target, name) {
      this.$set(target, 'isChangingName', false);
      if (name && name !== target.name) {
        await this.updateData(target.id, {
          name,
        });
      }
    },
  },
  computed: {
    // items: {
    //   get() {
    //     if (!this.currentTab) {
    //       return [];
    //     }
    //     return this.itemsData[this.currentTab] || [];
    //   },
    //   set(newValue) {
    //     if (Array.isArray(newValue) && this.currentTab) {
    //       this.$set(this.itemsData, this.currentTab, newValue);
    //     }
    //   },
    // },
    tabIndex() {
      return this.tabs.findIndex(tab => tab.id === this.currentTab);
    },
    endPoint() {
      return `/${this.tabs[this.tabIndex].endpoint}`;
    },
    realm() {
      const currentTab = this.tabs[this.tabIndex];
      return currentTab.realm || currentTab.endpoint;
    },
    params() {
      const currentTab = this.tabs[this.tabIndex];
      return currentTab.params || {};
    },
    currentPath() {
      return this.paths[this.tabIndex];
    },
    currentFolder() {
      return this.currentPath[this.currentPath.length - 1] || {};
    },
    noData() {
      return (
        !this.filter && !this.isRequesting && this.paths.length === 1 && this.items.length === 0
      );
    },
    totalPages() {
      // return an array with elements ranging from 1 to pages
      const pages = Math.ceil(this.totalItems / this.pagination.limit) || 1;
      return new Array(pages).fill(0).map((item, i) => `${i + 1}`);
    },
    pageSize() {
      return this.pagination.limit;
    },
    multipleItemsSelected() {
      return this.currentItems.length > 0;
    },
  },
};

export default explorer;

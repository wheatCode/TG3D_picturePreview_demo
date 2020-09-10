<template>
  <v-dialog v-model="showDialog" no-click-animation persistent fullscreen>
    <div class="dialogBg">
      <v-container>
        <v-layout justify-end>
          <h1 v-html="title" class="mr-auto"></h1>
          <toggle-btn
            :btn-icon-start="btnClose.btnIcon"
            :btn-check-icon-circle="btnClose.btnCheckIconCircle"
            :btn-round="btnClose.btnRound"
            :btn-color="btnClose.btnColor"
            :btn-text-white="btnClose.btnTextWhite"
            @getBtn="closeDialog"
          ></toggle-btn>
        </v-layout>
      </v-container>

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
          @getBtn="createUpdateProject"
        />
      </v-layout>
    </div>
  </v-dialog>
</template>

<script>
import ToggleBtn from '@/components/common/ToggleBtn';
// import Tag from '@/components/common/Tag';

export default {
  name: 'dialogmodel1',
  components: {
    ToggleBtn,
    // Tag,
  },
  props: {
    showDialog: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      items: [
        {
          id: 0,
          name: 'mine',
        },
        {
          id: 1,
          name: 'yours',
        },
        {
          id: 2,
          name: 'ours',
        },
      ],
      labels: [
        { name: 'body0001' },
        { name: 'body0001' },
        { name: 'body0001' },
        { name: 'body0001' },
        { name: 'body0001' },
        { name: 'body0001' },
        { name: 'body0001' },
        { name: 'body0001' },
        { name: 'body0001' },
        { name: 'body0001' },
      ],
      data: [
        {
          icon: 'folder',
          iconClass: 'grey lighten-1 white--text',
          title: 'Photos',
          subtitle: 'Jan 9, 2014',
        },
        {
          icon: 'folder',
          iconClass: 'grey lighten-1 white--text',
          title: 'Recipes',
          subtitle: 'Jan 17, 2014',
        },
        {
          icon: 'folder',
          iconClass: 'grey lighten-1 white--text',
          title: 'Work',
          subtitle: 'Jan 28, 2014',
        },
      ],
      title: 'Project name',
      checkInput: false,
      newTag: '',
      btnCancel: {
        btnTitle: 'Cancel       ',
        btnColor: '#2dbdcb',
        btnOutline: true,
      },
      btnConfirm: {
        btnTitle: 'Confirm',
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
      labeling_type: [
        'Classification Only',
        'Bbox & Classification',
        'Pixel-level & Classification',
      ],
    };
  },
  mounted() {
    this.title += '<br>' + this.$route.path.replace('/', '');
  },
  methods: {
    showInput() {
      this.checkInput = true;
    },
    addTag(tagText) {
      const tag = tagText.trim();

      this.$nextTick(() => {
        if (!tag || this.newTag === tag) {
          return (this.checkInput = false);
        }
        const items = this.items;

        this.newTag = tag;
        items.push({
          id: items.length,
          name: tag,
        });
        this.checkInput = false;
      });
    },
    createUpdateProject() {
      // const projectData = {};
      // const { id, name, labeling_type, classes } = this.singleProductDialog;
      // id ? (projectData.id = id) : '';
      // projectData.name = name;
      // projectData.labeling_type = labeling_type;
      // projectData.classes = classes;
      // this.axios
      //   .post({
      //     url: '/api/v1/projects' + id ? '/' + id : '',
      //     data: projectData
      //   }) //all projects  request
      //   .then(response => {
      //     const properties = response.data.properties;
      //     const tableContent = this.table.tableContent;
      //     if (properties) {
      //       this.closeDialog();
      //       console.log('createUpdateProject Success');
      //     } else {
      //       console.log('createUpdateProject Error');
      //     }
      //   });
    },
    deleteTag(id) {
      this.items = this.items.filter(item => {
        return item.id !== id;
      });
    },
    closeDialog() {
      this.$emit('changeDialog', false);
    },
  },
};
</script>

<style scoped>
.dialogBg {
  background: #3c3c3c;
  color: white;
}

.NavBar {
  color: white;
  background-color: #1ac5d4;
  padding: 20px 40px;
  font-size: 30px;
}
.v-input input {
  margin: 0px !important;
}
.content {
  background-color: #ededed;
}
.contentBg {
  color: black;
  background: white;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.2);
  padding: 20px 30px;
}
.dotted-line {
  border-right: 1px dashed #d4d4d4;
}
.noLabel {
  color: #b5b5b5;
}
.footerBg {
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.2);
}
/* .h3 {
  display: inline-block;
}
.headline {
  color: white;
} */
</style>

<template>
  <v-dialog no-click-animation persistent fullscreen v-model="showDialog.bBoxAndClassification">
    <div class="loading">
      <div ref="img" class="loading-son"></div>
    </div>
    <v-container fluid class="bBoxBG pa-0" v-show="showDialog.bBoxAndClassification">
      <v-layout style="height:10vh">
        <v-flex xs12 class="header">
          <v-layout justify-end class="pt-3">
            <h1 v-html="title" class="mr-auto pl-5"></h1>
            <div class="pr-3">
              <toggle-btn
                :btn-check-icon-circle="btnClose.btnCheckIconCircle"
                :btn-round="btnClose.btnRound"
                :btn-color="btnClose.btnColor"
                :btn-text-white="btnClose.btnTextWhite"
                :btn-size-small="btnClose.btnSizeSmall"
                @getBtn="closeDialog(true)"
              >
                <img src="../../assets/ic-windows-close-n@3x.png" alt="" width="25" height="25" />
              </toggle-btn>
            </div>
          </v-layout>
        </v-flex>
      </v-layout>
      <v-layout text-center class="contentH">
        <v-flex xs7 class="pt-5">
          <div class="positionCropperIcon ml-5">
            <cropper
              ref="cropper"
              class="mx-auto"
              v-bind="options"
              :img="singleProduct.next ? singleProduct.next.filePath : ''"
              :labels="labels"
              @imgLoad="imgLoad"
              @imgMoving="repositionCrop"
              @cropMoving="cropMoving"
              @cropDone="cropDone"
              @getImgWH="getImgWH"
              @changeLabels="changeLabels"
              @loadingImg="loadingImg"
              @getOriginalImgXY="getOriginalImgXY"
            >
              <check-box
                v-if="canCheckBox.canChooseLabel"
                @getRightBtn="canChooseLabels"
                @getLeftBtn="cancelChooseLabels"
              ></check-box>
            </cropper>
            <div class="crop-left-controls" v-show="showAdd">
              <div
                class="crop-control btn btn-add"
                :style="{ pointerEvents: canClickLabel ? 'auto' : 'none' }"
                :class="{ active: isAddLabel }"
                @click="toggleAdd(!isAddLabel)"
              ></div>
            </div>

            <div class="crop-controls" v-show="readyToEdit">
              <div
                v-show="false"
                class="crop-control btn btn-move"
                :class="{ active: isMoveMode }"
                @click="toggleMove"
              ></div>
              <div class="crop-control btn btn-zoomin" @click="changeScale(1)"></div>
              <div class="crop-control zoom-level">{{ zoom }}</div>
              <div class="crop-control btn btn-zoomout" @click="changeScale(-1)"></div>
            </div>
          </div>
        </v-flex>
        <v-flex xs5 class="ml-5 pt-5 pr-5" style="height:90vh;position:relative">
          <div class="lablesH" :class="{ tall: !this.singleProduct.labelingType }">
            <v-layout wrap :style="{ pointerEvents: canClickTag ? 'auto' : 'none' }">
              <toggle-btn
                v-for="(item, key) in classes"
                :key="key"
                :btn-title="item.name"
                :btn-id="item.id"
                :btn-color="item.btnColor"
                :btn-outline="item.btnOutline"
                :btnTextWhite="item.btnTextWhite"
                :btn-round="true"
                :btn-text-white="false"
                :btn-size-small="true"
                :table-id="item.tableId"
                :active="item.active"
                @getBtn="clickTag((btn = item), (tableId = item.tableId))"
              />
            </v-layout>
          </div>
          <v-layout class="tableH mt-2" v-show="showTable">
            <table-model
              :table-headers="table.tableHeaders"
              :table-content="table.tableContent"
              :table-td="table.tableTd"
            >
              <template
                v-for="(item, key) in countTableContent"
                :slot="`slot_tag4_${table.tableContent[key].id}_end`"
              >
                <toggle-btn
                  :btn-check-icon-circle="table.btnTrash.btnCheckIconCircle"
                  :table-id="table.tableContent[key].id"
                  :key="table.tableContent[key].id"
                  @getBtn="destoryTag(table.tableContent[key].id)"
                >
                  <img src="@/assets/ic-delete-black.png" width="18px" height="20px" alt="" />
                </toggle-btn>
              </template>
            </table-model>
          </v-layout>
        </v-flex>
      </v-layout>
      <v-layout class="footerBg py-2">
        <v-flex>
          <v-layout justify-center>
            <toggle-btn
              :btn-title="btnDelete.btnTitle"
              :btn-color="btnDelete.btnColor"
              :btn-outline="btnDelete.btnOutline"
              :btn-size-small="true"
              @getBtn="deleteImage"
            />
            <toggle-btn
              :btn-title="btnCancel.btnTitle"
              :btn-color="btnCancel.btnColor"
              :btn-outline="btnCancel.btnOutline"
              :btn-size-small="true"
              @getBtn="submitImgLabels(false)"
            />
            <toggle-btn
              :btn-title="btnConfirm.btnTitle"
              :btn-color="btnConfirm.btnColor"
              :btn-text-white="btnConfirm.btnTextWhite"
              :btn-size-small="true"
              @getBtn="submitImgLabels(true)"
            >
              <span
                ref="btnLoading"
                class="mt-3"
                v-if="loadingConfirm"
                style="width:25px;height:20px"
              ></span>
            </toggle-btn>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </v-dialog>
</template>

<script>
import i18n from '@/i18n/i18n';
import TableModel from '@/components/common/TableModel';
import ToggleBtn from '@/components/common/ToggleBtn';
import CheckBox from '@/components/common/CheckBox';
import Cropper from '@/components/Cropper';

export default {
  name: 'bBox',
  components: {
    TableModel,
    ToggleBtn,
    Cropper,
    CheckBox,
  },
  props: {
    showDialog: {
      type: Object,
      default: () => {},
    },
    singleProductDialog: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      title: '<h3>Project name</h3><h5 class="font-weight-thin">Bbox & Classification</h5>',
      classes: [],
      btnCancel: {
        btnTitle: i18n.t('skip'),
        btnColor: '#2dbdcb',
        btnOutline: true,
      },
      btnConfirm: {
        btnTitle: i18n.t('confirm'),
        btnColor: '#2dbdcb',
        btnTextWhite: true,
      },
      btnDelete: {
        btnTitle: i18n.t('delete'),
        btnColor: '#2dbdcb',
        btnOutline: true,
      },
      btnClose: {
        btnIcon: 'close',
        btnCheckIconCircle: true,
        btnRound: true,
        btnColor: 'transparent',
        btnTextWhite: true,
        btnSizeSmall: false,
      },
      table: {
        tableHeaders: [
          {
            text: 'Target',
            sortable: false,
          },
          {
            text: 'Bbox',
            sortable: false,
          },
          {
            text: 'Class',
            sortable: false,
          },
          {
            text: ' ',
            sortable: false,
          },
        ],
        tableTd: [
          { tag: true },
          { tag: true },
          { tag: true },
          { tag: true },
          { tag: false },
          { tag: false },
        ],
        tableContent: [],
        btnTrash: {
          btnIcon: 'restore_from_trash',
          btnCheckIconCircle: true,
        },
      },
      meta: {
        isLoading: false,
        errorMsg: '',
      },
      isCropping: false,
      ratioLocked: false,
      cropX: 0,
      cropY: 0,
      cropW: 0,
      cropH: 0,
      options: {
        canAdd: false,
        outputSize: 1,
        outputType: 'jpg',
        original: true,
        canMove: false,
        fixedBox: false,
        canMoveBox: true,
        canScale: false,
        centerBox: false,
        autoCrop: false,
        info: true,
        infoTrue: true,
        high: false,
        full: true,
        enlarge: 1,
        mode: '100%',
        fixed: false,
        fixedNumber: [1, 1],
      },
      originalImgX: '',
      originalImgY: '',
      labels: [],
      newLabels: [],
      coordinate: {},
      color: '',
      zoomLevel: 0,
      isRotating: false,
      newImgX: '',
      newImgY: '',
      imgWidth: '',
      imgHeight: '',
      scale: 1,
      canClickLabel: true,
      canClickTag: false,
      checkTag: '',
      checkTags: [],
      oldTabelId: '',
      newTableId: '',
      canCheckBox: {
        canChooseLabel: false,
      },
      axios: {},
      checkXY: {
        top: '',
        left: '',
      },
      loadingImgs: '',
      loadingConfirm: false,
      canLoading: false,
      timer: '',
      singleProduct: {},
      canSubmitLabelXY: [],
      colors: [
        'f9787f',
        'a4f985',
        '46b1f9',
        'f9f570',
        'f98ce9',
        '76e5ff',
        'fc906b',
        '85f9c1',
        'ffdba6',
        'c18df7',
      ],
    };
  },
  methods: {
    resetLabelingTool() {
      this.singleProduct = {
        ...this.singleProductDialog,
        ...this.singleProduct,
      };
      this.canClickLabel = true;
      this.labels = [];
      this.classes = [];
      this.checkTags = [];
      this.checkTag = '';
      this.table.tableContent = [];
      this.resetScale();
    },
    changeTitle() {
      this.title = `<h3>${
        this.singleProduct.next ? this.singleProduct.next.fileName : ''
      }</h3><h5 class="font-weight-thin">${this.showTitleClass || ''}</h5>`;
    },
    getImgWH({ width, height }) {
      this.imgWidth = width;
      this.imgHeight = height;
    },
    showChooseClass(tableId = tableId || null, coordinate = coordinate || null) {
      this.showClassColor(tableId);
    },
    clickTag(btn, tableId) {
      this.addUpdateToTableContent(btn, tableId);
      this.showChooseClass(tableId);
    },
    resetClickTag() {
      this.classes.forEach(item => {
        item.btnColor = '#636363';
        item.btnOutline = true;
        item.active = false;
      });
    },
    showClassColor() {
      // showClassColor(tableId) {
      this.classes.forEach(item => {
        item.btnColor = 'white';
        item.btnOutline = true;
        item.active = false;
      });

      switch (this.singleProduct.labelingType) {
        case 0:
          this.classes.forEach(item => {
            this.checkTags.forEach(tagItem => {
              if (item.id === tagItem.id) {
                item.btnColor = 'cyan lighten-2';
                item.active = true;
                item.btnOutline = false;
                item.btnTextWhite = true;
              }
            });
          });
          break;
        case 1:
          this.classes.forEach(item => {
            if (item.id === this.checkTag.id) {
              item.btnColor = 'cyan lighten-2';
              item.active = true;
              item.btnOutline = false;
              item.btnTextWhite = true;
            }
          });
          break;
      }
    },
    addUpdateToTableContent(btn, tableId, hasImageXY) {
      if (hasImageXY) {
        this.updateTableContent();
      } else {
        this.addTableContent(btn, tableId);
      }
    },
    updateTableContent() {
      switch (this.singleProduct.labelingType) {
        case 0:
          break;
        case 1:
          break;
      }
      // const classes = this.classes;
      // const tableContent = this.table.tableContent;
      // tableContent.push({
      //   id:
      //     tableContent.length === 0
      //       ? 0
      //       : tableContent[tableContent.length - 1].id + 1,
      //   tag1:
      //     '<div class="colorSquare" style="background:' +
      //     this.color +
      //     '"></div>',
      //   tag2: 'Target' + (tableContent.length + 1),
      //   tag3: `p0:(${this.coordinate.x1},${this.coordinate.y1}) , p1:(${
      //     this.coordinate.x2
      //   },${this.coordinate.y2})`,
      //   tag4: classes[btn].name,
      //   tag5: this.singleProduct.classes.filter(item => {
      //     return item.name === classes[btn].name;
      //   })
      // });
    },
    loadingImg(canLoading) {
      if (canLoading) {
        this.loadingImgs = this.$loading.show({
          backgroundColor: 'gray',
        });
      } else {
        this.loadingImgs.hide();
      }
      this.canLoading = canLoading;
    },
    getLabels(labelXY, color) {
      let { x1, x2, y1, y2 } = labelXY;

      this.labels.push({
        border: '4px solid ' + color,
        width: x2 - x1 + 'px',
        height: y2 - y1 + 'px',
        top: y1 + 'px',
        left: x1 + 'px',
      });
    },
    getTable() {
      if (this.singleProductDialog.labels) {
        this.singleProductDialog.labels.forEach(item => {
          let { tableLabel } = JSON.parse(item.bbox);
          let { labelXY, color } = tableLabel;
          let { x1, x2, y1, y2 } = labelXY;
          const tableContent = this.table.tableContent;

          this.getLabels(labelXY, color);

          tableContent.push({
            id: tableContent.length === 0 ? 0 : tableContent[tableContent.length - 1].id + 1,

            tag1: `<div style="display:flex;"><div style="margin:auto;display:inline-block;width:10px;height:10px;background:${color}"></div></div>`,
            tag2: `p0:(${x1},${y1}) , p1:(${x2},${y2})`,
            tag3: item.class.name,
            data: {
              labelXY: {
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2,
              },
              color: color,
              class: item.class,
            },
          });
        });
      }
    },
    addTableContent(btn, tableId) {
      // const classes = this.classes;
      const tableContent = this.table.tableContent;

      switch (this.singleProduct.labelingType) {
        case 0: {
          let checkSameTag = false;

          this.checkTags.forEach((item, index) => {
            if (item.id === btn.id) {
              this.checkTags.splice(index, 1);
              checkSameTag = true;
            }
          });
          if (!checkSameTag) {
            this.checkTags.push(btn);
          }
          break;
        }
        case 1:
          this.checkTags.length === 0 ? 1 : this.checkTags.length;
          tableId = tableId ? tableId : 0;
          this.checkTag = btn;
          // this.checkTags.forEach((item, key) => {
          //   if (key !== this.checkTags.length - 1) {
          //     checkTags += item.name + ' ';
          //   } else {
          //     checkTags += item.name;
          //   }
          // });
          if (this.oldTabelId === tableId) {
            tableContent[tableContent.length - 1].tag3 = this.checkTag.name;
          } else {
            tableContent.push({
              id: tableContent.length === 0 ? 0 : tableContent[tableContent.length - 1].id + 1,
              tag1: `<div style="display:flex;"><div style="margin:auto;display:inline-block;width:10px;height:10px;background:${this.color}"></div></div>`,
              tag2: `p0:(${this.coordinate.x1},${this.coordinate.y1}) , p1:(${this.coordinate.x2},${this.coordinate.y2})`,
              tag3: this.checkTag.name,
              data: {
                labelXY: {
                  x1: this.coordinate.x1,
                  x2: this.coordinate.x2,
                  y1: this.coordinate.y1,
                  y2: this.coordinate.y2,
                },
                color: this.color,
                class: this.checkTag,
              },
            });
          }
          this.oldTabelId = tableId;
          break;
      }

      // tableId === 0 || !!tableId
      //   ? tableContent.forEach(item => {
      //       if (item.id === tableId) {
      //         item.tag4 = classes[btn].name;
      //       }
      //     }):
    },
    moveImgToCenter() {
      this.$refs.cropper.moveImgToCenter();
    },
    closeDialog(hasNext) {
      this.$emit('closeDialog', 'bBoxAndClassification', false);
      if (this.singleProduct.fromSingleImage) return;
      if (!hasNext) {
        setTimeout(() => {
          this.$snackbar.info(i18n.t('no_next'));
        }, 300);
      }
    },
    destoryTag(id) {
      const tableContent = this.table.tableContent;

      tableContent.forEach((item, index, array) => {
        if (item.id === id) {
          array.splice(index, 1);
          this.labels.splice(index, 1);
          this.changeLabels();
        }
      });
    },

    async init() {
      try {
        this.meta.errorMsg = '';
        this.meta.isLoading = true;
        this.previewSrc = '';
      } catch (e) {
        this.meta.isLoading = false;
      }
    },
    repositionCrop() {
      //  repositionCrop(data) {
      if (this.isMoveMode) {
        this.setCurrentCrop(true);
      }
    },
    setCurrentCrop(showCrop = false) {
      this.$refs.cropper.changeCropXY(this.cropX, this.cropY, true);
      this.$refs.cropper.changeCropWH(this.cropW, this.cropH, true);

      if (showCrop) {
        this.$refs.cropper.stopCrop(showCrop);
      }
    },
    getOriginalImgXY({ x, y }) {
      this.originalImgX = x;
      this.originalImgY = y;
    },
    changeLabels() {
      // changeLabels(labelXY) {
      // // this.newLabels = [];
      // // this.labels.forEach(item => {
      // //   this.newLabels.push({
      // //     ...item
      // //   });
      // // });
      // // if (labelXY) {
      // //   this.newImgX = labelXY.newImgX;
      // //   this.newImgY = labelXY.newImgY;
      // //   this.scale = labelXY.scale;
      // //   this.newLabels.forEach(item => {
      // //     let originalTop = parseInt(item.top.replace('px', ''));
      // //     let originalLeft = parseInt(item.left.replace('px', ''));
      // //     let originalWidth = parseInt(item.width.replace('px', ''));
      // //     let originalHeight = parseInt(item.height.replace('px', ''));
      // //     item.top =
      // //       this.originalImgY +
      // //       this.imgHeight / 2 -
      // //       (this.originalImgY +
      // //         this.imgHeight / 2 -
      // //         (originalTop + originalHeight / 2)) *
      // //         labelXY.scale -
      // //       originalHeight * labelXY.scale / 2 -
      // //       (this.originalImgY - labelXY.newImgY) +
      // //       'px';
      // //     item.left =
      // //       this.originalImgX +
      // //       this.imgWidth / 2 -
      // //       (this.originalImgX +
      // //         this.imgWidth / 2 -
      // //         (originalLeft + originalWidth / 2)) *
      // //         labelXY.scale -
      // //       originalWidth * labelXY.scale / 2 -
      // //       (this.originalImgX - labelXY.newImgX) +
      // //       'px';
      // //     item.width = originalWidth * labelXY.scale + 'px';
      // //     item.height = originalHeight * labelXY.scale + 'px';
      // //   });
      // }
    },
    createLabel() {
      const { x1, x2, y1, y2 } = this.axis;
      // const { x1, x2, y1, y2, labelX1, labelX2, labelY1, labelY2 } = this.axis;

      this.labels.push({
        border: '4px solid ' + this.color,
        width: this.labelW / this.scale + 'px',
        height: this.labelH / this.scale + 'px',
        // top:
        //   (this.labelY -
        //     this.originalImgY -
        //     this.imgHeight / 2 +
        //     this.labelH / this.scale * this.scale / 2) /
        //     this.scale +
        //   this.originalImgY +
        //   this.imgHeight / 2 -
        //   this.labelH / this.scale / 2 +
        //   'px',
        // left:
        //   (this.labelX -
        //     this.originalImgX -
        //     this.imgWidth / 2 +
        //     this.labelW / this.scale * this.scale / 2) /
        //     this.scale +
        //   this.originalImgX +
        //   this.imgWidth / 2 -
        //   this.labelW / this.scale / 2 +
        //   'px'
        top: this.labelY + 'px',
        left: this.labelX + 'px',
      });
      const labelXY = {
        newImgX: this.newImgX || this.originalImgX,
        newImgY: this.newImgY || this.originalImgY,
        scale: this.scale,
      };

      this.changeLabels(labelXY);

      // tableLabel
      this.coordinate = { x1, x2, y1, y2 };
    },
    canChooseLabels() {
      this.toggleAdd();
      this.canCheckBox.canChooseLabel = false;
      this.canClickLabel = false;
      this.canClickTag = true;
      this.createLabel();
      this.showChooseClass();
    },
    cancelChooseLabels() {
      this.canCheckBox.canChooseLabel = false;
      this.toggleAdd();
    },
    cropDone(data) {
      if (data) {
        const { axis = {} } = data;
        // const { x1, x2, y1, y2, labelX1, labelX2, labelY1, labelY2 } = axis;
        const { x1, x2, y1, y2 } = axis;
        this.cropX = x1;
        this.cropY = y1;
        this.cropW = x2 - x1;
        this.cropH = y2 - y1;
        // this.labelX = this.newImgX
        //   ? this.originalImgX - this.newImgX + labelX1
        //   : labelX1;
        // this.labelY = this.newImgY
        //   ? this.originalImgY - this.newImgY + labelY1
        //   : labelY1;
        // this.labelW = labelX2 - labelX1;
        // this.labelH = labelY2 - labelY1;
        this.labelX = x1;
        this.labelY = y1;
        this.labelW = x2 - x1;
        this.labelH = y2 - y1;
        this.axis = { ...axis };
        this.canCheckBox.canChooseLabel = true;
      }
    },
    getColor() {
      const min = 0;
      const max = 9;
      let num = Math.floor(Math.random() * (max - min + 1)) + min;

      return '#' + this.colors[num];
    },
    cropMoving(data) {
      this.canCheckBox.canChooseLabel = false;
      const { axis = {} } = data;
      const { x1, x2, y1, y2 } = axis;
      this.cropX = x1;
      this.cropY = y1;
      this.cropW = x2 - x1;
      this.cropH = y2 - y1;
    },
    imgLoad(msg) {
      if (msg === 'success') {
        this.meta.isLoading = false;
        this.toggleMove(true);
        this.restoreCrop();
      }
    },
    startCrop(restore) {
      // start
      let checkColor = false;
      this.color = this.getColor();
      this.table.tableContent.forEach(item => {
        if (item.data.color === this.color) {
          checkColor = true;
          return this.startCrop();
        }
      });
      if (checkColor) {
        return;
      }
      this.$refs.cropper.getColor(this.color);
      this.isCropping = true;
      this.options.canMoveBox = true;
      this.toggleRatioLock(false);
      this.$refs.cropper.startCrop();
      if (restore) {
        this.setCurrentCrop();
      }
    },
    toggleRatioLock(force) {
      this.ratioLocked = typeof force === 'boolean' ? force : !this.ratioLocked;
      this.options.fixed = this.ratioLocked;
      if (this.ratioLocked) {
        this.options.fixedNumber = [this.cropW, this.cropH];
      }
    },
    restoreCrop(useAuto) {
      if (!this.cropInfo || (useAuto && this.isUsingAuto)) return;

      const { manual, auto = {} } = this.cropInfo;
      const { rect } = auto;
      const { x1 = 0, y1 = 0, x2 = 0, y2 = 0, rotate } = (useAuto ? rect : manual) || rect || {};
      this.cropX = x1;
      this.cropY = y1;
      this.cropW = x2 - x1;
      this.cropH = y2 - y1;
      this.rotation = rotate || 0;
      this.toggleMove(false);
      this.resetScale(true);
      this.$refs.cropper.rotateIt(this.rotation);
      this.$refs.cropper.moveImgToCenter();
      this.setCurrentCrop();
    },
    async toggleAdd(status) {
      switch (this.singleProduct.labelingType) {
        case 0:
          break;
        case 1:
          this.checkTag = '';
          this.options.canAdd = status;
          this.canClickTag = false;
          if (this.oldTabelId != this.newTableId) {
            this.oldTabelId = this.newTableId;
            this.checkTags = [];
          }
          this.resetClickTag();
          break;
      }
      this.canCheckBox.canChooseLabel = false;
      this.clearCrop();
      this.toggleMove(!this.options.canAdd);
    },
    toggleMove(force) {
      this.options.canMove = typeof force === 'boolean' ? force : !this.options.canMove;
      if (this.options.canMove) {
        this.stopCrop(true);
      } else {
        this.startCrop(true);
      }
    },
    stopCrop(isMoving) {
      //  stop
      this.isCropping = false;
      this.options.canMoveBox = false;
      this.$refs.cropper.stopCrop(isMoving);
      if (!isMoving) {
        this.clearCrop();
      }
    },
    clearCrop() {
      this.cropX = 0;
      this.cropY = 0;
      this.cropW = 0;
      this.cropH = 0;
      this.$refs.cropper.clearCrop();
    },
    resetScale(fitImage) {
      this.zoomLevel = (this.$refs.cropper.resetScale(fitImage) - 1) * 10;
    },
    stopRotating() {
      this.isRotating = false;
    },
    changeScale(num) {
      this.canCheckBox.canChooseLabel = false;
      this.stopRotating();
      const newZoomLevel = this.zoomLevel + num;
      if (newZoomLevel < -9 || newZoomLevel > 10) {
        return;
      }
      this.$refs.cropper.changeScale(num);
      this.zoomLevel = newZoomLevel;
      this.setCurrentCrop();
    },
    getClasses() {
      if (!this.singleProduct.classes) {
        return;
      }
      switch (this.singleProduct.labelingType) {
        case 0:
          this.singleProduct.classes.forEach(item => {
            this.classes.push({
              id: item.id,
              name: item.name,
              btnColor: 'white',
              btnOutline: true,
              active: false,
            });
          });
          break;
        case 1:
          this.singleProduct.classes.forEach(item => {
            this.classes.push({
              id: item.id,
              name: item.name,
              tableId: null,
              btnColor: 'rgb(96, 94, 94)',
              btnOutline: true,
              active: false,
            });
          });
          break;
      }
    },
    async submitImgLabels(cnaSubmit) {
      if (cnaSubmit) {
        if (!this.singleProduct.fromSingleImage) {
          this.loadingImg(true);
        }
        await this.saveImgLabels();
      } else {
        this.goNextImg();
      }
    },
    async saveImgLabels() {
      this.btnConfirm.btnTitle = '';
      this.loadingConfirm = true;
      var loader;
      await this.$nextTick(() => {
        loader = this.$loading.show({
          container: this.$refs.btnLoading,
          loader: 'spinner',
          width: 20,
          height: 20,
          color: 'white',
        });
      });

      const token = localStorage.getItem('id_token');
      let labels = [];
      // let labelClasses = [];

      switch (this.singleProduct.labelingType) {
        case 0:
          this.checkTags.forEach(item => {
            labels.push({
              classId: item.id,
              bbox: '',
            });
          });
          break;
        case 1:
          this.table.tableContent.forEach((tableItem, key) => {
            labels.push({
              classId: tableItem.data.class.id,
              bbox: JSON.stringify({
                cropLabel: this.labels[key],
                tableLabel: tableItem.data,
              }),
            });
          });
          break;
      }
      let data = {
        imageId: this.singleProduct.next.id,
        labels: labels,
      };
      await this.$http
        .post('/api/v1/projects/' + this.singleProduct.id + '/labels', data, {
          headers: { Authorization: 'Bearer ' + token },
        })
        .then(response => {
          if (this.singleProduct.fromSingleImage || !response.data.next) {
            this.closeDialog(false);
          } else {
            this.singleProduct = {
              ...this.singleProduct,
              ...response.data,
            };
          }
        })
        .catch(() => {});
      loader.hide();
      this.loadingConfirm = false;
      this.btnConfirm.btnTitle = i18n.t('confirm');
    },
    goNextImg() {
      if (this.singleProduct.fromSingleImage) {
        this.closeDialog(false);
        return;
      }
      this.$emit('openCUBBoxDialog', this.singleProduct);
    },
    async deleteImage() {
      const canDelete = await this.$confirm.open('', i18n.t('check_delete'));
      if (canDelete) {
        const token = localStorage.getItem('id_token');

        try {
          await this.$http.delete(
            `/api/v1/projects/${this.singleProduct.id}/images/${this.singleProduct.next.id}`,
            {
              headers: { Authorization: 'Bearer ' + token },
            }
          );
        } catch (e) {
          const { response } = e;
          const { status } = response || {};
          if (status === 401) {
            this.$router.push('/login');
          }
        } finally {
          this.goNextImg();
        }
      }
    },
  },
  watch: {
    'singleProductDialog.next.id'(nv) {
      if (nv) {
        this.singleProduct = { ...this.singleProductDialog };
      } else {
        this.singleProduct = {};
        this.resetLabelingTool();
        this.getClasses();
        this.changeTitle();
      }
    },
    async 'singleProduct.next.id'(nv) {
      if (nv) {
        if (this.singleProduct.next) {
          this.resetLabelingTool();
          this.getClasses();
          this.changeTitle();

          switch (this.singleProductDialog.labelingType) {
            case 0:
              this.canClickTag = true;
              if (this.singleProduct.labels) {
                this.singleProduct.labels.forEach(label => {
                  this.checkTags.push(label.class);
                });
              }
              this.showClassColor();
              break;
            case 1:
              this.getTable();
              if (this.singleProduct.labels) {
                this.singleProduct.labels.forEach(() => {
                  // this.singleProduct.labels.forEach(label => {
                  // let bbox = JSON.parse(label.bbox);
                  this.addUpdateToTableContent(null, null, true);
                });
              }
              this.changeLabels();
              break;
          }
          this.toggleAdd(false);
        }
      }
    },
    canLoading() {
      if (this.canLoading) {
        this.timer = setInterval(() => {
          if (this.loadingImgs) {
            this.loadingImgs.hide();
          }
        }, 5000);
      } else {
        clearInterval(this.timer);
      }
    },
    'table.tableContent'() {
      if (this.table.tableContent[this.oldTabelId]) {
        this.canClickLabel = true;
        this.newTableId = this.oldTabelId + 1;
      }
      if (this.table.tableContent.length === 10) {
        this.canClickLabel = false;
        this.$snackbar.info(i18n.t('max_labels'));
      }
    },
    // async 'showDialog.bBoxAndClassification'(show) {
    //   if (show) {
    //     await this.init();
    //   }
    // }
  },
  computed: {
    showTitleClass() {
      return this.singleProduct.labelingType === 0
        ? 'Classification Only'
        : this.singleProduct.labelingType === 1
        ? 'Bbox & Classification'
        : '';
    },
    showAdd() {
      return this.singleProduct.labelingType === 0
        ? false
        : this.singleProduct.labelingType === 1
        ? this.readyToEdit
        : '';
    },
    showTable() {
      return this.singleProduct.labelingType === 0
        ? false
        : this.singleProduct.labelingType === 1
        ? true
        : '';
    },
    countTableContent() {
      return this.table.tableContent.length;
    },
    isUsingAuto() {
      if (!this.cropInfo) return false;

      const { rect } = this.cropInfo.auto;
      const { x1, x2, y1, y2 } = this.clipRange;
      return (
        x1 === rect.x1 &&
        x2 === rect.x2 &&
        y1 === rect.y1 &&
        y2 === rect.y2 &&
        this.rotation === rect.rotate
      );
    },
    clipRange() {
      return {
        x1: this.cropX,
        y1: this.cropY,
        x2: this.cropX + this.cropW,
        y2: this.cropY + this.cropH,
      };
    },
    previewStyle() {
      if (this.previewBgUrl) {
        const style = {
          overflow: 'hidden',
          'background-image': `url(${this.previewBgUrl})`,
          'background-size': 'auto',
        };
        const width = this.cropW || this.previewBgWidth;
        if (width > 0) {
          style['background-size'] = `${width * this.previewZoom}px`;
        }
        return style;
      }
      return null;
    },
    isAddLabel() {
      return this.options.canAdd;
    },
    isMoveMode() {
      return this.options.canMove;
    },
    readyToEdit() {
      return !this.meta.isLoading && !this.meta.errorMsg;
    },
    nothingClipped() {
      return !this.cropW || !this.cropH;
    },
    cropInfo() {
      try {
        return JSON.parse(this.fabric.crop_info);
      } catch (e) {
        return null;
      }
    },
    clipIsUnchanged() {
      if (!this.cropInfo) {
        return false;
      }
      const { manual } = this.cropInfo;
      const { x1, y1, x2, y2, rotate } = manual || {};
      const { x1: nx1, y1: ny1, x2: nx2, y2: ny2 } = this.clipRange;
      const sameArea = x1 === nx1 && y1 === ny1 && x2 === nx2 && y2 === ny2;
      const sameRotation = rotate === this.rotation;
      return sameArea && sameRotation;
    },
    zoom() {
      return `${parseInt(10 * this.zoomLevel + 100, 10)}%`;
    },
  },
};
</script>

<style scoped lang="scss">
.header {
  position: fixed;
  width: 100vw;
}
.lablesH {
  min-height: 35%;
  max-height: 35%;
  overflow: scroll;
  &.tall {
    max-height: 100%;
    overflow: auto;
  }
}
.tableH {
  min-height: 47%;
  max-height: 47%;
  overflow: scroll;
}
.contentH {
  max-height: 100%;
  box-sizing: border-box;
}
.bBoxBG {
  background: #3c3c3c;
  color: white;
}
h2 {
  color: white;
}
.colorSquare {
  width: 15px;
  height: 15px;
}
.elevation-1 {
  border: 1px rgb(96, 94, 94) solid;
}
.crop-left-controls {
  position: absolute;
  top: 30px;
  transform: translateY(-50%);
  left: 10px;
  display: flex;
  flex-direction: column;
  .crop-control {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 42px;
    margin: 7px 0;
  }
  .btn {
    width: 42px;
    height: 42px;
    opacity: 0.7;
    background-color: #000000;
    border-radius: 25px;
    border: 0.5px solid white;
    cursor: pointer;
    &:before {
      margin-left: 1px;
      content: '';
      display: block;
      width: 25px;
      height: 25px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    &:hover {
      border-color: #2dbdcb;
    }
    &.active,
    &:active {
      background-color: #2dbdcb;
    }
  }
  .btn-add {
    &:before {
      background-image: url('../../assets/Group 5.png');
    }
  }
}
.crop-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 11px;
  display: flex;
  flex-direction: column;
  .crop-control {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 42px;
    margin: 7px 0;
  }
  .btn {
    width: 42px;
    height: 42px;
    opacity: 0.7;
    background-color: #000000;
    border-radius: 25px;
    border: 0.5px solid white;
    cursor: pointer;
    &:before {
      margin-left: 1px;
      content: '';
      display: block;
      width: 25px;
      height: 25px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    &:hover {
      border-color: #2dbdcb;
    }
    &.active,
    &:active {
      background-color: #2dbdcb;
    }
  }
  .btn-move {
    &:before {
      background-image: url('../../assets/ic-move.svg');
    }
  }
  .btn-zoomin {
    &:before {
      background-image: url('../../assets/ic-zoomin-s.svg');
    }
  }
  .btn-zoomout {
    &:before {
      background-image: url('../../assets/ic-zoomout-s.svg');
    }
  }
  .zoom-level {
    text-align: center;
    font-weight: 700;
    //
    text-shadow: 2.5px 1.5px 2px black;
  }
}
.positionCropperIcon {
  position: relative;
}
.footerBg {
  position: fixed;
  bottom: 0px;
  min-width: 100vw;
  background: #3c3c3c;
  border-top: 2px solid rgba(0, 0, 0, 0.32);
}
</style>

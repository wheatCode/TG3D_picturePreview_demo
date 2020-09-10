<template>
  <v-container>
    <v-layout justify-center>
      <v-flex xs5>
        <cropper
          ref="cropper"
          v-bind="options"
          @imgLoad="imgLoad"
          @imgMoving="repositionCrop"
          @cropMoving="cropMoving"
          @cropDone="cropDone"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
/* eslint-disable */
import axios from "axios";
import Cropper from "./Cropper";

export default {
  name: "ToolboxDialog",
  components: {
    Cropper,
  },
  data: () => ({
    meta: {
      isLoading: false,
      errorMsg: "",
    },
    isCropping: false,
    ratioLocked: false,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
    options: {
      img: "",
      outputSize: 1,
      outputType: "jpg",
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
      mode: "100%",
      fixed: false,
      fixedNumber: [1, 1],
    },
  }),
  methods: {
    async init() {
      try {
        this.meta.errorMsg = "";
        this.meta.isLoading = true;
        this.previewScale = 0;
        this.previewSrc = "";
        this.resetScale();
        this.toggleRatioLock(false);
        this.toggleCropMode();
      } catch (e) {
        this.meta.isLoading = false;
      }
    },
    repositionCrop() {
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
    cropDone(data) {
      if (data) {
        const { axis = {} } = data;
        const { x1, x2, y1, y2 } = axis;
        this.cropX = x1;
        this.cropY = y1;
        this.cropW = x2 - x1;
        this.cropH = y2 - y1;
      }
    },
    cropMoving(data) {
      const { axis = {} } = data;
      const { x1, x2, y1, y2 } = axis;
      this.cropX = x1;
      this.cropY = y1;
      this.cropW = x2 - x1;
      this.cropH = y2 - y1;
    },
    imgLoad(msg) {
      if (msg === "success") {
        this.meta.isLoading = false;
        this.startCrop();
        this.restoreCrop();
      }
    },
    startCrop(restore) {
      // start
      this.isCropping = true;
      this.options.canMoveBox = true;
      this.toggleRatioLock(false);
      this.$refs.cropper.startCrop();
      if (restore) {
        this.setCurrentCrop();
      }
    },
    toggleRatioLock(force) {
      this.ratioLocked = typeof force === "boolean" ? force : !this.ratioLocked;
      this.options.fixed = this.ratioLocked;
      if (this.ratioLocked) {
        this.options.fixedNumber = [this.cropW, this.cropH];
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
    restoreCrop(useAuto) {
      if (!this.cropInfo || (useAuto && this.isUsingAuto)) return;

      const { manual, auto = {} } = this.cropInfo;
      const { rect } = auto;
      const { x1 = 0, y1 = 0, x2 = 0, y2 = 0, rotate } =
        (useAuto ? rect : manual) || rect || {};
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
    toggleMove(force) {
      this.options.canMove =
        typeof force === "boolean" ? force : !this.options.canMove;
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
  },
  watch: {
    async showDialog(show) {
      if (show && this.currentItem && this.currentItem.status >= 5) {
        await this.init(this.currentItem);
      }
    },
  },
  computed: {
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
          overflow: "hidden",
          "background-image": `url(${this.previewBgUrl})`,
          "background-size": "auto",
        };
        const width = this.cropW || this.previewBgWidth;
        if (width > 0) {
          style["background-size"] = `${width * this.previewZoom}px`;
        }
        return style;
      }
      return null;
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
  },
};
</script>

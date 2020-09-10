<template>
  <!-- 超出範圍 限制選取範圍 或 移開取消選取 -->
  <div
    class="vue-cropper"
    ref="cropper"
    :style="cropperWH"
    @mouseover="scaleImg"
    @mouseout="cancelScale"
  >
    <!--照片放置區-->
    <div class="cropper-box">
      <div class="cropper-box-canvas" v-show="!loading" :style="boxCanvasStyle">
        <div
          :style="`background-image: url(${img});width:${imgW}px;height:${imgH}px;`"
          class="img"
          alt="cropper-img"
          ref="cropperImg"
        >
          <div
            :class="{ 'cropper-move': (move && !crop) || readonly, 'cropper-moving': isMovingImg }"
            v-for="(label, key) in labels"
            :style="[labelStyle, label]"
            :key="key"
          ></div>
        </div>
      </div>
      <!-- @mousedown="cropMove" -->
    </div>

    <div
      class="cropper-drag-box"
      :class="{
        'cropper-move': (move && !crop) || readonly,
        'cropper-moving': isMovingImg,
        'cropper-crop': crop && !readonly,
        'cropper-modal': cropping,
      }"
      @mousedown="startMove"
      @touchstart="startMove"
    ></div>

    <!-- cropper選取開頭 -->
    <div v-show="cropping" class="cropper-crop-box" :style="cropBoxStyle">
      <span class="cropper-view-box">
        <img :style="viewBoxStyle" :src="img" alt="cropper-img" />
        <span class="border" :style="changeBorderColor"></span>
      </span>

      <!--截圖移動-->
      <span class="cropper-face cropper-move"></span>
      <!-- @mousedown="cropMove"
            @touchstart="cropMove" -->
      <!-- 顯示 幾 Ｘ 幾 -->
      <span class="crop-info" v-if="info" :style="{ top: cropInfo.top }">
        {{ this.cropInfo.width }} × {{ this.cropInfo.height }}
      </span>

      <!-- cropper移動範圍 -->
      <span v-if="!fixedBox && !readonly">
        <!-- <span class="crop-line line-w"
              @mousedown="changeCropSize($event, false, true, 0, 1)"
              @touchstart="changeCropSize($event, false, true, 0, 1)"></span>
        <span class="crop-line line-a"
              @mousedown="changeCropSize($event, true, false, 1, 0)"
              @touchstart="changeCropSize($event, true, false, 1, 0)"></span>
        <span class="crop-line line-s"
              @mousedown="changeCropSize($event, false, true, 0, 2)"
              @touchstart="changeCropSize($event, false, true, 0, 2)"></span>
        <span class="crop-line line-d"
              @mousedown="changeCropSize($event, true, false, 2, 0)"
              @touchstart="changeCropSize($event, true, false, 2, 0)"></span>
        <span class="crop-point point1"
              @mousedown="changeCropSize($event, true, true, 1, 1)"
              @touchstart="changeCropSize($event, true, true, 1, 1)"></span>
        <span class="crop-point point2"
              @mousedown="changeCropSize($event, false, true, 0, 1)"
              @touchstart="changeCropSize($event, false, true, 0, 1)"></span>
        <span class="crop-point point3"
              @mousedown="changeCropSize($event, true, true, 2, 1)"
              @touchstart="changeCropSize($event, true, true, 2, 1)"></span>
        <span class="crop-point point4"
              @mousedown="changeCropSize($event, true, false, 1, 0)"
              @touchstart="changeCropSize($event, true, false, 1, 0)"></span>
        <span class="crop-point point5"
              @mousedown="changeCropSize($event, true, false, 2, 0)"
              @touchstart="changeCropSize($event, true, false, 2, 0)"></span>
        <span class="crop-point point6"
              @mousedown="changeCropSize($event, true, true, 1, 2)"
              @touchstart="changeCropSize($event, true, true, 1, 2)"></span>
        <span class="crop-point point7"
              @mousedown="changeCropSize($event, false, true, 0, 2)"
              @touchstart="changeCropSize($event, false, true, 0, 2)"></span>
        <span class="crop-point point8"
              @mousedown="changeCropSize($event, true, true, 2, 2)"
              @touchstart="changeCropSize($event, true, true, 2, 2)"></span> -->
      </span>
      <slot></slot>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  data: function() {
    return {
      // 容器高宽
      w: 0,
      h: 0,
      // 图片缩放比例
      scale: 1,
      // 图片偏移x轴
      x: 0,
      // 图片偏移y轴
      y: 0,
      // 图片加载
      loading: true,
      // 图片真实宽度
      trueWidth: 0,
      // 图片真实高度
      trueHeight: 0,
      move: true,
      // 移动的x
      moveX: 0,
      // 移动的y
      moveY: 0,
      isMovingImg: false,
      // 开启截图
      crop: false,
      // 正在截图
      cropping: false,
      // display crop but cannot adjust it
      readonly: false,
      // 裁剪框大小
      cropW: 0,
      cropH: 0,
      cropOldW: 0,
      cropOldH: 0,
      // 判断是否能够改变
      canChangeX: false,
      canChangeY: false,
      // 改变的基准点
      changeCropTypeX: 1,
      changeCropTypeY: 1,
      // 裁剪框的坐标轴
      cropScreenX: 0,
      cropScreenY: 0,
      cropChangeStartX: 0,
      cropChangeStartY: 0,
      cropCanvasX: 0,
      cropCanvasY: 0,
      // 支持的滚动事件
      support: '',
      // 移动端手指缩放
      touches: [],
      touchNow: false,
      // 图片旋转
      rotate: 0,
      isIos: false,
      orientation: 0,
      imgs: '',
      // 图片缩放系数
      coe: 0.2,
      // 是否正在多次缩放
      scaling: false,
      scalingSet: '',
      coeStatus: '',
      // 控制emit触发频率
      isCanShow: true,
      //label區塊
      labelStyle: {
        position: 'absolute',
        boxSizing: 'border-box',
        zIndex: 15,
      },
      //外層內層的面積
      cropperWH: {
        width: '0px',
        height: '0px',
      },
      imgPosition: {
        top: '0px',
        left: '0px',
      },
      changeBorderColor: {},
      imgH: '',
      imgW: '',
    };
  },
  props: {
    img: {
      type: [String, Blob, null, File],
    },
    outputSize: {
      type: Number,
      default: 1,
    },
    outputType: {
      type: String,
      default: 'jpeg',
    },
    info: {
      type: Boolean,
      default: true,
    },
    // 是否开启滚轮放大缩小
    canScale: {
      type: Boolean,
      default: true,
    },
    // 是否自成截图框
    autoCrop: {
      type: Boolean,
      default: false,
    },
    autoCropWidth: {
      type: [Number, String],
      default: 0,
    },
    autoCropHeight: {
      type: [Number, String],
      default: 0,
    },
    // 是否开启固定宽高比
    fixed: {
      type: Boolean,
      default: false,
    },
    // 宽高比 w/h
    fixedNumber: {
      type: Array,
      default: () => {
        return [1, 1];
      },
    },
    // 固定大小 禁止改变截图框大小
    fixedBox: {
      type: Boolean,
      default: false,
    },
    // 输出截图是否缩放
    full: {
      type: Boolean,
      default: false,
    },
    // 是否可以拖动图片
    canMove: {
      type: Boolean,
      default: true,
    },
    // 是否可以拖动截图框
    canMoveBox: {
      type: Boolean,
      default: true,
    },
    // 上传图片按照原始比例显示
    original: {
      type: Boolean,
      default: false,
    },
    // 截图框能否超过图片
    centerBox: {
      type: Boolean,
      default: false,
    },
    // 是否根据dpr输出高清图片
    high: {
      type: Boolean,
      default: true,
    },
    // 截图框展示宽高类型
    infoTrue: {
      type: Boolean,
      default: false,
    },
    // 可以压缩图片宽高  默认不超过200
    maxImgSize: {
      type: Number,
      default: 2000,
    },
    // 倍数  可渲染当前截图框的n倍 0 - 1000;
    enlarge: {
      type: [Number, String],
      default: 1,
    },

    // 自动预览的固定宽度
    preW: {
      type: [Number, String],
      default: 0,
    },
    /*
        图片布局方式 mode 实现和css背景一样的效果
        contain  居中布局 默认不会缩放 保证图片在容器里面 mode: 'contain'
        cover    拉伸布局 填充整个容器  mode: 'cover'
        如果仅有一个数值被给定，这个数值将作为宽度值大小，高度值将被设定为auto。 mode: '50px'
        如果有两个数值被给定，第一个将作为宽度值大小，第二个作为高度值大小。 mode: '50px 60px'
      */
    mode: {
      type: String,
      default: 'contain',
    },
    labels: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    a() {
      this.$emit('a');
    },
    checkOrientationImage(img, orientation, width, height) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      ctx.save();
      switch (orientation) {
        case 2:
          canvas.width = width;
          canvas.height = height;
          // horizontal flip
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          break;
        case 3:
          canvas.width = width;
          canvas.height = height;
          //180 graus
          ctx.translate(width / 2, height / 2);
          ctx.rotate(180 * Math.PI / 180);
          ctx.translate(-width / 2, -height / 2);
          break;
        case 4:
          canvas.width = width;
          canvas.height = height;
          // vertical flip
          ctx.translate(0, height);
          ctx.scale(1, -1);
          break;
        case 5:
          // vertical flip + 90 rotate right
          canvas.height = width;
          canvas.width = height;
          ctx.rotate(0.5 * Math.PI);
          ctx.scale(1, -1);
          break;
        case 6:
          canvas.width = height;
          canvas.height = width;
          //90 graus
          ctx.translate(height / 2, width / 2);
          ctx.rotate(90 * Math.PI / 180);
          ctx.translate(-width / 2, -height / 2);
          break;
        case 7:
          // horizontal flip + 90 rotate right
          canvas.height = width;
          canvas.width = height;
          ctx.rotate(0.5 * Math.PI);
          ctx.translate(width, -height);
          ctx.scale(-1, 1);
          break;
        case 8:
          canvas.height = width;
          canvas.width = height;
          //-90 graus
          ctx.translate(height / 2, width / 2);
          ctx.rotate(-90 * Math.PI / 180);
          ctx.translate(-width / 2, -height / 2);
          break;
        default:
          canvas.width = width;
          canvas.height = height;
      }

      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      canvas.toBlob(
        blob => {
          let data = URL.createObjectURL(blob);
          this.imgs = data;
        },
        'image/' + this.outputType,
        1
      );
    },
    // checkout img
    checkedImg() {
      if (!this.img) return;
      this.loading = true;
      this.scale = 1;
      this.rotate = 0;
      this.clearCrop();
      let img = new Image();
      img.onload = () => {
        if (this.img === '') {
          this.$emit('imgLoad', 'error');
          return false;
        }

        let width = img.width;
        let height = img.height;
        this.imgW = img.width;
        this.imgH = img.height;

        this.$emit('getImgWH', { width, height });
        this.orientation = 1;
        let max = this.maxImgSize;
        if (!this.orientation && (width < max) & (height < max)) {
          this.imgs = this.img;
          return;
        }

        if (width > max) {
          height = height / width * max;
          width = max;
        }

        if (height > max) {
          width = width / height * max;
          height = max;
        }

        this.checkOrientationImage(img, this.orientation, width, height);
        setTimeout(() => {
          this.loadingImg(false);
        }, 500);
      };
      img.onerror = () => {
        this.$emit('imgLoad', 'error');
      };
      // 判断如果不是base64图片 再添加crossOrigin属性，否则会导致iOS低版本(10.2)无法显示图片
      if (this.img.substr(0, 4) !== 'data') {
        img.crossOrigin = '';
      }

      if (this.isIE) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          var url = URL.createObjectURL(this.response);
          img.src = url;
        };
        xhr.open('GET', this.img, true);
        xhr.responseType = 'blob';
        xhr.send();
      } else {
        img.src = this.img;
      }
    },
    // 当按下鼠标键
    startMove(e) {
      e.preventDefault();
      // 如果move 为true 表示当前可以拖动
      if ((this.move && !this.crop) || this.readonly) {
        if (!this.canMove) {
          return false;
        }
        // 开始移动
        this.isMovingImg = true;
        this.moveX = e.clientX - this.x;
        this.moveY = e.clientY - this.y;

        window.addEventListener('mousemove', this.moveImg);
        window.addEventListener('mouseup', this.leaveImg);
        // 触发图片移动事件
        this.$emit('imgMoving', {
          moving: true,
          axis: this.getImgAxis(),
        });
      } else if (!this.readonly) {
        if (this.clickOutsideImg(e)) {
          return;
        }
        // 截图ing
        this.cropping = true;
        // 绑定截图事件
        window.addEventListener('mousemove', this.createCrop);
        window.addEventListener('mouseup', this.endCrop);
        // window.addEventListener("touchmove", this.createCrop);
        // window.addEventListener("touchend", this.endCrop);
        this.cropCanvasX = e.offsetX;
        this.cropCanvasY = e.offsetY;
        this.cropScreenX = e.clientX;
        this.cropScreenY = e.clientY;
        this.cropChangeStartX = this.cropCanvasX;
        this.cropChangeStartY = this.cropCanvasY;
        this.cropW = 0;
        this.cropH = 0;

        this.$emit('cropMoving', {
          moving: false,
          axis: this.getAbsoluteXY(),
        });
      }
    },

    clickOutsideImg(e, moving) {
      return false; // FIXME: fix this
      const { x1, x2, y1, y2 } = this.getImgAxis();
      // const rotation = this.rotate;
      const { offsetX, offsetY, clientX, clientY } = e;
      if (moving) {
        return clientX < x1 || clientX > x2 || clientY < y1 || clientY > y2;
      }
      return offsetX < x1 || offsetX > x2 || offsetY < y1 || offsetY > y2;
    },

    // pointInRotatedRectangle(pointX, pointY, rectX, rectY, rectOffsetX, rectOffsetY, rectWidth, rectHeight, rectAngle) {
    //   const { x1: rectX, x2: rectOffsetX, y1: rectY, y2: rectOffsetY } = this.getImgAxis();
    //   const rectWidth = rectOffsetX - rectX;
    //   const rectHeight = rectOffsetY - rectY;
    //
    //   const rectAngle = this.rotate;
    //   const { offsetX: pointX, offsetY: pointY } = e;
    //   const relX = pointX - rectX;
    //   const relY = pointY - rectY;
    //   const angle = -rectAngle;
    //   const angleCos = Math.cos(angle);
    //   const angleSin = Math.sin(angle);
    //   const localX = angleCos * relX - angleSin * relY;
    //   const localY = angleSin * relX + angleCos * relY;
    //   const isIN = localX >= -rectOffsetX && localX <= rectWidth - rectOffsetX &&
    //     localY >= -rectOffsetY && localY <= rectHeight - rectOffsetY;
    //   console.log('isIn', localX, localY, );
    //   return !isIN;
    // },

    // 移动端缩放
    touchScale(e) {
      e.preventDefault();
      let scale = this.scale;
      // 记录变化量
      // 第一根手指
      var oldTouch1 = {
        x: this.touches[0].clientX,
        y: this.touches[0].clientY,
      };
      var newTouch1 = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      // 第二根手指
      var oldTouch2 = {
        x: this.touches[1].clientX,
        y: this.touches[1].clientY,
      };
      var newTouch2 = {
        x: e.touches[1].clientX,
        y: e.touches[1].clientY,
      };
      var oldL = Math.sqrt(
        Math.pow(oldTouch1.x - oldTouch2.x, 2) + Math.pow(oldTouch1.y - oldTouch2.y, 2)
      );
      var newL = Math.sqrt(
        Math.pow(newTouch1.x - newTouch2.x, 2) + Math.pow(newTouch1.y - newTouch2.y, 2)
      );
      var cha = newL - oldL;
      // 根据图片本身大小 决定每次改变大小的系数, 图片越大系数越小
      // 1px - 0.2
      var coe = 1;
      coe =
        coe / this.trueWidth > coe / this.trueHeight ? coe / this.trueHeight : coe / this.trueWidth;
      coe = coe > 0.1 ? 0.1 : coe;
      var num = coe * cha;
      if (!this.touchNow) {
        this.touchNow = true;
        if (cha > 0) {
          scale += Math.abs(num);
        } else if (cha < 0) {
          scale > Math.abs(num) ? (scale -= Math.abs(num)) : scale;
        }
        this.touches = e.touches;
        setTimeout(() => {
          this.touchNow = false;
        }, 8);
        if (!this.checkoutImgAxis(this.x, this.y, scale)) {
          return false;
        }
        this.scale = scale;
      }
    },

    cancelTouchScale(e) {
      window.removeEventListener('touchmove', this.touchScale);
    },

    // 移动图片
    moveImg(e) {
      e.preventDefault();
      let nowX = e.clientX || 0;
      let nowY = e.clientY || 0;

      let changeX, changeY;
      changeX = nowX - this.moveX;
      changeY = nowY - this.moveY;
      this.$nextTick(() => {
        if (this.centerBox) {
          let axis = this.getImgAxis(changeX, changeY, this.scale);
          let cropAxis = this.getCropAxis();
          let imgW = this.trueHeight * this.scale;
          let imgH = this.trueWidth * this.scale;
          let maxLeft, maxTop, maxRight, maxBottom;
          // switch (this.rotate) {
          //   case 1:
          //   case -1:
          //   case 3:
          //   case -3:
          //     maxLeft =
          //       this.cropCanvasX -
          //       (this.trueWidth * (1 - this.scale)) / 2 +
          //       (imgW - imgH) / 2;
          //     maxTop =
          //       this.cropCanvasY -
          //       (this.trueHeight * (1 - this.scale)) / 2 +
          //       (imgH - imgW) / 2;
          //     maxRight = maxLeft - imgW + this.cropW;
          //     maxBottom = maxTop - imgH + this.cropH;
          //     break;
          //   default:
          maxLeft = this.cropCanvasX - this.trueWidth * (1 - this.scale) / 2;
          maxTop = this.cropCanvasY - this.trueHeight * (1 - this.scale) / 2;
          maxRight = maxLeft - imgH + this.cropW;
          maxBottom = maxTop - imgW + this.cropH;
          // break;
          // }

          // 图片左边 图片不能超过截图框
          if (axis.x1 >= cropAxis.x1) {
            changeX = maxLeft;
          }

          // 图片上边 图片不能超过截图框
          if (axis.y1 >= cropAxis.y1) {
            changeY = maxTop;
          }

          // 图片右边
          if (axis.x2 <= cropAxis.x2) {
            changeX = maxRight;
          }

          // 图片下边
          if (axis.y2 <= cropAxis.y2) {
            changeY = maxBottom;
          }
        }
        this.x = changeX;
        this.y = changeY;
        // 触发图片移动事件
        this.$emit('imgMoving', {
          moving: true,
          axis: this.getImgAxis(),
        });
      });
    },
    moveImgToXY(x, y) {
      this.x = x - (this.trueWidth - this.trueWidth * this.scale) / 2;
      this.y = y - (this.trueHeight - this.trueHeight * this.scale) / 2;
    },
    moveImgToCenter() {
      this.moveImgToXY(
        (this.w - this.trueWidth * this.scale) / 2,
        (this.h - this.trueHeight * this.scale) / 2
      );
    },
    // 移动图片结束
    leaveImg(e) {
      this.isMovingImg = false;
      window.removeEventListener('mousemove', this.moveImg);
      window.removeEventListener('touchmove', this.moveImg);
      window.removeEventListener('mouseup', this.leaveImg);
      window.removeEventListener('touchend', this.leaveImg);
      // 触发图片移动事件
      this.$emit('imgMoving', {
        moving: false,
        axis: this.getImgAxis(),
      });
    },
    // 缩放图片
    scaleImg() {
      if (this.canScale) {
        window.addEventListener(this.support, this.changeSize);
      }
    },
    // 移出框
    cancelScale() {
      if (this.canScale) {
        window.removeEventListener(this.support, this.changeSize);
      }
    },
    // 改变大小函数
    changeSize(e) {
      e.preventDefault();
      let scale = this.scale;
      var change = e.deltaY || e.wheelDelta;
      // 根据图片本身大小 决定每次改变大小的系数, 图片越大系数越小
      var isFirefox = navigator.userAgent.indexOf('Firefox');
      change = isFirefox > 0 ? change * 30 : change;
      // 修复ie的滚动缩放
      if (this.isIE) {
        change = -change;
      }
      // 1px - 0.2
      var coe = this.coe;
      coe =
        coe / this.trueWidth > coe / this.trueHeight ? coe / this.trueHeight : coe / this.trueWidth;
      var num = coe * change;
      num < 0 ? (scale += Math.abs(num)) : scale > Math.abs(num) ? (scale -= Math.abs(num)) : scale;
      // 延迟0.1s 每次放大大或者缩小的范围
      let status = num < 0 ? 'add' : 'reduce';
      if (status !== this.coeStatus) {
        this.coeStatus = status;
        this.coe = 0.2;
      }
      if (!this.scaling) {
        this.scalingSet = setTimeout(() => {
          this.scaling = false;
          this.coe = this.coe += 0.01;
        }, 50);
      }
      this.scaling = true;
      if (!this.checkoutImgAxis(this.x, this.y, scale)) {
        return false;
      }
      this.scale = scale;
    },
    // 修改图片大小函数
    _changeScale(num) {
      let scale = this.scale;
      num = num || 1;
      var coe = 20;
      coe =
        coe / this.trueWidth > coe / this.trueHeight ? coe / this.trueHeight : coe / this.trueWidth;
      num = num * coe;
      num > 0 ? (scale += Math.abs(num)) : scale > Math.abs(num) ? (scale -= Math.abs(num)) : scale;
      this.scale = scale;
    },
    changeScale(num) {
      this.scale = this.scale + num * 0.1;
      this.$nextTick(() => {
        this.$emit('cropDone');
      });
    },
    resetScale(fitImage) {
      if (fitImage) {
        const shortWorkspaceSide = Math.min(this.w, this.h);
        const newScale =
          (shortWorkspaceSide - 20) /
          (shortWorkspaceSide === this.w ? this.trueWidth : this.trueHeight);
        this.scale = Math.floor(newScale * 10) / 10;
      } else {
        this.scale = 1;
      }
      return this.scale;
    },
    // 创建截图框
    createCrop(e) {
      e.preventDefault();
      // 移动生成大小
      const nowX = e.clientX || 0;
      const nowY = e.clientY || 0;
      // const absoluteXY = this.getAbsoluteXY();
      this.$nextTick(() => {
        const fw = nowX - this.cropScreenX;
        const fh = nowY - this.cropScreenY;
        // FIXME: enable these checks for out of image bound
        if (fw > 0) {
          // if (absoluteXY.x1 + fw > this.trueWidth) {
          //   this.cropW = (fw + this.cropChangeStartX < this.w) ?
          //     this.trueWidth - absoluteXY.x1 :
          //     Math.min(this.trueWidth - absoluteXY.x1, this.w - this.cropChangeStartX);
          // } else {
          this.cropW = fw + this.cropChangeStartX > this.w ? this.w - this.cropChangeStartX : fw;
          // }
          this.cropCanvasX = this.cropChangeStartX;
          // } else if (this.cropChangeStartX + fw < this.x) { // out of image bound
          //   this.cropW = this.cropChangeStartX - this.x;
          //   this.cropCanvasX = this.x;
        } else {
          this.cropCanvasX = this.cropChangeStartX + fw <= 0 ? 0 : this.cropChangeStartX + fw;
          this.cropW = this.cropChangeStartX + fw <= 0 ? this.cropChangeStartX : Math.abs(fw);
        }

        if (!this.fixed) {
          if (fh > 0) {
            // if (absoluteXY.y1 + fh > this.trueHeight) {
            //   this.cropH = (fh + this.cropChangeStartY < this.h) ?
            //     this.trueHeight - absoluteXY.y1 :
            //     Math.min(this.trueHeight - absoluteXY.y1, this.h - this.cropChangeStartY);
            // } else {
            this.cropH = fh + this.cropChangeStartY > this.h ? this.h - this.cropChangeStartY : fh;
            // }
            this.cropCanvasY = this.cropChangeStartY;
            // } else if (this.cropChangeStartY + fh < this.y) { // out of image bound
            //   this.cropH = this.cropChangeStartY - this.y;
            //   this.cropCanvasY = this.y;
          } else {
            this.cropCanvasY = this.cropChangeStartY + fh <= 0 ? 0 : this.cropChangeStartY + fh;
            this.cropH = this.cropChangeStartY + fh <= 0 ? this.cropChangeStartY : Math.abs(fh);
          }
        } else {
          // FIXME: buggy
          var fixedHeight = this.cropW / this.fixedNumber[0] * this.fixedNumber[1];
          if (fixedHeight + this.cropCanvasY > this.h) {
            this.cropH = this.h - this.cropCanvasY;
            this.cropW = this.cropH / this.fixedNumber[1] * this.fixedNumber[0];
            if (fw > 0) {
              this.cropCanvasX = this.cropChangeStartX;
            } else {
              this.cropCanvasX = this.cropChangeStartX - this.cropW;
            }
          } else {
            this.cropH = fixedHeight;
          }
        }

        this.cropCanvasX =
          this.cropCanvasX < this.x - (this.trueWidth * this.scale - this.trueWidth) / 2 ||
          this.cropCanvasX >
            this.x -
              (this.trueWidth * this.scale - this.trueWidth) / 2 +
              this.trueWidth * this.scale
            ? this.x - (this.trueWidth * this.scale - this.trueWidth) / 2
            : this.cropCanvasX;

        this.cropCanvasY =
          this.cropCanvasY < this.y - (this.trueHeight * this.scale - this.trueHeight) / 2 ||
          this.cropCanvasY >
            this.y - (this.trueHeight * this.scale - this.trueHeight) + this.trueHeight * this.scale
            ? this.y - (this.trueHeight * this.scale - this.trueHeight) / 2
            : this.cropCanvasY;

        this.cropW =
          this.cropW >
          this.x -
            (this.trueWidth * this.scale - this.trueWidth) / 2 +
            this.trueWidth * this.scale -
            this.cropCanvasX
            ? this.x -
              (this.trueWidth * this.scale - this.trueWidth) / 2 +
              this.trueWidth * this.scale -
              this.cropCanvasX
            : this.cropW;
        this.cropH =
          this.cropH >
          this.y -
            (this.trueHeight * this.scale - this.trueHeight) / 2 +
            this.trueHeight * this.scale -
            this.cropCanvasY
            ? this.y -
              (this.trueHeight * this.scale - this.trueHeight) / 2 +
              this.trueHeight * this.scale -
              this.cropCanvasY
            : this.cropH;

        this.$emit('cropMoving', {
          moving: true,
          axis: this.getAbsoluteXY(),
        });
      });
    },

    // 改变截图框大小
    changeCropSize(e, w, h, typeW, typeH) {
      e.preventDefault();
      window.addEventListener('mousemove', this.changeCropNow);
      window.addEventListener('mouseup', this.changeCropEnd);
      window.addEventListener('touchmove', this.changeCropNow);
      window.addEventListener('touchend', this.changeCropEnd);
      this.canChangeX = w;
      this.canChangeY = h;
      this.changeCropTypeX = typeW;
      this.changeCropTypeY = typeH;
      this.cropScreenX = e.clientX || 0;
      this.cropScreenY = e.clientY || 0;
      this.cropOldW = this.cropW;
      this.cropOldH = this.cropH;
      this.cropChangeStartX = this.cropCanvasX;
      this.cropChangeStartY = this.cropCanvasY;
      if (this.fixed) {
        if (this.canChangeX && this.canChangeY) {
          this.canChangeY = 0;
        }
      }
    },

    // 正在改变
    changeCropNow(e) {
      e.preventDefault();
      var nowX = e.clientX || 0;
      var nowY = e.clientY || 0;
      // 容器的宽高
      let wrapperW = this.w;
      let wrapperH = this.h;

      // 不能超过的坐标轴
      let minX = 0;
      let minY = 0;

      if (this.centerBox) {
        let axis = this.getImgAxis();
        let imgW = axis.x2;
        let imgH = axis.y2;
        minX = axis.x1 > 0 ? axis.x1 : 0;
        minY = axis.y1 > 0 ? axis.y1 : 0;
        if (wrapperW > imgW) {
          wrapperW = imgW;
        }

        if (wrapperH > imgH) {
          wrapperH = imgH;
        }
      }
      this.$nextTick(() => {
        var fw = nowX - this.cropScreenX;
        var fh = nowY - this.cropScreenY;

        if (this.canChangeX) {
          if (this.changeCropTypeX === 1) {
            if (this.cropOldW - fw > 0) {
              this.cropW =
                wrapperW - this.cropChangeStartX - fw <= wrapperW - minX
                  ? this.cropOldW - fw
                  : this.cropOldW + this.cropChangeStartX - minX;
              this.cropCanvasX =
                wrapperW - this.cropChangeStartX - fw <= wrapperW - minX
                  ? this.cropChangeStartX + fw
                  : minX;
            } else {
              this.cropW =
                Math.abs(fw) + this.cropChangeStartX <= wrapperW
                  ? Math.abs(fw) - this.cropOldW
                  : wrapperW - this.cropOldW - this.cropChangeStartX;
              this.cropCanvasX = this.cropChangeStartX + this.cropOldW;
            }
          } else if (this.changeCropTypeX === 2) {
            if (this.cropOldW + fw > 0) {
              this.cropW =
                this.cropOldW + fw + this.cropCanvasX <= wrapperW
                  ? this.cropOldW + fw
                  : wrapperW - this.cropCanvasX;
              this.cropCanvasX = this.cropChangeStartX;
            } else {
              // 右侧坐标抽 超过左侧
              this.cropW =
                wrapperW - this.cropChangeStartX + Math.abs(fw + this.cropOldW) <= wrapperW - minX
                  ? Math.abs(fw + this.cropOldW)
                  : this.cropChangeStartX - minX;
              this.cropCanvasX =
                wrapperW - this.cropChangeStartX + Math.abs(fw + this.cropOldW) <= wrapperW - minX
                  ? this.cropChangeStartX - Math.abs(fw + this.cropOldW)
                  : minX;
            }
          }
        }

        if (this.canChangeY) {
          if (this.changeCropTypeY === 1) {
            if (this.cropOldH - fh > 0) {
              this.cropH =
                wrapperH - this.cropChangeStartY - fh <= wrapperH - minY
                  ? this.cropOldH - fh
                  : this.cropOldH + this.cropChangeStartY - minY;
              this.cropCanvasY =
                wrapperH - this.cropChangeStartY - fh <= wrapperH - minY
                  ? this.cropChangeStartY + fh
                  : minY;
            } else {
              this.cropH =
                Math.abs(fh) + this.cropChangeStartY <= wrapperH
                  ? Math.abs(fh) - this.cropOldH
                  : wrapperH - this.cropOldH - this.cropChangeStartY;
              this.cropCanvasY = this.cropChangeStartY + this.cropOldH;
            }
          } else if (this.changeCropTypeY === 2) {
            if (this.cropOldH + fh > 0) {
              this.cropH =
                this.cropOldH + fh + this.cropCanvasY <= wrapperH
                  ? this.cropOldH + fh
                  : wrapperH - this.cropCanvasY;
              this.cropCanvasY = this.cropChangeStartY;
            } else {
              this.cropH =
                wrapperH - this.cropChangeStartY + Math.abs(fh + this.cropOldH) <= wrapperH - minY
                  ? Math.abs(fh + this.cropOldH)
                  : this.cropChangeStartY - minY;
              this.cropCanvasY =
                wrapperH - this.cropChangeStartY + Math.abs(fh + this.cropOldH) <= wrapperH - minY
                  ? this.cropChangeStartY - Math.abs(fh + this.cropOldH)
                  : minY;
            }
          }
        }

        if (this.canChangeX && this.fixed) {
          var fixedHeight = this.cropW / this.fixedNumber[0] * this.fixedNumber[1];
          if (fixedHeight + this.cropCanvasY > wrapperH) {
            this.cropH = wrapperH - this.cropCanvasY;
            this.cropW = this.cropH / this.fixedNumber[1] * this.fixedNumber[0];
          } else {
            this.cropH = fixedHeight;
          }
        }

        if (this.canChangeY && this.fixed) {
          var fixedWidth = this.cropH / this.fixedNumber[1] * this.fixedNumber[0];
          if (fixedWidth + this.cropCanvasX > wrapperW) {
            this.cropW = wrapperW - this.cropCanvasX;
            this.cropH = this.cropW / this.fixedNumber[0] * this.fixedNumber[1];
          } else {
            this.cropW = fixedWidth;
          }
        }
        this.$emit('cropMoving', {
          moving: true,
          axis: this.getAbsoluteXY(),
        });
      });
    },

    // 结束改变
    changeCropEnd(e) {
      if (this.cropW === 0 || this.cropH === 0) {
        this.cropping = false;
        this.cropW = 0;
        this.cropH = 0;
      }
      window.removeEventListener('mousemove', this.changeCropNow);
      window.removeEventListener('mouseup', this.changeCropEnd);
      window.removeEventListener('touchmove', this.changeCropNow);
      window.removeEventListener('touchend', this.changeCropEnd);
      this.$emit('cropDone', {
        moving: false,
        axis: this.getAbsoluteXY(),
      });
    },

    changeCropXY(newX, newY, force) {
      if (!force && (!this.cropW || !this.cropH)) return false;
      const { x, y, scale, trueWidth, trueHeight } = this;
      const halfW = trueWidth / 2;
      const halfH = trueHeight / 2;
      const relativeX = (newX - halfW) * scale + x + halfW; //x,y 原圖的xy
      const relativeY = (newY - halfH) * scale + y + halfH;
      if (!this.readonly) {
        this.crop = true;
      }
      this.cropping = true;
      this.cropCanvasX = relativeX;
      this.cropCanvasY = relativeY;
      this.cropScreenX = relativeX;
      this.cropScreenY = relativeY;
      this.cropChangeStartX = this.cropCanvasX;
      this.cropChangeStartY = this.cropCanvasY;
      const labelXY = {
        newImgX: x,
        newImgY: y,
        scale,
      };
      this.$emit('changeLabels', labelXY);
      return true;
    },

    changeCropWH(newW, newH, force) {
      if (!force && (!this.cropW || !this.cropH)) return false;

      if (!this.readonly) {
        this.crop = true;
      }
      this.cropping = newW !== 0 && newH !== 0;
      this.cropW = this.cropping ? newW * this.scale : 0;
      this.cropH = this.cropping ? newH * this.scale : 0;
      this.$emit('cropDone');
      return true;
    },

    // 创建完成
    endCrop() {
      if (this.cropW === 0 || this.cropH === 0) {
        this.cropping = false;
        this.cropW = 0;
        this.cropH = 0;
      }
      window.removeEventListener('mousemove', this.createCrop);
      window.removeEventListener('mouseup', this.endCrop);
      window.removeEventListener('touchmove', this.createCrop);
      window.removeEventListener('touchend', this.endCrop);
      this.$emit('cropDone', {
        moving: false,
        axis: this.getAbsoluteXY(),
      });
    },
    // 开始截图
    startCrop() {
      this.readonly = false;
      this.crop = true;
    },
    // 停止截图
    stopCrop(showCrop) {
      if (!showCrop) {
        this.crop = false;
        this.cropping = false;
      } else {
        this.readonly = true;
      }
    },
    // 清除截图
    clearCrop() {
      this.cropping = false;
      this.cropW = 0;
      this.cropH = 0;
    },
    // 截图移动
    cropMove(e) {
      e.preventDefault();
      if (!this.canMoveBox) {
        this.crop = false;
        this.startMove(e);
        return false;
      }

      if (e.touches && e.touches.length === 2) {
        this.crop = false;
        this.startMove(e);
        this.leaveCrop();
        return false;
      }
      window.addEventListener('mousemove', this.moveCrop);
      window.addEventListener('mouseup', this.leaveCrop);
      window.addEventListener('touchmove', this.moveCrop);
      window.addEventListener('touchend', this.leaveCrop);
      let x = e.clientX || 0;
      let y = e.clientY || 0;
      let newX, newY;
      newX = x - this.cropCanvasX;
      newY = y - this.cropCanvasY;
      this.cropScreenX = newX;
      this.cropScreenY = newY;
      // 触发截图框移动事件
      this.$emit('cropMoving', {
        moving: true,
        axis: this.getAbsoluteXY(),
      });
    },

    getAbsoluteXY() {
      const { x1, x2, y1, y2 } = this.getCropAxis();
      const { x, y, scale, trueWidth, trueHeight } = this;
      const halfW = trueWidth / 2;
      const halfH = trueHeight / 2;
      const calcX = p => parseFloat(((p - x - halfW) / scale + halfW).toFixed(3));
      const calcY = p => parseFloat(((p - y - halfH) / scale + halfH).toFixed(3));

      return {
        x1: calcX(x1),
        y1: calcY(y1),
        x2: calcX(x2),
        y2: calcY(y2),
        labelX1: x1,
        labelY1: y1,
        labelX2: x2,
        labelY2: y2,
      };
    },

    moveCrop(e, isMove) {
      let nowX = 0;
      let nowY = 0;
      if (e) {
        e.preventDefault();
        nowX = e.clientX || 0;
        nowY = e.clientY || 0;
      }
      this.$nextTick(() => {
        let cx, cy;
        let fw = nowX - this.cropScreenX;
        let fh = nowY - this.cropScreenY;
        if (isMove) {
          fw = this.cropCanvasX;
          fh = this.cropCanvasY;
        }
        // 不能超过外层容器
        if (fw <= 0) {
          cx = 0;
        } else if (fw + this.cropW > this.w) {
          cx = this.w - this.cropW;
        } else {
          cx = fw;
        }

        if (fh <= 0) {
          cy = 0;
        } else if (fh + this.cropH > this.h) {
          cy = this.h - this.cropH;
        } else {
          cy = fh;
        }

        // 不能超过图片
        if (this.centerBox) {
          let axis = this.getImgAxis();
          // 横坐标判断
          if (cx <= axis.x1) {
            cx = axis.x1;
          }

          if (cx + this.cropW > axis.x2) {
            cx = axis.x2 - this.cropW;
          }

          // 纵坐标纵轴
          if (cy <= axis.y1) {
            cy = axis.y1;
          }

          if (cy + this.cropH > axis.y2) {
            cy = axis.y2 - this.cropH;
          }
        }

        this.cropCanvasX = cx;
        this.cropCanvasY = cy;
        // 触发截图框移动事件
        this.$emit('cropMoving', {
          moving: true,
          axis: this.getAbsoluteXY(),
        });
        this.$emit('cropDone', {
          moving: true,
          axis: this.getAbsoluteXY(),
        });
      });
    },

    // 算出不同场景下面 图片相对于外层容器的坐标轴
    getImgAxis(x, y, scale) {
      x = x || this.scaledImageX;
      y = y || this.scaledImageY;
      scale = scale || this.scale;
      // 如果设置了截图框在图片内， 那么限制截图框不能超过图片的坐标
      // 图片的坐标
      let obj = {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
      };
      // let imgW = this.trueWidth * scale;
      // let imgH = this.trueHeight * scale;
      // FIXME: fix rotation
      // switch (this.rotate) {
      //   case 0:
      //     obj.x1 = (x + (this.trueWidth * (1 - scale)) / 2);
      //     obj.x2 = (obj.x1 + this.trueWidth * scale);
      //     obj.y1 = (y + (this.trueHeight * (1 - scale)) / 2);
      //     obj.y2 = (obj.y1 + this.trueHeight * scale);
      //     break;
      //   case 1:
      //   case -1:
      //   case 3:
      //   case -3:
      //     obj.x1 =
      //       (x + (this.trueWidth * (1 - scale)) / 2) + (imgW - imgH) / 2;
      //     obj.x2 = (obj.x1 + this.trueHeight * scale);
      //     obj.y1 =
      //       (y + (this.trueHeight * (1 - scale)) / 2) + (imgH - imgW) / 2;
      //     obj.y2 = (obj.y1 + this.trueWidth * scale);
      //     break;
      //   default:
      obj.x1 = x;
      obj.x2 = obj.x1 + this.trueWidth * scale;
      obj.y1 = y;
      obj.y2 = obj.y1 + this.trueHeight * scale;
      // break;
      // }
      return obj;
    },

    // 获取截图框的坐标轴
    getCropAxis() {
      let obj = {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0,
      };
      obj.x1 = this.cropCanvasX;
      obj.x2 = obj.x1 + this.cropW;
      obj.y1 = this.cropCanvasY;
      obj.y2 = obj.y1 + this.cropH;
      return obj;
    },

    leaveCrop(e) {
      window.removeEventListener('mousemove', this.moveCrop);
      window.removeEventListener('mouseup', this.leaveCrop);
      window.removeEventListener('touchmove', this.moveCrop);
      window.removeEventListener('touchend', this.leaveCrop);
      // 触发截图框移动事件
      this.$emit('cropMoving', {
        moving: false,
        axis: this.getAbsoluteXY(),
      });
    },

    getCropChecked(cb) {
      let canvas = document.createElement('canvas');
      let img = new Image();
      let rotate = this.rotate;
      let trueWidth = this.trueWidth;
      let trueHeight = this.trueHeight;
      let cropCanvasX = this.cropCanvasX;
      let cropCanvasY = this.cropCanvasY;
      img.onload = () => {
        if (this.cropW !== 0) {
          let ctx = canvas.getContext('2d');
          let dpr = 1;
          if (this.high && !this.full) {
            dpr = window.devicePixelRatio;
          }
          if (this.enlarge !== 1 && !this.full) {
            dpr = Math.abs(Number(this.enlarge));
          }
          const width = this.cropW * dpr;
          const height = this.cropH * dpr;
          const imgW = trueWidth * this.scale * dpr;
          const imgH = trueHeight * this.scale * dpr;
          setCanvasSize(width / this.scale, height / this.scale);
          ctx.save();

          if (rotate !== 0) {
            const theta = rotate * Math.PI / 180;
            const cos = Math.cos(theta);
            const sin = Math.sin(theta);
            const bx = this.x + trueWidth / 2 + cos * (-imgW / 2) - sin * (-imgH / 2) - cropCanvasX;
            const by =
              this.y + trueHeight / 2 + sin * (-imgW / 2) + cos * (-imgH / 2) - cropCanvasY;
            ctx.translate(bx / this.scale, by / this.scale);
            ctx.rotate(theta);
          } else {
            ctx.translate(
              -(cropCanvasX - (this.x + trueWidth / 2 + -imgW / 2)) / this.scale,
              -(cropCanvasY - (this.y + trueHeight / 2 + -imgH / 2)) / this.scale
            );
          }
          ctx.drawImage(img, 0, 0, imgW / this.scale, imgH / this.scale);

          ctx.restore();
        }
        cb(canvas);
      };
      // 判断图片是否是base64
      var s = this.img.substr(0, 4);
      if (s !== 'data') {
        img.crossOrigin = 'Anonymous';
      }
      img.src = this.imgs;

      function setCanvasSize(width, height) {
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
      }
    },

    // 获取转换成base64 的图片信息
    getCropData(cb) {
      this.getCropChecked(data => {
        cb(data.toDataURL('image/' + this.outputType, this.outputSize));
      });
    },
    getColor(color) {
      this.changeBorderColor = {
        border: `4px solid ${color}`,
      };

      console.log(this.changeBorderColor);
    },
    //canvas获取为blob对象
    getCropBlob(cb) {
      this.getCropChecked(data => {
        data.toBlob(blob => cb(blob), 'image/' + this.outputType, this.outputSize);
      });
    },

    // 自动预览函数
    showPreview() {
      return false; // return anyway
      // 优化不要多次触发
      if (this.isCanShow) {
        this.isCanShow = false;
        setTimeout(() => {
          this.isCanShow = true;
        }, 16);
      } else {
        return false;
      }
      let w = this.cropW;
      let h = this.cropH;
      let scale = this.scale;
      var obj = {};
      obj.div = {
        width: `${w}px`,
        height: `${h}px`,
      };
      let transformX = (this.x - this.cropCanvasX) / scale;
      let transformY = (this.y - this.cropCanvasY) / scale;
      let transformZ = 0;
      obj.w = w;
      obj.h = h;
      obj.url = this.imgs;
      obj.img = {
        width: `${this.trueWidth}px`,
        height: `${this.trueHeight}px`,
        transform: `scale(${scale})translate3d(${transformX}px, ${transformY}px, ${transformZ}px)rotateZ(${this
          .rotate * 90}deg)`,
      };
      obj.html = `
      <div class="show-preview" style="width: ${obj.w}px; height: ${obj.h}px,; overflow: hidden">
        <div style="width: ${w}px; height: ${h}px">
          <img src=${obj.url} style="width: ${this.trueWidth}px; height: ${
        this.trueHeight
      }px; transform:
          scale(${scale})translate3d(${transformX}px, ${transformY}px, ${transformZ}px)rotateZ(${this
        .rotate * 90}deg)">
        </div>
      </div>`;
      this.$emit('realTime', obj);
    },
    resetContainerWH() {
      this.w = parseFloat(window.getComputedStyle(this.$refs.cropper).width);
      this.h = parseFloat(window.getComputedStyle(this.$refs.cropper).height);
    },
    // reload 图片布局函数
    reload() {
      let img = new Image();
      img.onload = () => {
        // 读取图片的信息原始信息， 解析是否需要旋转
        // 读取图片的旋转信息
        // 得到外层容器的宽度高度
        this.resetContainerWH();

        // 存入图片真实高度
        this.trueWidth = img.width;
        this.trueHeight = img.height;

        // 判断是否需要压缩大图
        if (!this.original) {
          // 判断布局方式 mode
          this.scale = this.checkedMode();
        } else {
          this.scale = 1;
        }

        this.$nextTick(() => {
          this.x =
            -(this.trueWidth - this.trueWidth * this.scale) / 2 +
            (this.w - this.trueWidth * this.scale) / 2;
          this.y =
            -(this.trueHeight - this.trueHeight * this.scale) / 2 +
            (this.h - this.trueHeight * this.scale) / 2;
          this.loading = false;
          // // 获取是否开启了自动截图
          if (this.autoCrop) {
            this.goAutoCrop();
          }
          // // 图片加载成功的回调
          this.$emit('imgLoad', 'success');
          this.$emit('getOriginalImgXY', { x: this.x, y: this.y });
          setTimeout(() => {
            this.showPreview();
          }, 20);
        });
      };
      img.onerror = () => {
        this.$emit('imgLoad', 'error');
      };
      img.src = this.imgs;
    },
    // 背景布局的函数
    checkedMode() {
      let scale = 1;
      // 通过字符串分割
      let imgW = this.trueWidth;
      let imgH = this.trueHeight;
      const arr = this.mode.split(' ');
      switch (arr[0]) {
        case 'contain':
          if (this.trueWidth > this.w) {
            // 如果图片宽度大于容器宽度
            scale = this.w / this.trueWidth;
          }

          if (this.trueHeight * scale > this.h) {
            scale = this.h / this.trueHeight;
          }
          break;
        case 'cover':
          // 扩展布局 默认填充满整个容器
          // 图片宽度大于容器
          imgW = this.w;
          scale = imgW / this.trueWidth;
          imgH = imgH * scale;
          // 如果扩展之后高度小于容器的外层高度 继续扩展高度
          if (imgH < this.h) {
            imgH = this.h;
            scale = imgH / this.trueHeight;
          }
          break;
        default:
          try {
            let str = arr[0];
            if (str.search('px') !== -1) {
              str = str.replace('px', '');
              imgW = parseFloat(str);
              scale = imgW / this.trueWidth;
            }
            if (str.search('%') !== -1) {
              str = str.replace('%', '');
              imgW = parseFloat(str) / 100 * this.w;
              scale = imgW / this.trueWidth;
            }

            if (arr.length === 2 && str === 'auto') {
              let str2 = arr[1];
              if (str2.search('px') !== -1) {
                str2 = str2.replace('px', '');
                imgH = parseFloat(str2);
                scale = imgH / this.trueHeight;
              }
              if (str2.search('%') !== -1) {
                str2 = str2.replace('%', '');
                imgH = parseFloat(str2) / 100 * this.h;
                scale = imgH / this.trueHeight;
              }
            }
          } catch (error) {
            scale = 1;
          }
      }
      return scale;
    },
    // 自动截图函数
    goAutoCrop(cw, ch) {
      this.clearCrop();
      this.cropping = true;
      let maxWidth = this.w;
      let maxHeight = this.h;
      if (this.centerBox) {
        let imgW = this.trueWidth * this.scale;
        let imgH = this.trueHeight * this.scale;
        maxWidth = imgW < maxWidth ? imgW : maxWidth;
        maxHeight = imgH < maxHeight ? imgH : maxHeight;
      }
      // 截图框默认大小
      // 如果为0 那么计算容器大小 默认为80%
      var w = cw ? cw : parseFloat(this.autoCropWidth);
      var h = ch ? ch : parseFloat(this.autoCropHeight);
      if (w === 0 || h === 0) {
        w = maxWidth * 0.8;
        h = maxHeight * 0.8;
      }
      w = w > maxWidth ? maxWidth : w;
      h = h > maxHeight ? maxHeight : h;
      if (this.fixed) {
        h = w / this.fixedNumber[0] * this.fixedNumber[1];
      }
      // 如果比例之后 高度大于h
      if (h > this.h) {
        h = this.h;
        w = h / this.fixedNumber[1] * this.fixedNumber[0];
      }
      this.changeCrop(w, h);
    },
    // 手动改变截图框大小函数
    changeCrop(w, h) {
      // 判断是否大于容器
      this.cropW = w;
      this.cropH = h;
      // 居中走一走
      this.cropCanvasX = (this.w - w) / 2;
      this.cropCanvasY = (this.h - h) / 2;
      if (this.centerBox) {
        this.$nextTick(() => {
          this.moveCrop(null, true);
        });
      }
    },
    // 重置函数， 恢复组件置初始状态
    refresh() {
      let img = this.img;
      this.imgs = '';
      this.scale = 1;
      this.crop = false;
      this.rotate = 0;
      this.w = 0;
      this.h = 0;
      this.trueWidth = 0;
      this.trueHeight = 0;
      this.clearCrop();
      this.$nextTick(() => {
        this.checkedImg();
      });
    },

    // 向左边旋转
    rotateLeft() {
      this.rotate = this.rotate <= -3 ? 0 : this.rotate - 1;
    },

    // 向右边旋转
    rotateRight() {
      this.rotate = this.rotate >= 3 ? 0 : this.rotate + 1;
    },

    rotateIt(deg) {
      this.rotate = deg;
    },

    // 清除旋转
    rotateClear() {
      this.rotate = 0;
    },
    // 图片坐标点校验
    checkoutImgAxis(x, y, scale) {
      x = x || this.x;
      y = y || this.y;
      scale = scale || this.scale;
      let canGo = true;
      // 开始校验 如果说缩放之后的坐标在截图框外 则阻止缩放
      if (this.centerBox) {
        let axis = this.getImgAxis(x, y, scale);
        let cropAxis = this.getCropAxis();
        // 左边的横坐标 图片不能超过截图框
        if (axis.x1 >= cropAxis.x1) {
          canGo = false;
        }

        // 右边横坐标
        if (axis.x2 <= cropAxis.x2) {
          canGo = false;
        }

        // 纵坐标上面
        if (axis.y1 >= cropAxis.y1) {
          canGo = false;
        }

        // 纵坐标下面
        if (axis.y2 <= cropAxis.y2) {
          canGo = false;
        }
      }
      return canGo;
    },
    loadingImg(type) {
      this.$emit('loadingImg', type);
    },
  },
  mounted() {
    this.support =
      'onwheel' in document.createElement('div')
        ? 'wheel'
        : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
    let that = this;
    var u = navigator.userAgent;
    this.isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    // 兼容blob
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function(callback, type, quality) {
          var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
            len = binStr.length,
            arr = new Uint8Array(len);
          for (var i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
          }
          callback(new Blob([arr], { type: that.type || 'image/png' }));
        },
      });
    }
    this.cropperWH.width = '100%';
    this.cropperWH.height = '75vh';
    this.showPreview();
    this.checkedImg();
    window.addEventListener('resize', this.resetContainerWH);
  },
  destroyed() {
    window.removeEventListener('resize', this.resetContainerWH);
    window.removeEventListener('mousemove', this.moveCrop);
    window.removeEventListener('mouseup', this.leaveCrop);
    window.removeEventListener('touchmove', this.moveCrop);
    window.removeEventListener('touchend', this.leaveCrop);
  },
  computed: {
    cropInfo() {
      let obj = {};
      obj.top = this.cropCanvasY > 21 ? '-21px' : '0px';
      obj.width = this.cropW > 0 ? this.cropW : 0;
      obj.height = this.cropH > 0 ? this.cropH : 0;
      if (this.infoTrue) {
        let dpr = 1;
        if (this.high && !this.full) {
          dpr = window.devicePixelRatio;
        }
        if ((this.enlarge !== 1) & !this.full) {
          dpr = Math.abs(Number(this.enlarge));
        }
        obj.width = obj.width * dpr;
        obj.height = obj.height * dpr;
        if (this.full) {
          obj.width = obj.width / this.scale;
          obj.height = obj.height / this.scale;
        }
      }
      obj.width = obj.width.toFixed(0);
      obj.height = obj.height.toFixed(0);
      return obj;
    },

    isIE() {
      const userAgent = navigator.userAgent;
      return userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1;
    },
    scaledImageX() {
      return this.x / this.scale;
    },
    scaledImageY() {
      return this.y / this.scale;
    },
    boxCanvasStyle() {
      return {
        width: `${this.trueWidth}px`,
        height: `${this.trueHeight}px`,
        transform: `scale(${this.scale}, ${this.scale}) translate3d(${this.scaledImageX}px, ${
          this.scaledImageY
        }px, 0) rotateZ(${this.rotate}deg)`,
      };
    },
    cropBoxStyle() {
      return {
        width: `${this.cropW}px`,
        height: `${this.cropH}px`,
        // transform: `translate3d(${this.cropCanvasX}px, ${
        //   this.cropCanvasY
        // }px, 0)`,
        // FIXME: use left and top so the border will actually move around with the box,
        // but it is slower.
        left: `${this.cropCanvasX}px`,
        top: `${this.cropCanvasY}px`,
      };
    },
    viewBoxStyle() {
      return {
        width: `${this.trueWidth}px`,
        height: `${this.trueHeight}px`,
        transform: `scale(${this.scale}, ${this.scale}) translate3d(${(this.x - this.cropCanvasX) /
          this.scale}px, ${(this.y - this.cropCanvasY) / this.scale}px, 0) rotateZ(${
          this.rotate
        }deg)`,
      };
    },
  },
  watch: {
    // 如果图片改变， 重新布局
    img() {
      // 当传入图片时, 读取图片信息同时展示
      this.checkedImg();
    },
    imgs(val) {
      if (val === '') {
        return;
      }
      this.reload();
    },
    mode() {
      this.checkedImg();
    },
  },
};
</script>

<style scoped lang="scss">
.vue-cropper {
  position: relative;
  box-sizing: content-box;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  direction: ltr;
  touch-action: none;
  text-align: left;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
  background-repeat: repeat;
  border: 1px solid;
  overflow: hidden;
}

.cropper-box,
.cropper-box-canvas,
.cropper-drag-box,
.cropper-crop-box,
.cropper-face {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  // user-select: none;
}

.cropper-box-canvas .img {
  position: relative;
  text-align: left;
  user-select: none;
  transform: none;
  max-width: none;
  max-height: none;
}

.cropper-box {
  overflow: hidden;
}

.cropper-move {
  cursor: grab;
}
.cropper-moving {
  cursor: grabbing !important;
}

.cropper-crop {
  cursor: crosshair;
}

.cropper-modal {
  background: rgba(0, 0, 0, 0.5);
}

// .cropper-crop-box {
/*border: 2px solid #39f;*/
// }

.cropper-view-box {
  display: block;
  overflow: hidden;
  width: 100%;
  height: 100%;
  /* border: 4px solid #49ffd6; */
  box-sizing: border-box;
  user-select: none;
  position: relative;
  .border {
    display: block;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    left: 0;
  }
}

.cropper-view-box img {
  user-select: none;
  text-align: left;
  max-width: none;
  max-height: none;
}

.cropper-face {
  top: 0;
  left: 0;
  background-color: #fff;
  opacity: 0.1;
}

.crop-info {
  position: absolute;
  left: 0px;
  min-width: 65px;
  text-align: center;
  color: white;
  line-height: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  font-size: 12px;
}

.crop-line {
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.line-w {
  top: -3px;
  left: 0;
  height: 5px;
  cursor: n-resize;
}

.line-a {
  top: 0;
  left: -3px;
  width: 5px;
  cursor: w-resize;
}

.line-s {
  bottom: -3px;
  left: 0;
  height: 5px;
  cursor: s-resize;
}

.line-d {
  top: 0;
  right: -3px;
  width: 5px;
  cursor: e-resize;
}

.crop-point {
  position: absolute;
  width: 8px;
  height: 8px;
  opacity: 0.75;
  background-color: #39f;
  border-radius: 100%;
}

.cropper-modal,
.cropper-face {
  background: none;
}

.cropper-face {
  background: none;
}

.crop-line {
  border-width: 1px;
  opacity: 1;
}

.crop-point {
  box-shadow: 0 0 2px 0 #000000;
  background-color: #f3f3f3;
  border-radius: 0;
  opacity: 1;
}

.point1 {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.point2 {
  top: -5px;
  left: 50%;
  margin-left: -3px;
  cursor: n-resize;
}

.point3 {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.point4 {
  top: 50%;
  left: -4px;
  margin-top: -3px;
  cursor: w-resize;
}

.point5 {
  top: 50%;
  right: -4px;
  margin-top: -3px;
  cursor: e-resize;
}

.point6 {
  bottom: -5px;
  left: -4px;
  cursor: sw-resize;
}

.point7 {
  bottom: -5px;
  left: 50%;
  margin-left: -3px;
  cursor: s-resize;
}

.point8 {
  bottom: -5px;
  right: -4px;
  cursor: se-resize;
}

@media screen and (max-width: 500px) {
  .crop-point {
    position: absolute;
    width: 20px;
    height: 20px;
    opacity: 0.45;
    background-color: #39f;
    border-radius: 100%;
  }

  .point1 {
    top: -10px;
    left: -10px;
  }

  .point2,
  .point4,
  .point5,
  .point7 {
    display: none;
  }

  .point3 {
    top: -10px;
    right: -10px;
  }

  .point4 {
    top: 0;
    left: 0;
  }

  .point6 {
    bottom: -10px;
    left: -10px;
  }

  .point8 {
    bottom: -10px;
    right: -10px;
  }
}
</style>

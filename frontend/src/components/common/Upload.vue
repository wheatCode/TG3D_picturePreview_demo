<template>
  <v-layout class="uploaderpage">
    <v-flex>
      <div class="uploaderpage--title">
        <v-layout justify-space-between class="pr-3">
          <v-flex>
            <v-layout class="mt-3">
              <v-flex xs2>
                <div class="loading">
                  <div ref="loading" class="loading-son"></div>
                </div>
              </v-flex>
              <v-flex>
                <span class="title" style="color:white">{{ uploadTitle }}</span>
              </v-flex>
            </v-layout>
          </v-flex>
          <v-flex xs2>
            <toggle-btn
              v-if="!showUpload"
              :btn-check-icon-circle="btnClose.btnCheckIconCircle"
              :btn-round="btnClose.btnRound"
              :btn-color="btnClose.btnColor"
              :btn-text-white="btnClose.btnTextWhite"
              :btn-size-small="btnClose.btnSizeSmall"
              @getBtn="showUpload = !showUpload"
            >
              <img src="../../assets/arrow_up.png" alt="" width="40" height="40" />
            </toggle-btn>

            <toggle-btn
              v-if="showUpload"
              :btn-check-icon-circle="btnClose.btnCheckIconCircle"
              :btn-round="btnClose.btnRound"
              :btn-color="btnClose.btnColor"
              :btn-text-white="btnClose.btnTextWhite"
              :btn-size-small="btnClose.btfileStatusTextnSizeSmall"
              @getBtn="showUpload = !showUpload"
            >
              <img src="../../assets/arrow_down.png" alt="" width="40" height="40" />
            </toggle-btn>
          </v-flex>
        </v-layout>
      </div>
      <uploader
        v-show="showUpload"
        ref="uploader"
        :options="options"
        :autoStart="autoStart"
        :file-status-text="statusText"
        class="uploader-example"
      >
        <uploader-unsupport></uploader-unsupport>
        <uploader-drop>
          <v-layout wrap>
            <v-flex>
              <v-select
                class="select"
                v-model="project"
                :items="projectItems"
                menu-props="auto"
                hide-details
                :label="$t('upload_project')"
                single-line
              ></v-select>
            </v-flex>
            <v-flex style="margin:auto 0px;">
              <v-layout justify-end v-if="project">
                <uploader-btn :attrs="attrs">{{ $t('upload_btn') }}</uploader-btn>
                <toggle-btn
                  :btn-title="btnCancel.btnTitle"
                  :btn-color="btnCancel.btnColor"
                  :btn-outline="btnCancel.btnOutline"
                  :btn-size-small="true"
                  @getBtn="remove"
                />
              </v-layout>
            </v-flex>
          </v-layout>
        </uploader-drop>
        <uploader-list ref="list" class="list"></uploader-list>
      </uploader>
    </v-flex>
  </v-layout>
</template>

<script>
import SparkMD5 from 'spark-md5';
import ToggleBtn from '@/components/common/ToggleBtn';
import i18n from '@/i18n/i18n';

export default {
  components: {
    ToggleBtn,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      num: 0,
      waitNum: 0,
      fileDelayNum: 0,
      remainder: 0,
      countFiles: 0,
      loadFile: '',
      checkFileLoadNum: 0,
      checkFileLoad: [],
      checkFinishAllfiles: false,
      oldFiles: [],
      uploadTitle: i18n.t('upload_title'),
      uploadProjectId: '',
      project: '',
      projectItems: [],
      options: {
        target: '', //上傳網址
        testChunks: false,
        method: 'octet',
        uploadMethod: 'PUT',
        headers: {
          'Content-Type': '',
        },
      },
      showUpload: false,
      autoStart: false, //是否直接上傳
      attrs: {
        accept: 'image/*',
      },
      statusText: {
        success: i18n.t('upload_status__success'),
        error: i18n.t('upload_status__error'),
        uploading: i18n.t('upload_status__uploading'),
        paused: i18n.t('upload_status__paused'),
        waiting: i18n.t('upload_status__waiting'),
      },
      btnCancel: {
        btnTitle: i18n.t('upload_clear'),
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
    };
  },
  mounted() {
    this.$refs.uploader.uploader.on('filesAdded', async files => {
      if (files.length === 0) return this.$snackbar.alert(i18n.t('images_repeat'));
      this.checkFileLoadNum++;
      await this.filesAdded(files, this.checkFileLoadNum);
    });
    this.$refs.uploader.uploader.on('fileComplete', (rootFile, file) => {
      this.checkFileStatus(file); //getFinishUpload
    });
  },
  methods: {
    async resetFile() {
      this.num = 0;
      this.checkFinishAllfiles = false;
    },
    async filesAdded(files, checkFileLoadNum) {
      this.checkFileLoad[checkFileLoadNum] = false;
      if (this.oldFiles.length > 0 && this.oldFiles != files) {
        await this.waitFilesAdd(this.oldFiles, checkFileLoadNum);
      }
      this.oldFiles = files;
      await this.loader(true);
      for (let file in files) {
        this.projectItems.forEach(item => {
          if (item.text === this.project) {
            this.uploadProjectId = item.id;
          }
        });
        files[file].path = this.uploadProjectId;
      }
      let fileDelayNum = Math.ceil(files.length / 3);
      let remainder = files.length % 3;
      this.countFiles = files.length;
      for (let file in files) {
        this.num++;
        await this.checkImageType(files[file]);
        this.uploadTitle = i18n.t('upload_title');
        await this.resume(files[file]);
        if (fileDelayNum) {
          if (fileDelayNum !== 1 && this.num % 3 === 0) {
            await this.delay(0.2, this.num, checkFileLoadNum);
            fileDelayNum--;
          } else if (fileDelayNum === 1 && this.num % 3 === remainder) {
            await this.delay(0.2, this.num % 3, checkFileLoadNum, true);
          }
        }
      }
      this.checkFinishAllfiles = true;
    },
    async checkFileStatus(file) {
      const item = this.$refs.list.$children.filter(fileData => fileData.file.id === file.id)[0];

      await this.$nextTick(() => {
        item.isUploading = true;
        item.isComplete = false;
      });

      if (item.file.error) return;
      const md5Hash = await this.getMD5FromBlob(item.file.file);
      await this.finishUpload(md5Hash, item);
    },
    checkImageType(file) {
      if (this.$refs.list.$children.length !== 0) {
        switch (file.fileType) {
          case 'image/svg+xml': {
            const target = this.$refs.list.$children.find(item => item.file.id === file.id);
            if (target) {
              target.remove();
            }
            break;
          }
        }
        return Promise.resolve();
      } else {
        return new Promise(resolve => {
          setTimeout(() => {
            this.checkImageType(file).then(resolve);
          }, 2000);
        });
      }
    },
    remove() {
      this.$refs.list.$children.forEach(item => {
        if (item.status === 'success') {
          item.remove();
        }
      });
    },
    async resume(file) {
      if (file.aborted) {
        this.waitNum++;
        return;
      }
      const item = this.$refs.list.$children.filter(fileData => fileData.file.id === file.id)[0];
      item.canRetry = item.retry;
      this.$set(item, 'retry', async () => {
        const { url, filePath } = await this.getUploadTarget(item);
        this.$refs.uploader.uploader.opts.target = `${url}`;
        item.myfilePath = filePath;
        item.canRetry();
      });
      const { url, filePath } = await this.getUploadTarget(item);
      this.$refs.uploader.uploader.opts.target = `${url}`;
      item.myfilePath = filePath;
      switch (item.status) {
        case 'error':
          break;
        case 'paused':
          item.resume();
          break;
      }
    },
    waitFilesAdd(oldFiles, checkFileLoadNum) {
      if (this.checkFileLoad[checkFileLoadNum - 1]) {
        return new Promise(resolve =>
          setTimeout(() => {
            this.num = 0;
            this.checkFileLoad[checkFileLoadNum - 1] = false;
            resolve();
          }, 200)
        );
      } else {
        return new Promise(resolve => {
          setTimeout(() => {
            this.waitFilesAdd(oldFiles, checkFileLoadNum).then(resolve);
            this.checkFinishAllfiles = false;
          }, 200);
        });
      }
    },
    delay(time, num, checkFileLoadNum, checkLast) {
      if (this.waitNum != 0 && this.waitNum % 3 === 0 && !checkLast) {
        this.waitNum = 0;
        return Promise.resolve();
      } else if (checkLast) {
        if (num === this.waitNum % 3 && this.waitNum !== 0) {
          this.waitNum = 0;
          this.$nextTick(() => {
            this.checkFileLoad[checkFileLoadNum] = true;
          });
          return Promise.resolve();
        } else {
          return new Promise(resolve => {
            setTimeout(() => {
              this.delay(time, num, checkFileLoadNum, checkLast).then(resolve);
            }, time * 1000);
          });
        }
      } else {
        return new Promise(resolve => {
          setTimeout(() => {
            this.delay(time, num, checkFileLoadNum, checkLast).then(resolve);
          }, time * 1000);
        });
      }
    },
    async getUploadTarget(file) {
      try {
        const fileName = file.file.name;
        const { data } = await this.$http.post(`/api/v1/projects/${file.file.path}/start_upload`, {
          fileName,
        });
        return data;
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        }
      }
    },
    async finishUpload(md5Hash, file) {
      try {
        const { data } = await this.$http.post(`/api/v1/projects/${file.file.path}/finish_upload`, {
          md5: md5Hash,
          filePath: file.myfilePath,
        });
        if (data) {
          file.isUploading = false;
          file.isComplete = true;
        } else {
          file.error = true;
          file.isUploading = false;
          file.isComplete = false;
        }
      } catch (e) {
        const { response } = e;
        const { status } = response || {};
        if (status === 401) {
          this.$router.push('/login');
        } else if (!e.status) {
          file.error = true;
          file.isUploading = false;
          file.isComplete = false;
        }
      } finally {
        await this.addWaitNum();
      }
    },
    addWaitNum(num) {
      if (this.waitNum < 3) {
        return new Promise(resolve => {
          setTimeout(() => {
            this.waitNum++;
            resolve();
          }, 200);
        });
      } else if (num === 0) {
        this.waitNum = 0;
        return Promise.resolve();
      } else {
        return new Promise(resolve => {
          setTimeout(() => {
            this.addWaitNum(0).then(resolve);
          }, 200);
        });
      }
    },
    async loader(status) {
      if (status) {
        this.uploadTitle = i18n.t('upload_title__verifying');
        await this.$nextTick(() => {
          this.loadFile = this.$loading.show({
            container: this.$refs.loading,
            loader: 'spinner',
            width: 20,
            height: 20,
            color: 'white',
          });
        });
      } else {
        this.$nextTick(() => {
          this.loadFile.hide();
        });
      }
    },
    getMD5FromBlob(blob) {
      let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        file = blob,
        chunkSize = 2097152, // Read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader();

      return new Promise(resolve => {
        fileReader.onload = function(e) {
          spark.append(e.target.result);
          currentChunk++;

          if (currentChunk < chunks) {
            loadNext();
          } else {
            resolve(spark.end());
          }
        };
        fileReader.onerror = function() {};

        function loadNext() {
          var start = currentChunk * chunkSize,
            end = start + chunkSize >= file.size ? file.size : start + chunkSize;

          fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();
      });
    },
    // getMD5FromBlob(blob) {
    //   if (!blob) {
    //     return Promise.resolve('');
    //   }
    //   return new Promise(resolve => {
    //     const reader = new FileReader();
    //     reader.onloadend = function() {
    //       resolve(md5(reader.result));
    //     };
    //     reader.readAsBinaryString(blob);
    //   });
    // },
    getProgress(item) {
      return new Promise(resolve => {
        if (item.status === 'error') resolve(true);
        setTimeout(() => {
          resolve(item.isComplete);
        }, 3000);
      }).then(passed => passed || this.getProgress(item));
    },
  },
  watch: {
    items(nv) {
      if (nv) {
        this.items.forEach(item => {
          this.projectItems.push({
            id: item.id,
            text: item.name,
          });
        });
      }
    },
    checkFinishAllfiles(nv) {
      if (nv) {
        if (this.num === this.countFiles) {
          this.uploadTitle = i18n.t('upload_title__done');
          this.loader(false);
          this.resetFile();
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.uploaderpage {
  z-index: 50;
  position: fixed;
  bottom: 0px;
  right: 0px;
  .uploaderpage--title {
    height: 50px;
    width: 350px;
    background: #3c3c3c;
    border-radius: 15px 0px 0 0;
  }
}
.uploader-example {
  min-width: 350px;
  max-width: 350px;
  width: 350px;
  font-size: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  /deep/.uploader-drop {
    border: none;
    background-color: white;
  }
  /deep/.uploader-btn {
    margin: auto 0px;
    font-size: 13px;
    background: #1ac5d4;
    color: white;
    border: 1px solid #1ac5d4;
    text-transform: uppercase;
    min-width: 88px;
    text-align: center;
    font-weight: 500;
  }
}
.uploader-example .uploader-btn {
  margin-right: 4px;
}
.uploader-example .uploader-list {
  max-height: 240px;
  overflow: auto;
  overflow-x: hidden;
  overflow-y: auto;
}
.loading {
  position: relative;
  .loading-son {
    position: absolute;
    left: 45%;
    top: 45%;
    height: 30px;
    width: 20px;
  }
}
.list {
  /deep/.uploader-file {
    background: white;
  }
  /deep/.uploader-file-name {
    width: 55%;
  }
  /deep/.uploader-file-size,
  /deep/.uploader-file-meta {
    display: none;
  }
  /deep/.uploader-file-actions {
    width: 20%;
    padding-left: 10px;
  }
  /deep/.uploader-file-resume,
  /deep/.uploader-file-pause {
    visibility: hidden;
  }
}
</style>

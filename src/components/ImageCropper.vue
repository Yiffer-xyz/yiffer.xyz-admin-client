<template>
  <div class="verticalFlex">
    <div class="horizontalFlex flexWrap justifyContentStart" v-if="!disableUpload && !isReadyForCrop">
      <form enctype="multipart/form-data"
            v-if="!croppieRef"
            novalidate
            style="width: fit-content;"
            class="m-4"
            :disabled="isDisabled">
        <div class="pretty-input-upload" style="width: 16rem"
             :class="{'y-button-disabled': isDisabled}">
          <input type="file" multiple="false" @change="onFileAdded" id="newPageFiles"
                 accept="image/png,image/jpeg" class="input-file" style="width: 16rem"
                 :disabled="isDisabled"/>
          <p>
            {{buttonText}}
          </p>
        </div>
      </form>
    </div>

    <button class="y-button m-4 width100"
            style="width: 16.25rem"
            :class="{'y-button-disabled': isDisabled}"
            @click="$emit('disabledUploadClick')"
            v-else-if="!isReadyForCrop"
            :disabled="isDisabled">
      {{buttonText}}
    </button>

    <div class="cropContainer">
      <div class="verticalFlex" :style="{'max-height: 0px': !isReadyForCrop}">
        <p v-if="isReadyForCrop">
          Resize &amp; crop - remember, no borders!
        </p>
        <vue-croppie ref="croppieRef"
                     v-show="isReadyForCrop"
                     :enableResize="false"
                     :boundary="{ width: 300, height: 400}"
                     :viewport="{ width:200, height:283, 'type':'square' }">
        </vue-croppie>

        <button v-if="isReadyForCrop" @click="crop" class="y-button iconButton width100">
          Crop
        </button>
      </div>

      <div class="verticalFlex alignItemsCenter" style="min-width: 200px;">
        <p v-if="isReadyForCrop">
          Result:
        </p>
        <img :src="croppedImageB64" v-show="croppedImageB64" id="croppedImage" width="200">

        <ResponseMessage :message="cropErrorText" preventClose messageType="error" style="max-width: 200px;"/>
      </div>
    </div>
  </div>
</template>

<script>
import ImageTools from '@/utils/imageResizer'
const imageResizer = new ImageTools();
import ResponseMessage from '@/components/ResponseMessage.vue'

export default {
  props: {
    buttonText: String,
    externalFile: File,
    disableUpload: Boolean,
    isDisabled: Boolean,
  },

  components: {
    ResponseMessage,
  },

  data() {
    return {
      croppieImage: '',
      croppedImageB64: null,
      isReadyForCrop: false,
      cropErrorText: null,
      croppieRef: '',
    };
  },

  methods: {
    onFileAdded (e) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) { return }
      
      let reader = this.makeFileReader()
      reader.readAsDataURL(files[0])
    },

    loadExternalFile () {
      if (!this.externalFile) { return }
      let reader = this.makeFileReader()
      reader.readAsDataURL(this.externalFile)
    },

    makeFileReader () {
      this.cropErrorText = null
      this.croppedImageB64 = null
      this.$emit('imageReady', false)
      this.$emit('readyForCrop', false)

      var reader = new FileReader()
      reader.onload = e => {
        this.$refs.croppieRef.bind({
          url: e.target.result
        })
        this.isReadyForCrop = true
        this.$emit('readyForCrop', true)
      }

      return reader
    },

    async crop () {
      let options = {
        type: 'base64',
        size: 'original',
        format: 'jpeg',
        quality: 1,
      }

      this.cropErrorText = null
      this.croppedImageB64 = null

      this.$refs.croppieRef.result(options, async output => {
        try {
          const resized = await imageResizer.ResizeImage(output, 200, 283)
          this.croppedImageB64 = resized
          this.$emit('imageReady', true)
          let croppedFile = await urlToFile(resized, 'test.jpg', 'image/jpeg')
          this.$emit('handleImage', {file: croppedFile, base64: resized})
        }
        catch (err) {
          this.cropErrorText = err
          this.$emit('imageReady', false)
        }
      })
    },
  },

  watch: {
    externalFile () {
      this.loadExternalFile()
    }
  }
}

async function urlToFile(url, filename, mimeType){
  let res = await fetch(url)
  let buffer = await res.arrayBuffer()
  return new File([buffer], filename, {type: mimeType})
}
</script>

<style lang="scss" scoped>
.cropContainer {
  display: grid;
  grid-template-columns: auto auto;
  gap: 2.5rem;

  @media screen and (max-width: 600px) {
    grid-template-columns: auto;
    gap: 1rem;
  }
}
</style>
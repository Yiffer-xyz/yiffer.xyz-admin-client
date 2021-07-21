<template>
  <span>
    <h1>Pending: {{$route.params.comicName}}</h1>
    <span v-if="comic">
      <LoadingButton v-if="$store.getters.userData.userType === 'admin' && publishResponseMessageType !== 'success'"
                     :isLoading="isPublishingComic"
                     class="y-button button-with-icon marginAuto mt-32"
                     :isDisabled="!canPublish || isMarkingComicError"
                     @click="processComic"
                     iconType="check"
                     color="primary"
                     text="Approve &amp; publish comic"/>

      <p v-if="comic.errorText" class="mt-16">
        Error: {{comic.errorText}}
      </p>

      <LoadingButton v-if="$store.getters.userData.userType === 'admin' && comic.errorText"
                     :isLoading="isSubmittingComicError"
                     class="y-button marginAuto mt-8"
                     @click="submitComicError()"
                     text="Remove error"/>

      <button v-if="$store.getters.userData.userType === 'admin' && !comic.errorText && !isMarkingComicError"
              class="y-button y-button-neutral marginAuto mt-16"
              @click="initializeErrorMarking()">
        Mark as needing fix
      </button>

      <div v-if="isMarkingComicError" class="mt-16 verticalFlex alignItemsStart marginAuto fitContent">
        <p class="bold">
          Set comic error
        </p>

        <TextInput :value="comicErrorText"
                   @change="newText => comicErrorText = newText"
                   textAlign="left"
                   style="width: 16rem;"
                   title="Error text"/>

        <div class="horizontalFlex mt-16">
          <button class="y-button y-button-neutral mr-8"
                  v-for="errorTxt in errorTexts"
                  :key="errorTxt.short"
                  @click="comicErrorText = errorTxt.long">
            {{errorTxt.short}}
          </button>
        </div>


        <div class="horizontalFlex mt-16" style="align-self: flex-end">
          <button class="y-button y-button-neutral button-with-icon mr-8"
                  @click="isMarkingComicError = false">
            <CrossIcon title=""/>
            Cancel
          </button>

          <LoadingButton :isLoading="isSubmittingComicError"
                         @click="submitComicError()"
                         color="primary"
                         iconType="check"
                         :isDisabled="!comicErrorText"
                         text="Set error"/>
        </div>
      </div>


      <ResponseMessage :message="publishResponseMessage"
                       :messageType="publishResponseMessageType"
                       preventClose
                       class="mt-16 mb-16" />

      <h2 class="mt-32">Thumbnail</h2>
      
      <span v-if="comic.hasThumbnail">
        <img :src="`${config.comicsBaseUrl}/${$route.params.comicName}/thumbnail.webp?${randomQueryString}`"/>
      </span>

      <ResponseMessage :message="thumbnailResponseMessage"
                       :messageType="thumbnailResponseMessageType"
                       @closeMessage="() => thumbnailResponseMessage = ''"
                       class="mt-16 mb-16" />

      <span style="display: flex; align-items: center; flex-direction: column;">
        <p v-if="!comic.hasThumbnail">
          There is no thumbnail yet! Help out by adding one? Find the guidelines in the mod panel's Adding new comic section.
        </p>

        <p v-if="comic.hasThumbnail && thumbnailFile"
           class="thumbnailNotice">
          IMPORTANT: When replacing a thumbnail, you should <i>not</i> use the existing one and resize it. This will reduce the overall quality of the resulting thumbnail. Please, use a high-resolution image, typically one of the comic's pages, and crop/resize that.
        </p>

        <div class="cropContainer" :class="{'borderedContainer': isThumbnailReadyForCrop}">
          <ImageCropper :buttonText="comic.hasThumbnail ? 'Replace thumbnail (click/drop)' : 'Select file (click/drop)'"
                        @imageReady="isReady => isThumbnailReady = isReady"
                        @readyForCrop="isReadyForCrop => setReadyForCrop('new', isReadyForCrop)"
                        @handleImage="data => croppedThumbnail = data.file"
                        :key="resizerKey"
                        v-if="!isPageThumbnailReadyForCrop"/>

          <!-- TODO -->
          <!-- <ImageCropper buttonText="Crop page 1 as thumbnail"
                        @imageReady="isReady => isThumbnailReady = isReady"
                        @readyForCrop="isReadyForCrop => setReadyForCrop('page', isReadyForCrop)"
                        @handleImage="data => croppedThumbnail = data.file"
                        disableUpload
                        @disabledUploadClick="setPage1ThumbnailFile"
                        :externalFile="externalThumbnailFile"
                        :key="resizerKey + 'a'"
                        v-if="!isNewFileThumbnailReadyForCrop"/> -->

          <hr v-if="isThumbnailReadyForCrop || isPageThumbnailReadyForCrop" class="mt-16"/>

          <div class="horizontalFlex mt-16" v-if="isThumbnailReadyForCrop || isPageThumbnailReadyForCrop">
            <button class="y-button y-button-neutral mr-8" @click="resetResizer">
              Cancel
            </button>
            <LoadingButton iconType="check"
                           :isLoading="isSubmittingThumbnail"
                           :isDisabled="!isThumbnailReady"
                           @click="uploadThumbnailImage()"
                           text="Submit thumbnail"
                           class="y-button button-with-icon"/>
          </div>
        </div>
      </span>

      <Keywords :comic="comic"
                :isLoadingComic="isLoadingComic"
                @reloadComic="reloadComic()"/>

      <EditInfo :initialComic="comic"
                @reloadComic="reloadComic()"/>

      <h2 class="mt-48 mb-8">
        Comic pages
      </h2>

      <div class="horizontalFlex marginAuto">
        <button v-if="!isAppendingOrReplacingPages"
                @click="isAppendingPages = true"
                class="y-button mr-8">
          Append pages
        </button>
        <button v-if="!isAppendingOrReplacingPages"
                @click="isReplacingPages = true"
                class="y-button">
          Replace all pages
        </button>
      </div>

      <Loading v-if="isSubmittingPages"
               style="margin-top: 0.5rem;"
               :text="uploadPercent===100 ? `Uploading: ${uploadPercent}%` : 'Processing...'" />

      <ResponseMessage :message="pagesResponseMessage"
                       :messageType="pagesResponseMessageType"
                       @closeMessage="() => pagesResponseMessage = ''"
                       class="mt-24 mb-24"/>

      <div v-if="isAppendingOrReplacingPages && !isSubmittingPages" class="verticalFlex">
        <div class="horizontalFlex">
          <button class="y-button y-button-neutral mr-8" @click="cancelAppendingOrReplacingPages"> 
            Cancel
          </button>
          <form enctype="multipart/form-data" novalidate>
            <div class="pretty-input-upload">
              <input type="file" multiple="true" @change="processApendFilesUploadChange" id="appendPagesFiles" accept="image/png,image/jpeg" class="input-file"/>
              <p v-if="isAppendingPages">
                Select files to append
              </p>
              <p v-else>
                Select new files
              </p>
            </div>
          </form>
        </div>

        <div v-if="filesAreInput" class="marginAuto mt-8 verticalFlex alignItemsStart fitContent">
          <p>
            <b>{{selectedFiles.length}}</b> Selected files:
          </p>
          <p class="courier" v-for="fileName in selectedFileNames" :key="fileName">
            {{fileName}}
          </p>
          <p>
            <i>Make sure these are ordered correctly!</i>
          </p>

          <button v-if="selectedFiles.length" @click="uploadPages" class="y-button mt-8 button-with-icon">
            <CheckIcon/>
            {{isAppendingPages ? 'Append' : 'Replace all current pages with these'}}
            {{selectedFiles.length}} pages
          </button>
        </div>
      </div>

      <div class="horizontalFlex mt-8" :style="{visibility: isAppendingOrReplacingPages ? 'hidden' : 'visible'}">
        <button @click="fitImages('full')" class="y-button y-button-neutral" style="margin: 4px;">Full size</button>
        <button @click="fitImages('fit')" class="y-button y-button-neutral" style="margin: 4px;">Fit images to page</button>
        <button @click="fitImages('small')" class="y-button y-button-neutral" style="margin: 4px;">Small</button>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center;">
        <img  
          v-for="pageNumber in comic.numberOfPages" 
          :src="`${config.comicsBaseUrl}/${$route.params.comicName}/${formattedPageNumber(pageNumber)}.jpg?${randomQueryString}`"
          :key="pageNumber"
          :id="`comicPage${pageNumber}`"
          :class="['comic-page', 'image-fit-full', 'comic-page-pending']"/>
      </div>

      <br/>
      <button class="y-button y-button-neutral marginAuto margin-bottom-16 fitContent"
              @click="scrollToTop()">
        <UpArrow/> to top
      </button>
    </span>
    <span v-if="comicLoadErrorMessage">
      <p class="error-message margin-top-32">{{comicLoadErrorMessage}}</p>
    </span>
  </span>
</template>

<script>
import UpArrow from 'vue-material-design-icons/ArrowUp.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import CrossIcon from 'vue-material-design-icons/Close.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import ResponseMessage from '@/components/ResponseMessage.vue'
import Loading from '@/components/LoadingIndicator.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import TextInput from '@/components/TextInput.vue'

import comicApi from '@/api/comicApi'
import config from '@/config.json'
import EditInfo from './PKInfo.vue'
import Keywords from './PKKeywords.vue'

export default {
  name: 'pendingComic',

  components: {
    UpArrow, CrossIcon, CheckIcon,
    EditInfo, Keywords,
    ResponseMessage,
    Loading,
    TextInput,
    ImageCropper,
    LoadingButton,
  },

  data () {
    return {
      config,
      isLoadingComic: false,
      comic: undefined,
      thumbnailFile: undefined,

      isAppendingPages: false,
      isReplacingPages: false,
      
      selectedFiles: [],

      uploadPercent: undefined,
      comicLoadErrorMessage: '',

      isSubmittingThumbnail: false,
      thumbnailResponseMessage: '',
      thumbnailResponseMessageType: 'error',
      croppedThumbnail: null,
      externalThumbnailFile: null,

      isThumbnailReady: false,
      isThumbnailReadyForCrop: false,
      isNewFileThumbnailReadyForCrop: false,
      isPageThumbnailReadyForCrop: false,
      resizerKey: Math.random().toString(),

      isSubmittingComicError: false,
      isMarkingComicError: false,
      comicErrorText: '',

      isSubmittingPages: false,
      pagesResponseMessage: '',
      pagesResponseMessageType: 'error',

      randomQueryString: Math.random().toString(),

      isPublishingComic: false,
      publishResponseMessage: '',
      publishResponseMessageType: 'error',

      errorTexts,
    }
  },

  computed: {
    isAppendingOrReplacingPages () {
      return this.isReplacingPages || this.isAppendingPages
    },

    filesAreInput () {
      return this.selectedFiles.length > 0 
    },
    selectedFileNames () {
      return this.selectedFiles.map( file => file.name )
    },

    canPublish () {
      return this.comic 
        && this.comic.keywords && this.comic.keywords.length > 0
        && this.comic.hasThumbnail
        && !this.hasChangedData
    }
  },

  async mounted () {
    this.reloadComic()
  },

  methods: {
    setReadyForCrop (cropperType, isReady) {
      if (isReady) {
        if (cropperType === 'page') {
          this.isPageThumbnailReadyForCrop = true
          this.isNewFileThumbnailReadyForCrop = false
        }
        else if (cropperType === 'new') {
          this.isNewFileThumbnailReadyForCrop = true
          this.isPageThumbnailReadyForCrop = false
        }
      }
      else {
        this.isNewFileThumbnailReadyForCrop = false
        this.isPageThumbnailReadyForCrop = false
        this.croppedThumbnail = null
        this.externalThumbnailFile = null
      }

      this.isThumbnailReadyForCrop = isReady
    },

    async setPage1ThumbnailFile () {
      // todo
      // this.externalThumbnailFile = page1File
    },
    
    resetResizer () {
      this.isThumbnailReady = false
      this.isThumbnailReadyForCrop = false
      this.resizerKey = Math.random().toString()
      this.isNewFileThumbnailReadyForCrop = false
      this.isPageThumbnailReadyForCrop = false
      this.croppedThumbnail = null
      this.externalThumbnailFile = null
    },

    processFileUploadChange (changeEvent) {
      this.thumbnailFile = changeEvent.target.files[0]
    },
    
    async uploadThumbnailImage () {
      this.thumbnailResponseMessage = ''

      this.isSubmittingThumbnail = true
      let response = await comicApi.addThumbnailToPendingComic(this.comic, this.croppedThumbnail)
      this.isSubmittingThumbnail = false

      if (response.success) {
        this.thumbnailResponseMessage = 'Success adding thumbnail!'
        this.thumbnailResponseMessageType = 'success'
        this.thumbnailFile = undefined
        this.randomQueryString = Math.random().toString()
        this.resetResizer()
      }
      else {
        this.thumbnailResponseMessage = 'Error adding thumbnail: ' + response.message
        this.thumbnailResponseMessageType = 'error'
      }
    },

    initializeErrorMarking () {
      this.comicErrorText = ''
      this.isMarkingComicError = true
    },

    async submitComicError () {
      this.isSubmittingComicError = true

      if (!this.comicErrorText) {
        await comicApi.setPendingComicNeedingFix(this.comic.id, null)
        this.comic.errorText = null
      }
      else {
        await comicApi.setPendingComicNeedingFix(this.comic.id, this.comicErrorText)
        this.comic.errorText = this.comicErrorText
      }

      this.isSubmittingComicError = false
      this.comicErrorText = ''
      this.isMarkingComicError = false
      this.reloadComic()
    },

    async processComic () {
      this.isPublishingComic = true
			let response = await comicApi.processPendingComic(this.comic.id, true)
      this.isPublishingComic = false
      
      if (response.success) {
        this.publishResponseMessage = `Published ${this.comic.name}`
        this.publishResponseMessageType = 'success'
			}
			else {
        this.publishResponseMessage = response.message
        this.publishResponseMessageType = 'error'
			}
    },
    
    processApendFilesUploadChange (changeEvent) {
      this.selectedFiles = [...changeEvent.target.files]
    },

    cancelAppendingOrReplacingPages () {
      this.selectedFiles = []
      this.isAppendingPages = false
      this.isReplacingPages = false
    },
    
    async uploadPages () {
      let mode = this.isAppendingPages ? 'addpages' : 'replacepages'
      this.isSubmittingPages = true
      let response = await comicApi.uploadPendingComicPages(mode, this.comic, this.selectedFiles, this.updateUploadProgress)
      this.isSubmittingPages = false

      this.uploadPercent = undefined

      if (response.success) {
        this.pagesResponseMessage = `Success appending ${this.selectedFiles.length} pages to comic!`
        this.pagesResponseMessageType = 'success'
        this.selectedFiles = []
        this.isAppendingPages = false
        this.isReplacingPages = false
        this.comic.numberOfPages = 0
        this.reloadComic()
      }
      else {
        this.pagesResponseMessage = response.message
        this.pagesResponseMessageType = 'error'
      }
    },
    
    updateUploadProgress (progressEvent) {
      this.uploadPercent = Math.round((progressEvent.loaded/progressEvent.total)*100)
    },

    fitImages (fit) {
      document.querySelectorAll('.comic-page').forEach(page => {
        page.classList.remove('image-fit-full')
        page.classList.remove('image-fit-small')
        if (fit === 'fit') {
          page.classList.add('image-fit-full')
        }
        else if (fit === 'small') {
          page.classList.add('image-fit-small')
        }
      })
    },

    async reloadComic () {
      this.isLoadingComic = true
      let response = await comicApi.getPendingComic(this.$route.params.comicName)
      this.isLoadingComic = false
      if (response.success) {
        this.comic = response.result
      }
      else {
        this.comicLoadErrorMessage = response.message
      }
    },

    formattedPageNumber (pageNumber) {
      return pageNumber<100 ? (pageNumber<10 ? '00'+pageNumber : '0'+pageNumber) : pageNumber
    },
    
    scrollToTop () {
      window.scrollTo(0, 0)
    }
  },

  metaInfo () {
    let title = `Pending: ${this.$route.params.comicName} - Yiffer.xyz`
    return {
      title: title,
      meta: [
        {vmid: 'twitterTitle', name: 'twitter:title', content: title},
        {vmid: 'ogTitle', property: 'og:title', content: title},
        {vmid: 'twitterDesc', name: 'twitter:description', content: "The internet's best collection of high quality furry porn comics, easily readable and free!"},
        {vmid: 'ogDesc', property: 'og:description', content: "The internet's best collection of high quality furry porn comics, easily readable and free!"},
      ]
    }
  },
}

const errorTexts = [
  {short: 'Thumb', long: 'Thumbnail'},
  {short: 'Res.', long: 'Varying page res.'},
]
</script>

<style lang="scss" scoped>
.image-fit-full {
  max-width: 100vw;
  max-height: 100vh;
}
.image-fit-small {
  max-width: 240px;
  max-width: 240px;
}
.comic-page-pending {
  margin: 6px;
}
.thumbnailNotice {
  max-width: 40rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
}

.cropContainer {
  padding: 1rem;
  border-radius: 4px;
}
.borderedContainer {
  border: 3px solid $themeGreen1;
}
</style>

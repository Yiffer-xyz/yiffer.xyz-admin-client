<template>
  <span>
    <h1>Pending: {{$route.params.comicName}}</h1>
    <span v-if="comic">

      <h2 class="mt-32">Thumbnail</h2>
      
      <span v-if="comic.hasThumbnail">
        <img :src="`${config.comicsBaseUrl}/${comic.name}/thumbnail.webp`"/>
      </span>

      <ResponseMessage :message="thumbnailResponseMessage"
                       :messageType="thumbnailResponseMessageType"
                       @closeMessage="() => thumbnailResponseMessage = ''"
                       outsideStyle="margin-top: 0.5rem;" />

      <Loading v-if="isSubmittingThumbnail" text="Submitting" />

      <span v-else style="display: flex; align-items: center; flex-direction: column;">
        <p v-if="!comic.hasThumbnail">
          There is no thumbnail yet! Help out by adding one? Find the guidelines in the mod panel's Adding new comic section.
        </p>
        <form enctype="multipart/form-data" novalidate style="width: fit-content" class="margin-top-8">
          <div class="pretty-input-upload">
            <input type="file" multiple="false" @change="processFileUploadChange" id="newPageFiles" accept="image/x-png,image/jpeg" class="input-file"/>
            <p v-if="!comic.hasThumbnail">Select file</p>
            <p v-else>Add new thumbnail</p>
          </div>
        </form>
        <button v-if="thumbnailFile" @click="processNewThumbnail()" class="y-button margin-top-8">
          Add {{thumbnailFile.name}} as thumbnail
        </button>
      </span>


      <h2 class="margin-top-32">Tags</h2>
      <p v-if="comic.keywords.length === 0">No tags have been added.</p>
      
      <ResponseMessage :message="keywordResponseMessage"
                       :messageType="keywordResponseMessageType"
                       @closeMessage="() => keywordResponseMessage = ''"
                       outsideStyle="margin-top: 0.5rem;" />

      <Loading v-if="isSubmittingKeywords" text="Submitting" style="padding-top: 5.5rem; height: 6.5rem;"/>

      <div v-else class="horizontalFlex" style="width: 100%; margin-top: 8px;">
        <div class="verticalFlex" style="margin: 0 12px 0 0;">
          <p class="admin-mini-header">Tag list</p>
          <select size="8" style="margin-bottom: 0" v-model="selectedKeyword" @keyup.13="addSelectedKeyword()"> 
            <option v-for="keyword in keywordsNotInComic" :key="keyword.name" :value="keyword">{{keyword.name}}</option>
          </select>
          <button class="y-button y-button-small y-button-neutral" @click="addSelectedKeyword()" style="width: 100%; margin-top: 1px;">
            <RightArrow/>
          </button>
        </div>
      
        <div class="verticalFlex" style="margin: 0 12px 0 12px;">
          <p class="admin-mini-header">Tags you're adding</p>
          <p v-if="selectedKeywords.length > 0" style="margin-bottom: 6px;">Click tag to <span class="red-color">remove</span></p>
          <p v-for="keyword in selectedKeywords" @click="removeKeywordFromSelection(keyword)" 
             :key="keyword.name" class="selected-add-keyword">{{keyword.name}}</p>
          <button class="y-button" v-if="selectedKeywords.length > 0"
                  @click="confirmAddKeywords()" style="margin: 6px auto 0 auto;">
            Add tags
          </button>
        </div>
      
        <div class="verticalFlex" style="margin: 0 0 0 12px;">
          <p class="admin-mini-header">This comic's tags</p>
          <p v-if="comic.keywords.length > 0" style="margin-bottom: 6px;">
            Click tags to <span class="red-color">remove</span>
          </p>
          <p v-for="keyword in comic.keywords" @click="addOrRemoveKeywordToDeleteList(keyword)" 
             :key="keyword.name" class="selected-add-keyword" 
             :class="{'keyword-to-be-deleted': keywordsToDelete.findIndex(kw=>kw.id===keyword.id)>=0}">{{keyword.name}}</p>
          <button @click="confirmRemoveKeywords()" class="y-button y-button-red"
                  v-if="keywordsToDelete.length > 0" style="margin: 6px auto 0 auto;">
            Remove tags
          </button>
        </div>
      </div>



      <h2 class="margin-top-32">Comic pages</h2>
      <button v-if="!appendPages"
              @click="appendPages = true"
              class="y-button y-button-neutral marginAuto mt-4 fitContent">
        Append pages
      </button>

      <Loading v-if="isSubmittingPages"
               style="margin-top: 0.5rem;"
               :text="uploadPercent===100 ? `Uploading: ${uploadPercent}%` : 'Processing...'" />

      <ResponseMessage :message="pagesResponseMessage"
                       :messageType="pagesResponseMessageType"
                       @closeMessage="() => pagesResponseMessage = ''"
                       outsideStyle="margin-top: 1rem;" />

      <span v-if="appendPages && !isSubmittingPages"
            style="display: flex; align-items: center; flex-direction: column; mt-4">
        <form enctype="multipart/form-data" novalidate>
          <div class="pretty-input-upload">
            <input type="file" multiple="true" @change="processApendFilesUploadChange" id="appendPagesFiles" accept="image/x-png,image/jpeg" class="input-file"/>
            <p>Select files</p>
          </div>
        </form>

        <p v-if="filesAreInput" class="margin-top-4 no-margin-bot"><b>{{selectedFiles.length}}</b> Selected files:</p>
        <p v-if="filesAreInput" class="courier">{{selectedFileNames.join(', ')}}</p>

        <button v-if="selectedFiles.length" @click="uploadAppendPages" class="y-button margin-top-8">Submit {{selectedFiles.length}} pages</button>
      </span>

      <div class="horizontalFlex margin-top-16">
        <button @click="fitImages('full')" class="y-button y-button-neutral" style="margin: 4px;">Full size</button>
        <button @click="fitImages('fit')" class="y-button y-button-neutral" style="margin: 4px;">Fit images to page</button>
        <button @click="fitImages('small')" class="y-button y-button-neutral" style="margin: 4px;">Small</button>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center;">
        <img  
          v-for="pageNumber in comic.numberOfPages" 
          :src="`${config.comicsBaseUrl}/${comic.name}/${formattedPageNumber(pageNumber)}.jpg`"
          :key="pageNumber"
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
import BackArrow from 'vue-material-design-icons/Undo.vue'
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'
import ResponseMessage from '@/components/ResponseMessage.vue'
import Loading from '@/components/LoadingIndicator.vue'

import comicApi from '@/api/comicApi'
import keywordApi from '@/api/keywordApi'
import { mapGetters } from 'vuex'
import config from '@/config.json'

export default {
  name: 'pendingComic',

  components: {
    UpArrow,
    BackArrow,
    RightArrow,
    ResponseMessage,
    Loading,
  },

  data: function () {
    return {
      config,
      comic: undefined,
      keywordsNotInComic: [],
      selectedKeyword: undefined,
      selectedKeywords: [],
      keywordsToDelete: [],
      thumbnailFile: undefined,
      appendPages: false,
      selectedFiles: [],
      uploadPercent: undefined,
      comicLoadErrorMessage: '',

      isSubmittingThumbnail: false,
      thumbnailResponseMessage: '',
      thumbnailResponseMessageType: 'error',

      isSubmittingKeywords: false,
      keywordResponseMessage: '',
      keywordResponseMessageType: 'error',

      isSubmittingPages: false,
      pagesResponseMessage: '',
      pagesResponseMessageType: 'error',
    }
  },

  computed: {
    ...mapGetters([
      'allKeywords',
    ]),
    filesAreInput () { return this.selectedFiles.length > 0 },
    selectedFileNames () { return this.selectedFiles.map( file => file.name ) },
  },

  async mounted () {
    this.reloadComic()
    if (!this.allKeywords.fetched && !this.allKeywords.fetching) {
      this.$store.dispatch('fetchKeywordList')
    }
  },

  methods: {
    processFileUploadChange (changeEvent) {
      this.thumbnailFile = changeEvent.target.files[0]
    },
    
    async processNewThumbnail () {
      let fileReader = new FileReader()
      fileReader.onload = () => {
        let tempImage = new Image()
        tempImage.src = fileReader.result
        tempImage.onload = () => {
          if (tempImage.width !== 200 || tempImage.height !== 283) {
            this.thumbnailResponseMessage = `The image does not match the 200x283 pixel requirement (is ${tempImage.width}x${tempImage.height}).`
            this.thumbnailResponseMessageType = 'error'
          }
          else {
            this.uploadThumbnailImage()
          }
        }
      }
      fileReader.readAsDataURL(this.thumbnailFile)
    },

    async uploadThumbnailImage () {
      this.thumbnailResponseMessage = ''

      this.isSubmittingThumbnail = true
      let response = await comicApi.addThumbnailToPendingComic(this.comic, this.thumbnailFile)
      this.isSubmittingThumbnail = false

      if (response.success) {
        this.thumbnailResponseMessage = 'Success adding thumbnail!'
        this.thumbnailResponseMessageType = 'success'
        window.location.reload()
        this.thumbnailFile = undefined
      }
      else {
        this.thumbnailResponseMessage = 'Error adding thumbnail: ' + response.message
        this.thumbnailResponseMessageType = 'error'
      }
    },

    addSelectedKeyword () {
      if (!this.selectedKeywords.find(kw => kw.id === this.selectedKeyword.id)) {
        this.selectedKeywords.push(this.selectedKeyword)
      }
    },

    removeKeywordFromSelection (keyword) {
      this.selectedKeywords.splice(this.selectedKeywords.findIndex(kw => kw.id === keyword.id), 1)
    },

    addOrRemoveKeywordToDeleteList (keyword) {
      if (!this.keywordsToDelete.find(kw => kw.id === keyword.id)) {
        this.keywordsToDelete.push(keyword)
      }
      else {
        this.keywordsToDelete.splice(this.keywordsToDelete.findIndex(kw => kw.id === keyword.id), 1)
      }
    },
    
    async confirmAddKeywords () {
      this.isSubmittingKeywords = true
      let response = await keywordApi.addKeywordsToPendingComic(this.comic, this.selectedKeywords)
      this.isSubmittingKeywords = false

      if (response.success) {
        this.keywordResponseMessage = 'Successfully added tags!'
        this.keywordResponseMessageType = 'success'
        this.selectedKeywords = []
        this.reloadComic()
      }
      else {
        this.keywordResponseMessage = 'Error adding tags: ' + response.message
        this.keywordResponseMessageType = 'error'
      }
    },

    async confirmRemoveKeywords () {
      this.isSubmittingKeywords = true
      let response = await keywordApi.removeKeywordsFromPendingComic(this.comic, this.keywordsToDelete)
      this.isSubmittingKeywords = false

      if (response.success) {
        this.keywordResponseMessage = 'Successfully removed tags!'
        this.keywordResponseMessageType = 'success'
        this.keywordsToDelete = []
        this.reloadComic()
      }
      else {
        this.keywordResponseMessage = 'Error removing tags: ' + response.message
        this.keywordResponseMessageType = 'error'
      }
    },
    
    processApendFilesUploadChange (changeEvent) {
      this.selectedFiles = [...changeEvent.target.files]
    },
    
    async uploadAppendPages () {
      this.isSubmittingPages = true
      let response = await comicApi.addPagesToPendingComic(this.comic, this.selectedFiles, this.updateUploadProgress)
      this.isSubmittingPages = false

      this.uploadPercent = undefined

      if (response.success) {
        this.pagesResponseMessage = `Success adding ${this.selectedFiles.length} pages to comic!`
        this.pagesResponseMessageType = 'success'
        this.selectedFiles = []
        this.appendPages = false
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
      let response = await comicApi.getPendingComic(this.$route.params.comicName)
      if (response.success) {
        this.comic = response.result
        this.keywordsNotInComic = this.allKeywords.payload
          .filter(kw => !this.comic.keywords.find(comicKw => comicKw.id === kw.id))
          .sort((kw1, kw2) => kw1.name > kw2.name ? 1 : -1)
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
</script>

<style lang="scss">
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
</style>

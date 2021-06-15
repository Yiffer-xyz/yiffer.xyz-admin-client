<template>
  <span>
    <h1>Pending: {{$route.params.comicName}}</h1>
    <span v-if="comic">

      <h2 class="mt-32">Thumbnail</h2>
      
      <span v-if="comic.hasThumbnail">
        <img :src="`${config.comicsBaseUrl}/${comic.name}/thumbnail.webp?${randomQueryString}`"/>
      </span>

      <ResponseMessage :message="thumbnailResponseMessage"
                       :messageType="thumbnailResponseMessageType"
                       @closeMessage="() => thumbnailResponseMessage = ''"
                       class="mt-16 mb-16" />

      <span style="display: flex; align-items: center; flex-direction: column;">
        <p v-if="!comic.hasThumbnail">
          There is no thumbnail yet! Help out by adding one? Find the guidelines in the mod panel's Adding new comic section.
        </p>
        <form enctype="multipart/form-data" v-if="!thumbnailFile" novalidate style="width: fit-content" class="margin-top-8">
          <div class="pretty-input-upload">
            <input type="file" multiple="false" @change="processFileUploadChange" id="newPageFiles" accept="image/x-png,image/jpeg" class="input-file"/>
            <p v-if="!comic.hasThumbnail">
              Select file
            </p>
            <p v-else>
              Replace thumbnail
            </p>
          </div>
        </form>
        <div class="horizontalFlex mt-8" v-if="thumbnailFile">
          <button class="y-button y-button-neutral mr-8" @click="thumbnailFile = null">
            Cancel
          </button>
          <LoadingButton iconType="check"
                         :isLoading="isSubmittingThumbnail"
                         @click="processNewThumbnail()"
                         :text="`Replace thumbnail with ${thumbnailFile.name}`"
                         class="y-button button-with-icon">
            
          </LoadingButton>
        </div>
      </span>


      <ResponseMessage :message="keywordResponseMessage"
                       :messageType="keywordResponseMessageType"
                       @closeMessage="() => keywordResponseMessage = ''"
                       outsideStyle="margin-top: 2rem;" />

      <div class="mt-32 width100">
        <div class="tagsContainer">
          <div class="verticalFlex alignItemsStart">
            <p class="admin-mini-header">
              Existing tags
            </p>

            <p v-if="comic && comic.keywords.length === 0">
              No tags yet
            </p>

            <p v-for="keyword in comic.keywords"
                @click="addOrRemoveKeywordToDeleteList(keyword)" 
                :key="keyword.id" class="selected-add-keyword" 
                :class="{'keyword-to-be-deleted': keywordsToDelete.findIndex(kw=>kw.id===keyword.id)>=0}">
              {{keyword.name}}
            </p>

            <LoadingButton text="Remove tags"
                           iconType="check"
                           :style="{visibility: keywordsToDelete.length > 0 ? 'visible' : 'hidden'}"
                           :isLoading="isSubmittingRemoveKw"
                           color="error"
                           class="mt-8"
                           @click="confirmRemoveKeywords()"/>
          </div>

          <div class="verticalFlex fitContent alignItemsStart">
            <p class="admin-mini-header newTagsHeader">
              New tags
            </p>

            <Select :options="keywordOptions"
                    isSearchable
                    :resetValue="kwSelectResetValue"
                    searchPlaceholder="Search for tags"
                    @change="newVal => addSelectedKeyword(newVal)"
                    @searchSelectedClicked="logit"
                    class="mb-16"
                    style="margin-top: -1rem;"/>

            <p v-for="keyword in selectedKeywords" 
              @click="removeKeywordFromSelection(keyword)" 
              :key="keyword.id" class="selected-add-keyword">
              {{keyword.name}}
            </p>

            <LoadingButton text="Add tags"
                            v-if="selectedKeywords.length > 0"
                            iconType="check"
                            :isLoading="isSubmittingAddKw"
                            class="mt-8"
                            @click="confirmAddKeywords()"/>
          </div>
        </div>
      </div>

      <h2 class="mt-16 mb-8">Comic pages</h2>
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
              <input type="file" multiple="true" @change="processApendFilesUploadChange" id="appendPagesFiles" accept="image/x-png,image/jpeg" class="input-file"/>
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
          :src="`${config.comicsBaseUrl}/${comic.name}/${formattedPageNumber(pageNumber)}.jpg?${randomQueryString}`"
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
import CheckIcon from 'vue-material-design-icons/Check.vue'
import ResponseMessage from '@/components/ResponseMessage.vue'
import Loading from '@/components/LoadingIndicator.vue'
import Select from '@/components/Select.vue'
import TextInput from '@/components/TextInput.vue'
import LoadingButton from '@/components/LoadingButton.vue'

import comicApi from '@/api/comicApi'
import keywordApi from '@/api/keywordApi'
import { mapGetters } from 'vuex'
import config from '@/config.json'

export default {
  name: 'pendingComic',

  components: {
    UpArrow,
    CheckIcon,
    ResponseMessage,
    Loading,
    Select,
    TextInput,
    LoadingButton,
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

      isAppendingPages: false,
      isReplacingPages: false,
      
      selectedFiles: [],

      uploadPercent: undefined,
      comicLoadErrorMessage: '',

      isSubmittingThumbnail: false,
      thumbnailResponseMessage: '',
      thumbnailResponseMessageType: 'error',

      keywordResponseMessage: '',
      keywordResponseMessageType: 'success',
      isSubmittingAddKw: false,
      isSubmittingRemoveKw: false,

      isSubmittingPages: false,
      pagesResponseMessage: '',
      pagesResponseMessageType: 'error',

      kwSelectResetValue: null,
      randomQueryString: Math.random().toString(),
    }
  },

  computed: {
    ...mapGetters([
      'allKeywords', 'alphabeticKeywordList',
    ]),

    isAppendingOrReplacingPages () {
      return this.isReplacingPages || this.isAppendingPages
    },

    keywordOptions () {
      let existingKwIds = this.comic.keywords.map(kw => kw.id)
      let selectedKwIds = this.selectedKeywords.map(kw => kw.id)

      return this.alphabeticKeywordList
        .filter(kw => !existingKwIds.includes(kw.id) && !selectedKwIds.includes(kw.id))
        .map(kw => ({text: kw.name, value: kw}))
    },

    filesAreInput () {
      return this.selectedFiles.length > 0 
    },
    selectedFileNames () {
      return this.selectedFiles.map( file => file.name )
    },
  },

  async mounted () {
    this.reloadComic()

    if (!this.allKeywords.fetched && !this.allKeywords.fetching) {
      this.$store.dispatch('fetchKeywordList')
    }
  },

  methods: {
    logit () {
      console.log('ittt')
    },
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

    addSelectedKeyword (keyword) {
      if (!this.selectedKeywords.find(kw => kw.id === keyword.id)) {
        this.selectedKeywords.push(keyword)
      }
      this.kwSelectResetValue = Math.random().toString()
    },

    removeKeywordFromSelection (keyword) {
      this.selectedKeywords.splice(this.selectedKeywords.findIndex(kw => kw.id===keyword.id), 1)
    },

    async addOrRemoveKeywordToDeleteList (keyword) {
      if (!this.keywordsToDelete.find(kw => kw.id===keyword.id)) {
        this.keywordsToDelete.push(keyword)
      }
      else {
        this.keywordsToDelete.splice(this.keywordsToDelete.findIndex(kw => kw.id===keyword.id), 1)
      }
    },
    
    async confirmAddKeywords () {
      this.isSubmittingAddKw = true
      let response = await keywordApi.addKeywordsToPendingComic(this.comic, this.selectedKeywords)
      this.isSubmittingAddKw = false

      if ('error' in response) {
        this.keywordResponseMessage = 'Error adding tags: ' + response.error
        this.keywordResponseMessageType = 'error'
      }
      else {
        this.keywordResponseMessage = 'Successfully added tags!'
        this.keywordResponseMessageType = 'success'
        this.selectedKeywords = []
        this.reloadComic()
      }
    },

    async confirmRemoveKeywords () {
      this.isSubmittingRemoveKw = true
      let response = await keywordApi.removeKeywordsFromPendingComic(this.comic, this.keywordsToDelete)
      this.isSubmittingRemoveKw = false

      if ('error' in response) {
        this.keywordResponseMessage = 'Error removing tags: ' + response.error
        this.keywordResponseMessageType = 'error'
      }
      else {
        this.keywordResponseMessage = 'Successfully removed tags!'
        this.keywordResponseMessageType = 'success'
        this.keywordsToDelete = []
        this.reloadComic()
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
.tagsContainer {
  display: grid;
  grid-template-columns: auto auto;
  width: fit-content;
  margin: auto;
  &>div:first-child {
    @media (min-width: 501px) {
      margin-right: 2.5rem;
    }
    @media (max-width: 500px) {
      margin-bottom: 1rem;
    }
  }

  @media (max-width: 500px) {
    min-width: 0;
    grid-template-columns: auto;
    justify-content: center;
  }
}
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

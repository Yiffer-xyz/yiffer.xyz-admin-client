<template>
  <span>
    <h1>Pending: {{$route.params.comicName}}</h1>
    <span v-if="comic">

      <LoadingButton v-if="$store.getters.userData.userType === 'admin' && publishResponseMessageType !== 'success'"
                     :isLoading="isPublishingComic"
                     class="y-button button-with-icon marginAuto mt-32"
                     :isDisabled="!canPublish"
                     @click="processComic"
                     iconType="check"
                     :text="`Approve & publish comic${hasChangedData ? ' (unsaved changes)' : ''}`"/>
      
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
        <form enctype="multipart/form-data" v-if="!thumbnailFile" novalidate style="width: fit-content" class="margin-top-8">
          <div class="pretty-input-upload">
            <input type="file" multiple="false" @change="processFileUploadChange" id="newPageFiles" accept="image/png,image/jpeg" class="input-file"/>
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


      <!-- COMIC DATA -->
      <h2 class="mt-32 mb-8">Comic data</h2>

      <ResponseMessage :message="updateDataResponseMessage"
                       :messageType="updateDataResponseMessageType"
                       @closeMessage="() => updateDataResponseMessage = ''"
                       class="mt-16 mb-16" />

      <div class="verticalFlex alignItemsStart fitContent marginAuto">
        <TextInput :value="comic.name"
                    @change="newName => comic.name = newName"
                    textAlign="left"
                    title="Comic name"
                    class="mb-24"
                    style="width: 100%;"/>

        <Select :options="artistOptions"
                title="Artist"
                isSearchable
                searchKeepSelected
                initialWidth="10rem"
                :defaultValue="selectedArtist"
                :searchSelected="selectedArtist ? selectedArtist.name : null"
                :resetValue="artistResetValue"
                @searchSelectedClicked="selectedArtist = null"
                @change="onArtistSelect"
                class="mb-24"
                style="width: 100%;"/>

        <div class="horizontalFlex width100 justifyStart">
          <Select :options="categoryOptions"
                  title="Category"
                  :defaultValue="{text: comic.cat, value: comic.cat}"
                  @change="newCat => comic.cat = newCat"
                  class="tagCatSelects mb-24 mr-16"
                  initialWidth="6rem"
                  :resetValue="allSelectResetValue"/>

          <Select :options="tagOptions"
                  title="Classification"
                  :defaultValue="{text: comic.tag, value: comic.tag}"
                  @change="newVal => comic.tag = newVal"
                  class="tagCatSelects ml-8"
                  initialWidth="6rem"
                  :resetValue="allSelectResetValue"/>   
        </div>

        <Select :options="stateOptions"
                title="State"
                :defaultValue="stateOptions.find(so => so.value === comic.state)"
                initialWidth="10rem"
                isFullWidth
                @change="onStateSelect"
                :resetValue="allSelectResetValue"/>  

        <!-- PREVIOUS AND NEXT COMIC LINKS -->
        <p class="admin-mini-header textAlignLeft mt-32">
          Comic links
        </p>
        <Select :options="comicOptions"
                title="Previous comic"
                isSearchable
                searchKeepSelected
                searchPlaceholder="None if left blank"
                initialWidth="16rem"
                :defaultValue="comic.previousComic ? comicOptions.find(co => co.value.name === comic.previousComic) : null"
                :searchSelected="comic.previousComic ? comic.previousComic.name : null"
                :resetValue="prevComicResetValue"
                @searchSelectedClicked="comic.previousComic = null"
                @change="onPrevComicSelect"/>

        <Select :options="comicOptions"
                title="Next comic"
                isSearchable
                searchKeepSelected
                searchPlaceholder="None if left blank"
                initialWidth="16rem"
                class="mt-24"
                :defaultValue="comic.nextComic ? comicOptions.find(co => co.value.name === comic.nextComic) : null"
                :searchSelected="comic.nextComic ? comic.nextComic.name : null"
                :resetValue="nextComicResetValue"
                @searchSelectedClicked="comic.nextComic = null"
                @change="onNextComicSelect"/>

        <div class="horizontalFlex mt-16" v-if="hasChangedData">
          <button class="y-button y-button-neutral mr-8"
                  @click="resetComicData">
            Reset
          </button>
          <LoadingButton :isLoading="isSubmittingDataUpdate"
                         @click="submitDataUpdate"
                         text="Save changes"
                         iconType="save"/>
        </div>
      </div>


      <h2 class="mt-48 mb-8">Comic pages</h2>
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
import { doFetch } from '@/utils/statefulFetch'

import comicApi from '@/api/comicApi'
import keywordApi from '@/api/keywordApi'
import artistApi from '@/api/artistApi'
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
      initialComic: undefined,
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

      isSubmittingDataUpdate: false,
      updateDataResponseMessage: '',
      updateDataResponseMessageType: 'error',

      isPublishingComic: false,
      publishResponseMessage: '',
      publishResponseMessageType: 'error',

      selectedArtist: null,
      artistResetValue: null,
      allSelectResetValue: null,
      prevComicResetValue: null,
      nextComicResetValue: null,
      categoryOptions,
      tagOptions,
      stateOptions,
    }
  },

  computed: {
    ...mapGetters([
      'allKeywords',
      'alphabeticKeywordList',
      'artistList',
      'allComics',
      'comicList',
      'pendingComics',
    ]),

    hasChangedData () {
      let comicKeys = ['tag', 'cat', 'name', 'state']
      for (let key of comicKeys) {
        if (this.comic[key] !== this.initialComic[key]) {
          return true
        }
      }

      if (this.comic.nextComic?.id !== this.initialComic.nextComic?.id) {
        return true
      }
      if (this.comic.previousComic?.id !== this.initialComic.previousComic?.id) {
        return true
      }

      if (this.selectedArtist?.id !== this.initialComic?.artistId) {
        return true
      }

      return false
    },

    artistOptions () {
      return this.artistList.payload.map(a => ({text: a.name, value: a}))
    },

    comicOptions () {
      let comicsMapped = this.allComics.payload.map(c => ({text: c.name, value: c}))
      let pendingComicsMapped = this.pendingComics.payload.map(c => ({text: `PENDING: ${c.name}`, value: c}))
      return comicsMapped.concat(pendingComicsMapped)
    },

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

    canPublish () {
      console.log(this.initialComic.keywords.length > 0)
      return this.initialComic 
        && this.initialComic.keywords && this.initialComic.keywords.length > 0
        && this.initialComic.hasThumbnail
        && !this.hasChangedData
    }
  },

  async mounted () {
    this.reloadComic()

    if (!this.artistList.fetched && !this.artistList.fetching) {
      doFetch(this.$store.commit, 'artistList', artistApi.getArtistList())
    }
    if (!this.allKeywords.fetched && !this.allKeywords.fetching) {
      this.$store.dispatch('fetchKeywordList')
    }
    if (!this.allComics.fetched && !this.allComics.fetching) {
      doFetch(this.$store.commit, 'allComics', comicApi.getAllComics())
    }
    if (!this.pendingComics.fetched && !this.pendingComics.fetching) {
      doFetch(this.$store.commit, 'pendingComics', comicApi.getPendingComics(), comics => (
        comics.map(c => ({...c, isPending: true}))
      ))
    }
  },

  methods: {
    onArtistSelect (artist) {
      this.selectedArtist = artist
      this.artistResetValue = Math.random().toString()
    },

    onStateSelect (newState) {
      this.comic.state = newState
    },

    onPrevComicSelect (prevComic) {
      this.comic.previousComic = prevComic
      this.prevComicResetValue = Math.random().toString()
    },

    onNextComicSelect (nextComic) {
      this.comic.nextComic = nextComic
      this.nextComicResetValue = Math.random().toString()
    },

    resetComicData () {
      this.comic = { ...this.initialComic }
      let randomVal = Math.random().toString()
      this.selectedArtist = this.initialComic.selectedArtist
      this.artistResetValue = randomVal
      this.allSelectResetValue = randomVal
      this.prevComicResetValue = randomVal
      this.nextComicResetValue = randomVal
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

    async submitDataUpdate () {
      this.isSubmittingDataUpdate = true
      let result = await comicApi.updatePendingComicData(
        this.comic.id, this.comic.name, this.selectedArtist.id, this.comic.cat, this.comic.tag, this.comic.state,
        this.comic.nextComic ? {id: this.comic.nextComic.id, isPending: this.comic.nextComic.isPending } : null,
        this.comic.previousComic ? {id: this.comic.previousComic.id, isPending: this.comic.previousComic.isPending } : null,
      )
      this.isSubmittingDataUpdate = false

      if (result.success) {
        this.updateDataResponseMessage = `Success updating ${this.comic.name}`
        this.updateDataResponseMessageType = 'success'
        this.reloadComic()
      }
      else {
        this.updateDataResponseMessage = `Error: ${result.message}`
        this.updateDataResponseMessageType = 'error'
      }
    },

    async processComic () {
      this.isPublishingComic = true
			let response = await comicApi.processPendingComic(this.initialComic.id, true)
      this.isPublishingComic = false
      
      if (response.success) {
        this.publishResponseMessage = `Published ${this.initialComic.name}`
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
      let response = await comicApi.getPendingComic(this.$route.params.comicName)
      if (response.success) {
        this.comic = response.result
        this.initialComic = {
          ...this.comic,
          selectedArtist: {name: response.result.artistName, id: response.result.artistId}
        }

        this.selectedArtist = {name: response.result.artistName, id: response.result.artistId}

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

const categoryOptions = [
  {text: 'Furry', value: 'Furry'},
  {text: 'MLP', value: 'MLP'},
  {text: 'Pokemon', value: 'Pokemon'},
  {text: 'Other', value: 'Other'},
]

const tagOptions = [
  {text: 'M', value: 'M'},
  {text: 'F', value: 'F'},
  {text: 'MF', value: 'MF'},
  {text: 'MM', value: 'MM'},
  {text: 'FF', value: 'FF'},
  {text: 'MF+', value: 'MF+'},
  {text: 'I', value: 'I'},
]

const stateOptions = [
  {text: 'WIP', value: 'wip'},
  {text: 'Finished', value: 'finished'},
  {text: 'Cancelled', value: 'cancelled'},
]
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

<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Add new comic</h2>
    <span class="admin-content-box-inner description-text" v-if="isOpen" ref="innerAdminBox">

        <p class="link-color cursorPointer textAlignLeft"
          @click="isShowingInstructions = !isShowingInstructions">
          {{isShowingInstructions ? 'Hide instructions' : 'Click to show must-know instructions'}}
        </p>

        <div style="max-width: 700px;" v-if="isShowingInstructions">
          <p>
            - Files must be either .jpg or .png. File name does not matter, except for ordering.<br/>
          </p>
          <p class="mt-16">
            - It is <i>very important</i> that pages are named in some ascending order.<br/>
            Example:
            <span class="courier">[01.jpg, 02.jpg, ...]</span>, or 
            <span class="courier">[a.jpg, b.jpg, ...]</span>. Note that
            <span class="courier">[1.jpg, 2.jpg, ...]</span> will not work for more than 9 pages!
          </p>

          <p class="mt-16">
            - If the comic has a cover page, this should be used in the thumbnail. Otherwise, choose an image representing the comic well,
            but not too lewd if possible. Crop edges off of thumbnails!<br/>
          </p>

          <p class="mt-16">
            - Adding tags is optional. Someone else will have to do it if you don't. 
            You can also add tags after finishing this, from the "Pending comics" list.
          </p>
        </div>

      <div>
        <ResponseMessage :message="responseMessage"
                         :messageType="responseMessageType"
                         @closeMessage="closeResponseMessage"
                         class="margin-top-8"
                         style="max-width: 23rem;"/>
          
        <p class="admin-mini-header mt-16 mb-8">
          Basic info
        </p>
        <div class="verticalFlex alignItemsStart">

          <TextInput :value="comicName"
                      @change="newName => comicName = newName"
                      textAlign="left"
                      title="Comic name"
                      class="mb-24"
                      style="width: 100%;"/>

          <Select :options="artistOptions"
                  title="Artist"
                  isSearchable
                  searchKeepSelected
                  initialWidth="10rem"
                  :searchSelected="artist ? artist.name : null"
                  :resetValue="artistResetValue"
                  @searchSelectedClicked="artist = null"
                  @change="onArtistSelect"
                  class="mb-24"
                  style="width: 100%;"/>        

          <div class="horizontalFlex width100 justifyStart">
            <Select :options="categoryOptions"
                    title="Category"
                    @change="newCat => cat = newCat"
                    class="tagCatSelects mb-24 mr-16"
                    :resetValue="selectResetValue"/>

            <Select :options="tagOptions"
                    title="Classification"
                    @change="newVal => tag = newVal"
                    class="tagCatSelects ml-8"
                    :resetValue="selectResetValue"/>   
          </div>

          <Select :options="stateOptions"
                  title="State"
                  initialWidth="10rem"
                  isFullWidth
                  @change="newVal => state = newVal"
                  :resetValue="selectResetValue"/>  
        </div>

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
                :maxWidth="maxContentWidth"
                :searchSelected="previousComic ? previousComic.name : null"
                :resetValue="prevComicResetValue"
                @searchSelectedClicked="previousComic = null"
                @change="onPrevComicSelect"/>

        <Select :options="comicOptions"
                title="Next comic"
                isSearchable
                searchKeepSelected
                searchPlaceholder="None if left blank"
                initialWidth="16rem"
                class="mt-24"
                :maxWidth="maxContentWidth"
                :searchSelected="nextComic ? nextComic.name : null"
                :resetValue="nextComicResetValue"
                @searchSelectedClicked="nextComic = null"
                @change="onNextComicSelect"/>



        <p class="admin-mini-header no-margin-bot mt-32">
          Pages
        </p>
        <form enctype="multipart/form-data" novalidate class="mt-4 inputUploadForm">
          <div class="pretty-input-upload">
            <input type="file" multiple="true" @change="processFileUploadChange" id="newPageFilesAddComic" accept="image/png,image/jpeg" class="input-file"/>
            <p>Select files</p>
          </div>
        </form>
        <p v-if="filesAreInput" class="mb-0 mt-8">
          <b>{{selectedFiles.length}}</b> Selected files:
        </p>
        <p class="courier" v-for="fileName in selectedFileNames" :key="fileName">
          {{fileName}}
        </p>
        <p>
          <i>Make sure these are ordered correctly!</i>
        </p>

        <p class="admin-mini-header no-margin-bot mt-32">
          Thumbnail
        </p>
        <div class="cropContainer"
             :class="{'borderedContainer': isThumbnailReadyForCrop}"
             v-if="!isThumbnailConfirmed">
          <ImageCropper buttonText="Select file (click/drop)"
                        @imageReady="isReady => isThumbnailReady = isReady"
                        @readyForCrop="isReadyForCrop => setReadyForCrop('new', isReadyForCrop)"
                        @handleImage="data => croppedThumbnail = data"
                        :key="resizerKey"
                        v-if="!isPageThumbnailReadyForCrop"/>

          <ImageCropper buttonText="Crop page 1 as thumbnail"
                        @imageReady="isReady => isThumbnailReady = isReady"
                        @readyForCrop="isReadyForCrop => setReadyForCrop('page', isReadyForCrop)"
                        @handleImage="data => croppedThumbnail = data"
                        disableUpload
                        @disabledUploadClick="setPage1ThumbnailFile"
                        :externalFile="externalThumbnailFile"
                        :key="resizerKey + 'a'"
                        :isDisabled="!selectedFiles || selectedFiles.length < 1"
                        v-if="!isNewFileThumbnailReadyForCrop"/>

          <hr v-if="isThumbnailReadyForCrop || isPageThumbnailReadyForCrop" class="mt-16"/>

          <div class="horizontalFlex mt-16" v-if="isThumbnailReadyForCrop || isPageThumbnailReadyForCrop">
            <button class="y-button y-button-neutral mr-8" @click="resetResizer">
              Cancel thumbnail
            </button>
            <button class="y-button button-with-icon"
                    :disabled="!isThumbnailReady"
                    :class="{'y-button-disabled': !isThumbnailReady}"
                    @click="confirmThumbnail">
              <CheckIcon/> Confirm thumbnail
            </button>
          </div>
        </div>

        <div v-if="isThumbnailConfirmed">
          <img :src="croppedThumbnail.base64"/>
          <button class="y-button y-button-neutral button-with-icon" @click="resetResizer">
            <CrossIcon/> Remove thumbnail
          </button>
        </div>

        <p class="admin-mini-header no-margin-bot mt-32">
          Tags
        </p>
        <p>Optional, but appreciated!</p>

        <Select :options="keywordOptions"
                isSearchable
                :resetValue="kwResetValue"
                searchPlaceholder="Search for tags"
                @change="newVal => addSelectedKeyword(newVal)"
                class="mb-16"/>

        <p v-for="keyword in selectedKeywords" 
          @click="removeKeywordFromSelection(keyword)" 
          :key="keyword.id" class="selected-add-keyword">
          {{keyword.name}}
        </p>

        <p class="admin-mini-header no-margin-bot" style="margin-top: 32px;">Finish</p>
        <button v-if="!readyForUpload" class="y-button y-button-disabled" style="margin-top: 4px;">
          Fill in all details and add pages before finishing!
        </button>
        <button @click="confirmAddComic()" v-else class="y-button" style="margin-top: 4px;">
          Add comic!
        </button>
      </div>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import comicApi from '@/api/comicApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import Select from '@/components/Select.vue'
import TextInput from '@/components/TextInput.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import { mapGetters } from 'vuex'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import CrossIcon from 'vue-material-design-icons/Close.vue'

export default {
  name: 'correctComic',

  props: {
    artistList: Array,
    comicList: Array,
    pendingComics: Array,
  },

	components: {
    ResponseMessage, Select, TextInput, ImageCropper,
    CheckIcon, CrossIcon,
  },

  data: function () {
    return {
			isOpen: false,
      isShowingInstructions: false,
      comicName: '',
      artist: undefined,
      tag: undefined,
      cat: undefined,
      state: undefined,
      previousComic: undefined,
      nextComic: undefined,
      selectedFiles: [],
      selectedKeywords: [],
			selectedKeyword: undefined,
      uploadPercent: undefined,
      errorMessageThumbnail: '',
      responseMessage: '',
      responseMessageType: 'info',
      artistResetValue: null,
      categoryOptions,
      tagOptions,
      stateOptions,
      maxContentWidth: 9999,
      prevComicResetValue: null,
      nextComicResetValue: null,
      kwResetValue: null,
      selectResetValue: null,

      isThumbnailReady: false,
      isThumbnailReadyForCrop: false,
      isNewFileThumbnailReadyForCrop: false,
      isPageThumbnailReadyForCrop: false,
      resizerKey: Math.random().toString(),
      croppedThumbnail: null,
      externalThumbnailFile: null,
      isThumbnailConfirmed: false,
    }
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
      this.externalThumbnailFile = this.selectedFiles[0]
    },

    confirmThumbnail () {
      this.isThumbnailConfirmed = true
    },

    resetResizer () {
      this.isThumbnailReady = false
      this.isThumbnailReadyForCrop = false
      this.resizerKey = Math.random().toString()
      this.isNewFileThumbnailReadyForCrop = false
      this.isPageThumbnailReadyForCrop = false
      this.croppedThumbnail = null
      this.externalThumbnailFile = null
      this.isThumbnailConfirmed = false
    },

    addSelectedKeyword (keyword) {
      if (!this.selectedKeywords.find(kw => kw.id === keyword.id)) {
        this.selectedKeywords.push(keyword)
      }
      this.kwResetValue = Math.random().toString()
    },

    removePreviousLink () {
      this.previousComic = undefined
    },
    removeNextLink () {
      this.nextComic = undefined
    },
    processFileUploadChange (changeEvent) {
      let eventFiles = [...changeEvent.target.files]
      this.selectedFiles = eventFiles.sort((f1, f2) => f1.name > f2.name ? 1 : -1)
    },

    removeKeywordFromSelection (keyword) {
      this.selectedKeywords.splice(this.selectedKeywords.findIndex(kw => kw.id===keyword.id), 1)
    },

    async confirmAddComic () {
      let uploadData = {
        comicName: this.comicName,
        artistId: this.artist.id,
        tag: this.tag,
        cat: this.cat,
        state: this.state,
        keywordIds: this.selectedKeywords.map(kw => kw.id),
        previousComic: this.previousComic
          ? { id: this.previousComic.id, isPending: this.previousComic.isPending }
          : null,
        nextComic: this.nextComic
          ? { id: this.nextComic.id, isPending: this.nextComic.isPending }
          : null
			}

      this.responseMessageType = 'info'
      try {
        await comicApi.addNewComic(
          uploadData,
          this.selectedFiles,
          this.croppedThumbnail.file,
          this.updateUploadProgress
        )
      }
      catch (err) {
        this.responseMessage = err.response?.data || 'Unknown server error'
        this.responseMessageType = 'error'
        return
      }
	
      this.responseMessage = `Success adding ${this.comicName}! An admin will review the comic,
        and then (hopefully) publish it! Your suggested comic will now appear under "Pending comics".`
      this.responseMessageType = 'success'
      this.uploadPercent = undefined,
      this.comicName = ''
      this.artist = undefined
      this.cat = undefined
      this.tag = undefined
      this.state = undefined
      this.selectResetValue = Math.random().toString()
      this.kwResetValue = Math.random().toString()
      this.selectedFiles = []
      this.selectedKeywords = []
      this.thumbnailFile = undefined
      this.nextComic = undefined
      this.previousComic = undefined
      this.resetResizer()
      document.getElementById('newPageFilesAddComic').value = ''
      this.$emit('refresh-pending-comics')
		},

    onArtistSelect (artistName) {
      this.artist = this.artistList.find(a => a.name === artistName)
      this.artistResetValue = Math.random().toString()
    },

    onPrevComicSelect (prevComic) {
      if (prevComic.isPending) {
        this.previousComic = this.pendingComics.find(c => c.id === prevComic.id)
      }
      else {
        this.previousComic = this.comicList.find(c => c.id === prevComic.id)
      }
      this.prevComicResetValue = Math.random().toString()
    },

    onNextComicSelect (nextComic) {
      if (nextComic.isPending) {
        this.nextComic = this.pendingComics.find(c => c.id === nextComic.id)
      }
      else {
        this.nextComic = this.comicList.find(c => c.id === nextComic.id)
      }
      this.nextComicResetValue = Math.random().toString()
    },
		
		updateUploadProgress (progressPercent) {
      if (progressPercent === 100) {
        this.responseMessage = `Uploading... ${this.uploadPercent = 100}% - now processing!`
      }
      else {
        this.responseMessage = `Uploading... ${this.uploadPercent = progressPercent}%`
      }
		},
    
    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  computed: {
    ...mapGetters(['allKeywords']),

    artistOptions () {
      return this.artistList.map(a => ({text: a.name, value: a.name}))
    },

    comicOptions () {
      let comicsMapped = this.comicList.map(c => ({text: c.name, value: c}))
      let pendingComicsMapped = this.pendingComics.map(c => ({text: `PENDING: ${c.name}`, value: c}))
      return comicsMapped.concat(pendingComicsMapped)
    },

    keywordOptions () {
      if (!this.allKeywords.fetched) {
        return []
      }

      let selectedKwIds = this.selectedKeywords.map(kw => kw.id)

      return this.allKeywords.payload
        .filter(kw => !selectedKwIds.includes(kw.id))
        .map(kw => ({text: kw.name, value: kw}))
    },

    filesAreInput () {
      return this.selectedFiles.length > 0
    },

    selectedFileNames () {
      return this.selectedFiles.map(file => file.name)
    },

    detailsFilledIn () {
      return this.comicName && this.artist && this.tag && this.cat && this.state
    },

    readyForUpload () {
      return this.detailsFilledIn 
        && this.selectedFiles.length>0
        && !this.errorMessageThumbnail
        && this.croppedThumbnail?.file
        && this.isThumbnailConfirmed
    }
	},

  watch: {
    isOpen () {
      setTimeout(() => {
        if (this.$refs.innerAdminBox && document.body.clientWidth < 400) {
          this.maxContentWidth = this.$refs.innerAdminBox.clientWidth - 32
        }
      }, 25)
    }
  }
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

<style lang="scss" scoped>
.tagCatSelects {
  @media (min-width: 380px) {
    // flex-grow: 1;
  }
}

.cropContainer {
  border-radius: 4px;
}
.borderedContainer {
  border: 3px solid $themeGreen1;
  padding: 1rem;
}
</style>

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
            - It is <i>very important</i> that pages are named in some ascending order.<br/>
            Example:
            <span class="courier">[01.jpg, 02.jpg, ...]</span>, or 
            <span class="courier">[a.jpg, b.jpg, ...]</span>. Note that
            <span class="courier">[1.jpg, 2.jpg, ...]</span> will not work for more than 9 pages!
          </p>

          <p class="margin-top-8">
            - Adding a thumbnail is optional. If you don't someone else will later. <br/>
            - Thumbnails are precisely <u>200x283</u> pixels.<br/>
            - If the comic has a cover page, this should be used in the thumbnail. Otherwise, choose an image representing the comic well,
            but not too lewd if possible. Crop edges off of thumbnails.<br/>
            - There are many good resize/crop tools for making thumbnails. Don't use MSPaint, it destroys the image when scaling.
          </p>

          <p class="margin-top-8">
            - Adding tags is also optional. Again, someone else will have to do it if you don't. 
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
            <input type="file" multiple="true" @change="processFileUploadChange" id="newPageFilesAddComic" accept="image/x-png,image/jpeg" class="input-file"/>
            <p>Select files</p>
          </div>
        </form>
        <p v-if="filesAreInput" class="mb-0 mt-8">
          <b>{{selectedFiles.length}}</b> Selected files:
        </p>
        <p class="courier" v-for="fileName in selectedFileNames" :key="fileName">
          {{fileName}}
        </p>


        <p class="admin-mini-header no-margin-bot mt-32">
          Thumbnail
        </p>
        <form enctype="multipart/form-data" novalidate class="mt-4 inputUploadForm">
          <div class="pretty-input-upload">
            <input type="file" @change="processThumbNailUploadChange" accept="image/x-png,image/jpeg" class="input-file"/>
            <p>Select file</p>
          </div>
        </form>
        <p v-if="thumbnailFile">Selected file: 
          <span class="courier">{{thumbnailFile.name}}</span>
        </p>
        <p class="red-color bold" v-if="errorMessageThumbnail" style="max-width: 20rem;">
          {{errorMessageThumbnail}}
        </p>

        <p class="admin-mini-header no-margin-bot mt-32">
          Tags
        </p>
        <p>Optional, but appreciated!</p>

        <Select :options="keywordOptions"
                isSearchable
                :resetValue="selectResetValue"
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
import CheckboxIcon from 'vue-material-design-icons/CheckboxMarkedCircle.vue'

import comicApi from '@/api/comicApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import Select from '@/components/Select.vue'
import TextInput from '@/components/TextInput.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'correctComic',

  props: {
    artistList: Array,
    comicList: Array,
  },

	components: {
    ResponseMessage, Select, TextInput,
    CheckboxIcon, 
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
      thumbnailFile: undefined,
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
    }
  },

  methods: {
    addSelectedKeyword (keyword) {
      if (!this.selectedKeywords.find(kw => kw.id === keyword.id)) {
        this.selectedKeywords.push(keyword)
      }
      this.selectResetValue = Math.random().toString()
    },

    removePreviousLink () {
      this.previousComic = undefined
    },
    removeNextLink () {
      this.nextComic = undefined
    },
    processFileUploadChange (changeEvent) {
      this.selectedFiles = [...changeEvent.target.files]
    },

    processThumbNailUploadChange (changeEvent) {
      this.thumbnailFile = changeEvent.target.files[0]
      this.processNewThumbnail()
    },

		async processNewThumbnail () {
			this.errorMessageThumbnail = ''
			let fileReader = new FileReader()
			fileReader.onload = () => {
				let tempImage = new Image()
				tempImage.src = fileReader.result
				tempImage.onload = () => {
					if (tempImage.width !== 200 || tempImage.height !== 283) {
						this.errorMessageThumbnail = `Sorry, the image does not match the 200x283 pixel requirement (is ${tempImage.width}x${tempImage.height}).`
					}
				}
			}
			fileReader.readAsDataURL(this.thumbnailFile)
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
        previousComic: this.previousComic ? this.previousComic.id : null,
        nextComic: this.nextComic ? this.nextComic.id : null
			}
      
      this.responseMessageType = 'info'
      try {
        await comicApi.addNewComic(
          uploadData,
          this.selectedFiles,
          this.thumbnailFile,
          this.updateUploadProgress
        )
      }
      catch (err) {
        console.log(err)
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
      this.selectedFiles = []
      this.selectedKeywords = []
      this.thumbnailFile = undefined
      this.nextComic = undefined
      this.previousComic = undefined
      document.getElementById('newPageFilesAddComic').value = ''
      this.$emit('refresh-pending-comics')
		},

    onArtistSelect (artistName) {
      this.artist = this.artistList.find(a => a.name === artistName)
      this.artistResetValue = Math.random().toString()
    },

    onPrevComicSelect (prevComic) {
      this.previousComic = this.comicList.find(c => c.id === prevComic.id)
      this.prevComicResetValue = Math.random().toString()
    },

    onNextComicSelect (nextComic) {
      this.nextComic = this.comicList.find(c => c.id === nextComic.id)
      this.nextComicResetValue = Math.random().toString()
    },
		
		updateUploadProgress (progressPercent) {
      console.log(progressPercent)
			this.responseMessage = `Uploading... ${this.uploadPercent = progressPercent}%`
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
      return this.comicList.map(c => ({text: c.name, value: c}))
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
      return this.detailsFilledIn && this.selectedFiles.length>0 && !this.errorMessageThumbnail
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
</style>

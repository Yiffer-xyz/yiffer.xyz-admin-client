<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Add new comic</h2>
    <span class="admin-content-box-inner description-text" v-if="isOpen">

      <span style="max-width: 700px;">
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
        but not too lewd if possible.<br/>
        - GIMP is a great tool for making thumbnails. Don't use MSPaint, it destroys the image when scaling.
      </p>

      <p class="margin-top-8">
        - Adding tags is also optional. Again, someone else will have to do it if you don't. 
        You can also add tags after finishing this, from the "Pending comics" list.
      </p>
      </span>

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       class="margin-top-8"/>

      <p class="admin-mini-header no-margin-bot" style="margin-top: 16px;">
        Comic details <CheckboxIcon v-if="detailsFilledIn"/>
      </p>
      <table id="newComicTable">
        <tr>
          <td>
            <p>Comic name</p>
          </td>
          <td>
            <input type="text" v-model="comicName">
          </td>
        </tr>
        <tr>
          <td>
            <p>Artist</p>
          </td>
          <td>
            <select v-model="artist">
              <option v-for="artist in artistList" :key="artist.name" :value="artist">
                {{artist.name}}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td>
            <p>Category</p>
          </td>
          <td>
            <select v-model="cat">
              <option value="Furry">Furry</option>
              <option value="MLP">MLP</option>
              <option value="Pokemon">Pokemon</option>
              <option value="Other">Other</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>
            <p>Classification</p>
          </td>
          <td>
            <select v-model="tag">
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="MF">MF</option>
              <option value="MM">MM</option>
              <option value="FF">FF</option>
              <option value="MF+">MF+</option>
              <option value="I">I</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>
            <p>State</p>
          </td>
          <td>
            <select v-model="state">
              <option value="wip">WIP</option>
              <option value="finished">Finished</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </td>
        </tr>
      </table>

      <!-- PREVIOUS AND NEXT COMIC LINKS -->
      <p class="admin-mini-header" style="margin-top: 16px; margin-bottom: 4px;">Comic links</p>
      <div class="horizontalFlex flex-wrap">
        <p>Previous comic </p>
        <select v-model="previousComic" class="margin-bottom-1" style="margin-left: 6px;">
          <option v-for="comic in comicList" :key="comic.id" :value="comic">
            {{comic.name}}
          </option>
        </select>
        <button v-if="previousComic" class="y-button y-button-neutral button-with-icon" 
                style="margin-left: 4px; margin-top: 2px;" @click="removePreviousLink()">
          <CrossIcon/> Remove link
        </button>
      </div>
      <div class="horizontalFlex flex-wrap margin-top-4">
        <p>Next comic </p>
        <select v-model="nextComic" class="margin-bottom-1" style="margin-left: 6px;">
          <option v-for="comic in comicList" :key="comic.id" :value="comic">
            {{comic.name}}
          </option>
        </select>
        <button v-if="nextComic" class="y-button y-button-neutral button-with-icon" 
                style="margin-left: 4px; margin-top: 2px;" @click="removeNextLink()">
          <CrossIcon/> Remove link
        </button>
      </div>


      <p class="admin-mini-header no-margin-bot" style="margin-top: 16px;">Add pages <CheckboxIcon v-if="filesAreInput"/></p>
      <form enctype="multipart/form-data" novalidate style="margin-top: 4px;">
        <div class="pretty-input-upload">
          <input type="file" multiple="true" @change="processFileUploadChange" id="newPageFilesAddComic" accept="image/x-png,image/jpeg" class="input-file"/>
          <p>Select files</p>
        </div>
      </form>
      <p v-if="filesAreInput" style="margin-bottom: 0px;"><b>{{selectedFiles.length}}</b> Selected files:</p>
      <p v-if="filesAreInput" class="courier">{{selectedFileNames.join(', ')}}</p>


      <p class="admin-mini-header no-margin-bot" style="margin-top: 16px;">Add thumbnail <CheckboxIcon v-if="thumbnailFile"/></p>
      <form enctype="multipart/form-data" novalidate style="margin: 4px 0;">
        <div class="pretty-input-upload">
          <input type="file" @change="processThumbNailUploadChange" accept="image/x-png,image/jpeg" class="input-file"/>
          <p>Select file</p>
        </div>
      </form>
      <p v-if="thumbnailFile">Selected file: 
        <span class="courier">{{thumbnailFile.name}}</span>
      </p>
      <p class="red-color bold" v-if="errorMessageThumbnail">{{errorMessageThumbnail}}</p>

      <p class="admin-mini-header no-margin-bot margin-top-16">Add tags <CheckboxIcon v-if="selectedKeywords.length"/></p>
      <p>Adding tags is optional, but appreciated!</p>
      <div class="horizontalFlex margin-top-4">
        <div class="verticalFlex">
          <select size="10" style="margin-bottom: 0" v-model="selectedKeyword" @keyup.13="addSelectedKeyword()"> 
            <option v-for="keyword in allKeywords.payload" :key="keyword.name" :value="keyword">{{keyword.name}}</option>
          </select>
          <button class="y-button y-button-small y-button-neutral" @click="addSelectedKeyword()" style="width: 100%; margin-top: 1px;">
            <RightArrow/>
          </button>
        </div>
      
        <div class="verticalFlex" style="margin-left: 15px;">
          <p style="margin-bottom: 6px;">Click to <span class="red-color">remove</span></p>
          <p v-for="keyword in selectedKeywords" @click="removeKeywordFromSelection(keyword)" 
             :key="keyword.name" class="selected-add-keyword">{{keyword.name}}</p>
        </div>
      </div>

      <p class="admin-mini-header no-margin-bot" style="margin-top: 32px;">Finish</p>
      <button v-if="!readyForUpload" class="y-button y-button-disabled" style="margin-top: 4px;">
        Fill in all details and add pages before finishing!
      </button>
      <button @click="confirmAddComic()" v-else class="y-button" style="margin-top: 4px;">
        Add comic!
      </button>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import CheckboxIcon from 'vue-material-design-icons/CheckboxMarkedCircle.vue'
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'
import CrossIcon from 'vue-material-design-icons/Close.vue'

import comicApi from '@/api/comicApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'correctComic',

  props: {
    artistList: Array,
    comicList: Array,
  },

	components: {
    ResponseMessage,
    CheckboxIcon, RightArrow, CrossIcon, 
  },

  data: function () {
    return {
			isOpen: false,
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
    }
  },

  methods: {
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

    addSelectedKeyword () {
      if (!this.selectedKeywords.find(kw => kw.id === this.selectedKeyword.id)) {
        this.selectedKeywords.push(this.selectedKeyword)
      }
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
        keywords: this.selectedKeywords,
        previousComic: this.previousComic ? this.previousComic.id : null,
        nextComic: this.nextComic ? this.nextComic.id : null
			}
      
      this.responseMessageType = 'info'
			let response = await comicApi.addNewComic(uploadData, {pageFiles: this.selectedFiles, thumbnailFile: this.thumbnailFile}, this.updateUploadProgress)
	
			if (response.success) {
        this.responseMessage = `Success adding ${this.comicName}, thank you! An administrator will review the new comic,
          and then (hopefully) add it! Your suggested comic will now appear under "Pending comics".`
        this.responseMessageType = 'success'

				this.uploadPercent = undefined,
        this.comicName = ''
        this.artist = undefined
        this.cat = undefined
        this.tag = undefined
        this.state = undefined
        this.selectedFiles = []
				this.selectedKeywords = []
				this.thumbnailFile = undefined
        document.getElementById('newPageFilesAddComic').value = ''
				this.$emit('refresh-pending-comics')
      }
      else {
        this.responseMessage = 'Error adding comic: ' + response.message
        this.responseMessageType = 'error'
      }
		},
		
		updateUploadProgress (progressEvent) {
			this.responseMessage = `Uploading... ${this.uploadPercent = Math.round((progressEvent.loaded/progressEvent.total)*100)}%`
		},
    
    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  computed: {
    ...mapGetters(['allKeywords']),
    filesAreInput () { return this.selectedFiles.length > 0 },
    selectedFileNames () { return this.selectedFiles.map( file => file.name ) },
    detailsFilledIn () { return this.comicName && this.artist && this.tag && this.cat && this.state },
    readyForUpload () { return this.detailsFilledIn && this.selectedFiles.length>0 && !this.errorMessageThumbnail }
	},
}
</script>

<style lang="scss">
#newComicTable {
  input, p, td, select {
    margin-bottom: 0px;
    text-align: left;
  }
  input, select {
    width: 100%;
    box-sizing: border-box;
  }
  td {
    padding: 2px 4px;
  }
}
</style>

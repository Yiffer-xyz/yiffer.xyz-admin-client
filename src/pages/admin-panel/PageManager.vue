<template>
  <div class="admin-content-box admin-content-box-grow" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Insert / remove / swap pages / thumbnail</h2>

    <span class="admin-content-box-inner" v-if="isOpen">
      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       class="margin-top-8"/>

      <div class="horizontalFlex margin-top-8 flex-wrap">
        <p class="admin-mini-header"
           style="margin-right: 8px;">
           Comic:
        </p>
        <select v-model="comic" @change="comicChanged">
          <option v-for="comic in comicList" :key="comic.id" :value="comic">
            {{comic.name}}
          </option>
        </select>
        <a :href="`https://yiffer.xyz/${comic.name}`" v-if="comic"
            style="margin-left: 8px;" target="_blank" class="underline-link">
          Go to comic <RightArrow/>
        </a>
      </div>

      <div v-if="comic" class="horizontalFlex" style="margin-top: 8px;">
        <p class="admin-mini-header" style="margin-right: 8px;">Start page viewing range:</p>
        <select v-model="startPageViewing">
          <option v-for="pageNumber in comic.numberOfPages" :key="pageNumber" :value="pageNumber">
            &nbsp;&nbsp;{{pageNumber}}&nbsp;&nbsp;&nbsp;
          </option>
        </select>
      </div>

      <div v-if="comic" class="horizontalFlex flex-wrap">
        <div v-for="i in pagesToShow" :key="i" class="verticalFlex" style="margin: 4px;">
          <p>Page {{i}}</p>
          <a :href="`${config.comicsBucketName}/${comic.name}/${formattedPageNumber(i)}.jpg?${generateRandomQueryString()}`" target="_blank">
            <img :src="`${config.comicsBucketName}/${comic.name}/${formattedPageNumber(i)}.jpg?${generateRandomQueryString()}`" 
              class="page-manager-image"/>
          </a>
        </div>
      </div>

      <span v-if="comic" class="admin-content-box-inner">
        <!-- SWAP PAGES -->
        <h2 style="margin-top: 32px;">Swap pages</h2>
        <p>Swap the positions of two existing pages</p>
        <div class="horizontalFlex">
          <p>Swap page ...</p>
          <select v-model="swapPage1" style="margin: 0 8px;">
            <option v-for="pageNumber in comic.numberOfPages" :key="pageNumber" :value="pageNumber">
              &nbsp;&nbsp;{{pageNumber}}&nbsp;&nbsp;&nbsp;
            </option>
          </select>
          <p>with page...</p>
          <select v-model="swapPage2" style="margin: 0 8px;">
            <option v-for="pageNumber in comic.numberOfPages" :key="pageNumber" :value="pageNumber">
              &nbsp;&nbsp;{{pageNumber}}&nbsp;&nbsp;&nbsp;
            </option>
          </select>
        </div>
        <button @click="swapPages" class="y-button margin-top-8" v-if="swapPage1 && swapPage2 && swapPage1!=swapPage2">
          Swap
        </button>


        <!-- INSERT PAGE -->
        <h2 style="margin-top: 32px;">Insert page</h2>
        <p>Insert a page in between two other pages. <u>Don't</u> use this for adding a page to the end of a comic. 
          For that, go to <i>Add pages to comic</i></p>
        <div class="horizontalFlex">
          <p>Insert an image after page ...</p>
          <select v-model="insertPageAfterNumber" style="margin: 0 8px;">
            <option v-for="pageNumber in comic.numberOfPages" :key="pageNumber" :value="pageNumber">
              &nbsp;&nbsp;{{pageNumber}}&nbsp;&nbsp;&nbsp;
            </option>
          </select>
          <p v-if="insertPageAfterNumber">, and before page {{insertPageAfterNumber+1}}</p>
        </div>

        <span v-if="insertPageAfterNumber" style="display: flex; align-items: center; flex-direction: column;">
          <form enctype="multipart/form-data" novalidate class="margin-top-16 no-margin-bot" style="width: fit-content">
            <div class="pretty-input-upload">
              <input type="file" @change="processFileUploadChange" accept="image/x-png,image/jpeg" class="input-file"/>
              <p>Select file</p>
            </div>
          </form>
          <p v-if="imageToInsert">Selected file: <span class="courier">{{imageToInsert.name}}</span></p>

          <button @click="insertPage" v-if="imageToInsert" class="y-button margin-top-8">Insert {{imageToInsert.name}}</button>
        </span>


        <!-- DELETE PAGE -->
        <h2 style="margin-top: 32px;">Delete page</h2>
        <p>Delete an existing page, in case of duplicate pages (or for some other reason)</p>
        <div class="horizontalFlex">
          <p>Delete page number...</p>
          <select v-model="deletePageNumber" style="margin: 0 8px;">
            <option v-for="pageNumber in comic.numberOfPages" :key="pageNumber" :value="pageNumber">
              &nbsp;&nbsp;{{pageNumber}}&nbsp;&nbsp;&nbsp;
            </option>
          </select>
        </div>
        <button @click="deletePage" class="y-button margin-top-8" v-if="deletePageNumber">
          Delete page {{deletePageNumber}}
        </button>


        <!-- REPLACE THUMBNAIL -->
        <h2 style="margin-top: 32px;">Replace thumbnail</h2>
        <form enctype="multipart/form-data" novalidate class="no-margin-bot" style="width: fit-content">
          <div class="pretty-input-upload">
            <input type="file" @change="processThumbnailUploadChange" accept="image/x-png,image/jpeg" class="input-file"/>
            <p>Select file</p>
          </div>
        </form>
        <p v-if="thumbnailImageFile">Selected file: <span class="courier">{{thumbnailImageFile.name}}</span></p>

        <button @click="replaceThumbnail" v-if="thumbnailImageFile && !thumbnailImageWrongFormat" 
                class="y-button">Insert {{thumbnailImageFile.name}}</button>
        <p v-if="thumbnailImageWrongFormat" class="red-color bold">
          {{thumbnailImageWrongFormatMessage}}
        </p>
      </span>


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

import comicApi from '@/api/comicApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import config from '@/config.json'

export default {
  name: 'pageManager',

	components: {
    ResponseMessage,
		CheckboxIcon, RightArrow,
	},

	props: {
		comicList: Array
	},

  data: function () {
    return {
      config,
      isOpen: false,
      comic: undefined,
      startPageViewing: 1,
      swapPage1: undefined,
      swapPage2: undefined,
      insertPageAfterNumber: undefined,
      imageToInsert: undefined,
      deletePageNumber: undefined,
      comicChangeDate: undefined,
      thumbnailImageFile: undefined,
      thumbnailImageWrongFormat: false,
      thumbnailImageWrongFormatMessage: '',

      responseMessage: '',
      responseMessageType: 'info',
    }
  },

  methods: {
    async swapPages () {
      this.setResponseMessage('info', 'Swapping...')
      let response = await comicApi.swapComicPages(this.comic.name, this.comic.id, this.swapPage1, this.swapPage2)

      if (response.success) {
        this.setResponseMessage('success', `Successfully swapped pages ${this.swapPage1} and ${this.swapPage2}`)
        this.$store.dispatch('updateOneComicInList', this.comic)
        this.swapPage1 = undefined
        this.swapPage2 = undefined
      }
      else {
        this.setResponseMessage('error', 'Error inserting page: ' + response.message)
      }
    },

    async insertPage () {
      this.setResponseMessage('info', 'Inserting...')
      let response = await comicApi.insertComicPage(this.comic.name, this.comic.id, this.imageToInsert,
                                                    this.insertPageAfterNumber, this.updateUploadProgress)

      if (response.success) {
        this.setResponseMessage('success', 'Successfully inserted new page ' + (Number(this.insertPageAfterNumber)+1))
        this.$store.dispatch('refreshOneComicInList', this.comic.name)
        this.imageToInsert = undefined
      }
      else {
        this.setResponseMessage('error', 'Error inserting page: ' + response.message)
      }
    },

    async deletePage () {
      this.setResponseMessage('info', 'Deleting...')
      let response = await comicApi.deleteComicPage(this.comic.name, this.comic.id, this.deletePageNumber)

      if (response.success) {
        this.setResponseMessage('success', `Successfully deleted page ${this.deletePageNumber}`)
        this.$store.dispatch('updateOneComicInList', this.comic)
        this.deletePageNumber = undefined
      }
      else {
        this.setResponseMessage('error', 'Error deleting page: ' + response.message)
      }
    },

    async replaceThumbnail () {
      this.setResponseMessage('info', 'Replacing...')
      let response = await comicApi.replaceThumbnailImage(this.comic.name, this.comic.id, this.thumbnailImageFile)
      
      if (response.success) {
        this.setResponseMessage('success', 'Successfully replaced thumbnail')
        this.thumbnailImageFile = undefined
      }
      else {
        this.setResponseMessage('error', 'Error replacing thumbnail: ' + response.message)
      }
    },

		updateUploadProgress (progressEvent) {
      this.responseMessage = `Uploading... ${Math.round((progressEvent.loaded/progressEvent.total)*100)}%`
		},

    async comicChanged () {
      this.resetAllInputsAndMessages()
    },

    processFileUploadChange (changeEvent) {
      this.imageToInsert = changeEvent.target.files[0]
    },

    processThumbnailUploadChange (changeEvent) {
      this.thumbnailImageFile = changeEvent.target.files[0]
      this.processNewThumbnail()
    },

		async processNewThumbnail () {
			let fileReader = new FileReader()
			fileReader.onload = () => {
				let tempImage = new Image()
				tempImage.src = fileReader.result
				tempImage.onload = () => {
					if (tempImage.width !== 200 || tempImage.height !== 283) {
            this.thumbnailImageWrongFormat = true
            this.thumbnailImageWrongFormatMessage = `Sorry, the image does not match the 200x283 pixel requirement (is ${tempImage.width}x${tempImage.height}).`
          }
          else {
            this.thumbnailImageWrongFormat = false
          }
				}
			}
			fileReader.readAsDataURL(this.thumbnailImageFile)
		},

    resetAllInputsAndMessages () {
      this.startPageViewing = 1
      this.swapPage1 = undefined
      this.swapPage2 = undefined
      this.insertPageAfterNumber = undefined
      this.imageToInsert = undefined
      this.deletePageNumber = undefined
      this.comicChangeDate = undefined
      this.thumbnailImageFile = undefined

      this.closeResponseMessage()
    },

    generateRandomQueryString () {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq';
      const charactersLength = characters.length
      let queryString = ''
      for (var i=0; i<4; i++) {
        queryString += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return queryString
    },

    setResponseMessage (type, message) {
      this.responseMessage = message
      this.responseMessageType = type
    },

    closeResponseMessage () { this.responseMessage = '' },

    formattedPageNumber (pageNumber) {
      return pageNumber<100 ? (pageNumber<10 ? '00'+pageNumber : '0'+pageNumber) : pageNumber
    },   

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  computed: {
    pagesToShow () {
      return this.comic ? [this.startPageViewing, this.startPageViewing+1, this.startPageViewing+2]
        .slice(0, this.comic.numberOfPages - this.startPageViewing + 1)
        : []
    }
  }
}
</script>

<style lang="scss">
.page-manager-image {
	max-height: 350px;
  max-width: 300px;
	@media (max-width: 900px) {
    max-width: 100px;    
    max-height: 120px;
  }
}
</style>

<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Add pages to comic</h2>
    <span class="admin-content-box-inner description-text" v-if="isOpen">
      <p>
        - Files must be either .jpg or .png. File name does not matter, except for ordering.<br/>
        - If adding multiple pages, it is <i>very important</i> that they are named in some 
        ascending order.<br/>
        Example:
        <span class="courier">[01.jpg, 02.jpg, ...]</span>, or 
        <span class="courier">[a.jpg, b.jpg, ...]</span>. Note that
        <span class="courier">[1.jpg, 2.jpg, ...]</span> will not work for more than 9 pages!
      </p>

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                  class="margin-top-10"/>

      <div class="horizontalFlex margin-top-8 margin-bottom-8 flex-wrap" style="align-items: center;">
        <p style="margin-right: 8px; font-weight: 400;">Comic:</p>
        <select v-model="comic" style="margin-bottom: 0">
          <option v-for="comic in comicList" :key="comic.id" :value="comic">
            {{comic.name}} 
            {{comic.state==='finished' ? '(Finished!)' : ''}} 
            {{comic.state === 'cancelled' ? '(Cancelled!)' : ''}}
          </option>
        </select>
        <a :href="`https://yiffer.xyz/${comic.name}`"
           v-if="comic" style="margin-left: 8px;" target="_blank" class="underline-link">
          Go to comic <RightArrow/>
        </a>
      </div>
      
      <form enctype="multipart/form-data" novalidate>
        <div class="pretty-input-upload">
          <input type="file" multiple="true" @change="processFileUploadChange" id="newPageFiles" accept="image/x-png,image/jpeg" class="input-file"/>
          <p>Select files</p>
        </div>
      </form>

      <p v-if="filesAreInput" style="margin-bottom: 0px;"><b>{{selectedFiles.length}}</b> Selected files:</p>
      <p v-if="filesAreInput" class="courier verticalFlex">
        <span v-for="file in selectedFileNames" :key="file">{{file}}</span>
      </p>

      <button @click="uploadFiles()"
              v-if="filesAreInput && comic"
              class="y-button margin-top-8">
        Upload files
        {{ comic.state === 'finished' ? ' (NOTE: this comic is marked as finished!)' : ''}}
        {{ comic.state === 'cancelled' ? ' (NOTE: this comic is marked as cancelled!)' : ''}}
      </button>

      <button class="y-button y-button-neutral" @click="toggleShowAllComics()" style="margin-top:16px;"
        v-if="!showAllComics"> Show all WIP comics, with most recent page</button>
      <button class="y-button y-button-neutral" @click="toggleShowAllComics()" style="margin-top:16px;"
        v-if="showAllComics"> Hide this list</button>

      <div v-if="showAllComics" class="scrolling-table-container">
        <table class="yTable margin-top-4">
          <thead>
            <tr>
              <th>Comic name</th>
              <th>Pages</th>
              <th>Days since<br/>update</th>
              <th>Last page</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comic in wipComicList" :key="comic.id">
              <td>
                <a :href="`https://yiffer.xyz/${comic.name}`"
                   target="_blank" class="underline-link">
                  {{comic.name}}
                </a>
              </td>
              <td>{{comic.numberOfPages}}</td>
              <td>{{comic.daysSinceUpdate}}</td>
              <td>
                <span v-if="!comic.lastPageUrl" class="link-color cursorPointer" @click="showLastPage(comic)">Load image</span>
                <a v-if="comic.lastPageUrl" :href="comic.lastPageUrl" target="_blank">
                  <img :src="comic.lastPageUrl" style="max-width: 250px;"/>
                </a>
                <br>
                <span v-if="comic.lastPageUrl" class="link-color cursorPointer" @click="unshowLastPage(comic)">Hide image</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import DownArrow from 'vue-material-design-icons/ArrowDown.vue'
import UpArrow from 'vue-material-design-icons/ArrowUp.vue'
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'

import comicApi from '@/api/comicApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import config from '@/config.json'

export default {
  name: 'addPage',

	components: {
    ResponseMessage,
    DownArrow, UpArrow, RightArrow,
	},

	props: {
		comicList: Array
	},

  data: function () {
    return {
      isOpen: false,
			comic: undefined,
      selectedFiles: [],
      showAllComics: false,
      responseMessage: '',
      responseMessageType: 'info',
    }
  },

  methods: {
    processFileUploadChange (changeEvent) {
      this.selectedFiles = [...changeEvent.target.files]
    },

    async uploadFiles () {
      let response = await comicApi.addPagesToComic(this.comic, this.selectedFiles, this.updateUploadProgress)

      if (response.success) {
        this.responseMessage = 'Success updating ' + this.comic.name
        this.responseMessageType = 'success'
        this.selectedFiles = []
        document.getElementById('newPageFiles').value = ''
        this.$emit('refresh-comic-list')
      }
      else {
        this.responseMessage = 'Error updating: ' + response.message
        this.responseMessageType = 'error'
      }
		},
		
		updateUploadProgress (progressEvent) {
      if (this.responseMessageType !== 'info') { this.responseMessageType = 'info' }
			this.responseMessage = `Uploading: ${Math.round((progressEvent.loaded/progressEvent.total)*100)} %`
		},

    toggleShowAllComics () {
      this.showAllComics = !this.showAllComics
    },

    showLastPage (comic) {
      comic.lastPageUrl = `${config.comicDirectory}/${comic.name}/${this.formattedPageNumber(comic.numberOfPages)}.jpg`
      comic.name = ' ' + comic.name + ' '
    },

    unshowLastPage (comic) {
      comic.lastPageUrl = undefined
      comic.name = comic.name.substring(1, comic.name.length-1)
    },

    formattedPageNumber (pageNumber) {
      return pageNumber<100 ? (pageNumber<10 ? '00'+pageNumber : '0'+pageNumber) : pageNumber
    },

    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) },
  },

  computed: {
    filesAreInput () { return this.selectedFiles.length > 0 },

    selectedFileNames () { return this.selectedFiles.map( file => file.name ) },

    wipComicList () {
      return this.comicList
        .filter(comic => comic.state === 'wip')
        .sort((c1, c2) => c1.updated < c2.updated ? 1 : -1)
        .map(comic => {
          comic.daysSinceUpdate = Math.floor((nowTimestamp - (new Date(comic.updated)).getTime()) / 86400000)
          return comic
        })
    }
  },
}

let nowTimestamp = (new Date()).getTime()
</script>
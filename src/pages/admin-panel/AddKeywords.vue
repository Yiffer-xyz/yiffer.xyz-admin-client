<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Tag manager</h2>
    <span class="admin-content-box-inner paddedAdminBox" v-if="isOpen">

      <p class="textLeft">Select a comic. Then, if you you click on the tag list below, you can navigate quickly to tags by typing, and press enter to add them. You <i>do</i> have to wait about a second between adding tags this way though.</p>

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       class="margin-top-8"/>

      <div class="centerLeftAlignedContainer marginAuto">
        <div class="horizontalFlex no-margin-bot mt-16" style="flex-wrap: wrap;">
          <p class="admin-mini-header mr-8">Comic:</p>
          <select v-model="comic" @change="onComicChange">
            <option v-for="comic in comicList" :key="comic.name" :value="comic">
              {{comic.name}}
            </option>
          </select>
          <a :href="`https://yiffer.xyz/${comic.name}`"
             v-if="comic" 
             style="margin-left: 8px;" 
             target="_blank"
             class="underline-link">
            Go to comic <RightArrow/>
          </a>
        </div>
    
        <div class="horizontalFlex mt-16"
            v-if="comic && comicKeywords !== null">
          <div class="verticalFlex mr-40" style="flex-wrap: wrap;">
            <p class="admin-mini-header">Tag list</p>
            <select size="13" style="margin-bottom: 0" v-model="selectedKeyword" @keyup.13="addSelectedKeyword()"> 
              <option v-for="keyword in alphabeticKeywordList" 
                      :key="keyword.name" 
                      :value="keyword">
                {{keyword.name}}
              </option>
            </select>
            <button @click="addSelectedKeyword()" class="y-button y-button-small y-button-neutral" style="width: 100%; margin-top: 1px;">
              <RightArrow/>
            </button>
          </div>
        
          <div class="verticalFlex mr-40">
            <p class="admin-mini-header">New tags</p>
            <p v-if="selectedKeywords.length > 0" style="margin-bottom: 6px;">Click tag to remove</p>
            <p v-for="keyword in selectedKeywords" 
              @click="removeKeywordFromSelection(keyword)" 
              :key="keyword.id" class="selected-add-keyword">
              {{keyword.name}}
            </p>
            <button class="y-button mt-8" v-if="selectedKeywords.length > 0"
                    @click="confirmAddKeywords()">
              Add tags
            </button>
          </div>
        
          <div class="verticalFlex">
            <p class="admin-mini-header">This comic's tags</p>
            <p v-if="comicKeywords.length > 0" style="margin-bottom: 6px;">
              Click tags to remove
            </p>
            <p v-for="keyword in comicKeywords" @click="addOrRemoveKeywordToDeleteList(keyword)" 
              :key="keyword.id" class="selected-add-keyword" 
              :class="{'keyword-to-be-deleted': keywordsToDelete.findIndex(kw=>kw.id===keyword.id)>=0}">
                {{keyword.name}}
            </p>
            <button @click="confirmRemoveKeywords()" class="y-button y-button-red mt-8"
                    v-if="keywordsToDelete.length > 0">
              Remove tags
            </button>
          </div>
        </div>

        <div v-else-if="comic && comicKeywords === null" class="loadingTagsIndicator marginAuto">
          <Loading text="Loading tags"/>
        </div>
      </div>

      <h2 class="mt-32 textCenter width100">Create new tag</h2>
      <p>If a tag is not in the list above, create it here. Double check first though, please.</p>
      <div class="horizontalFlex flex-wrap margin-top-8"
           style="align-items: center;">
        <p style="margin-right: 8px; font-weight: 400;">New tag name:</p>
        <input type="text" v-model="newKeyword" style="width: 128px;"/>
        <button @click="createKeyword()" class="y-button" style="margin: 0 0 0 8px;">Create tag</button>
      </div>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'
import Loading from '@/components/LoadingIndicator.vue'

import keywordApi from '@/api/keywordApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'addKeywords',
  
	components: {
    ResponseMessage,
    RightArrow,
    Loading,
	},

	props: {
    comicList: Array,
	},

  data: function () {
    return {
      isOpen: false,
      comic: undefined,
      responseMessage: '',
      responseMessageType: 'info',
      comicKeywords: null,
      selectedKeywords: [],
      selectedKeyword: undefined,
      keywordsToDelete: [],
			newKeyword: '',
			lastComicId: undefined,
    }
  },

  computed: {
    ...mapGetters(['alphabeticKeywordList']),
  },

  methods: {
    async onComicChange () {
      this.comicKeywords = null
      this.fetchComicKeywords()
    },

    async fetchComicKeywords () {
      this.comicKeywords = await keywordApi.getComicKeywords(this.comic.id)
    },

    addSelectedKeyword () {
      if (!this.selectedKeywords.find(kw => kw.id === this.selectedKeyword.id)) {
        this.selectedKeywords.push(this.selectedKeyword)
      }
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
      this.responseMessage = ''
      let response = await keywordApi.addKeywordsToComic(this.comic, this.selectedKeywords)

      if (response.success) {
        this.responseMessage = 'Successfully added tags to ' + this.comic.name
        this.responseMessageType = 'success'
				this.selectedKeywords = []
        this.lastComicId = this.comic.id
        this.fetchComicKeywords()
      }
      else {
        this.responseMessage = 'Error adding tags: ' + response.message
        this.responseMessageType = 'error'
      }
    },

    async confirmRemoveKeywords () {
      let response = await keywordApi.removeKeywordsFromComic(this.comic, this.keywordsToDelete)

      if (response.success) {
        this.responseMessage = 'Successfully removed tags from ' + this.comic.name
        this.responseMessageType = 'success'
        this.keywordsToDelete = []
				this.lastComicId = this.comic.id
        this.fetchComicKeywords()
      }
      else {
        this.responseMessage = 'Error removing tags: ' + response.message
        this.responseMessageType = 'error'
      }
    },

    async createKeyword () {
      if (!this.newKeyword) { return }
      let response = await keywordApi.createKeyword(this.newKeyword)

      if (response.success) {
        this.responseMessage = 'Successfully created tag ' + this.newKeyword
        this.responseMessageType = 'success'
				this.newKeyword = ''
				this.$store.dispatch('fetchKeywordList')
      }
      else {
        this.responseMessage = 'Error creating tag: ' + response.message
        this.responseMessageType = 'error'
      }
		},
    
    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
	},

	watch: {
		comicList () {
			this.comic = this.comicList.find(c => c.id===this.lastComicId)
		} 
	},
}
</script>

<style lang="scss">
.loadingTagsIndicator {
  min-height: 19.55rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
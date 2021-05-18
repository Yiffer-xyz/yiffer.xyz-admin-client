<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Tag manager</h2>
    <span class="admin-content-box-inner paddedAdminBox" v-if="isOpen" ref="innerAdminBox">

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       class="margin-top-8" disableElevation/>

      <div class="centerLeftAlignedContainer marginAuto" style="max-width: 25rem;">
        <div class="verticalFlex marginAuto no-margin-bot mt-16 flexWrap" style="align-items: flex-end;">
          <Select :options="comicOptions"
                  title="Comic"
                  isSearchable
                  searchKeepSelected
                  searchPlaceholder="Search for comic"
                  initialWidth="16rem"
                  :maxWidth="maxContentWidth"
                  :searchSelected="comic ? comic.name : null"
                  :resetValue="comicResetValue"
                  @searchSelectedClicked="comic = null"
                  @change="onComicSelect"/>

          <a :href="`https://yiffer.xyz/${comic.name}`"
             v-if="comic" 
             target="_blank"
             class="underline-link mt-8">
            Go to comic <RightArrow/>
          </a>
        </div>
    
        <div v-if="comic && comicKeywords !== null" class="mt-16 width100">
          <div class="tagsContainer mt-24 width100">
            <div class="verticalFlex">
              <p class="admin-mini-header">
                Existing tags
              </p>

              <p v-if="comicKeywords.length === 0">
                No tags yet
              </p>

              <p v-for="keyword in comicKeywords" @click="addOrRemoveKeywordToDeleteList(keyword)" 
                :key="keyword.id" class="selected-add-keyword" 
                :class="{'keyword-to-be-deleted': keywordsToDelete.findIndex(kw=>kw.id===keyword.id)>=0}">
                  {{keyword.name}}
              </p>

              <LoadingButton text="Remove tags"
                             v-if="keywordsToDelete.length > 0"
                             iconType="check"
                             :isLoading="isSubmittingRemoveKw"
                             color="error"
                             class="mt-8"
                             @click="confirmRemoveKeywords()"/>
            </div>

            <div class="verticalFlex">
              <p class="admin-mini-header newTagsHeader">
                New tags
              </p>

              <Select :options="keywordOptions"
                      isSearchable
                      :resetValue="selectResetValue"
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

          <p v-if="comicKeywords.length > 0 || selectedKeywords.length > 0" class="mt-32 textAlignCenter width100">
            Click tags to remove them
          </p>
        </div>

        <div v-else-if="comic && comicKeywords === null" class="loadingTagsIndicator">
          <Loading text="Loading tags"/>
        </div>

        <button v-if="!isCreatingNewTag"
                class="y-button button-with-icon"
                style="margin-top: 40px;"
                @click="isCreatingNewTag = true">
          <PlusIcon/> Create new tag
        </button>

        <span v-if="isCreatingNewTag">
          <h2 class="textLeft width100" style="margin-top: 40px;">
            New tag
          </h2>

          <p>If a tag is not in the list above, create it here. Double check first though, please.</p>
          <TextInput :value="newKeyword"
                      @change="newKw => newKeyword = newKw"
                      title="New tag name"
                      textAlign="left"
                      class="mt-24 mb-24"/>

          <div class="horizontalFlex justifyContentStart">
            <button @click="isCreatingNewTag = false" class="y-button y-button-neutral mr-8">
              Cancel
            </button>
            <button @click="createKeyword()" class="y-button" :class="{'y-button-disabled': newKeyword.length < 2}">
              Create tag
            </button>
          </div>
        </span>

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
import Select from '@/components/Select.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import TextInput from '../../components/TextInput.vue'
import LoadingButton from '@/components/LoadingButton.vue'

import keywordApi from '@/api/keywordApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'addKeywords',
  
	components: {
    ResponseMessage,
    RightArrow,
    Loading,
    Select,
    PlusIcon,
    TextInput,
    LoadingButton,
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
      selectResetValue: null,
      comicResetValue: null,
      isCreatingNewTag: false,
      isSubmittingAddKw: false,
      isSubmittingRemoveKw: false,
      isMounted: false,
      maxContentWidth: 9999,
    }
  },

  mounted () {
    this.isMounted = true
  },

  computed: {
    ...mapGetters(['alphabeticKeywordList']),

    comicOptions () {
      return this.comicList.map(c => ({text: c.name, value: c.name}))
    },

    keywordOptions () {
      let existingKwIds = this.comicKeywords.map(kw => kw.id)
      let selectedKwIds = this.selectedKeywords.map(kw => kw.id)

      return this.alphabeticKeywordList
        .filter(kw => !existingKwIds.includes(kw.id) && !selectedKwIds.includes(kw.id))
        .map(kw => ({text: kw.name, value: kw}))
    },

    comicInputWidth () {
      if (window.innerWidth < 382) {
        return '17'
      }
      if (this.$breakpoint.xs) {
        return '20'
      }
      return '25'
    }
  },

  methods: {
    async fetchComicKeywords () {
      this.comicKeywords = await keywordApi.getComicKeywords(this.comic.id)
    },

    onComicSelect (comicName) {
      this.comic = this.comicList.find(c => c.name === comicName)
      this.comicKeywords = null
      this.fetchComicKeywords()
      this.comicResetValue = Math.random().toString()
    },

    addSelectedKeyword (keyword) {
      if (!this.selectedKeywords.find(kw => kw.id === keyword.id)) {
        this.selectedKeywords.push(keyword)
      }
      this.selectResetValue = Math.random().toString()
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
      this.isSubmittingAddKw = true
      let response = await keywordApi.addKeywordsToComic(this.comic, this.selectedKeywords)
      this.isSubmittingAddKw = false

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
      this.isSubmittingRemoveKw = true
      let response = await keywordApi.removeKeywordsFromComic(this.comic, this.keywordsToDelete)
      this.isSubmittingRemoveKw = false

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
		},

    isOpen () {
      setTimeout(() => {
        if (this.$refs.innerAdminBox && document.body.clientWidth < 400) {
          this.maxContentWidth = this.$refs.innerAdminBox.clientWidth - 32
        }
      }, 25)
    }
	},
}
</script>

<style lang="scss" scoped>
.tagsContainer {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  min-width: 26rem;

  @media (max-width: 500px) {
    min-width: 0;
    grid-template-columns: auto;
    justify-content: center;
  }
}

.newTagsHeader {
  @media (max-width: 500px) {
    margin-top: 3rem;
  }
}

.loadingTagsIndicator {
  min-height: 16rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
</style>
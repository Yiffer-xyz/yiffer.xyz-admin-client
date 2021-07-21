<template>
  <div class="mt-32 width100">
    <h2 class="mt-32 mb-8">Tags</h2>

    <ResponseMessage :message="keywordResponseMessage"
                      :messageType="keywordResponseMessageType"
                      @closeMessage="() => keywordResponseMessage = ''"
                      outsideStyle="margin-top: 2rem;" />

    <div class="tagsContainer">
      <div class="verticalFlex alignItemsStart">
        <p class="admin-mini-header">
          Existing tags
        </p>

        <Loading v-if="!comic || isLoadingComic" text="Updating..."/>

        <p v-else-if="comic.keywords.length === 0">
          No tags yet
        </p>

        <span v-else class="verticalFlex alignItemsStart">
          <p v-for="keyword in comic.keywords"
            @click="addOrRemoveKeywordToDeleteList(keyword)" 
            :key="keyword.id" class="selected-add-keyword" 
            :class="{'keyword-to-be-deleted': keywordsToDelete.findIndex(kw=>kw.id===keyword.id)>=0}">
            {{keyword.name}}
          </p>
        </span>

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
</template>

<script>
import { mapGetters } from 'vuex'
import keywordApi from '@/api/keywordApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import Select from '@/components/Select.vue'
import Loading from '@/components/LoadingIndicator.vue'

export default {
  name: 'pendingComicKeywords',

  props: {
    comic: Object,
    isLoadingComic: Boolean,
  },

  components: {
    ResponseMessage, LoadingButton, Select, Loading,
  },

  data () {
    return {
      keywordsNotInComic: [],
      selectedKeyword: undefined,
      selectedKeywords: [],
      keywordsToDelete: [],
      kwSelectResetValue: null,

      keywordResponseMessage: '',
      keywordResponseMessageType: 'success',
      isSubmittingAddKw: false,
      isSubmittingRemoveKw: false,
    }
  },

  computed: {
    ...mapGetters([
      'allKeywords',
      'alphabeticKeywordList',
    ]),

    keywordOptions () {
      let existingKwIds = this.comic.keywords.map(kw => kw.id)
      let selectedKwIds = this.selectedKeywords.map(kw => kw.id)

      return this.alphabeticKeywordList
        .filter(kw => !existingKwIds.includes(kw.id) && !selectedKwIds.includes(kw.id))
        .map(kw => ({text: kw.name, value: kw}))
    },
  },

  async mounted () {
    if (!this.allKeywords.fetched && !this.allKeywords.fetching) {
      this.$store.dispatch('fetchKeywordList')
    }
  },

  methods: {
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
      this.keywordResponseMessage = ''

      if ('error' in response) {
        this.keywordResponseMessage = 'Error adding tags: ' + response.error
        this.keywordResponseMessageType = 'error'
      }
      else {
        this.selectedKeywords = []
        this.$emit('reloadComic')
      }
    },

    async confirmRemoveKeywords () {
      this.isSubmittingRemoveKw = true
      let response = await keywordApi.removeKeywordsFromPendingComic(this.comic, this.keywordsToDelete)
      this.isSubmittingRemoveKw = false
      this.keywordResponseMessage = ''

      if ('error' in response) {
        this.keywordResponseMessage = 'Error removing tags: ' + response.error
        this.keywordResponseMessageType = 'error'
      }
      else {
        this.keywordsToDelete = []
        this.$emit('reloadComic')
      }
    },
  },

  watch: {
    comic () {
      this.keywordsNotInComic = this.allKeywords.payload
        .filter(kw => !this.comic.keywords.find(comicKw => comicKw.id === kw.id))
        .sort((kw1, kw2) => kw1.name > kw2.name ? 1 : -1)
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
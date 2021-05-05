<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Tag suggestions
      <span v-if="keywordSuggestionList.length>0" class="red-color"> ({{keywordSuggestionList.length}})</span>
      <span v-else style="color: #999;">(0)</span>
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen">
      <p class="margin-bottom-8">Tags suggested by users pending approval will appear here.</p>

      <FetchResponseMessage :fetchStates="[keywordSuggestionSubmit]" 
                            :successMessage="successMessage" 
                            disableElevation
                            class="mb-16"/>

      <span v-if="keywordSuggestionList.length > 0">
        <table class="yTable">
          <thead>
            <tr>
              <th>Comic name</th>
              <th>Suggestion</th>
              <th>Suggester</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(suggestion, index) in keywordSuggestionList" :key="index">
              <td><a :href="`https://yiffer.xyz/${suggestion.comicName}`" target="_blank" class="underline-link">{{suggestion.comicName}}</a></td>
              <td>{{getKeywordSuggestionText(suggestion)}}</td>
              <td style="word-break: break-all;">{{suggestion.user}}</td>
              <td>
								<div class="horizontal-wrapper-4">
									<LoadingButton :isLoading="keywordSuggestionSubmit.fetching 
                                    && isActionApprove 
                                    && keywordIdBeingProcessed === suggestion.id"
                                 text="Approve"
										             @click="processKeyword(suggestion, true)">
										Approve
									</LoadingButton>
									<LoadingButton :isLoading="keywordSuggestionSubmit.fetching 
                                    && !isActionApprove 
                                    && keywordIdBeingProcessed === suggestion.id"
                                 text="Reject"
                                 color="error"
										             @click="processKeyword(suggestion, false)">
										Reject
									</LoadingButton>
								</div>
              </td>
            </tr>
          </tbody>
        </table>
      </span>

      <span v-else>
        <p>There are currently no new suggestions.</p>
      </span>

			<menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import keywordApi from '@/api/keywordApi'
import FetchResponseMessage from '@/components/FetchResponseMessage.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { mapGetters } from 'vuex'
import { doFetch } from '@/utils/statefulFetch'

export default {
  name: 'keywordSuggestions',

  components: {
    FetchResponseMessage, LoadingButton,
  },

  computed: {
    ...mapGetters(['keywordSuggestionSubmit']),
  },

  data () {
    return {
      keywordSuggestionList: [],
      isOpen: false,
      isActionApprove: false,
      keywordIdBeingProcessed: null,
      successMessage: '',
    }
  },

  mounted () {
    this.loadSuggestions()
  },

  methods: {
    getKeywordSuggestionText (suggestion) {
      return (suggestion.addKeyword ? 'ADD ' : 'REMOVE ') + suggestion.keywordName
    },

    async processKeyword (suggestion, isApproved) {
      this.isActionApprove = isApproved
      this.keywordIdBeingProcessed = suggestion.id

      let result = await doFetch(this.$store.commit, 'keywordSuggestionSubmit',
        keywordApi.processKeywordSuggestion(suggestion, isApproved))

      if (result) {
        this.successMessage  = `Successfully ${isApproved ? 'approved' : 'rejected'} "${this.getKeywordSuggestionText(suggestion)}"`
        this.loadSuggestions()
      }
    },

    async loadSuggestions () {
      this.keywordSuggestionList = await keywordApi.getKeywordSuggestionList()
      for (var suggestion of this.keywordSuggestionList) {
        suggestion.keyword = {name: suggestion.keywordName, id: suggestion.keywordId}
        suggestion.user = suggestion.user || suggestion.userIP
      }
    },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
}
</script>

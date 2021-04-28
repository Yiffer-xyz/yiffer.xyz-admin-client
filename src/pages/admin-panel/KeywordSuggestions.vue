<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Tag suggestions
      <span v-if="keywordSuggestionList.length>0" class="red-color"> ({{keywordSuggestionList.length}})</span>
      <span v-else style="color: #999;">(0)</span>
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen">
      <p class="margin-bottom-8">Tags suggested by users pending approval will appear here.</p>

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       class="margin-bottom-10"/>

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
              <td>{{keywordSuggestionText(suggestion)}}</td>
              <td style="word-break: break-all;">{{suggestion.user}}</td>
              <td>
								<div class="horizontal-wrapper-4">
									<button
										@click="processKeyword(suggestion, true)"
										class="y-button">
										Approve
									</button>
									<button
										@click="processKeyword(suggestion, false)"
										class="y-button y-button-red">
										Reject
									</button>
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
import ResponseMessage from '@/components/ResponseMessage.vue'

export default {
  name: 'keywordSuggestions',

  components: {
    ResponseMessage,
  },

  data () {
    return {
      keywordSuggestionList: [],
      isOpen: false,
      responseMessage: '',
      responseMessageType: '',
    }
  },

  methods: {
    keywordSuggestionText (suggestion) {
      return (suggestion.addKeyword ? 'ADD ' : 'REMOVE ') + suggestion.keywordName
    },

    async processKeyword (suggestion, isApproved) {
			let response = await keywordApi.processKeywordSuggestion(suggestion, isApproved)

      if (response.success) {
        this.responseMessage  = `Successfully ${isApproved ? 'approved' : 'rejected'} "${this.keywordSuggestionText(suggestion)}"`
        this.responseMessageType = 'success'
        this.loadSuggestions()
      }
      else {
        this.responseMessage = 'Error processing tag suggestion: ' + response.message
        this.responseMessageType = 'error'
      }
    },

    async loadSuggestions () {
      this.keywordSuggestionList = await keywordApi.getKeywordSuggestionList()
      for (var suggestion of this.keywordSuggestionList) {
        suggestion.keyword = {name: suggestion.keywordName, id: suggestion.keywordId}
        suggestion.user = suggestion.user || suggestion.userIP
      }
    },

    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  mounted () {
    this.loadSuggestions()
  }
}
</script>

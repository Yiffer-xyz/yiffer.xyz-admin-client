<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Comic suggestions
      <span v-if="unprocessedSuggestions.length>0" class="red-color"> ({{unprocessedSuggestions.length}})</span>
      <span v-else style="color: #999;">(0)</span>
    </h2>
    <span class="admin-content-box-inner description-text" v-if="isOpen">
      <p class="margin-bottom-8 margin-top-8">
				- Click '<u>Adding/added</u>' BEFORE you start adding the comic.
				<br/>
				- Click '<u>Reject, add to rejected-list</u>' if the comic fails to meet the criteria listed  
				<a href="https://yiffer.xyz/suggestcomic" target="_blank" class="underline-link">here</a>. This will show up in the list of previously rejected comics, along with a reason you may specify. Users can see this and it will prevent them from suggesting the same comic again.
				<br/>
        - Click '<u>Reject as spam/duplicate</u>' if the comic has been suggested before, or if it's not a serious suggestion.
				<br/>
				<br/>
				Please don't hesitate to ask for opinions in the mod Telegram chat!
			</p>

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       class="mb-10"/>

      <div v-if="unprocessedSuggestions.length > 0"
           class="scrolling-table-container scrolling-table-container-vertical"
           style="max-height: 70vh;">
        <table class="yTable">
          <thead>
            <tr>
              <th class="textAlignCenter">Action</th>
              <th>Comic name</th>
              <th>Artist</th>
              <th>Links and comments</th>
              <th>User/IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(suggestion, index) in unprocessedSuggestions" :key="index">
              <td>
								<div v-if="suggestionIdBeingActioned === suggestion.id 
                  && !suggestion.isRejectingAndAddingToList"
                     class="verticalFlex">
									<button 
										@click="processSuggestion(suggestion, true)"
										class="y-button button-with-icon">
										<CheckIcon Title=""/> Adding/added the comic
									</button>
									<button 
										@click="initRejectAndAddToList(suggestion)"
										class="y-button y-button-red button-with-icon margin-top-8">
										<RemoveToListIcon/> Reject, add to rejected-list
									</button>
									<button
										@click="processSuggestion(suggestion, false, false)"
										class="y-button y-button-red button-with-icon margin-top-8">
										<DeleteIcon/> Reject as spam/duplicate
									</button>
									<button
										@click="suggestionIdBeingActioned = null"
										class="y-button y-button-neutral margin-top-8">
										Cancel
									</button>
								</div>

                <button v-else
                        @click="onSuggestionActionClick(suggestion)"
                        class="y-button"
                        :class="{'y-button-disabled': suggestionIdBeingActioned}"
                        :disabled="suggestionIdBeingActioned">
                  Choose action...
                </button>

                <!-- REJECT AND ADD TO LIST -->
                <div v-if="suggestion.isRejectingAndAddingToList" class="verticalFlex alignItemsStart">
                  <TextInput @change="newVal => rejectReason = newVal"
                             title="Optional reason (shown to users)"
                             placeholder="May be left blank"
                             textAlign="left"/>
                    <button 
                      @click="cancelAddingToList(suggestion)"
                      class="y-button y-button-neutral button-with-icon mt-16">
                      <LeftArrow/> Back
                    </button>
                    <button 
                      @click="processSuggestion(suggestion, false, true)"
                      class="y-button y-button-red button-with-icon mt-8">
                      <CheckIcon/> Reject, add to rejected-list
                    </button>
                </div>
              </td>
              <td>{{suggestion.name}}</td>
              <td>{{suggestion.artist || ''}}</td>
              <td style="white-space: pre-wrap;">{{suggestion.description}}</td>
              <td>{{suggestion.user}}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <span v-else>
        <p>There are currently no new suggestions.</p>
      </span>


      <span v-if="processedSuggestions.length>0 && !showProcessedSuggestions">
        <button @click="showProcessedSuggestions = true" class="y-button y-button-neutral margin-top-32">Show processed suggestions <DownArrow/></button>
      </span>

      <span v-if="showProcessedSuggestions">
        <button @click="showProcessedSuggestions = false" class="y-button y-button-neutral margin-top-32">Hide this list <UpArrow/></button>
      </span>

      <table v-if="showProcessedSuggestions" class="yTable">
        <thead>
          <tr>
            <th>Action</th>
            <th>Comic name</th>
            <th>Artist</th>
            <th>Links and comments</th>
            <th>User/IP</th>
            <th>Mod</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(suggestion, index) in processedSuggestions" :key="index">
            <td v-if="suggestion.verdict === 'added'"><CheckboxIcon/> Added</td>
            <td v-else>Rejected</td>
            <td>{{suggestion.name}}</td>
            <td>{{suggestion.artist || ''}}</td>
            <td style="word-break: break-word;">{{suggestion.description}}</td>
            <td>{{suggestion.user}}</td>
            <td>{{suggestion.mod}}</td>
          </tr>
        </tbody>
      </table>

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
import LeftArrow from 'vue-material-design-icons/ArrowLeft.vue'
import CheckboxIcon from 'vue-material-design-icons/CheckboxMarkedCircle.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import RemoveToListIcon from 'vue-material-design-icons/DeleteSweep.vue'

import comicApi from '@/api/comicApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import TextInput from '@/components/TextInput.vue'

export default {
  name: 'comicSuggestions',

	components: {
    ResponseMessage, TextInput,
    DownArrow, UpArrow, CheckboxIcon, CheckIcon, DeleteIcon, RemoveToListIcon, LeftArrow,
	},

  data: function () {
    return {
      isOpen: false,
      showProcessedSuggestions: false,
      comicSuggestionList: [],
      rejectReason: '',
      responseMessage: '',
      responseMessageType: 'info',
      suggestionIdBeingActioned: null,
    }
  },

  methods: {
    onSuggestionActionClick (suggestion) {
      this.suggestionIdBeingActioned = suggestion.id
      this.rejectReason = ''
    },

    initRejectAndAddToList (suggestion) {
      for (let i=0; i<this.comicSuggestionList.length; i++) {
        if (this.comicSuggestionList[i].id === suggestion.id) {
          this.comicSuggestionList[i].isRejectingAndAddingToList = true
          this.$set(this.comicSuggestionList, i, this.comicSuggestionList[i])
        }
        else {
          if (this.comicSuggestionList[i].isRejectingAndAddingToList) {
            this.comicSuggestionList[i].isRejectingAndAddingToList = false
            this.$set(this.comicSuggestionList, i, this.comicSuggestionList[i])
          }
        }
      }
      this.rejectReason = ''
    },

    cancelAddingToList (suggestion) {
      this.rejectReason = ''
      suggestion.isRejectingAndAddingToList = false
      this.$set(this.comicSuggestionList, this.comicSuggestionList.findIndex(s => s.id===suggestion.id), suggestion)
    },

    async processSuggestion (suggestionData, isApproved, shouldShowInList) {
      let response = await comicApi.processComicSuggestion(suggestionData.id, {
        isApproved: isApproved,
        shouldShowInList: shouldShowInList,
        reason: this.rejectReason
      })

      if (response.success) {
        this.responseMessage = `Successfully processed suggestion of ${suggestionData.name} (${isApproved ? 'added' : 'rejected'})`
        this.responseMessageType = 'success'
        this.suggestionIdBeingActioned = null
        this.getComicSuggestions()
      }
      else {
        this.responseMessage = 'Error processing comic suggestion: ' + response.message
        this.responseMessageType = 'error'
      }
    },

    async getComicSuggestions () {
      this.comicSuggestionList = await comicApi.getSuggestedComicList()
      
      for (var suggestion of this.comicSuggestionList) {
        suggestion.user = suggestion.user || suggestion.userIP
        suggestion.isRejectingAndAddingToList = false
      }
    },

    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  computed: {
    unprocessedSuggestions () { return this.comicSuggestionList.filter(s => !s.processed) },
    processedSuggestions () { return this.comicSuggestionList.filter(s => !!s.processed) }
  },

  created () {
    this.getComicSuggestions()
  }
}
</script>

<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Pending comics
      <span style="margin-right: 5px;">
        <span>({{pendingComics.length}})</span>
      </span>
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                      class="margin-bottom-10 margin-top-10"/>

      <div v-if="pendingComics.length > 0" class="verticalFlex" style="max-width: 100%;">
        <div class="verticalFlex alignItemsStart marginAuto">
          <p style="text-align: left;" class="mt-8">
            You can add keywords, a thumbnail, or more pages by <u>clicking the comic title</u>. <br/>
          </p>
          <p class="mt-8">
            Comics are published by admins.
          </p>

          <div class="mt-8">
            <input type="checkbox" id="showAllDataCheckbox" v-model="showAllData" style="margin: 0 0.5rem 0 0">
            <label for="showAllDataCheckbox">Show all data</label>
          </div>
        </div>

        <div class="scrolling-table-container" style="margin: 8px auto 0 auto">
          <table class="yTable">
            <thead>
              <tr>
                <th>Comic name</th>
                <th>Error</th>
                <th v-if="showAllData">Artist</th>
                <th v-if="showAllData">Category</th>
                <th v-if="showAllData">Class.</th>
                <th v-if="showAllData">Pages</th>
                <th v-if="showAllData">State</th>
                <th>Tags</th>
                <th>Thumbnail</th>
                <th>Mod name</th>
                <th v-if="$store.getters.userData.userType === 'admin'" class="textAlignCenter">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pendingComic in pendingComics" :key="pendingComic.id">
                <td>
                  <router-link :to="`/pending-comic/${pendingComic.name}`"
                               target="_blank"
                               class="underline-link"
                               :class="{'red-color': !isComicApprovable(pendingComic)}">
                    {{pendingComic.name}} <RightArrow/>
                  </router-link>
                </td>

                <td class="red-color">{{pendingComic.errorText}}</td>

                <td v-if="showAllData">
                  <a :href="`https://yiffer.xyz/artist/${pendingComic.artist}`" target="_blank" class="underline-link">
                    {{pendingComic.artist}}
                  </a>
                </td>

                <td v-if="showAllData">{{pendingComic.tag}}</td>
                <td v-if="showAllData">{{pendingComic.cat}}</td>
                <td v-if="showAllData">{{pendingComic.numberOfPages}}</td>
                <td v-if="showAllData">{{pendingComic.state}}</td>
                
                <td v-if="pendingComic.keywords.length>0" class="textAlignCenter">
                  {{pendingComic.keywords.length}}
                </td>
                <td v-else class="textAlignCenter">-</td>

                <td v-if="pendingComic.hasThumbnail" class="textAlignCenter">
                  <CheckboxIcon/>
                </td>
                <td v-else class="textAlignCenter">-</td>

                <td>{{pendingComic.modName}}</td>

                <td v-if="$store.getters.userData.userType === 'admin'">
                  <div class="horizontal-wrapper-4">
                    <button @click="processComic(pendingComic.id, true, pendingComic.name)" 
                            v-if="isComicApprovable(pendingComic)"
                            class="y-button">
                      Approve
                    </button>
                    <button @click="processComic(pendingComic.id, false, pendingComic.name)"
                            class="y-button y-button-red">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <span v-else>
        <p>There are no pending comics.</p>
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

export default {
  name: 'pendingComics',

	components: {
    ResponseMessage,
		CheckboxIcon, RightArrow,
  },
  
  props: {
    pendingComics: Array,
  },

  data: function () {
    return {
      showAllData: false,
      isOpen: false,
      responseMessage: '',
      responseMessageType: 'info',
    }
  },

  methods: {
    isComicApprovable (comic) {
      return comic.keywords.length > 0 && comic.hasThumbnail && !comic.errorText
    },

    async processComic (comicId, isApproved, comicName) {
			let response = await comicApi.processPendingComic(comicId, isApproved)
      
      if (response.success) {
        this.responseMessage = `Success ${isApproved ? 'approving' : 'rejecting'} ${comicName}`
        this.responseMessageType = 'success'
        this.$emit('refresh-pending-comics')
        if (isApproved) {
          this.$emit('refresh-comic-list')
				}
			}
			else {
        this.responseMessage = response.message
        this.responseMessageType = 'error'
			}
    },

    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  computed: {
    comicsMissingKeywords () { return this.pendingComics.filter(c => c.keywords.length === 0).length },
    comicsMissingThumbnails () { return this.pendingComics.filter(c => !c.hasThumbnail).length },
  }
}
</script>
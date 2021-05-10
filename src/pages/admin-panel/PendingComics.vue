<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Pending comics
      <span style="margin-right: 5px;">
        <span v-if="pendingComics.length>0" class="red-color">({{pendingComics.length}})</span>
        <span v-else style="color: #999; margin-right: 5px;">(0)</span>
      </span>
      <span style="margin-right: 5px;">
        <span v-if="comicsMissingKeywords>0">({{comicsMissingKeywords}})</span>
        <span v-else style="color: #999; margin-right: 5px;">(0)</span>
      </span>
      <span>
        <span v-if="comicsMissingThumbnails>0">({{comicsMissingThumbnails}})</span>
        <span v-else style="color: #999;">(0)</span>
      </span>
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                      class="margin-bottom-10 margin-top-10"/>

      <div v-if="pendingComics.length > 0" class="verticalFlex" style="max-width: 100%;">
        <p>You can add keywords, a thumbnail, or more pages by <u>clicking the comic title</u>. <br/>
        Comics are approved by admins.<br/>
        The <span class="red-color">numbers</span> in the header mean (1) amount of pending comics, (2) how many are missing tags, and (3) how many are missing a thumbnail.</p>

        <div class="scrolling-table-container" style="margin: 8px auto 0 auto">
          <table class="yTable">
            <thead>
              <tr>
                <th>Comic name</th>
                <th>Artist</th>
                <th>Category</th>
                <th>Class.</th>
                <th>Pages</th>
                <th>State</th>
                <th>Tags</th>
                <th>Thumbnail</th>
                <th>Mod name</th>
                <th v-if="$store.getters.userData.userType === 'admin'">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pendingComic in pendingComics" :key="pendingComic.id">
                <td>
                  <router-link :to="`/pending-comic/${pendingComic.name}`" target="_blank" class="underline-link">
                    {{pendingComic.name}} <RightArrow/>
                  </router-link>
                </td>
                <td>
                  <a :href="`https://yiffer.xyz/artist/${pendingComic.artist}`" target="_blank" class="underline-link">
                    {{pendingComic.artist}}
                  </a>
                </td>
                <td>{{pendingComic.tag}}</td>
                <td>{{pendingComic.cat}}</td>
                <td>{{pendingComic.numberOfPages}}</td>
                <td>{{pendingComic.state}}</td>
                <td v-if="pendingComic.keywords.length>0"><CheckboxIcon/></td> <td v-else>-</td>
                <td v-if="pendingComic.hasThumbnail"><CheckboxIcon/></td> <td v-else>-</td>
                <td>{{pendingComic.modName}}</td>
                <td v-if="$store.getters.userData.userType === 'admin'">
                  <div class="horizontal-wrapper-4">
                    <button @click="processComic(pendingComic.id, true, pendingComic.name)" 
                            v-if="pendingComic.keywords.length > 0 && pendingComic.hasThumbnail"
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
      isOpen: false,
      responseMessage: '',
      responseMessageType: 'info',
    }
  },

  methods: {
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
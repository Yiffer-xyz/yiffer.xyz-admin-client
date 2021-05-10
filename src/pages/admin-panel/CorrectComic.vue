<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Correct comic data</h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       outsideStyle="margin: 0.5rem auto;"/>

      <Loading v-if="comicList.length === 0" text="Fetching comics" style="margin-top: 1rem;" />

      <div v-else class="horizontalFlex flex-wrap" style="margin-top: 8px; align-items: center;">
        <p class="admin-mini-header margin-bottom-4 margin-right-8">Comic:</p>
        <select v-model="comic" class="margin-bottom-4">
          <option v-for="comic in comicList" :key="comic.id" :value="comic">
            {{comic.name}}
          </option>
        </select>
        <a :href="`https://yiffer.xyz/${comic.name}`"
           v-if="comic"
           style="margin-left: 8px;" target="_blank" class="underline-link margin-bottom-4">
          Go to comic <RightArrow/>
        </a>
      </div>

      <span v-if="comic && !isSubmitting" class="margin-top-8" style="width: 100%;">
				<button @click="toggleRename(true)"
                v-if="!renameActive"
                class="y-button y-button-neutral marginAuto mb-16 fitContent">
          Rename comic
        </button>

				<span v-if="renameActive" class="horizontalFlex margin-bottom-16" style="align-items: center;">
          <div class="verticalFlex">
            <p style="text-align: left;">New name</p>
            <input type="text" v-model="newComicName" style="width: 200px; height: 18px;"/>
          </div>
					<button @click="toggleRename(false)" class="y-button y-button-neutral no-margin-bot margin-left-8" style="align-self: flex-end;">
            <CrossIcon/> Cancel rename
          </button>
				</span>
				

        <div id="fourSelectsContainer" class="verticalFlex">
          <div class="verticalFlex">
            <p style="text-align: left;">Artist</p>
            <select v-model="artist">
              <option v-for="artist in artistList" :key="artist.name" :value="artist.name">
                {{artist.name}}
              </option>
            </select>
          </div>

          <div class="verticalFlex">
            <p style="text-align: left;">Category</p>
            <select v-model="cat">
              <option value="Furry">Furry</option>
              <option value="MLP">MLP</option>
              <option value="Pokemon">Pokemon</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="verticalFlex">
            <p style="text-align: left;">Classification</p>
            <select v-model="tag">
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="MF">MF</option>
              <option value="MM">MM</option>
              <option value="FF">FF</option>
              <option value="MF+">MF+</option>
              <option value="I">I</option>
            </select>
          </div>
          
          <div class="verticalFlex">
            <p style="text-align: left;">State</p>
            <select v-model="state">
              <option value="wip">WIP</option>
              <option value="finished">Finished</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <!-- PREVIOUS COMIC -->
        <div class="prev-next-comic-container margin-top-16">
          <div class="horizontalFlex horiz-space-items-8px" style="align-items: center; flex-wrap: wrap;">
            <div>
              <p style="text-align: left;">Previous comic</p>
              <select v-model="previousComic">
                <option v-for="comic in comicList" :key="comic.id" :value="comic">
                  {{comic.name}}
                </option>
              </select>
            </div>
            <button v-if="previousComic" class="y-button y-button-neutral button-with-icon" 
                    style="margin-left: 4px; margin-top: 2px; align-self: flex-end;" @click="removePreviousLink()">
              <CrossIcon/> Remove link
            </button>
          </div>
        </div>

        <!-- NEXT COMIC -->
        <div class="prev-next-comic-container margin-top-8">
          <div class="horizontalFlex horiz-space-items-8px" style="align-items: center; flex-wrap: wrap;">
            <div>
              <p style="text-align: left;">Next comic</p>
              <select v-model="nextComic">
                <option v-for="comic in comicList" :key="comic.id" :value="comic">
                  {{comic.name}}
                </option>
              </select>
            </div>
            <button v-if="nextComic" class="y-button y-button-neutral button-with-icon"
                    style="margin-left: 4px; margin-top: 2px; align-self: flex-end;" @click="removeNextLink()">
              <CrossIcon/> Remove link
            </button>
          </div>
        </div>

				<span class="horizontalFlex no-margin-bot" style="margin-top: 16px;">
        	<button @click="resetFields()"
                  class="y-button y-button-neutral button-with-icon" style="margin-right: 4px;">
            <RefreshIcon/> Reset
          </button>
        	<button @click="submitChanges()" class="y-button" style="margin-left: 4px;">
            Submit changes
          </button>
				</span>
      </span>

      <Loading v-if="isSubmitting" text="Updating..." style="margin-top: 1rem;" />

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import CrossIcon from 'vue-material-design-icons/Close.vue'
import RefreshIcon from 'vue-material-design-icons/Refresh.vue'
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'
import Loading from '@/components/LoadingIndicator.vue'

import comicApi from '@/api/comicApi'
import ResponseMessage from '@/components/ResponseMessage.vue'

export default {
	name: 'correctComic',
  
  components: {
    ResponseMessage, Loading,
    RightArrow, CrossIcon, RefreshIcon
	},
  
  props: {
    comicList: Array,
    artistList: Array,
  },

  data: function () {
    return {
			renameActive: false,
			newComicName: '',
      isOpen: false,
      comic: undefined,
      artist: undefined,
      tag: undefined,
      cat: undefined,
      state: undefined,
      lastComicId: undefined,
      originalPreviousComic: undefined,
      originalNextComic: undefined,
      previousComic: undefined,
      nextComic: undefined,

      isSubmitting: false,
      responseMessage: '',
      responseMessageType: 'info',
    }
  },

  methods: {
    async submitChanges () {
      this.isSubmitting = true

      let response = await comicApi.updateComic({
				id: this.comic.id,
				name: (this.renameActive && this.newComicName.length>0) ? this.newComicName : this.comic.name,
				oldName: this.comic.name,
				cat: this.cat,
				tag: this.tag,
				state: this.state,
        artist: this.artist,
        previousComic: this.previousComic ? this.previousComic.id : null,
        nextComic: this.nextComic ? this.nextComic.id : null
      })
      
      this.isSubmitting = false

      if (response.success) {
        this.responseMessage = 'Successfully updated info of ' + this.comic.name
				this.responseMessageType = 'success'
				this.toggleRename(false)
				this.lastComicId = this.comic.id
				this.$emit('refresh-comic-list')
      }
      else {
        this.responseMessage = 'Error updating comic: ' + response.message
				this.responseMessageType = 'error'
      }
		},
		
		toggleRename (isActive) {
			this.renameActive = isActive
			if (!isActive) { this.newComicName = this.comic.name }
    },
    
    removePreviousLink () {
      this.previousComic = undefined
    },

    removeNextLink () {
      this.nextComic = undefined
    },

		resetFields () {
			this.tag = this.comic.tag + ''
			this.cat = this.comic.cat + ''
			this.state = this.comic.state
      this.artist = this.comic.artist + ''
      this.nextComic = this.originalNextComic + ''
      this.previousComic = this.originalPreviousComic + ''
      this.toggleRename(false)
      this.findComicLinks()      
    },
    
    async findComicLinks () {
      let comicData = await comicApi.getComic(this.comic.name)
      this.previousComic = comicData.previousComic ? 
        this.comicList.find(c => c.name === comicData.previousComic)
        : undefined
      this.nextComic = comicData.nextComic ? 
        this.comicList.find(c => c.name === comicData.nextComic)
        : undefined
      this.originalPreviousComic = this.previousComic + ''
      this.originalNextComic = this.nextComic + ''
    },

    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  watch: {
    comic () {
      if (this.comic) { this.resetFields() }
		},

		comicList () {
			this.comic = this.comicList.find(c => c.id===this.lastComicId)
		} 
  },
}
</script>

<style lang="scss">
#fourSelectsContainer {
  flex-wrap: wrap;
  justify-content: center;
  margin: auto;
  width: fit-content;

  div {
    margin: 4px;
  }

	@media (min-width: 900px) {
    flex-direction: row;
    div {
      margin: 8px;
    }
	}
}

.prev-next-comic-container {
  margin-left: auto; margin-right: auto;
  display: flex;
  flex-direction: column;
  width: fit-content;
}
</style>

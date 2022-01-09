<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">
      Correct comic data
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen" ref="innerAdminBox">

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       outsideStyle="margin: 0.5rem auto;"/>

      <Loading v-if="comicList.length === 0" text="Fetching comics" style="margin-top: 1rem;" />

      <div class="centerLeftAlignedContainer marginAuto" v-else>

      <div class="verticalFlex flexWrap" style="align-items: flex-end; margin: 0 auto">
        <Select :options="comicOptions"
                title="Comic"
                isSearchable
                searchKeepSelected
                searchPlaceholder="Search for comic"
                initialWidth="16rem"
                :maxWidth="maxContentWidth"
                :searchSelected="comic ? comic.text : null"
                :resetValue="comicResetValue"
                @searchSelectedClicked="comic = null"
                @change="onComicSelect"/>

        <a :href="`https://yiffer.xyz/${comic.value.name}`"
            v-if="comic" 
            target="_blank"
            class="underline-link mt-8">
          Go to comic <RightArrow/>
        </a>
      </div>

      <span v-if="comic && !isSubmitting" class="margin-top-8" style="width: 100%;">
        <div class="horizontalFlex mb-16 justifyContentStart">
          <button @click="toggleRename(true)"
                  v-if="!renameActive"
                  class="y-button y-button-neutral mr-16">
            Rename comic
          </button>

          <LoadingButton class="y-button y-button-neutral"
                         @click="autoResizecomic()"
                         :isLoading="isResizing"
                         text="Auto-resize comic"/>
        </div>
				<span v-if="renameActive" class="horizontalFlex margin-bottom-16 alignItemsCenter justifyContentStart">
          <div class="verticalFlex">
            <TextInput :value="newComicName"
                       @change="newVal => newComicName = newVal"
                       title="New name"
                       textAlign="left"/>
          </div>
					<button @click="toggleRename(false)" class="y-button y-button-neutral no-margin-bot margin-left-8" style="align-self: flex-end;">
            <CrossIcon/> Cancel rename
          </button>
				</span>
				

        <div id="fourSelectsContainer" class="verticalFlex alignItemsStart">
          <Select :options="artistOptions"
                  title="Artist"
                  isSearchable
                  searchKeepSelected
                  searchPlaceholder="Search for artist"
                  initialWidth="10rem"
                  :defaultValue="artist"
                  :searchSelected="artist ? artist.text : null"
                  :resetValue="artistResetValue"
                  @searchSelectedClicked="artist = null"
                  @change="onArtistSelect"/>

          <Select :options="categoryOptions"
                  title="Category"
                  @change="onCatSelected"
                  :resetValue="selectResetValue"
                  :defaultValue="cat"/>

          <Select :options="tagOptions"
                  title="Classification"
                  @change="onTagSelected"
                  :resetValue="selectResetValue"
                  :defaultValue="tag"/>

          <Select :options="stateOptions"
                  title="State"
                  @change="onStateSelected"
                  :resetValue="selectResetValue"
                  :defaultValue="state"/>
        </div>

        <!-- PREVIOUS COMIC -->
        <Select :options="comicOptions"
                title="Previous comic"
                isSearchable
                searchKeepSelected
                searchPlaceholder="Search for comic"
                initialWidth="16rem"
                classes="mt-16"
                :maxWidth="maxContentWidth"
                :searchSelected="previousComic ? previousComic.text : null"
                :resetValue="prevComicResetValue"
                @searchSelectedClicked="previousComic = null"
                @change="onPrevComicSelect"/>

        <!-- NEXT COMIC -->
        <Select :options="comicOptions"
                title="Next comic"
                isSearchable
                searchKeepSelected
                searchPlaceholder="Search for comic"
                initialWidth="16rem"
                classes="mt-16"
                :maxWidth="maxContentWidth"
                :searchSelected="nextComic ? nextComic.text : null"
                :resetValue="nextComicResetValue"
                @searchSelectedClicked="nextComic = null"
                @change="onNextComicSelect"/>

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

      </div>

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
import Select from '@/components/Select.vue'
import TextInput from '@/components/TextInput.vue'

import comicApi from '@/api/comicApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import LoadingButton from '@/components/LoadingButton.vue'

export default {
	name: 'correctComic',
  
  components: {
    ResponseMessage, Loading, Select, LoadingButton, TextInput,
    RightArrow, CrossIcon, RefreshIcon,
	},
  
  props: {
    comicList: Array,
    artistList: Array,
  },

  computed: {
    comicOptions () {
      return this.comicList.map(c => ({text: c.name, value: c}))
    },
    
    artistOptions () {
      return this.artistList.map(a => ({text: a.name, value: a.name}))
    },
  },

  data () {
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

      comicResetValue: null,
      artistResetValue: null,
      selectResetValue: null,
      prevComicResetValue: null,
      nextComicResetValue: null,

      isSubmitting: false,
      responseMessage: '',
      responseMessageType: 'info',

      isResizing: false,
      maxContentWidth: 9999,
      categoryOptions,
      tagOptions,
      stateOptions,
    }
  },

  methods: {
    onComicSelect (comic) {
      this.comic = this.comicOptions.find(c => c.value.id === comic.id)
      this.comicResetValue = Math.random().toString()
      this.artist = this.artistOptions.find(a => a.value === this.comic.value.artist)
      this.cat = this.categoryOptions.find(c => c.value === this.comic.value.cat)
      this.tag = this.tagOptions.find(c => c.value === this.comic.value.tag)
      this.state = this.stateOptions.find(c => c.value === this.comic.value.state)
    },

    onArtistSelect (artistName) {
      this.artist = this.artistOptions.find(a => a.value === artistName)
    },
    onCatSelected (catName) {
      this.cat = this.categoryOptions.find(opt => opt.value === catName)
    },
    onTagSelected (tagName) {
      this.tag = this.tagOptions.find(opt => opt.value === tagName)
    },
    onStateSelected (stateName) {
      this.state = this.stateOptions.find(opt => opt.value === stateName)
    },
    onPrevComicSelect (comic) {
      this.previousComic = this.comicOptions.find(opt => opt.value.id === comic.id)
    },
    onNextComicSelect (comic) {
      this.nextComic = this.comicOptions.find(opt => opt.value.id === comic.id)
    },

    async submitChanges () {
      this.isSubmitting = true

      let response = await comicApi.updateComic({
				id: this.comic.value.id,
				name: (this.renameActive && this.newComicName.length>0) ? this.newComicName : this.comic.value.name,
				oldName: this.comic.value.name,
				cat: this.cat?.value,
				tag: this.tag?.value,
				state: this.state?.value,
        artist: this.artist?.value,
        previousComic: this.previousComic ? this.previousComic.value.id : null,
        nextComic: this.nextComic ? this.nextComic.value.id : null
      })
      
      this.isSubmitting = false

      if (response.success) {
        this.responseMessage = 'Successfully updated info of ' + this.comic.value.name
				this.responseMessageType = 'success'
				this.toggleRename(false)
				this.lastComicId = this.comic.value.id
				this.$emit('refresh-comic-list')
      }
      else {
        this.responseMessage = 'Error updating comic: ' + response.message
				this.responseMessageType = 'error'
      }
		},

    async autoResizecomic () {
      this.isResizing = true
      let result = await comicApi.autoResizeComic(this.comic.value.id)
      this.isResizing = false

      if (result.error) {
        this.responseMessage = result.error
        this.responseMessageType = 'error'
      }
      else {
        this.responseMessage = `Success resizing ${this.comic.value.name}. Scaled down ${result.numberOfResizedPages}/${result.totalNumberOfPages} pages.`
        this.responseMessageType = 'success'
      }
    },
		
		toggleRename (isActive) {
			this.renameActive = isActive
			if (!isActive) { this.newComicName = this.comic.value.name }
    },
    
    removePreviousLink () {
      this.previousComic = undefined
    },

    removeNextLink () {
      this.nextComic = undefined
    },

		resetFields () {
			this.tag = this.tagOptions.find(opt => opt.value === this.comic.value.tag)
			this.cat = this.categoryOptions.find(opt => opt.value === this.comic.value.cat)
			this.state = this.stateOptions.find(opt => opt.value === this.comic.value.state)
      this.artist = this.artistOptions.find(a => a.value === this.comic.value.artist)
      this.nextComic = this.originalNextComic + ''
      this.previousComic = this.originalPreviousComic + ''
      this.toggleRename(false)
      this.findComicLinks()      
    },
    
    async findComicLinks () {
      let comicData = await comicApi.getComic(this.comic.value.name)

      this.previousComic = comicData.previousComic ? 
        this.comicOptions.find(c => c.value.name === comicData.previousComic)
        : undefined
      this.nextComic = comicData.nextComic ? 
        this.comicOptions.find(c => c.value.name === comicData.nextComic)
        : undefined

      this.originalPreviousComic = this.comicOptions.find(c => c.value.name === comicData.previousComic)
      this.originalNextComic = this.comicOptions.find(c => c.value.name === comicData.nextComic)

      this.prevComicResetValue = Math.random().toString()
      this.nextComicResetValue = Math.random().toString()
    },

    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  watch: {
    comic () {
      if (this.comic) { this.resetFields() }
		},

		comicOptions () {
			this.comic = this.comicOptions.find(c => c.value.id === this.lastComicId)
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

const categoryOptions = [
  {text: 'Furry', value: 'Furry'},
  {text: 'MLP', value: 'MLP'},
  {text: 'Pokemon', value: 'Pokemon'},
  {text: 'Other', value: 'Other'},
]

const tagOptions = [
  {text: 'M', value: 'M'},
  {text: 'F', value: 'F'},
  {text: 'MF', value: 'MF'},
  {text: 'MM', value: 'MM'},
  {text: 'FF', value: 'FF'},
  {text: 'MF+', value: 'MF+'},
  {text: 'I', value: 'I'},
]

const stateOptions = [
  {text: 'WIP', value: 'wip'},
  {text: 'Finished', value: 'finished'},
  {text: 'Cancelled', value: 'cancelled'},
]
</script>

<style lang="scss">
#fourSelectsContainer {
  flex-wrap: wrap;
  justify-content: center;
  width: fit-content;
  gap: 0.5rem;

	@media (min-width: 900px) {
    flex-direction: row;
	}
}

.prev-next-comic-container {
  display: flex;
  flex-direction: column;
  width: fit-content;
}
</style>

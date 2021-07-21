<template>
<div>
  <h2 class="mt-32 mb-8">
    Comic data
  </h2>

  <ResponseMessage :message="updateDataResponseMessage"
                   :messageType="updateDataResponseMessageType"
                   @closeMessage="() => updateDataResponseMessage = ''"
                   class="mt-16 mb-16" />

  <div class="verticalFlex alignItemsStart fitContent marginAuto">
    <TextInput :value="comic.name"
                @change="newName => comic.name = newName"
                textAlign="left"
                title="Comic name"
                class="mb-24"
                style="width: 100%;"/>

    <Select :options="artistOptions"
            title="Artist"
            isSearchable
            searchKeepSelected
            initialWidth="10rem"
            :defaultValue="selectedArtist"
            :searchSelected="selectedArtist ? selectedArtist.name : null"
            :resetValue="artistResetValue"
            @searchSelectedClicked="selectedArtist = null"
            @change="onArtistSelect"
            class="mb-24"
            style="width: 100%;"/>

    <div class="horizontalFlex width100 justifyStart">
      <Select :options="categoryOptions"
              title="Category"
              :defaultValue="{text: comic.cat, value: comic.cat}"
              @change="newCat => comic.cat = newCat"
              class="tagCatSelects mb-24 mr-16"
              initialWidth="6rem"
              :resetValue="allSelectResetValue"/>

      <Select :options="tagOptions"
              title="Classification"
              :defaultValue="{text: comic.tag, value: comic.tag}"
              @change="newVal => comic.tag = newVal"
              class="tagCatSelects ml-8"
              initialWidth="6rem"
              :resetValue="allSelectResetValue"/>   
    </div>

    <Select :options="stateOptions"
            title="State"
            :defaultValue="stateOptions.find(so => so.value === comic.state)"
            initialWidth="10rem"
            isFullWidth
            @change="onStateSelect"
            :resetValue="allSelectResetValue"/>  

    <!-- PREVIOUS AND NEXT COMIC LINKS -->
    <p class="admin-mini-header textAlignLeft mt-32">
      Comic links
    </p>
    <Select :options="comicOptions"
            title="Previous comic"
            isSearchable
            searchKeepSelected
            searchPlaceholder="None if left blank"
            initialWidth="16rem"
            :defaultValue="comic.previousComic ? comicOptions.find(co => co.value.name === comic.previousComic) : null"
            :searchSelected="comic.previousComic ? comic.previousComic.name : null"
            :resetValue="prevComicResetValue"
            @searchSelectedClicked="comic.previousComic = null"
            @change="onPrevComicSelect"/>

    <Select :options="comicOptions"
            title="Next comic"
            isSearchable
            searchKeepSelected
            searchPlaceholder="None if left blank"
            initialWidth="16rem"
            class="mt-24"
            :defaultValue="comic.nextComic ? comicOptions.find(co => co.value.name === comic.nextComic) : null"
            :searchSelected="comic.nextComic ? comic.nextComic.name : null"
            :resetValue="nextComicResetValue"
            @searchSelectedClicked="comic.nextComic = null"
            @change="onNextComicSelect"/>

    <div class="horizontalFlex mt-16" v-if="hasChangedData">
      <button class="y-button y-button-neutral mr-8"
              @click="resetComicData">
        Reset
      </button>
      <LoadingButton :isLoading="isSubmittingDataUpdate"
                      @click="submitDataUpdate"
                      text="Save changes"
                      iconType="save"/>
    </div>
  </div>
</div>
</template>

<script>
import { doFetch } from '@/utils/statefulFetch'
import { mapGetters } from 'vuex'
import comicApi from '@/api/comicApi'
import artistApi from '@/api/artistApi'
import ResponseMessage from '@/components/ResponseMessage.vue'
import TextInput from '@/components/TextInput.vue'
import Select from '@/components/Select.vue'
import LoadingButton from '@/components/LoadingButton.vue'

export default {
  name: 'pendingComicInfo',

  props: {
    initialComic: Object,
  },

  components: {
    ResponseMessage, TextInput, Select, LoadingButton,
  },

  data () {
    return {
      comic: {
        ...this.initialComic,
      },
      selectedArtist: {name: this.initialComic?.artistName, id: this.initialComic?.artistId},

      isSubmittingDataUpdate: false,
      updateDataResponseMessage: '',
      updateDataResponseMessageType: 'error',

      artistResetValue: null,
      allSelectResetValue: null,
      prevComicResetValue: null,
      nextComicResetValue: null,

      categoryOptions,
      tagOptions,
      stateOptions,
    }
  },

  computed: {
    ...mapGetters([
      'artistList',
      'allComics',
      'pendingComics',
    ]),


    hasChangedData () {
      let comicKeys = ['tag', 'cat', 'name', 'state']
      for (let key of comicKeys) {
        if (this.comic[key] !== this.initialComic[key]) {
          return true
        }
      }

      if (this.comic.nextComic?.id !== this.initialComic.nextComic?.id) {
        return true
      }
      if (this.comic.previousComic?.id !== this.initialComic.previousComic?.id) {
        return true
      }

      if (this.selectedArtist?.id !== this.initialComic?.artistId) {
        return true
      }

      return false
    },

    artistOptions () {
      return this.artistList.payload.map(a => ({text: a.name, value: a}))
    },

    comicOptions () {
      let comicsMapped = this.allComics.payload.map(c => ({text: c.name, value: c}))
      let pendingComicsMapped = this.pendingComics.payload.map(c => ({text: `PENDING: ${c.name}`, value: c}))
      return comicsMapped.concat(pendingComicsMapped)
    },
  },

  async mounted () {
    this.resetComicData()

    if (!this.artistList.fetched && !this.artistList.fetching) {
      doFetch(this.$store.commit, 'artistList', artistApi.getArtistList())
    }
    if (!this.allComics.fetched && !this.allComics.fetching) {
      doFetch(this.$store.commit, 'allComics', comicApi.getAllComics())
    }
    if (!this.pendingComics.fetched && !this.pendingComics.fetching) {
      doFetch(this.$store.commit, 'pendingComics', comicApi.getPendingComics(), comics => (
        comics.map(c => ({...c, isPending: true}))
      ))
    }
  },

  methods: {
    onArtistSelect (artist) {
      this.selectedArtist = artist
      this.artistResetValue = Math.random().toString()
    },

    onStateSelect (newState) {
      this.comic.state = newState
    },

    onPrevComicSelect (prevComic) {
      this.comic.previousComic = prevComic
      this.prevComicResetValue = Math.random().toString()
    },

    onNextComicSelect (nextComic) {
      this.comic.nextComic = nextComic
      this.nextComicResetValue = Math.random().toString()
    },

    resetComicData () {
      this.comic = {
        ...this.initialComic,
      }
      this.selectedArtist = {name: this.initialComic?.artistName, id: this.initialComic?.artistId}
      let randomVal = Math.random().toString()
      this.artistResetValue = randomVal
      this.allSelectResetValue = randomVal
      this.prevComicResetValue = randomVal
      this.nextComicResetValue = randomVal
    },

    async submitDataUpdate () {
      this.isSubmittingDataUpdate = true
      let result = await comicApi.updatePendingComicData(
        this.comic.id, this.comic.name, this.selectedArtist.id, this.comic.cat, this.comic.tag, this.comic.state,
        this.comic.nextComic ? {id: this.comic.nextComic.id, isPending: this.comic.nextComic.isPending } : null,
        this.comic.previousComic ? {id: this.comic.previousComic.id, isPending: this.comic.previousComic.isPending } : null,
      )
      this.isSubmittingDataUpdate = false

      if (result.success) {
        this.updateDataResponseMessage = `Success updating ${this.comic.name}`
        this.updateDataResponseMessageType = 'success'
        this.$emit('reloadComic')
      }
      else {
        this.updateDataResponseMessage = `Error: ${result.message}`
        this.updateDataResponseMessageType = 'error'
      }
    },
  },

  watch: {
    initialComic () {
      this.comic = {
        ...this.initialComic,
      }
      this.selectedArtist = {
        name: this.initialComic?.artistName, id: this.initialComic?.artistId
      }
      this.resetComicData()
    }
  }
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

<style>

</style>
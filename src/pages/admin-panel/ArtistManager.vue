<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader" v-if="!isAddingNewArtist">
      Artist Manager
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <FetchResponseMessage :fetchStates="[artistUpdate, createArtist]" 
                            :successMessage="successMessage" 
                            disableElevation
                            class="mb-16"/>

      <div>
        <div class="verticalFlex marginAuto no-margin-bot mt-16 flexWrap alignItemsEnd" v-if="!isAddingNewArtist">
          <Select :options="artistOptions"
                  title="Artist"
                  isSearchable
                  searchKeepSelected
                  searchPlaceholder="Search for artist"
                  initialWidth="10rem"
                  :searchSelected="artist ? artist.name : null"
                  :resetValue="artistResetValue"
                  @searchSelectedClicked="artist = null"
                  @change="onArtistSelect"/>

          <a :href="`https://yiffer.xyz/artist/${artist.name}`"
            v-if="artist"
            target="_blank"
            class="underline-link mt-8">
            Go to artist <RightArrow/>
          </a>
        </div>

        <button v-if="!isAddingNewArtist && !artist"
                class="y-button button-with-icon mt-64"
                @click="isAddingNewArtist = true">
          <PlusIcon/>Add new artist
        </button>
      </div>

      <div v-if="artist" id="artistContent" class="verticalFlex alignItemsStart justifyContentStart">
        <div id="e621AndPatreonGrid" class="">
          <!-- E621 Name -->
          <label class="textAlignLeft">
            E621 name
          </label>
          <TextInput v-if="isEditingE621Name"
                     :value="artist.e621Name"
                     @change="newInput => artist.e621Name = newInput"
                     textAlign="left"/>
          <button v-if="isEditingE621Name"
                  title="Undo edit"
                  @click="resetE621Name"
                  class="y-button yButtonRound y-button-neutral">
            <UndoIcon title="Undo edit"/>
          </button>

          <a v-if="!isEditingE621Name && artist.e621Name"
             :href="`https://e621.net/post/index/1/${artist.e621Name}`"
             class="underline-link textAlignLeft"
             target="_blank">
            {{artist.e621Name}}
          </a>
          <p v-if="!isEditingE621Name && !artist.e621Name">-</p>

          <div class="horizontalFlex justifyContentStart" v-if="!isEditingE621Name">
            <button @click="isEditingE621Name=true"
                    class="y-button yButtonRound y-button-neutral mr-4">
              <EditIcon title=""/>
            </button>
            <button @click="clearE621Name"
                    v-if="artist.e621Name"
                    class="y-button yButtonRound y-button-neutral">
              <DeleteIcon title=""/>
            </button>
          </div>

          <!-- Patreon Name -->
          <label class="textAlignLeft">
            Patreon name
          </label>
          <TextInput v-if="isEditingPatreonName"
                     :value="artist.patreonName"
                     @change="newInput => artist.patreonName = newInput"
                     textAlign="left"/>
          <button v-if="isEditingPatreonName"
                  title="Undo edit"
                  @click="resetPatreonName"
                  class="y-button yButtonRound y-button-neutral">
            <UndoIcon title="Undo edit"/>
          </button>

          <a v-if="!isEditingPatreonName && artist.patreonName"
             :href="`https://www.patreon.com/${artist.patreonName}`"
             class="underline-link textAlignLeft"
             target="_blank">
            {{artist.patreonName}}
          </a>
          <p v-if="!isEditingPatreonName && !artist.patreonName">-</p>

          <div class="horizontalFlex justifyContentStart">
            <button @click="isEditingPatreonName=true"
                    v-if="!isEditingPatreonName"
                    class="y-button yButtonRound y-button-neutral mr-4">
              <EditIcon title=""/>
            </button>
            <button @click="clearPatreonName"
                    v-if="artist.patreonName && !isEditingPatreonName"
                    class="y-button yButtonRound y-button-neutral">
              <DeleteIcon title=""/>
            </button>
          </div>
        </div>

        <!-- LINKS -->
        <p class="admin-mini-header no-margin-bot margin-top-8">
          Artist links
        </p>

        <div class="verticalFlex scrolling-table-container justifyContentStart alignItemsStart">
          <div v-for="(link, index) in existingArtistLinks"
               :key="index"
               class="horizontalFlex mt-8 alignItemsCenter">
            <button v-if="!link.isBeingDeleted && !link.isBeingEdited"
                    @click="link.isBeingEdited=true"
                    class="y-button yButtonRound y-button-neutral mr-4">
              <EditIcon/>
            </button>
            <button v-if="!link.isBeingDeleted && !link.isBeingEdited"
                    @click="deleteLink(index)"
                    class="y-button yButtonRound y-button-neutral mr-8">
              <DeleteIcon/>
            </button>

            <button v-if="link.isBeingDeleted"
                    @click="undoLinkEdit(index)"
                    title="Undo"
                    class="y-button yButtonRound y-button-neutral mr-8">
              <UndoIcon title="Undo delete"/>
            </button>

            <a v-if="!link.isBeingEdited"
               :class="{'red-linethrough-text': link.isBeingDeleted}"
               class="underline-link textAlignLeft"
               :href="link.url"
               target="_blank">
              {{link.url}}
            </a>

            <button v-if="link.isBeingEdited"
                    @click="undoLinkEdit(index)"
                    title="Undo"
                    class="y-button yButtonRound y-button-neutral mr-4">
              <UndoIcon title="Undo"/>
            </button>
            <button v-if="link.isBeingEdited"
                    @click="deleteLink(index)"
                    title="Delete link"
                    class="y-button yButtonRound y-button-neutral mr-8">
              <DeleteIcon title="Delete link"/>
            </button>

            <TextInput v-if="link.isBeingEdited"
                       :value="link.url"
                       textAlign="left"
                       @change="newInput => link.url = newInput"
                       class="linkInput"/>
          </div>

          <div v-for="(link, index) in newLinks" :key="index" class="horizontalFlex mt-8 alignItemsCenter">
            <button @click="deleteNewLink(index)"
                    class="y-button yButtonRound mr-8">
              <DeleteIcon title="Delete link"/>
            </button>

            <TextInput :value="newLinks[index]"
                       textAlign="left"
                       @change="newInput => newLinks[index] = newInput"
                       class="linkInput"/>
          </div>
        </div>

        <button @click="addLink()" class="y-button button-with-icon y-button-neutral mt-8">
          <PlusIcon title/> Add link
        </button>

        <button v-if="!isEditingName"
                @click="isEditingName=true"
                class="y-button button-with-icon y-button-neutral mt-32">
          <EditIcon/> Edit artist name
        </button>

        <div v-if="isEditingName" class="horizontalFlex alignItemsEnd mt-32">
          <TextInput title="New artist name"
                     :value="newName"
                     @change="newInput => newName = newInput"
                     textAlign="left"/>
          <button title="Undo edit"
                  @click="undoNameEdit"
                  class="y-button yButtonRound margin-left-4"
                  style="height: fit-content">
            <UndoIcon title="Undo edit"/>
          </button>
        </div>


        <div class="horizontalFlex margin-top-32">
          <button @click="cancelChanges()" class="y-button y-button-neutral button-with-icon mr-8">
            <CancelIcon title=""/> Cancel
          </button>
          <LoadingButton @click="saveArtistChanges()"
                         text="Save changes"
                         :isLoading="artistUpdate.fetching"
                         iconType="check"/>
        </div>
      </div>


      <div v-if="isAddingNewArtist" class="verticalFlex alignItemsStart">
        <h2>New artist</h2>
        
        <TextInput :value="artistName"
                   @change="newName => artistName = newName"
                   textAlign="left"
                   title="New artist name"/>

        <div class="horizontalFlex mt-16">
          <button class="y-button y-button-neutral button-with-icon mr-8"
                  @click="cancelNewArtist">
            <CancelIcon title=""/> Cancel
          </button>

          <LoadingButton @click="addNewArtist()"
                        text="Add artist"
                        :isLoading="createArtist.fetching"
                        iconType="check"/>
        </div>

      </div>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import artistApi from '@/api/artistApi'
import Select from '@/components/Select.vue'
import TextInput from '@/components/TextInput.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import FetchResponseMessage from '@/components/FetchResponseMessage.vue'

import DeleteIcon from 'vue-material-design-icons/TrashCanOutline.vue'
import EditIcon from 'vue-material-design-icons/Pencil.vue'
import CancelIcon from 'vue-material-design-icons/Close.vue'
import UndoIcon from 'vue-material-design-icons/Undo.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'
import { mapGetters } from 'vuex'
import { doFetch } from '@/utils/statefulFetch'

export default {
  name: 'artistManager',

  props: {
    artistList: Array,
  },

  components: {
    Select, TextInput, LoadingButton, FetchResponseMessage,
    DeleteIcon, EditIcon, CancelIcon, UndoIcon, PlusIcon, RightArrow,
  },

  data: function () {
    return {
      isOpen: false,
      artist: undefined,
			artistName: '',
      artistResetValue: null,
      artistCopy: undefined,

      isEditingName: false,
      newName: '',

      existingArtistLinks: [],
      existingArtistLinksCopy: [],

      isEditingE621Name: false,
      isEditingPatreonName: false,

      newLinks: [],

      isAddingNewArtist: false,
      newArtistName: '',

      successMessage: '',
    }
  },

  computed: {
    ...mapGetters(['artistUpdate', 'createArtist']),

    artistOptions () {
      return this.artistList.map(a => ({text: a.name, value: a.name}))
    },
  },

  methods: {
    onArtistSelect (artistName) {
      this.artist = this.artistList.find(a => a.name === artistName)
      this.artistResetValue = Math.random().toString()
      this.artistChanged()
    },

    undoNameEdit () {
      this.newName = this.artistCopy.name + ''
      this.isEditingName = false
    },
    resetE621Name () {
      this.artist.e621Name = this.artistCopy.e621Name
      this.isEditingE621Name = false
    },
    resetPatreonName () {
      this.artist.patreonName = this.artistCopy.patreonName
      this.isEditingPatreonName = false
    },
    clearE621Name () {
      this.artist.e621Name = null
      this.isEditingE621Name = false
    },
    clearPatreonName () {
      this.artist.patreonName = null
      this.isEditingPatreonName = false
    },

    cancelChanges () {
      this.artist = {...this.artistCopy}
      this.artist = undefined
      this.isEditingE621Name = false
      this.isEditingPatreonName = false
      this.newLinks = []
      this.newName = ''
      this.isEditingName = false
    },

    async artistChanged () {
      this.existingArtistLinks = []
      if (!this.artist) {
        return
      }

      let artistData = await artistApi.getArtistByName(this.artist.name)
      this.existingArtistLinks = artistData.result.links.map(link => ({url: link.linkUrl, isBeingDeleted: false, isBeingEdited: false}))
      this.existingArtistLinksCopy = artistData.result.links.map(link => ({url: link.linkUrl, isBeingDeleted: false, isBeingEdited: false}))
      this.artistCopy = {...this.artist}
      this.newName = this.artist.name + ''
    },

    undoLinkEdit (linkIndex) {
      let newLink = {url: this.existingArtistLinksCopy[linkIndex].url, isBeingDeleted: false, isBeingEdited: false}
      this.existingArtistLinks.splice(linkIndex, 1, newLink)
    },

    deleteLink (linkIndex) {
      let newLink = {url: this.existingArtistLinksCopy[linkIndex].url, isBeingDeleted: true, isBeingEdited: false}
      this.existingArtistLinks.splice(linkIndex, 1, newLink)
    },

    addLink () {
      this.newLinks.push('')
    },

    deleteNewLink (linkIndex) {
      this.newLinks.splice(linkIndex, 1)
    },

    selectNewlyCreatedArtist () {
      let newArtist = this.artistList.find(a => a.name.toUpperCase() === this.newArtistName.toUpperCase())
      if (!newArtist) {
        setTimeout(this.selectNewlyCreatedArtist, 300)
      }
      else {
        this.artist = newArtist
      }
    },

    async addNewArtist () {
      this.newArtistName = this.artistName

      let name = this.artistName[0].toUpperCase() + this.artistName.substring(1)
      let isSuccess = await doFetch(this.$store.commit, 'createArtist',
        artistApi.addNewArtist(name))

      if (isSuccess) {
        this.successMessage = `Success adding artist ${this.artistName}. Please add links and names!`
        this.$emit('refresh-artist-list')
        setTimeout(this.selectNewlyCreatedArtist, 300)
        this.cancelNewArtist()
      }
    },

    cancelNewArtist () {
      this.isAddingNewArtist = false
      this.newArtist = ''
      this.newLinks = []
      this.isEditingE621Name = false
      this.isEditingPatreonName = false
    },

    async saveArtistChanges () {
      let links = this.existingArtistLinks
        .filter(link => !link.isBeingDeleted)
        .map(link => link.url)

      if (this.newLinks.length > 0) {
        links = links.concat(this.newLinks.filter(link => link))
      }

      let requestBody = {
        artistName: this.isEditingName ? this.newName : this.artist.name,
        e621Name: this.artist.e621Name,
        patreonName: this.artist.patreonName,
        links: links
      }

      let isSuccess = await doFetch(this.$store.commit, 'artistUpdate',
        artistApi.saveArtistChanges(this.artist.id, requestBody))

      if (isSuccess) {
        this.successMessage = `Success updating artist ${this.artist.name}`
        this.newLinks = []
        this.isEditingE621Name = false
        this.isEditingPatreonName = false
        if (this.isEditingName) {
          this.newArtistName = this.newName
          this.cancelChanges()
          this.$emit('refresh-artist-list')
          setTimeout(this.selectNewlyCreatedArtist, 300)
        }
        else {
          this.artistChanged()
        }
      }
    },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
}
</script>

<style lang="scss" scoped>
#artistContent {
  p {
    white-space: nowrap;
  }
}

.linkInput {
  width: calc(min(70vw, 24rem));
}

#e621AndPatreonGrid {
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  justify-content: start;
  row-gap: 1rem;
  column-gap: 1rem;
  margin: 2rem 0 1rem 0;
  @media (max-width: 500px) {
    column-gap: 0.5rem;
  }
}

.red-linethrough-text {
  text-decoration: line-through;
  color: red;
}
</style>

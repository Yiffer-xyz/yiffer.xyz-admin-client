<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Artist Manager</h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <ResponseMessage :message="responseMessageEdit" :messageType="responseMessageTypeEdit" @closeMessage="closeResponseMessageEdit"
                       class="margin-bottom-10"/>

      <div class="horizontalFlex" style="align-items: center; margin-bottom: 8px;">
        <p style="margin-right: 8px;">Artist:</p>
        <select v-model="artist" class="no-margin-bot" @change="artistChanged">
          <option v-for="artist in artistList" :key="artist.id" :value="artist">
            {{artist.name}}
          </option>
        </select>

        <a :href="`https://yiffer.xyz/artist/${artist.name}`"
           v-if="artist" style="margin-left: 8px;" target="_blank" class="underline-link">
          Go to artist <RightArrow/>
        </a>
      </div>

      <span v-if="artist" id="artistContent" class="verticalFlex">
        <button v-if="!isEditingName" @click="isEditingName=true" class="y-button y-button-neutral button-with-icon margin-top-10 margin-bottom-10">
          <EditIcon/> Edit artist name
        </button>

        <div v-if="isEditingName" style="margin-top: 12px; margin-bottom: 13px;">
          <label class="admin-mini-header no-margin-bot">New artist name: </label>
          <input type="text" v-model="newName" style="width: 120px;"/>
          <button title="Undo edit" @click="undoNameEdit" class="y-button y-button-neutral y-button-small margin-left-4">
            <UndoIcon title="Undo edit"/>
          </button>
        </div>

        <p class="admin-mini-header no-margin-bot margin-top-8">Artist info</p>
        <div id="e621AndPatreonGrid">
          <!-- E621 Name -->
          <label style="justify-self: end;">E621 name</label>
          <input v-if="isEditingE621Name" type="text" v-model="artist.e621Name" style="margin-left: 4px; width: 120px;"/>
          <button v-if="isEditingE621Name" title="Undo edit" @click="resetE621Name" class="y-button y-button-neutral y-button-small">
            <UndoIcon title="Undo edit"/>
          </button>

          <a v-if="!isEditingE621Name && artist.e621Name" :href="`https://e621.net/post/index/1/${artist.e621Name}`" target="_blank">
            {{artist.e621Name}}
          </a>
          <p v-if="!isEditingE621Name && !artist.e621Name">-</p>

          <span v-if="!isEditingE621Name">
            <button @click="isEditingE621Name=true" class="y-button y-button-neutral y-button-small">
              <EditIcon title=""/>
            </button>
            <button @click="clearE621Name" v-if="artist.e621Name" class="y-button y-button-neutral y-button-small margin-left-4">
              <DeleteIcon title=""/>
            </button>
          </span>

          <!-- Patreon Name -->
          <label style="justify-self: end;">Patreon name</label>
          <input v-if="isEditingPatreonName" type="text" v-model="artist.patreonName" style="margin-left: 4px; width: 120px;"/>
          <button v-if="isEditingPatreonName" title="Undo edit" @click="resetPatreonName" class="y-button y-button-neutral y-button-small">
            <UndoIcon title="Undo edit"/>
          </button>

          <a v-if="!isEditingPatreonName && artist.patreonName" :href="`https://www.patreon.com/${artist.patreonName}`" target="_blank">
            {{artist.patreonName}}
          </a>
          <p v-if="!isEditingPatreonName && !artist.patreonName">-</p>

          <span v-if="!isEditingPatreonName">
            <button @click="isEditingPatreonName=true" class="y-button y-button-neutral y-button-small">
              <EditIcon title=""/>
            </button>
            <button @click="clearPatreonName" v-if="artist.patreonName" class="y-button y-button-neutral y-button-small margin-left-4">
              <DeleteIcon title=""/>
            </button>
          </span>
        </div>

        <p class="admin-mini-header no-margin-bot margin-top-8">Artist links</p>
        <p>FurAffinity, Twitter, Pixiv, Weasyl, Artist's own website, etc.</p>

        <div class="verticalFlex scrolling-table-container" style="justify-content: flex-start; align-items: flex-start;">
          <div v-for="(link, index) in existingArtistLinks" :key="index" class="horizontalFlex margin-top-4">
            <button v-if="!link.isBeingDeleted && !link.isBeingEdited" @click="link.isBeingEdited=true" class="y-button y-button-neutral y-button-small">
              <EditIcon/>
            </button>
            <button v-if="!link.isBeingDeleted && !link.isBeingEdited" @click="deleteLink(index)" class="y-button y-button-neutral y-button-small" style="margin-left: 4px;">
              <DeleteIcon/>
            </button>

            <button v-if="link.isBeingDeleted" @click="undoLinkEdit(index)" title="Undo" class="y-button y-button-neutral y-button-small">
              <UndoIcon title="Undo delete"/>
            </button>
            <a v-if="!link.isBeingEdited" style="margin-left: 4px;" :class="{'red-linethrough-text': link.isBeingDeleted}" :href="link.url" target="_blank">
              {{link.url}}
            </a>

            <button v-if="link.isBeingEdited" @click="undoLinkEdit(index)" title="Undo" class="y-button y-button-neutral y-button-small">
              <UndoIcon title="Undo"/>
            </button>
            <button v-if="link.isBeingEdited" @click="deleteLink(index)" title="Delete link" class="y-button y-button-neutral y-button-small" style="margin-left: 4px;">
              <DeleteIcon title="Delete link"/>
            </button>

            <input v-if="link.isBeingEdited" type="text" v-model="link.url" style="width: 360px; margin-left: 4px;"/>
          </div>
        </div>

        <button @click="addLink()" class="y-button y-button-neutral button-with-icon margin-top-8">
          <PlusIcon title/> Add link
        </button>

        <div v-if="newLinks.length > 0">
          <p class="admin-mini-header no-margin-bot margin-top-8">New links</p>
          <div v-for="(link, index) in newLinks" :key="index" class="horizontalFlex margin-bottom-4">
            <input type="text" v-model="newLinks[index]" style="width: 360px;"/>
            <button @click="deleteNewLink(index)" title="Delete link" class="y-button y-button-neutral y-button-small" style="margin-left: 4px;">
              <DeleteIcon title="Delete link"/>
            </button>
          </div>
        </div>

        <div class="horizontalFlex margin-top-32">
          <button @click="cancelChanges()" class="y-button y-button-neutral button-with-icon">
            <CancelIcon title=""/> Cancel
          </button>
          <button @click="saveArtistChanges()" class="y-button button-with-icon margin-left-16">
            <CheckIcon title=""/> Save changes
          </button>
        </div>
      </span>

      

      <h2 class="margin-top-32">Add new artist</h2>
      
      <ResponseMessage :message="responseMessageNewArtist" :messageType="responseMessageTypeNewArtist" @closeMessage="closeResponseMessageNewArtist"
                       class="margin-bottom-10"/>

      <div class="horizontalFlex" style="align-items: center;">
        <p style="margin-right: 8px;">Artist name:</p>
        <input type="text" v-model="artistName"/>
        <button @click="addNewArtist()" class="y-button button-with-icon" style="margin: 0 0 0 8px;">
          <CheckIcon/> Add artist
        </button>
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
import ResponseMessage from '@/components/ResponseMessage.vue'

import DeleteIcon from 'vue-material-design-icons/TrashCanOutline.vue'
import EditIcon from 'vue-material-design-icons/Pencil.vue'
import CancelIcon from 'vue-material-design-icons/Close.vue'
import UndoIcon from 'vue-material-design-icons/Undo.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import CheckIcon from 'vue-material-design-icons/CheckCircle.vue'
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'

export default {
  name: 'artistManager',

  props: {
    artistList: Array,
  },

  components: {
    ResponseMessage, 
    DeleteIcon, EditIcon, CancelIcon, UndoIcon, PlusIcon, CheckIcon, RightArrow,
  },

  data: function () {
    return {
      isOpen: false,
      artist: undefined,
			artistName: '',

      isEditingName: false,
      newName: '',

      existingArtistLinks: [],
      existingArtistLinksCopy: [],

      artistCopy: undefined,

      isEditingE621Name: false,
      isEditingPatreonName: false,

      newLinks: [],

      newArtistName: '',

      responseMessageNewArtist: null,
      responseMessageTypeNewArtist: 'info',
      responseMessageEdit: null,
      responseMessageTypeEdit: 'info',
    }
  },

  methods: {
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

    async addNewArtist () {
      let response
      this.isArtistListRefreshed = false
      this.newArtistName = this.artistName
      if (!this.artistName || this.artistName.length < 2) {
        this.responseMessageNewArtist = 'Name must be at least two characters long'
        this.responseMessageTypeNewArtist = 'error'
      }
      else {
        let name = this.artistName[0].toUpperCase() + this.artistName.substring(1)
        response = await artistApi.addNewArtist(name)
      }

      if (response.success) {
        this.responseMessageNewArtist = `Success adding artist ${this.artistName}. Please add links and names above!`
        this.responseMessageTypeNewArtist = 'success'
        this.artistName = ''
        this.artist = null
        this.artistChanged()
        this.$emit('refresh-artist-list')
        setTimeout(this.selectNewlyCreatedArtist, 300)
      }
      else {
        this.responseMessageNewArtist = 'Error adding artist: ' + response.message
        this.responseMessageTypeNewArtist = 'error'
      }
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

      let response = await artistApi.saveArtistChanges(this.artist.id, requestBody)

      if (response.success) {
        this.responseMessageEdit = `Success updating artist ${this.artist.name}`
        this.responseMessageTypeEdit = 'success'
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
      else {
        this.responseMessageEdit = 'Error adding links: ' + response.message
        this.responseMessageTypeEdit = 'error'
      }
    },

    closeResponseMessageNewArtist () {
      this.responseMessageNewArtist = ''
    },
    closeResponseMessageEdit () {
      this.responseMessageEdit = ''
    },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
}
</script>

<style lang="scss">
#artistContent {
  align-items: center;
  width: 100%;
  p {
    white-space: nowrap;
  }
}

#e621AndPatreonGrid {
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  row-gap: 4px;
  column-gap: 16px;
  margin: 6px auto;
}

.artist-link-input {
  margin-top: 2px;
  width: 350px;
  @media (max-width: 900px) {
    width: 90%;
  }
}

.red-linethrough-text {
  text-decoration: line-through;
  color: red;
}
</style>

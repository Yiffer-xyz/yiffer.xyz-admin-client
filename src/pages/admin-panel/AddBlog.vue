<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Add blog</h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                        class="m-8"/>

      <div class="verticalFlex alignItemsStart" style="width: 16rem;">
        <TextInput :value="title"
                  @change="v => title = v"
                  textAlign="left"
                  title="Title"
                  style="width: 100%;"
                  class="mb-24"/>

        <TextInput :value="displayDays"
                  @change="v => displayDays = v"
                  textAlign="left"
                  title="Display days"
                  class="mb-24"
                  style="width: 6rem;"
                  type="number"/>
      </div>

      <TextInput :value="content"
                @change="v => content = v"
                textAlign="left"
                title="Content"
                class="mb-24"
                style="width: 40rem; max-width: 90%;"
                type="textarea"
                :textAreaRows="2"/>

      <div v-show="content" style="width: 40rem; max-width: 90%;">
        <p style="text-align: left;" v-html="content"/>

        <button @click="submitNewBlog" class="y-button mt-16">
          Submit
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
import blogApi from '@/api/blogApi'

import ResponseMessage from '@/components/ResponseMessage.vue'
import TextInput from '@/components/TextInput.vue'

export default {
  name: 'addBlog',

  components: {
    ResponseMessage, TextInput,
  },
  
  data: function () {
    return {
      isOpen: false,
      title: '',
      displayDays: 0,
      content: '',
      responseMessage: '',
      responseMessageType: 'info',
    }
  },

  methods: {
    async submitNewBlog () {
      let response = await blogApi.addBlog(this.title, true, this.content, this.displayDays)

      if (response.success) {
        this.responseMessage = 'Successfully added blog!'
        this.responseMessageType = 'success'
        this.clearContent()
      }
      else {
        this.responseMessage = 'Error: ' + response.message
        this.responseMessageType = 'error'
      }
    },

    clearContent () {
      this.title = ''
      this.displayDays = 0
      this.content = ''
    },

    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
}
</script>

<style lang="scss">
#newBlogTable {
  td {
    text-align: left;
  }
  input[type="text"] {
    width: 12rem;
  }
  input[type="number"] {
    width: 2.5rem;
  }
}
</style>
<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Feedback</h2>
    <span class="admin-content-box-inner" v-if="isOpen">
      <span v-if="feedback.fetched">
        <div v-for="fb in feedback.payload"
           :key="fb.id"
             class="oneFeedback"
             :class="{'newFeedback': !fb.isRead}">

          <Loading v-if="feedbackLoadingId && feedbackLoadingId === fb.id"
                   styles="margin: 1rem auto;"
                   text="Processing..." />

          <span v-else>
            <p style="font-weight: 400;">
              By: {{fb.user || 'Anon'}}, {{prettyDate(fb.timestamp)}}
            </p>

            <p class="mt-4 mb-8" style="text-align: left;">
              {{fb.text}}
            </p>

            <div class="horizontalFlexLeft">
              <button @click="() => markFeedbackRead(fb)"
                      v-if="!fb.isRead"
                      class="y-button y-button-neutral button-with-icon mr-8">
                <CheckIcon/> Have read
              </button>
              <button @click="() => deleteFeedback(fb)"
                      class="y-button y-button-red button-with-icon">
                <DeleteIcon/> Delete
              </button>
            </div>
          </span>
        </div>
      </span>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import Loading from '@/components/LoadingIndicator.vue'

export default {
  name: 'feedback',

  components: {
    CheckIcon, DeleteIcon, Loading,
  },

  computed: {
    ...mapGetters(['feedback'])
  },
  
  data: function () {
    return {
      isOpen: false,
      feedbackLoadingId: null,
    }
  },
  
  async mounted () {
    this.getFeedback()
    this.$store.watch(this.$store.getters.get_feedback, () => {this.feedbackLoadingId = null})
  },

  methods: {
    async getFeedback () {
      this.$store.dispatch('getFeedback')
    },

    async markFeedbackRead (feedback) {
      this.feedbackLoadingId = feedback.id
      this.$store.dispatch('markFeedbackRead', feedback.id)
    },

    async deleteFeedback (feedback) {
      this.feedbackLoadingId = feedback.id
      this.$store.dispatch('deleteFeedback', feedback.id)
    },

    prettyDate: inputDate => new Date(inputDate).toString().substring(0, 21),

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
}
</script>

<style lang="scss">
  .oneFeedback { 
    padding: 0.5rem;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  }
  .newFeedback {
    border: 3px solid $themeGreen1;
  }
  .dark {
    .newFeedback {
      border: 2px solid $themeGreen1;
    }
    .oneFeedback {
      background-color: $themeDark1;
    }
  }
</style>
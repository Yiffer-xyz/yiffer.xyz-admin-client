<template>
  <ResponseMessage
    :message="currentMessage"
    :messageType="currentMessageType"
    :preventClose="preventClose"
    :outsideStyle="outsideStyle"
    :classes="classes"
    :disableElevation="disableElevation"
    @closeMessage="closeMessage"

  />
</template>

<script>
import { fetchClear } from '../utils/statefulFetch'
import ResponseMessage from './ResponseMessage'

export default {
  components: {
    ResponseMessage,
  },

  props: {
    successMessage: String,
    fetchStates: Array,
    preventClose: Boolean,
    outsideStyle: String,
    classes: String,
    disableElevation: Boolean,
  },

  data: function () {
    return {
      currentMessage: '',
      currentMessageType: 'success',
      currentFetchStateName: null,
    }
  },

  methods: {
    closeMessage () {
      if (this.preventClose) { return }

      this.currentMessage = ''
      this.currentMessageType = 'success'
      fetchClear(this.$store.commit, this.currentFetchStateName)
    },
  },

  watch: {
    fetchStates (newFetchState) {
      for (let fetchState of newFetchState) {
        if (fetchState.fetched) {
          this.currentMessage = this.successMessage
          this.currentMessageType = 'success'
          this.currentFetchStateName = fetchState.name
          return
        }
        if (fetchState.failed) {
          this.currentMessage = fetchState.errorMessage
          this.currentMessageType = 'error'
          this.currentFetchStateName = fetchState.name
          return
        }
        if (fetchState.fetching) {
          this.currentMessage = ''
          this.currentMessageType = 'success'
        }
      }
    }
  }
}
</script>

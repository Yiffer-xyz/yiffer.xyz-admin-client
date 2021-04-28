<template>
  <form class="yForm2"
        enctype="multipart/form-data"
        @submit.prevent="$emit('submit')"
        :style="`width: min(${maxWidth || width}px, 95%); margin: 1rem auto; ${styles}`">
    <h3 style="text-align: left;">
      {{header}}
    </h3>

    <slot v-if="!fetchState.fetched"></slot>

    <ResponseMessage :message="responseMessage"
                     :messageType="fetchState.failed ? 'error' : 'success'"
                     :preventClose="fetchState.fetched"
                     disableElevation
                     @closeMessage="responseMessage = ''"
                     :style="fetchState.fetched ? 'margin-top: 0; width: 100%;' : 'margin-top: 1rem; width: 100%;'"/>

    <div v-if="!hideSubmit && !fetchState.fetched" class="horizontalFlex inlineFlex buttonsContainer">
      <button class="y-button y-button-neutral button-with-icon mr-8"
              type="button"
              v-if="includeCancel"
              @click="$emit('cancel')">
        <CrossIcon title=""/>
        Cancel
      </button>

      <LoadingButton :text="buttonText"
                     :iconType="buttonIconType"
                     :isDisabled="!canSubmit"
                     :isLoading="fetchState.fetching"
                     styles="align-self: center;"/>
    </div>

    <button v-if="showCloseOnSuccess && fetchState.fetched"
            class="y-button"
            style="align-self: flex-end;"
            @click="$emit('cancel')">
      {{closeButtonText}}
    </button>
  </form>
</template>

<script>
import CrossIcon from 'vue-material-design-icons/Close.vue'
import ResponseMessage from '@/components/ResponseMessage.vue'
import LoadingButton from '@/components/LoadingButton.vue'

export default {
  name: 'yifferForm',

  components: {
    ResponseMessage, LoadingButton, CrossIcon
  },

  props: {
    fetchState: Object,
    header: String,
    successText: String,
    fetchingText: String,
    errorText: String,
    buttonText: String,
    canSubmit: {
      type: Boolean,
      required: false,
      default: true,
    },
    includeCancel: Boolean,
    hideSubmit: Boolean,
    maxWidth: String,
    width: {
      type: Number,
      required: false,
      default: 600,
    },
    showCloseOnSuccess: Boolean,
    closeButtonText: {
      type: String,
      required: false,
      default: 'Close',
    },
    buttonIconType: String,
    styles: {
      type: String,
      required: false,
      default: '',
    },
  },

  data: function () {
    return {
      responseMessage: '',
    }
  },
  
  watch: {
    fetchState () {
      if (this.fetchState.failed) {
        this.responseMessage = this.fetchState.errorMessage
      }
      else if (this.fetchState.fetched) {
        this.responseMessage = this.successText
      }
      else {
        this.responseMessage = ''
      }
    },
  },

  methods: {
    async submit () {
      if (!this.canSubmit) { return }
      this.$emit('submit')
    },
  },
}
</script>

<style lang="scss" scoped>
#inputContainer {
  input, textarea {
    width: 100%;
  }
  textarea {
    padding: 1px;
  }
  .input-cell {
    width: 400px;
  }
}
.buttonsContainer {
  margin: 1rem auto;
}
</style>

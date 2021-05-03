<template>
  <div :class="{
          'error-message': messageType==='error',
          'success-message': messageType==='success',
          'info-message': messageType==='info',
          disableElevation: disableElevation,
          [classes]: classes,
        }" 
       :style="outsideStyle"
       v-show="message && message.length > 0"
       id="responseMessageContainer">
    <p class="no-margin-top">{{message}}</p>
    <div @click="closeMessage()" v-if="!preventClose" class="close-container">
      <CloseIcon title="Close"/>
    </div>
  </div>
</template>

<script>
import scrollIntoView from 'scroll-into-view-if-needed'
import CloseIcon from 'vue-material-design-icons/CloseCircle.vue'

export default {
  components: {
    CloseIcon,
  },

  props: {
    message: String,
    messageType: String,
    preventClose: Boolean,
    outsideStyle: String,
    classes: String,
    disableElevation: Boolean,
  },

  data: function () {
    return {
    }
  },

  methods: {
    closeMessage () {
      this.$emit('closeMessage')
    },

    scrollMessageIntoView () {
      this.$nextTick(() => scrollIntoView(document.getElementById('responseMessageContainer'), {behavior: 'smooth', scrollMode: 'if-needed', block: 'nearest'}))
    }
  },

  watch: {
    message: function (newVal) {
      if (newVal) {
        this.scrollMessageIntoView()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.error-message, .success-message, .info-message {
  &:not(.disableElevation) {
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  }
  box-sizing: border-box;
  display: flex; 
  justify-content: space-between;
  flex-direction: row;
  padding: 22px 28px;
  color: white !important;
  border-radius: 4px;
  p {
    color: white;
  }
  margin-left: auto;
  margin-right: auto;
  width: fit-content;

  p, span {
    font-weight: 600;
  }
  
  .close-container {
    display: flex;
    margin-left: 6px;
    margin-right: -3px;
    margin-bottom: -1px;
    color: white;

    &:hover {
      cursor: pointer;
    }

    svg {
      bottom: 0;
    }
  }
}

.error-message {
  background: linear-gradient(45deg, #f35757, #e2557f);
}
.success-message {
  background: linear-gradient(45deg, $themeGreen1Dark, $themeGreen2Dark);
}
.info-message {
  background: linear-gradient(45deg, #57b5f3, #55c1e2);
}
.dark {
  .success-message {
    color: white;
    background: linear-gradient(45deg, $themeGreen1Darker, $themeGreen2Darker);
  }
}
</style>
<template>
  <button type="submit"
          class="y-button"
          :disabled="isDisabled"
          :class="{
            yBtnIconPadding: iconType || isLoading,
            'y-button-disabled': isDisabled,
            yButtonLoading: isLoading,
            yButtonSubmitRed: color === 'error',
            'y-button-neutral': color === 'neutral',
          }"
          @click="$emit('click')"
          :style="styles">
    <div style="width: 1rem; height: 1rem; margin-right: 0.25rem;" v-if="iconType || isLoading">
      <Spinner v-if="isLoading"
               size="12"
               :line-size="1"
               :line-bg-color="'transparent'"
               :line-fg-color="'white'"
               style="margin-left: -0.2rem;"/>
      <CheckIcon v-else-if="iconType === 'check'"/>
      <SaveIcon v-else-if="iconType === 'save'"/>
    </div>
    {{text}}
  </button>
</template>

<script>
import Spinner from 'vue-simple-spinner'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import SaveIcon from 'vue-material-design-icons/ContentSave.vue'

export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    iconType: {
      type: String,
      required: false,
      validator: prop => ['check', 'save'].includes(prop),
    },
    color: {
      type: String,
      required: false,
      default: 'primary',
      validator: color => ['primary', 'error', 'neutral'].includes(color),
    },
    styles: {
      type: String,
      required: false,
    }
  },

  components: {
    Spinner, CheckIcon, SaveIcon,
  }
}
</script>

<style lang="scss" scoped>
$buttonPaddingSides: 12px;
$buttonPaddingTopBot: 6px;
$buttonBorderWidth: 2px;

.yButtonSubmit {
  &:hover, &:focus {
    cursor: pointer;
    background-color: $themeBlueDarker;
    border-color: $themeBlueDarker;
  }

  span {
    color: white;
    margin-bottom: 1px;
  }
}

.yButtonSubmitRed {
  background-color: $themeRed;
  border-color: $themeRed;
  color: white;
  &:hover, &:focus {
    border-color: $themeRed2;
    background-color: $themeRed2;
  }
}

.yBtnIconPadding {
  padding-right: $buttonPaddingSides+2px;
  padding-left: $buttonPaddingSides - 2px;
}

.yButtonLoading {
  opacity: 0.7;
  box-shadow: none;
  &:hover {
    box-shadow: none;
  }
}
</style>
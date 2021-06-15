<template>
  <button type="submit"
          class="yButtonSubmit"
          :class="{
            yBtnIconPadding: iconType || isLoading,
            yButtonDisabled: isDisabled,
            yButtonLoading: isLoading,
            yButtonSubmitRed: color === 'error',
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
      validator: color => ['primary', 'error'].includes(color),
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
  display: flex;
  outline: none;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  &:hover, &:focus {
    box-shadow: 0 3px 7px rgba(0,0,0,0.18);
  }
  border-radius: 4px;
  padding: $buttonPaddingTopBot $buttonPaddingSides;
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  font-weight: 600;
  background-color: $themeBlueDark;
  color: white;
  border: 2px solid $themeBlueDark;
  width: fit-content;
  word-break: keep-all;
  transition: background-color 100ms, border-color 100ms, box-shadow 100ms, opacity 100ms;

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

.yButtonDisabled {
  opacity: 0.6;
  box-shadow: none;
  &:hover {
    box-shadow: none;
    cursor: not-allowed;
  }
}

.yButtonLoading {
  opacity: 0.7;
  box-shadow: none;
  &:hover {
    box-shadow: none;
  }
}

.dark {
  .yButtonSubmit {
    background-color: $themeBlueDT;
    border-color: $themeBlueDT;
    &:hover, &:focus {
      background-color: $themeBlueDTDarker;
      border-color: $themeBlueDTDarker;
    }
  }

  .yButtonSubmitRed {
    background-color: $themeRed2;
    border-color: $themeRed2;
    &:hover, &:focus {
        background-color: $themeRed3;
        border-color: $themeRed3;
    }
  }

  .yButtonDisabled {
    opacity: 0.7;
  }

}
</style>
<template>
  <div :class="`customSelect ${classes} ${isSearchable ? '' : 'cursorPointer'}`"
       id="customSelect"
       :tabindex="tabindex"
       @blur="isOpen = false"
       :style="wrapperStyle">
    <p v-if="title && (selected || isSearchable)" class="titleText">
      {{ title }}
    </p>

    <div class="selected"
         :style="{'border-color': overrideBorderColor}"
         :class="{
           open: isOpen,
           overrideBorderColor: (overrideBorderColor || borderTheme1 || borderTheme2),
           borderTheme1: borderTheme1,
           borderTheme2: borderTheme2,
           placeholderStyle: !selected,
         }"
         v-if="!isSearchable"
         @click="isOpen = !isOpen">
      {{ selected ? selected.text : title }}
    </div>
    
    <input type="text" v-else-if="!searchSelected"
           class="selected"
           :style="{'border-color': overrideBorderColor}"
           :placeholder="searchPlaceholder || ''"
           :class="{
             open: isOpen,
             overrideBorderColor: (overrideBorderColor || borderTheme1 || borderTheme2),
             borderTheme1: borderTheme1,
             borderTheme2: borderTheme2,
           }"
           @click="isOpen = !isOpen || searchText"
           v-model="searchText"/>    

    <input type="text" v-else
           class="selected cursorPointer"
           :style="{'border-color': overrideBorderColor}"
           :placeholder="searchPlaceholder || ''"
           :class="{
             open: isOpen,
             overrideBorderColor: (overrideBorderColor || borderTheme1 || borderTheme2),
             borderTheme1: borderTheme1,
             borderTheme2: borderTheme2,
           }"
           @click="() => {
             $emit('searchSelectedClicked')
             isOpen = true
           }"
           v-model="searchSelected"/>

    <span class="clearContainer cursorPointer"
          v-if="isSearchable && searchSelected"
          @click="$emit('searchSelectedClicked')">
      <CrossIcon/>
    </span>

    <div class="items" :class="{ selectHide: !isOpen }">
      <div
        v-for="option of filteredOptions"
        :key="option.text"
        @click="
          selected = option
          isOpen = false
          $emit('change', option.value)
        "
      >
        {{ option.text }}
      </div>
    </div>
  </div>
</template>

<script>
import CrossIcon from 'vue-material-design-icons/Close.vue'

export default {
  props: {
    title: {
      type: String,
      required: false,
    },
    options: {
      type: Array,
      required: true,
    },
    defaultValue: {
      type: Object,
      required: false,
    },
    isSearchable: {
      type: Boolean,
      required: false,
      default: false,
    },
    searchKeepSelected: {
      type: Boolean,
      required: false,
      default: false,
    },
    searchSelected: {
      type: String,
      required: false,
      default: null,
    },
    searchPlaceholder: {
      type: String,
      required: false,
      default: null,
    },
    overrideBorderColor: {
      type: String,
      required: false,
    },
    borderTheme1: {
      type: Boolean,
      required: false,
    },
    borderTheme2: {
      type: Boolean,
      required: false,
    },
    tabindex: {
      type: Number,
      required: false,
      default: 0,
    },
    wrapperStyle: {
      type: String,
      required: false,
      default: '',
    },
    reducePadding: {
      type: Boolean,
      required: false,
      default: false,
    },
    resetValue: {
      type: [String, Object],
      required: false,
    },
    classes: {
      type: String,
      required: false,
      default: '',
    },
  },

  components: {
    CrossIcon,
  },

  mounted() {
    this.$emit("input", this.selected)
  },

  watch: {
    // THIS IS BAD. Change the number to reset the select value
    resetValue () {
      if (this.resetValue) {
        this.selected = this.defaultValue
        this.searchText = ''
      }
    },

    searchText (newText) {
      if (newText && !this.isopen) {
        this.isOpen = true
      }
    },

    isOpen () {
      if (this.isSearchable && this.isOpen) {
        setTimeout(() => {
          window.addEventListener('click', this.closeSearchableResults)
        }, 25)
      }
      else {
        window.removeEventListener('click', this.closeSearchableResults)
      }
    }
  },

  methods: {
    closeSearchableResults () {
      this.isOpen = false
      this.searchText = ''
    }
  },

  computed: {
    filteredOptions () {
      if (!this.isSearchable || this.searchText === '') {
        return this.options
      }
      
      return this.lowerCaseOptions.filter(opt => opt.lowerCaseText.includes(this.searchText.toLowerCase()))
    },

    lowerCaseOptions () {
      return this.options.map(opt => ({...opt, lowerCaseText: opt.text.toLowerCase()}))
    },
  },

  data() {
    return {
      selected: this.defaultValue,
      searchText: '',
      isOpen: false,
      clickListener: null,
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../scss/shadows.scss";
$height: 2.25rem;
$paddingBig: 0.75rem;
$paddingSmall: 0.4rem;
$borderRadius: 0px;

$lightThemeColor: #333;
$darkThemeColor: #eee;

input {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  outline: none;
  font-size: 1rem;
  color: #333;
  &::placeholder {
    filter: opacity(0.4);
  }
  background: transparent;
}

.titleText {
  position: absolute;
  font-size: 0.75rem;
  top: 0;
  left: $paddingBig;
  @media (max-width: 900px) {
    left: $paddingSmall
  }
}

.customSelect {
  position: relative;
  width: 100%;
  text-align: left;
  outline: none;
  height: $height;
  line-height: $height;
  padding-top: 0.75rem;

  .clearContainer {
    position: absolute;
    right: 5px;
    top: 12px;
  }
}

.customSelect .selected {
  border-radius: $borderRadius;
  color: $lightThemeColor;
  user-select: none;
  border-width: 0;
  border-style: hidden;
  border-image: linear-gradient(to right, $themeGreen1, $themeGreen2) 1; 
  border-bottom-width: 2px;
  border-bottom-style: solid;
  padding-left: $paddingBig;
  @media (max-width: 900px) {
    padding-left: $paddingSmall
  }
}

.customSelect .selected.open {
  border-radius: $borderRadius $borderRadius 0px 0px;
}

.customSelect .selected:after {
  position: absolute;
  content: "";
  bottom: 0.65rem;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-color: $lightThemeColor transparent transparent transparent;
  right: $paddingBig;
  @media (max-width: 900px) {
    right: $paddingSmall
  }
}

.items {
  color: $lightThemeColor;
  border-radius: 0px 0px $borderRadius $borderRadius;
  overflow: hidden;
  @include simpleshadowNoHover;

  position: absolute;
  background-color: white;
  left: 0;
  right: 0;
  z-index: 1;

  max-height: 20rem;
  overflow-y: auto;
}

.items div {
  color: $lightThemeColor;
  cursor: pointer;
  user-select: none;
  padding-left: $paddingBig;
  @media (max-width: 900px) {
    padding-left: $paddingSmall
  }
}

.items div:hover {
  background: linear-gradient(to right, $themeGreen1, $themeGreen2);
}

.selectHide {
  display: none;
}

.overrideBorderColor {
  border-image: none !important;
}
.borderTheme1 {
  border-color: $themeGreen1;
}
.borderTheme2 {
  border-color: $themeGreen2;
}

.placeholderStyle {
  color: $themeGray3p5 !important;
}

.dark {
  .customSelect .selected,
  .items,
  .items div {
    color: $darkThemeColor;
  }

  input::placeholder {
    filter: none;
  }

  .placeholderStyle {
    color: $themeGray8 !important;
  }

  .customSelect .selected:after {
    border-color: $darkThemeColor transparent transparent transparent;
  }

  .items {
    background-color: $themeDark1;
  }

  .items div:hover {
    color: #333;
  }
}
</style>

<template>
  <div :class="`customSelect ${classes} ${isSearchable ? '' : 'cursorPointer'}`"
       id="customSelect"
       :tabindex="isSearchable ? 'none' : '0'"
       @blur="onBlur"
       @click="onSelectedClicked"
       ref="outerContainer"
       :style="`${wrapperStyle}; ${minWidthString}; ${widthString}`">
    <p v-if="title && (selected || isSearchable)" class="titleText">
      {{ title }}
    </p>

    <div v-if="!isSearchable"
         class="selected"
         :style="{'border-color': overrideBorderColor}"
         :class="{
           open: isOpen,
           overrideBorderColor: (overrideBorderColor || borderTheme1 || borderTheme2),
           borderTheme1: borderTheme1,
           borderTheme2: borderTheme2,
           placeholderStyle: !selected,
           selectWithIconRight: hasIconRight,
         }">
      {{ selected ? selected.text : title }}
    </div>
    
    <input v-else-if="!searchSelected"
           type="text"
           class="selected"
           ref="selectInput1"
           autocomplete="off"
           :style="{'border-color': overrideBorderColor}"
           :placeholder="searchPlaceholder || ''"
           :class="{
             open: isOpen,
             overrideBorderColor: (overrideBorderColor || borderTheme1 || borderTheme2),
             borderTheme1: borderTheme1,
             borderTheme2: borderTheme2,
           }"
           @click="isOpen = true"
           v-model="searchText"/>    

    <input type="text"
           v-else
           ref="selectInput2"
           class="selected cursorPointer"
           autocomplete="off"
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
           @focus="() => {
             $emit('searchSelectedClicked')
             isOpen = true
           }"
           v-model="searchSelected"/>

    <span class="clearContainer cursorPointer"
          v-if="isSearchable && searchSelected"
          @click="$emit('searchSelectedClicked')">
      <CrossIcon/>
    </span>

    <div class="items"
         :class="{
           selectHide: !isOpen,
         }"
         :style="maxOptionWidthStyle"
         ref="selectItemContainer">
      <div
        v-for="(option, index) of filteredOptions"
        class="selectOption"
        :key="option.text"
        :class="{highlightedOption: highlightedIndex === index}"
        :ref="`option${index}`"
        @click="onOptionSelected(option)"
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
    initialWidth: {
      type: String,
      required: false,
      default: null,
    },
    maxWidth: {
      type: Number,
      required: false,
      default: 99999,
    },
    isFullWidth: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    CrossIcon,
  },

  mounted() {
    this.$emit("input", this.selected)
    window.addEventListener('keydown', this.onKeyPress)
    this.tryComputeWidth()
  },

  watch: {
    // THIS IS BAD. Change the number to reset the select value
    resetValue () {
      if (this.resetValue) {
        this.selected = this.defaultValue
        this.searchText = ''
      }
    },

    defaultValue () {
      this.selected = this.defaultValue
      this.searchText = ''
    },

    searchText (newText) {
      this.highlightedIndex = null

      if (newText && !this.isopen) {
        this.isOpen = true
      }

      this.scrollToTopIfPossible()
    },

    highlightedIndex (newIndex) {
      if (newIndex !== null && this.$refs[`option${newIndex}`]) {
        let option = this.$refs[`option${newIndex}`][0]
        if (option) {
          option.scrollIntoView({ block: 'nearest', inline: 'start' })
        }
      }
    },

    isOpen () {
      this.highlightedIndex = null

      if (this.isSearchable && this.isOpen) {
        setTimeout(() => {
          window.addEventListener('click', this.closeSearchableResults)
        }, 125)

        this.scrollToTopIfPossible()
      }
      else {
        window.removeEventListener('click', this.closeSearchableResults)
      }
    },

    options () {
      this.tryComputeWidth()
    },
  },

  methods: {
    onBlur () {
      this.isOpen = false
    },

    onSelectedClicked (e) {
      if (!this.isSearchable) {
        if (e.target.classList.contains('selectOption')) {
          this.isOpen = false
        }
        else {
          this.isOpen = !this.isOpen
        }
      }
    },

    async waitMillisec (millisec) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(), millisec)
      })
    },

    async tryComputeWidth () {
      let isFinished = false
      while (!isFinished) {
        await this.waitMillisec(25)
        isFinished = this.computeWidth()
      }
    },  

    scrollToTopIfPossible () {
      if (this.isOpen
        && this.filteredOptions.length > 0
        && this.$refs[`option0`]
        && this.$refs[`option0`][0]) {
        this.$refs[`option0`][0].scrollIntoView({ block: 'nearest', inline: 'start' })
      }
    },

    computeWidth () {
      let container = this.$refs.selectItemContainer
      if (container && container.children.length > 0) {
        let maxChildWidth = 0
        for (let child of container.children) {
          if (child.clientWidth > maxChildWidth) {
            maxChildWidth = child.clientWidth
          }
        }

        if (this.minWidth > this.maxWidth) {
          this.width = this.maxWidth
        }
        else {
          this.minWidth = maxChildWidth
        }

        return true
      }
      else {
        return false
      }
    },

    closeSearchableResults () {
      this.isOpen = false
      this.searchText = ''
    },

    onOptionSelected (option) {
      this.selected = option
      this.isOpen = false
      this.$emit('change', option.value)

      if (this.isSearchable && this.searchKeepSelected) {
        let relevantInputElement = this.$refs.selectInput1
        if (!relevantInputElement) {
          relevantInputElement = this.$refs.selectInput2
        }
        if (relevantInputElement) {
          relevantInputElement.blur()
        } 
      }
      
    },

    onKeyPress (e) {
      if (this.isSearchable) {
        if (e.key === 'Tab') {
          this.isOpen = false
          this.searchText = ''
          return
        }
        if (e.key === ' ') {
          if (this.$refs.selectInput1 && this.$refs.selectInput1.isSameNode(document.activeElement)) {
            this.searchText += ' '
            e.preventDefault()
            return
          }
        }
      }

      if (!this.isSearchable) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          if (this.$refs.outerContainer && this.$refs.outerContainer.isSameNode(document.activeElement)) {
            e.preventDefault()
            this.isOpen = true
          }
        }
      }

      if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          if (this.highlightedIndex !== null) {
            if (this.highlightedIndex === this.filteredOptions.length - 1) {
              this.highlightedIndex = 0
            }
            else {
              this.highlightedIndex++
            }
          }
          else {
            this.highlightedIndex = 0
          }
        }
        else if (e.key === 'ArrowUp') {
          e.preventDefault()
          if (this.highlightedIndex !== null) {
            if (this.highlightedIndex === 0) {
              this.highlightedIndex = this.filteredOptions.length-1
            }
            else {
              this.highlightedIndex--
            }
          }
          else {
            this.highlightedIndex = this.filteredOptions.length-1
          }
        }
        else if (e.key === 'Enter' || e.key === ' ') {
          if (this.highlightedIndex === null && this.filteredOptions.length > 0
              && this.isSearchable) {
            this.onOptionSelected(this.filteredOptions[0])
          }
          else if (this.highlightedIndex !== null) {
            this.onOptionSelected(this.filteredOptions[this.highlightedIndex])
          }
        }
      }
    },
  },

  computed: {
    hasIconRight () {
      return !(this.isSearchable && !this.searchKeepSelected)
    },

    minWidthString () {
      if (this.width || this.isFullWidth) {
        return ''
      }
      if (this.minWidth) {
        return `min-width: ${this.minWidth + (this.hasIconRight ? 16 : 0)}px`
      }
      else if (this.initialWidth) {
        return `min-width: ${this.initialWidth}`
      }
      return ''
    },

    widthString () {
      if (this.isFullWidth) {
        return 'width: 100%'
      }
      if (this.width) {
        return `width: ${this.width}px`
      }
      return ''
    },

    maxOptionWidthStyle () {
      if (this.maxWidth && window.matchMedia(`(max-width: ${this.maxWidth}px)`)) {
        return `max-width: ${this.maxWidth}px`
      }
      return ''
    },

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

  data () {
    return {
      selected: this.defaultValue,
      searchText: '',
      isOpen: false,
      clickListener: null,
      highlightedIndex: null,
      minWidth: 0,
      width: undefined,
    }
  },

  beforeDestroy () {
    window.removeEventListener('click', this.closeSearchableResults)
    window.removeEventListener('keypress', this.onKeyPress)
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
    filter: opacity(0.5);
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
  width: fit-content;
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

  &:focus {
    background: rgba($themeGreen1, 0.25);
  }
}

.customSelect .selected {
  border-radius: $borderRadius;
  color: $lightThemeColor;
  border-width: 0;
  border-style: hidden;
  border-image: linear-gradient(to right, $themeGreen1, $themeGreen2) 1; 
  border-bottom-width: 2px;
  border-bottom-style: solid;
  padding-left: $paddingBig;
  @media (max-width: 900px) {
    padding-left: $paddingSmall
  }
  &.selectWithIconRight {
    padding-right: 2rem;
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

  width: fit-content;
  min-width: 100%;
  position: absolute;
  background-color: white;
  left: 0;
  right: 0;
  z-index: 4;

  max-height: 20rem;
  overflow-y: auto;
}

.items div {
  z-index: 4;
  color: $lightThemeColor;
  cursor: pointer;
  padding-left: $paddingBig;
  padding-right: $paddingBig;
  white-space: nowrap;
  @media (max-width: 900px) {
    padding-left: $paddingSmall
  }
}

.items div:hover {
  background: linear-gradient(to right, scale-color($themeGreen1, $lightness: 50%), scale-color($themeGreen2, $lightness: 50%));
}

.highlightedOption {
  background: linear-gradient(to right, $themeGreen1, $themeGreen2) !important;
}

.selectHide {
  visibility: hidden;
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
  .customSelect:focus {
    background: rgba($themeGreen1, 0.15);
  }

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

  
  .highlightedOption {
    background: linear-gradient(to right, $themeGreen1Dark, $themeGreen2Dark) !important;
    color: #333 !important;
  }

  .items div:hover {
    background: linear-gradient(to right, scale-color($themeGreen1, $lightness: 25%), scale-color($themeGreen2, $lightness: 25%));
    color: #333;
  }
}
</style>

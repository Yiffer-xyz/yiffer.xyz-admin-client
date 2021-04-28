<template>
  <div :class="`customTextInput ${classes}`" :style="wrapperStyle">
    <p v-if="title" class="titleText">
      {{ title }}
    </p>

    <div class="positionRelative innerInputWrapper">
      <span v-if="startIconVariant" class="inputIconWrapper inputIconWrapperLeft">
        <SearchIcon title="" v-if="startIconVariant === 'search'"/>
        <TagsIcon title="" v-if="startIconVariant === 'tags'"/>
      </span>
      <input v-model="localValue"
             v-if="type !== 'textarea'"
             @input="changeEvent => $emit('change', changeEvent.target.value)"
             :type="type"
             :placeholder="placeholder"
             class="paddedInput"
             :class="{
               inputWithIcon: startIconVariant,
               borderTheme1: borderTheme1,
               borderTheme2: borderTheme2
             }"
             :style="`text-align: ${textAlign}`"
             @focus="$emit('focus')"
             @blur="$emit('blur')"
             @click="$emit('click')"/>
      <span v-if="includeClearButton" class="inputIconWrapper inputIconWrapperRight cursorPointer"
            v-show="localValue"
            @click="clear">
        <CrossIcon title="Clear"/>
      </span>
      <label v-if="helperText"
             class="helperText"
             :class="{'red-color': helperTextError}" 
             :style="`text-align: ${textAlign}`">
        {{helperText}}
      </label>

      <textarea v-else-if="type === 'textarea'" rows=4
                v-model="localValue"
                @input="changeEvent => $emit('change', changeEvent.target.value)"
                class="paddedInput"
                :placeholder="placeholder"
                style="text-align: left"
                :class="{
                  inputWithIcon: startIconVariant,
                  borderTheme1: borderTheme1,
                  borderTheme2: borderTheme2
                }"
                @focus="$emit('focus')"
                @blur="$emit('blur')"
                @click="$emit('click')">
      </textarea>
    </div>
  </div>
</template>

<script>
import SearchIcon from 'vue-material-design-icons/Magnify.vue'
import CrossIcon from 'vue-material-design-icons/Close.vue'
import TagsIcon from 'vue-material-design-icons/TagMultiple.vue'

export default {
  components: {
    SearchIcon, CrossIcon, TagsIcon,
  },

  props: {
    value: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
      default: 'text'
    },
    textAlign: {
      type: String,
      required: false,
      default: 'center'
    },
    startIconVariant: {
      type: String,
      required: false,
    },
    placeholder: {
      type: String,
      required: false,
    },
    includeClearButton: {
      type: Boolean,
      required: false,
    },
    helperText: {
      type: String,
      required: false,
    },
    helperTextError: {
      type: Boolean,
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
    },
    classes: {
      type: String,
      required: false,
    },
  },

  data: function () {
    return {
      localValue: this.value,
    }
  },

  watch: {
    value (newValue) {
      this.localValue = newValue
    },
  },

  methods: {
    clear () {
      this.localValue = ''
      this.$emit('change', '')
      this.$emit('clear')
    },
  },
}
</script>

<style lang="scss" scoped>
$darkThemeColor: #eee;
$paddingBig: 0.5rem;
$paddingSmall: 0.4rem;

::placeholder {
  color: #aaa;
}

.titleText {
  font-size: 0.85rem;
  margin-left: $paddingBig;
  margin-right: $paddingBig;
  text-align: left;
  @media (max-width: 900px) {
    margin-left: $paddingSmall;
    margin-right: $paddingSmall;
  }
}

.helperText {
  font-size: 0.8rem;
  width: 100%;
  display: block;
  padding: 2px $paddingBig;
  @media (max-width: 900px) {
    padding: 2px $paddingSmall;
  }
}

.customTextInput {
  position: relative;
}

.innerInputWrapper {
  margin-top: -4px;
}

.inputIconWrapper {
  color: $themeDark1;
  position: absolute;
  display: block;
  top: 0.5rem;
}

.inputIconWrapperRight {
  right: $paddingBig;
  @media (max-width: 900px) {
    right: $paddingSmall;
  }
  &:hover {
    color: $themeBlueDark;
  }
}

.inputIconWrapperLeft {
  left: $paddingBig;
  @media (max-width: 900px) {
    left: $paddingSmall;
  }
}

.paddedInput {
  text-align: left;
  box-sizing: border-box;
  padding: 9px $paddingBig;
  text-align: center;
  background: transparent;
  outline: none;
  color: #333;
  width: 100%;
  border-width: 0;
  border-style: hidden;
  border-image: linear-gradient(to right, $themeGreen1, $themeGreen2) 1; 
  border-bottom-width: 2px;
  border-bottom-style: solid;
  @media (max-width: 900px) {
    padding: 9px $paddingSmall;
  }
}

.borderTheme1 {
  border-image: none;
  border-color: $themeGreen1;
}
.borderTheme2 {
  border-image: none;
  border-color: $themeGreen2;
}

.inputWithIcon {
  text-align: center;
}

.dark {
  .paddedInput, .inputIconWrapper {
    color: $darkThemeColor;
  }
}

</style>
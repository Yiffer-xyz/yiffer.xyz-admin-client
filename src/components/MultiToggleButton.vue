<template>
  <div class="toggleButtonsContainer">
    <button v-for="item in items" 
            :key="item"
            @click="toggleItem(item)"
            :class="{'selectedMultiButton': selectedItems.includes(item)}">
      {{item}}
    </button>
  </div> 
</template>
<script>

export default {
  name: 'multiToggleButton',
  
  props: {
    items: Array,
    initialValue: String,
    allowMultiple: Boolean,
    allowNone: Boolean,
    // if allowNone=false, this is the default value set instead of none
    defaultValue: String,
    // if true, only [some combo of other items] or [default value] can be active at any given time
    isDefaultValueExclusiveToOthers: Boolean,
  },

  data: function () {
    return {
      selectedItems: this.initialValue ? [this.initialValue] : [],
    }
  },

  methods: {
    toggleItem (item) {
      let shouldEmitOnChangeEvent = true
      let itemIndex = this.selectedItems.indexOf(item)
      let isItemSelectedAlready = this.selectedItems.includes(item)
      let isOnlyOneItemSelected = this.selectedItems.length === 1

      if (this.isDefaultValueExclusiveToOthers && this.defaultValue===item) {
        this.selectedItems = [item]
      }

      else {
        if (this.selectedItems.includes(this.defaultValue)) {
          this.$delete(this.selectedItems, this.selectedItems.indexOf(this.defaultValue))
        }

        if (isItemSelectedAlready) {
          if (isOnlyOneItemSelected) {
            if (this.allowNone) {
              this.selectedItems = []
            }
            else {
              if (this.defaultValue && this.defaultValue !== item) {
                this.selectedItems = [this.defaultValue]
              }
              else {
                shouldEmitOnChangeEvent = false
              }
            }
          }

          else {
            this.$delete(this.selectedItems, itemIndex)
          }
        }

        else {
          if (this.allowMultiple) {
            this.$set(this.selectedItems, this.selectedItems.length, item)
          }
          else {
            this.selectedItems = [item]
          }
        }
      }

      if (shouldEmitOnChangeEvent) {
        this.$emit('on-change', this.selectedItems)
      }
    },
  }
}

</script>

<style lang="scss">
.toggleButtonsContainer {
  border-radius: 4px;
  overflow: hidden;
  width: fit-content;

  button {
    background-color: $themeGray7;
    font-family: 'Mulish', sans-serif;
    font-size: 14px;
    border: none;
    width: fit-content;
    color: white;
    word-break: keep-all;

    background: $themeGray5;
    padding: 8px 10px;
    font-weight: 400;

    &:hover {
      cursor: pointer;
      background-color: $themeDark1;
    }
    &:focus {
      outline: none;
    }
  }
}
.selectedMultiButton {
  background: linear-gradient(to right, $themeGreen1, $themeGreen2) !important;
  color: $themeDark4 !important;
}
.dark {
  .toggleButtonsContainer {
    border: 1px solid $themeDark2;
    button {
      background-color: $themeDark1;
      &:hover {
        background-color: $themeDark3;
      }
    }
  }
}
</style>
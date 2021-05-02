<template>
  <div style="display: flex; flex-direction: column; align-items: center;"
       :style="styles"
       :class="classes">
    <Spinner v-if="text"
             line-fg-color="#37dda0"
             :line-bg-color="isDarkTheme ? '#727679' : '#ddd'"
             :text-fg-color="isDarkTheme ? '#ddd' : '#444'"
             :message="text"
             :font-size="fontSizePx"/>

    <Spinner v-else
             line-fg-color="#37dda0"
             :line-bg-color="isDarkTheme ? '#727679' : '#ddd'"/>
  </div>
</template>

<script>
import Spinner from 'vue-simple-spinner'
import { mapGetters } from 'vuex'

export default {
  name: 'loadingSpinner',

  props: {
    styles: String,
    text: {
      type: String,
      required: false,
      default: '',
    },
    classes: String,
    fontSizePx: {
      type: Number,
      required: false,
      default: 14,
    },
  },
  
  components: {
    Spinner,
  },

  computed: {
    ...mapGetters(['isDarkTheme'])
  }
}
</script>

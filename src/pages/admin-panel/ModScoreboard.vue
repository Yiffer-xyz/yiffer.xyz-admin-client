<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">Mod scoreboard</h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <MultiToggleButton :items="['Monthly', 'All time']"
                         :initialValue="mode"
                         :allowMultiple="false"
                         :allowNone="false"
                         @on-change="onModeChange"
                         class="mb-16"/>

      <div v-if="mode === 'Monthly'" class="horizontalFlex alignItemsCenter" style="gap: 0.5rem;">
        <p @click="() => onMonthChange(false)" class="cursorPointer" style="padding: 0.5rem 1rem;">
          <LeftArrow/>
        </p>
        <p>
          {{selectedMonthText}}
        </p>
        <p @click="() => onMonthChange(true)" class="cursorPointer" style="padding: 0.5rem;">
          <RightArrow/>
        </p>
      </div>

      <table v-if="!isLoadingTable" class="yTable">
        <thead>
          <tr>
            <th>Mod name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in modScoreList" :key="row.modName">
            <td>{{row.username}}</td>
            <td>{{row.score}}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="loadingContainer">
        <Loading/>
      </div>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import miscApi from '@/api/miscApi'
import MultiToggleButton from '@/components/MultiToggleButton.vue'
import { format, add } from 'date-fns'
import startOfMonth from 'date-fns/startOfMonth/index'
import Loading from '@/components/LoadingIndicator.vue'
import LeftArrow from 'vue-material-design-icons/ArrowLeft.vue'
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'

export default {
  name: 'modScoreboard',

  components: {
    MultiToggleButton, Loading,
    LeftArrow, RightArrow,
  },

  computed: {
    selectedMonthText () {
      return format(this.selectedDate, 'MMM yyyy')
    },

    disableNextMonth () {
			let now = new Date()
			return this.selectedDate.getMonth() >= now.getMonth() && this.selectedDate.getYear() >= now.getYear()
    }
  },

  data () {
    return {
      isOpen: false,
      modScoreList: [],
      mode: 'Monthly',
      selectedDate: new Date(),
      isLoadingTable: false,
    }
  },

  methods: {
    onModeChange (newMode) {
      this.mode = newMode[0]
      this.getScores()
    },

    onMonthChange (isNext) {
			if (isNext && this.disableNextMonth) { return }
			if (this.isLoadingTable) { return }
      this.selectedDate = add(this.selectedDate, {months:  isNext ? 1 : -1})
      this.getScores()
    },

    async getScores () {
      this.isLoadingTable = true
      let scores = await miscApi.getModScores(
        this.mode === 'Monthly' ? startOfMonth(this.selectedDate) : null,
        this.mode === 'Monthly' ? startOfMonth(add(this.selectedDate, {months: 1})) : null
      )
      this.modScoreList = scores
      this.modScoreList.sort((a, b) => a.score > b.score ? -1 : 1)
      this.isLoadingTable = false
    },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
  
  mounted () {
    this.getScores()
  }
}
</script>

<style lang="scss">
.loadingContainer {
  height: 18rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

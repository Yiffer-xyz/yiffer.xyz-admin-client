<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Visitor stats</h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <div>
        <div class="horizontalFlex alignCenter">
          <p class="mr-8">
            Data: 
          </p>
          <MultiToggleButton :items="['Visitors', 'Comics', 'Route']"
                             :initialValue="undefined"
                             :allowMultiple="false"
                             :allowNone="false"
                             @on-change="onDataTypeChanged"/>
        </div>
        
        <div class="horizontalFlex alignCenter mb-8 mt-8">
          <p class="mr-8">
            Interval: 
          </p>
          <MultiToggleButton :items="['24H', '1W', '1M', '1Y', 'All']"
                             :initialValue="undefined"
                             :allowMultiple="false"
                             :allowNone="false"
                             @on-change="onIntervalChanged"/>
        </div>
      </div>

      <button @click="fetchData" 
              class="y-button"
              :class="{'y-button-disabled': !canFetch}">
        Fetch data
      </button>

      <Loading v-if="isLoadingData" classes="mt-32" text="Fetching data"/>

      <div v-else-if="data.length>0" class="scrolling-table-container mt-16">
        <table class="yTable">
          <thead>
            <tr>
              <th>{{dataTableKeyHead}}</th>
              <th>{{dataTableCountHead}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, index) in data" :key="index">
              <td class="textLeft">{{d.dataKey}}</td>
              <td>{{d.count}}</td>
            </tr>
          </tbody>
        </table>
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

import MultiToggleButton from '@/components/MultiToggleButton'
import Loading from '@/components/LoadingIndicator.vue'

export default {
  name: 'visitorStats',

  components: {
    MultiToggleButton, Loading,
  },

  data: function () {
    return {
      isOpen: false,
      dataInterval: undefined,
      dataType: undefined,
      data: [],
      isLoadingData: false,
      dataTableKeyHead: undefined,
      dataTableCountHead: undefined,
    }
  },

  methods: {
    async fetchData () {
      if (!this.canFetch) { return }
      this.isLoadingData = true
      this.dataTableKeyHead = typeToTableKeyHead[this.dataType]
      this.dataTableCountHead = typeToTableCountHead[this.dataType]

      let newData
      if (this.dataType === 'Visitors') {
        newData = await miscApi.getVisitorStats(this.dataInterval)
        newData.forEach(d => d.time = new Date(d.dataKey))
      }
      else if (this.dataType === 'Comics') {
        newData = await miscApi.getComicViewStats(this.dataInterval)
      }
      else {
        newData = await miscApi.getRouteStats(this.dataInterval)
      }

      this.data = newData
      this.isLoadingData = false
    },

    onIntervalChanged (newInterval) {
      this.dataInterval = newInterval[0]
    },

    onDataTypeChanged (newDataType) {
      this.dataType = newDataType[0]
    },

    prettyDateOrString (inputValue) {
      if (inputValue instanceof Date) {
        return inputValue.toString().substring(0, 15)
      }
      else {
        return inputValue
      }
    },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
  
  computed: {
    canFetch () {
      return this.dataInterval && this.dataType
    }
  }
}

const typeToTableCountHead = {
  'Visitors': 'Visitors',
  'Comics': 'Count',
  'Route': 'Count',
}
const typeToTableKeyHead = {
  'Visitors': 'Date',
  'Comics': 'Comic',
  'Route': 'Route',
}
</script>
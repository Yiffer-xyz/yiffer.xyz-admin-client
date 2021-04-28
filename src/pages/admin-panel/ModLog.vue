<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Mod log</h2>
    <span class="admin-content-box-inner" v-if="isOpen">

			<button class="y-button y-button-neutral" @click="getModLogData()">
				Refresh data
			</button>

			<div class="verticalFlex margin-top-8">
				<div class="horizontalFlex margin-bottom-8" style="justify-content: start;">
					<p style="margin-right: 4px;">Action type: </p>
					<select v-model="actionTypeFilter" class="no-margin-bot" style="flex-grow: 1;">
						<option :value="undefined"> </option>
						<option v-for="actionType in actionTypes" :key="actionType" :value="actionType">
							{{actionType}}
						</option>
					</select>
				</div>

				<div class="horizontalFlex margin-bottom-8" style="justify-content: start;">
					<p style="margin-right: 4px;">Action filter: </p>
					<input type="text" v-model="actionFilter" style="flex-grow: 1;"/>
				</div>

				<div class="horizontalFlex margin-bottom-8" style="justify-content: start;">
					<p style="margin-right: 4px;">Mod name filter: </p>
					<input type="text" v-model="modNameFilter" style="flex-grow: 1;"/>
				</div>

			</div>


			<div class="scrolling-table-container">
				<table class="yTable margin-top-8" style="text-align: left; table-layout: fixed">
					<thead>
						<tr>
							<th>Mod name</th>
							<th>Type</th>
							<th>Action</th>
							<th>Details</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="row in slicedModLog" :key="row.id">
							<td>{{row.modName}}</td>
							<td>{{row.actionType}}</td>
							<td>{{row.action}}</td>
							<td style="white-space: pre-wrap;">
								<p v-if="row.detailsExpanded" @click="row.detailsExpanded=false" class="cursorPointer">{{row.actionDetails}}</p>
								<p v-else-if="row.actionDetails" @click="row.detailsExpanded=true" class="link-color cursorPointer">Show</p>
							</td>
							<td>{{prettyDate(row.date)}}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<button v-if="filteredModLog.length > maxRows"
				@click="maxRows += maxRowsInitial"
				class="y-button y-button-neutral margin-top-16">
					Show {{Math.min(maxRowsInitial, filteredModLog.length-maxRows)}} more
				</button>
      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import miscApi from '@/api/miscApi'

export default {
  name: 'modLog',

  data: function () {
    return {
			isOpen: false,
			modLog: [],
			actionTypeFilter: undefined,
			actionFilter: '',
			modNameFilter: '',
			maxRowsInitial: 30,
			maxRows: 30,
    }
  },

  methods: {
		prettyDate: inputDate => inputDate.toString().substring(0, 15),

		async getModLogData () {
			let modLogResponse = await miscApi.getModLog()
			this.modLog = modLogResponse
				.map(l => new Object({modName: l.username, actionType: l.actionType, action: l.actionDescription, 
															actionDetails: l.actionDetails, detailsExpanded: false, date: new Date(l.timestamp)}))
		},

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
	},

	computed: {
		actionTypes () {
			return [... new Set(this.modLog.map(x => x.actionType))]
		},

		filteredModLog () {
			if (!this.modLog) { return [] }
			let filteredList = this.modLog
			
			if (this.actionTypeFilter) {
				filteredList = filteredList.filter(x => x.actionType === this.actionTypeFilter)
			}
			if (this.actionFilter) {
				filteredList = filteredList.filter(x => x.action.toLowerCase().indexOf(this.actionFilter.toLowerCase()) >= 0)
			}
			if (this.modNameFilter) {
				filteredList = filteredList.filter(x => x.modName.indexOf(this.modNameFilter) >= 0)
			}
			return filteredList
		},

		slicedModLog () {
			return this.filteredModLog.slice(0, this.maxRows)
		},
	},
	
	async created () {
		this.getModLogData()
	}
}
</script>
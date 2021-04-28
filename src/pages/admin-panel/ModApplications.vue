<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">Mod applications
      <span v-if="numberOfUnprocessedApplications>0" class="red-color"> ({{numberOfUnprocessedApplications}})</span>
      <span v-else style="color: #999;">(0)</span>
    </h2>

    <span class="admin-content-box-inner" v-if="isOpen">

      <div class="horizontalFlex alignCenter">
        <input type="checkbox" v-model="showRemoved" id="showRemovedCheckbox"/>
        <label for="showRemovedCheckbox">Show removed</label>
      </div>

			<div v-if="shownApplications.length > 0" class="scrolling-table-container">
				<table class="yTable margin-top-8" style="text-align: left; table-layout: fixed">
					<thead>
						<tr>
							<th>Username</th>
							<th>Date</th>
							<th>Notes</th>
							<th>Thumbnail</th>
              <th>Telegram</th>
              <th>Proc</th>
              <th>Rem</th>
              <th>Action</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="application in shownApplications" :key="application.id">
							<td>{{application.username}}</td>
							<td>{{prettyDate(application.timestamp)}}</td>
							<td style="white-space: pre-wrap">
                <p style="min-width: 8rem;">{{application.notes}}</p>
              </td>
							<td style="white-space: pre-wrap">
                <p style="min-width: 8rem;">{{application.competentAnswer}}</p>
              </td>
							<td>{{application.telegramUsername}}</td>
							<td class="textAlignCenter">
                <CheckIcon v-if="application.isProcessed" title=""/>
                <CloseIcon v-else title=""/>
              </td>
							<td class="textAlignCenter">
                <CheckIcon v-if="application.isRemoved" title=""/>
                <CloseIcon v-else title=""/>
              </td>
							<td>
                <button v-if="!application.isProcessed"
                        @click="processApplication(application, false)"
                        class="y-button y-button-neutral mr-4 ml-4">
                  Processed
                </button>
                <button v-if="!application.isRemoved"
                        @click="processApplication(application, true)"
                        class="y-button y-button-neutral mr-4 ml-4">
                  Remove
                </button>
              </td>
						</tr>
					</tbody>
				</table>
			</div>

      <p v-else class="mt-16">
        No applications to list
      </p>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import miscApi from '@/api/miscApi'

import CheckIcon from 'vue-material-design-icons/CheckCircle.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'

export default {
  name: 'modApplications',

  components: {
    CheckIcon, CloseIcon,
  },

  data: function () {
    return {
			isOpen: false,
			applications: [],
      showRemoved: false,
    }
  },

  methods: {
    async processApplication (application, shouldRemove) {
      let response = await miscApi.processModApplication(application.id, shouldRemove)
      if (!response.success) { return }

      application.isRemoved = shouldRemove
      application.isProcessed = true
      let applicationIndex = this.applications.findIndex(a => a.id === application.id)
      this.$set(this.applications, applicationIndex, application)
    },

		prettyDate: dateString => (new Date(dateString)).toString().substring(4, 15),

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
  
  computed: {
    numberOfUnprocessedApplications () {
      return this.applications.filter(a => !a.isProcessed).length
    },

    shownApplications () {
      if (this.showRemoved) {
        return this.applications
      }
      else {
        return this.applications.filter(a => !a.isRemoved)
      }
    }
  },

  async mounted () {
    this.applications = await miscApi.getModApplications()
  },
}
</script>
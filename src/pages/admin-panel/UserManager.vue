<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">User manager</h2>
    <span class="admin-content-box-inner" v-if="isOpen">

      <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage"
                       class="margin-bottom-10"/>

			<!-- USER SEARCH -->
			<div class="horizontalFlex alignCenter">
				<form @submit.prevent="searchForUsers()" class="no-margin-bot">
					<div class="horizontalFlex">
						<input type="text" v-model="userSearchText" style="width: 110px;"/>

						<button @click="searchForUsers()" 
										type="submit"
										class="y-button y-button-neutral button-with-icon margin-left-4">
							<SearchIcon/> Search
						</button>

						<button @click="fetchModUsers()" class="y-button y-button-neutral button-with-icon margin-left-16 fitContent">
							<ModIcon/> List mods
						</button>
					</div>
				</form>
			</div>

			<!-- USER SEARCH RESULT TABLE -->
			<div v-if="foundUsers.length > 0" class="scrolling-table-container">
				<table class="yTable margin-top-8">
					<thead>
						<tr>
							<th>Username</th>
							<th>Created</th>
							<th>Select</th>
						</tr>
					</thead>
					<tr v-for="user in foundUsers" :key="user.id">
						<td>{{user.username}}</td>
						<td>{{prettyDateFromTimestamp(user.createdTime)}}</td>
						<td>
							<button class="y-button y-button-neutral no-margin-bot" @click="selectUser(user)">
								Select user
							</button>
						</td>
					</tr>
				</table>
			</div>
			<div v-if="noFoundUsers">
				<p class="margin-top-8">No found users</p>
			</div>

			<!-- SELECTED USER -->
			<div v-if="selectedUser" class="width100">
				<div v-if="!selectedUserFound">
					Loading user data...
				</div>
				<div v-else class="width100">
					<p class="admin-mini-header no-margin-bot margin-top-16">User: {{selectedUser.username}}</p>

					<p>Account created {{prettyDateFromTimestamp(selectedUser.createdTime)}}</p>

					<p>Email: {{selectedUser.email || '-'}}</p>

					<!-- ROLES & DONATOR -->
					<div class="horisontal-flex margin-top-8">
						<label>User type </label>
						<select v-model="selectedUser.userType">
							<option value="normal">Normal</option>
							<option value="moderator">Moderator</option>
							<option value="admin">Admin</option>
						</select>

						<label style="margin-left: 16px;">Donator </label>
						<select v-model="selectedUser.donator">
							<option value=0>No</option>
							<option value=1>Yes</option>
						</select>
					</div>
					
					<button @click="submitNewUserData()" 
									:class="{'y-button-disabled': !isSelectedUserModified}"
									class="fitContent marginAuto mt-8 y-button">
						Submit changes
					</button>

					<!-- COMIC VOTES -->
					<p v-if="selectedUserComicVotes.length == 0" class="margin-top-16">
						User has not rated any comics.
					</p>
					<div v-else class="margin-top-16 width100">
						<button class="y-button y-button-neutral button-with-icon fitContent marginAuto"
										@click="showComicRatings = true"
										v-if="!showComicRatings">
							<DownArrow/> Show {{selectedUserComicVotes.length}} comic votes
						</button>
						<button class="y-button y-button-neutral button-with-icon fitContent marginAuto"
										@click="showComicRatings = false"
										v-if="showComicRatings">
							<UpArrow/> Hide comic votes
						</button>

						<div v-if="showComicRatings" class="scrolling-table-container margin-top-4">
							<table class="yTable yTable-compact" style="margin: auto;">
								<thead>
									<tr>
										<th>Comic name</th>
										<th @click="setComicVotesSort('rating')">Rating</th>
										<th @click="setComicVotesSort('date')">Date assigned</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="comicRating in selectedUserComicVotes" :key="comicRating.comicName">
										<td>
											<a :href="`https://yiffer.xyz/${comicRating.comicName}`" class="underline-link">
												{{comicRating.comicName}}
											</a>
										</td>
										<td>{{comicRating.vote}}</td>
										<td>{{prettyDate(comicRating.timestamp)}}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import SearchIcon from 'vue-material-design-icons/Magnify.vue'
import ModIcon from 'vue-material-design-icons/AccountStar.vue'
import DownArrow from 'vue-material-design-icons/ArrowDown.vue'
import UpArrow from 'vue-material-design-icons/ArrowUp.vue'

import userApi from '@/api/userApi'
import ResponseMessage from '@/components/ResponseMessage.vue'

export default {
	name: 'userManager',
	
	components: {
		ResponseMessage,
		SearchIcon, ModIcon, DownArrow, UpArrow,
	},

  data: function () {
    return {
			isOpen: false,
			userSearchText: '',
			foundUsers: [],
			noFoundUsers: false,
			selectedUser: undefined,
			originalUser: undefined,
			selectedUserComicVotes: undefined,
			comicVotesSort: 'date',
			selectedUserFound: false,
			showComicRatings: false,
			moderatorUsers: [],
			toggleSortSwitch: -1,
			responseMessage: '',
			responseMessageType: 'info',
    }
  },

  methods: {
		async searchForUsers () {
			if (!this.userSearchText) { return }

			this.resetSelectedUser()
			this.resetSearchResults()

			let result = await userApi.searchForUsers(this.userSearchText)
			if (result.length > 0) {
				this.foundUsers = result
			}
			else {
				this.noFoundUsers = true
			}
		},

		async fetchModUsers () {
			this.userSearchText = ''
			this.resetSelectedUser()
			this.resetSearchResults()

			let result = (await userApi.getModerators()).result

			this.noFoundUsers = false
			this.foundUsers = result
		},

		async selectUser (user) {
			this.resetSearchResults()
			this.resetSelectedUser()

			this.selectedUser = user
			this.selectedUserFound = true
			this.originalUser = {
				userType: this.selectedUser.userType,
				donator: this.selectedUser.donator
			}

			let comicVotes = await userApi.getUserData(user.id)
			comicVotes.forEach(cv => cv.timestamp = new Date(cv.timestamp))
			this.selectedUserComicVotes = comicVotes
		},

		async submitNewUserData () {
			if (!this.isSelectedUserModified) { return }

			let response = await userApi.updateUserData(this.selectedUser)
			if (response.success) {
				this.responseMessage = `Successfully altered user ${this.selectedUser.username}`
				this.responseMessageType = 'success'
				this.originalUser = {
					userType: this.selectedUser.userType,
					donator: this.selectedUser.donator
				}				
			}
			else {
				this.responseMessage = 'Error altering user'
				this.responseMessageType = 'error'
			}
		},

		setComicVotesSort (sortBy) {
			if (sortBy === this.comicVotesSort) {
				this.toggleSortSwitch = -this.toggleSortSwitch
			}
			else {
				this.toggleSortSwitch = 1
			}

			if (sortBy === 'date') {
				this.selectedUserComicVotes.sort((a, b) => a.timestamp>b.timestamp ? -this.toggleSortSwitch : this.toggleSortSwitch)
			}
			else if (sortBy === 'rating') {
				this.selectedUserComicVotes.sort((a, b) => a.vote>b.vote ? -this.toggleSortSwitch : this.toggleSortSwitch)
			}

			this.comicVotesSort = sortBy
		},

		resetSearchResults () {
			this.foundUsers = []
			this.noFoundUsers = false
		},

		resetSelectedUser () {
			this.selectedUser = undefined
			this.selectedUserComicVotes = []
			this.selectedUserFound = false
			this.originalUser = undefined
			this.showComicRatings = false
		},

		prettyDateFromTimestamp (mysqlDateString) {
			return (new Date(mysqlDateString)).toString().substring(0, 15)
		},

		prettyDate (date) {
			return date.toString().substring(0, 15)
		},

    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
	},

	computed: {
		isSelectedUserModified () {
			let result = this.selectedUser
				&& (this.selectedUser.userType !== this.originalUser.userType
				|| Number(this.selectedUser.donator) !== Number(this.originalUser.donator))
			return result
		}
	}
}
</script>
import axios from 'axios'
import config from '@/config.json'
let baseUrl = config.apiBaseUrl

export default {
  async searchForUsers (searchText) {
    let response = await axios.get(baseUrl + '/users/search', {params: {searchText: searchText}})
    if (!response.data.error) { return response.data }
    else { return {message: 'Error searching for users'} }
  },

  async getUserData (userId) {
    let response = await axios.get(baseUrl + '/users/' + userId)
    if (!response.data.error) { return response.data }
    else { return {message: 'Error fetching user'} }
  },

  async getModerators () {
    let response = await axios.get(baseUrl + '/users/moderators')
    if (!response.data.error) { return {success: true, result: response.data} }
    else { return {message: 'Error fetching moderator list'} }
  },

  async updateUserData (newUserData) {
    let response = await axios.post(`${baseUrl}/users/${newUserData.id}`, newUserData)
    if (!response.data.error) { return {success: true, result: response.data} }
    else { return {message: response.data.error} }
  },

  async deleteUser (userId) {
    let response = await axios.post(`${baseUrl}/users/${userId}/delete`)
    if (!response.data.error) { return {success: true, result: response.data} }
    else { return {message: response.data.error} }
  },
}
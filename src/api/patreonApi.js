import axios from 'axios'
import config from '@/config.json'
let baseUrl = config.apiBaseUrl

export default {
  async getUnprocessedLinks () {
    let response = await axios.get(baseUrl + '/patreon/unprocessed-links')
    return response.data
  },

  async getAllPatrons () {
    let response = await axios.get(baseUrl + '/patreon/supporter-list')
    return response.data
  },

  async getPatreonTiers () {
    let response = await axios.get(baseUrl + '/patreon/tiers')
    return response.data
  },

  async processLink (userId, isApproved) {
    let response = await axios.post(baseUrl + '/patreon/process-link', {userId, isApproved})
    return response.data
  },

  async clearPatronField (userId, fieldName) {
    let response = await axios.post(baseUrl + '/patreon/clear-patron-field', {userId, fieldName})
    return response.data
  }
}

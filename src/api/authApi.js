import axios from 'axios'
axios.defaults.withCredentials = true
import config from '@/config.json'
const baseUrl = config.apiBaseUrl

export default {
  async refreshAuth () {
    let response = await axios.get(`${baseUrl}/refresh-auth`)
    return response.data
  },

  async login (username, password) {
    let response = await axios.post(baseUrl + '/login', {
      username, password
    })

    return response.data
  },
  
  async logout () {
    await axios.get(baseUrl + '/logout')
  },
}

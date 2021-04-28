import axios from 'axios'
import config from '@/config.json'
let baseUrl = config.apiBaseUrl

export default {
  async getBlogs () {
    let response = await axios.get(baseUrl + '/blogs')
    return response.data
  },

  async getDisplayedBlog () {
    try {
      let response = await axios.get(baseUrl + '/blogs/current')
      return response.data
    }
    catch (err) {
      return { shouldDisplay: false }
    }
  },

  async addBlog (title, isImportant, content, displayDays) {
    let response = await axios.post(baseUrl + '/blogs', {title, isImportant, content, displayDays})
    if (!response.data.error) { return {success: true} }
    else { return {success: false, message: response.data.error} }
  }
}
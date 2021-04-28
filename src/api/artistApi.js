import axios from 'axios'
import config from '@/config.json'
let baseUrl = config.apiBaseUrl

export default {
  async getArtistList () {
    let response = await axios.get(baseUrl + '/artists')
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async getArtistByName (artistName) {
    let response = await axios.get(`${baseUrl}/artists/${artistName}`)
    if (response.status === 200) {
      return { success: true, result: response.data }
    }
    else {
      return { success: false, message: response.data }
    }
  },

  async addNewArtist (artistName) {
    let response = await axios.post(baseUrl + '/artists', {artistName: artistName})
    if (response.status === 200) {
      return { success: true, result: response.data }
    }
    else {
      return { success: false, message: response.data }
    }
  },

  async saveArtistChanges (artistId, artistData) {
    let response = await axios.post(`${baseUrl}/artists/${artistId}`, artistData)
    if (response.status === 200) {
      return { success: true }
    }
    else {
      return { success: false, message: response.data }
    }
  }
}

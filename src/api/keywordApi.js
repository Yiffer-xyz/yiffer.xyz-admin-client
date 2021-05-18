import axios from 'axios'
import config from '@/config.json'
let baseUrl = config.apiBaseUrl

export default {
  async getKeywordList () {
    let response = await axios.get(baseUrl + '/keywords')
    return response.data
  },

  async getComicKeywords (comicId) {
    let response = await axios.get(`${baseUrl}/comic-keywords/${comicId}`)
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async getKeywordSuggestionList () {
    let response = await axios.get(baseUrl + '/keywordsuggestions')
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async processKeywordSuggestion (suggestion, isApproved) {
    let response = await axios.post(baseUrl + '/keywordsuggestions/process', 
      {suggestion: suggestion, isApproved: isApproved})
    if (!response.data.error) { return {success: true} }
    else { return {success: false, message: response.data.error} }
  },

  async addKeywordsToComic (comicData, keywordList) {
    let response = await axios.post(baseUrl + '/keywords/addtocomic', {comicId: comicData.id, keywords: keywordList})
    if (!response.data.error) { return {success: true} }
    else { return {success: false, message: response.data.error} }
  },

  async removeKeywordsFromComic (comicData, keywordList) {
    let response = await axios.post(baseUrl + '/keywords/removefromcomic', {comicId: comicData.id, keywords: keywordList})
    if (!response.data.error) { return {success: true} }
    else { return {success: false, message: response.data.error} }
  },

  async addKeywordsToPendingComic (comicData, keywordList) {
    try {
      await axios.post(`${baseUrl}/pendingcomics/${comicData.id}/addkeywords`, {
        keywords: keywordList
      })
      return {}
    }
    catch (err) {
      return {error: err.response?.status}
    }
  },

  async removeKeywordsFromPendingComic (comicData, keywordList) {
    try {
      await axios.post(`${baseUrl}/pendingcomics/${comicData.id}/removeKeywords`, {
        keywords: keywordList
      })
      return {}
    }
    catch (err) {
      return {error: err.response?.status}
    }
  },

  async createKeyword (keyword) {
    let response = await axios.post(baseUrl + '/keywords', {keyword: keyword})
    if (!response.data.error) { return {success: true} }
    else { return {success: false, message: response.data.error} }
  },
  
  async addKeywordSuggestion (comicId, keywordId, isAdding) {
    let response = await axios.post(baseUrl + '/keywordsuggestions', 
      {comicId: comicId, keywordId: keywordId, isAdding: isAdding})

    if (!response.data.error) { return {success: true} }
    else { return {success: false, message: response.data.error} }  
  },

  logKeywordSearch (keywordId, isFromCard) {
    axios.post(baseUrl + '/keywords/log', {keywordId, isFromCard})
  }
}

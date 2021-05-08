import axios from 'axios'
import config from '@/config.json'
let baseUrl = config.apiBaseUrl

export default {
  async getModScores () {
    let response = await axios.get(baseUrl + '/modscores')
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async getModLog () {
    let response = await axios.get(baseUrl + '/modlog')
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async logRoute (route, description) {
    try {
      axios.post(baseUrl + '/log-route', {route, description})
    }
    // eslint-disable-next-line no-empty
    catch (err) {}
  },

  async logEvent (event, description) {
    try {
      axios.post(baseUrl + '/log-event', {event, description: description || null})
    }
    // eslint-disable-next-line no-empty
    catch (err) {}
  },

  async getVisitorStats (interval) {
    let response = await axios.get(`${baseUrl}/stats/visitors?interval=${interval}`)
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async getComicViewStats (interval) {
    let response = await axios.get(`${baseUrl}/stats/comic-views?interval=${interval}`)
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async getRouteStats (interval) {
    let response = await axios.get(`${baseUrl}/stats/routes?interval=${interval}`)
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async submitModApplication (notes, competentAnswer, telegramUsername) {
    let response = await axios.post(`${baseUrl}/mod-applications`, {
      notes, competentAnswer, telegramUsername
    })
    return response.data
  },

  async getModApplications () {
    let response = await axios.get(`${baseUrl}/mod-applications`)
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async processModApplication (applicationId, isRemoved) {
    let response = await axios.post(`${baseUrl}/mod-applications/${applicationId}`, {
      isRemoved
    })
    if (!response.data.error) { return {success: true} }
    else { return {success: false, message: response.data.error} }
  },

  async getMyModApplicationStatus () {
    let response = await axios.get(`${baseUrl}/mod-applications/me`)
    if (!response.data.error) {
      return { success: true, ...response.data }
    }
    else {
      return { success: false }
    }
  },

  async getFeedback () {
    let response = await axios.get(`${baseUrl}/feedback`)
    if (response.status === 200) {
      return response.data
    }
    else {
      return { success: false }
    }
  },

  async markFeedbackRead (feedbackId) {
    let response = await axios.patch(`${baseUrl}/feedback/${feedbackId}/read`)
    if (response.status === 200) {
      return { success: true }
    }
    else {
      return { success: false }
    }
  },

  async deleteFeedback (feedbackId) {
    let response = await axios.delete(`${baseUrl}/feedback/${feedbackId}`)
    if (response.status === 200) {
      return { success: true }
    }
    else {
      return { success: false }
    }
  },
}

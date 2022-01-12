import axios from 'axios'
import config from '@/config.json'
import { format } from 'date-fns'
let baseUrl = config.apiBaseUrl

export default {
  async getModScores (startDate, endDate) {
    let url = `${baseUrl}/modscores`

    if (startDate && endDate) {
      url += `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`
    }

    let response = await axios.get(url)
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

  async getComicProblems () {
    let response = await axios.get(`${baseUrl}/comic-problems`)
    return response.data
  },
  
  async assignComicProblem (problemId) {
    try {
      await axios.patch(`${baseUrl}/comic-problems/${problemId}/assign`)
      return { success: true }
    }
    catch (err) {
      return { success: false, error: err.response.data }
    }
  },

  async removeComicProblem (problemId) {
    try {
      await axios.delete(`${baseUrl}/comic-problems/${problemId}`)
      return { success: true }
    }
    catch (err) {
      return { success: false, error: err.response.data }
    }
  },

  async getProblemCategories () {
    let response = await axios.get(`${baseUrl}/comic-problem-categories`)
    return response.data
  },

  async addProblemCategory (name, helperText) {
    try {
      await axios.post(`${baseUrl}/comic-problem-categories`, {
        name, helperText,
      })
      return { success: true }
    }
    catch (err) {
      return { success: false, error: err.response.data }
    }
  },

  async deleteProblemCategory (categoryId) {
    try {
      await axios.delete(`${baseUrl}/comic-problem-categories/${categoryId}`)
      return { success: true }
    }
    catch (err) {
      return { success: false, error: err.response.data }
    }
  },

  async editProblemCategory (categoryId, name, helperText) {
    try {
      await axios.put(`${baseUrl}/comic-problem-categories/${categoryId}`, {
        name, helperText
      })
      return { success: true }
    }
    catch (err) {
      return { success: false, error: err.response.data }
    }
  },
}

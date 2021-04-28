import axios from 'axios'
import config from '@/config.json'
import { format } from 'date-fns'
let baseUrl = config.apiBaseUrl

export default {
  async submitAdvertisingApplication (file1, file2, adType, adName, adLink, adMainText, adSecondaryText, advertiserNotes) {
    let formData = new FormData()
    formData.append('adType', adType)
    formData.append('adName', adName)
    formData.append('adLink', adLink)
    formData.append('adMainText', adMainText)
    formData.append('adSecondaryText', adSecondaryText)
    formData.append('advertiserNotes', advertiserNotes)
    formData.append('file1', file1)
    formData.append('file2', file2)

    let response = await axios.post(
      baseUrl + '/paid-images',
      formData,
      {
        headers: {'Content-Type': 'multipart/form-data'},
      }
    )

    return response.data
  },

  async getAdPrices () {
    let response = await axios.get(`${baseUrl}/paid-images-prices`)
    return response.data
  },

  async updateAd (id, adName, link, mainText, secondaryText, file1, file2) {
    let formData = new FormData()
    formData.append('link', link)
    formData.append('adName', adName)
    if (mainText) { formData.append('mainText', mainText) }
    if (secondaryText) { formData.append('secondaryText', secondaryText) }
    if (file1) { formData.append('file1', file1) }
    if (file2) { formData.append('file2', file2) }

    try {
      let response = await axios.post(
        `${baseUrl}/paid-images/${id}/update-user`,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        }
      )

      return response.data
    }
    catch (err) {
      return {success: false, message: err.response.data}
    }
  },

  async getAdClickStats (adId) {
    let response = await axios.get(`${baseUrl}/paid-images/${adId}/click-stats`)
    return response.data.map(clickAndDate => ({
      clicks: clickAndDate.clicks,
      date: format(new Date(clickAndDate.date.substr(0,10)), 'MMM d'),
    }))
  },

  async getAdsByStatuses (statuses) {
    let params = new URLSearchParams()
    statuses.forEach(status => params.append('statuses', status))
    let requestQuery = {params: params}

    let response = await axios.get(baseUrl + '/paid-images', requestQuery)
    if (!response.data.error) { return response.data }
    else { return [] }
  },
  
  async getAllAds () {
    let response = await axios.get(baseUrl + '/paid-images')
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async getMyAds () {
    try {
      let response = await axios.get(baseUrl + '/paid-images/me')
      return response.data
    }
    catch (err) {
      throw {message: err.response.data}
    }
  },

  async getAdPayments (adId) {
    let response = await axios.get(`${baseUrl}/paid-images/${adId}/payments`)
    return response.data
  },

  async toggleRenewal (adId, shouldRenew) {
    try {
      let response = await axios.post(`${baseUrl}/paid-images/${adId}/toggle-renew`, {shouldRenew})
      return response.data
    }
    catch (err) {
      return {success: false, message: err.response.data}
    }
  },

  async getAdsBasic () {
    let response = await axios.get(baseUrl + '/paid-images-basic')
    if (!response.data.error) { return response.data }
    else { return [] }
  },

  async deleteOrDeactivateAd (adId) {
    try {
      await axios.delete(`${baseUrl}/paid-images/${adId}`)
      return {success: true}
    }
    catch (err) {
      return {success: false, message: err.response.data}
    }
  },

  async logAdClick (adId) {
    axios.post(baseUrl + '/paid-images-click', {adId})
  },
}

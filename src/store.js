/* eslint-disable no-undef */
import Vue from 'vue'
import Vuex from 'vuex'
import auth from './store-auth'
import { registerFetchNames, doFetch, doFetchSilent } from './utils/statefulFetch'
import miscApi from '@/api/miscApi'
import keywordApi from '@/api/keywordApi'

Vue.use(Vuex)


const store = {
  modules: {
    auth
  },

  state: {
    darkTheme: false,
    orderedKeywordList: [],
    alphabeticKeywordList: [],
    comicKeywords: {},
  },

  actions: {
    async fetchKeywordList ({commit}) {
      let keywords = await doFetch(commit, 'allKeywords', keywordApi.getKeywordList())
      if (keywords) {
        commit('setOrderedKeywordList', keywords)
        commit('setAlphabeticKeywordList', keywords)
      }
    },

    findKeywordDataFromName (context, keywordName) {
      return context.state.keywordList.find(kw => kw.name === keywordName)
    },

    async getFeedback ({commit}) {
      return doFetch(commit, 'feedback', miscApi.getFeedback())
    },

    async markFeedbackRead ({commit}, feedbackId) {
      await miscApi.markFeedbackRead(feedbackId)
      doFetchSilent(commit, 'feedback', miscApi.getFeedback())
    },

    async deleteFeedback ({commit}, feedbackId) {
      await miscApi.deleteFeedback(feedbackId)
      doFetchSilent(commit, 'feedback', miscApi.getFeedback())
    },
  },

  mutations: {
    setDarkTheme (state, isDarkTheme) { state.darkTheme = isDarkTheme },
    setOrderedKeywordList (state, keywordList) {
      keywordList.sort((a, b) => a.count > b.count ? -1 : 1)
      state.orderedKeywordList = keywordList
    },
    setAlphabeticKeywordList (state, keywordList) {
      keywordList.sort((a, b) => a.name > b.name ? 1 : -1)
      state.alphabeticKeywordList = keywordList
    }
  },

  getters: {
    orderedKeywordListF: state => () => state.orderedKeywordList,
    orderedKeywordList: state => state.orderedKeywordList,
    alphabeticKeywordList: state => state.orderedKeywordList,
    isDarkTheme: state => state.darkTheme,
  }
}

registerFetchNames(store, 
  {name: 'allKeywords', defaultValue: []},
  {name: 'allComics', defaultValue: []},
  {name: 'feedback', defaultValue: []},
  {name: 'blogs', defaultValue: []},
  {name: 'modApplicationSubmit', defaultValue: {}},
  {name: 'fetchLogin', defaultValue: {}},
)

export default new Vuex.Store(store)
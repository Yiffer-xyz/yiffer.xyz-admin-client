import Vue from 'vue'
import store from '@/store.js'
import Router from 'vue-router'
import Login from '@/pages/Login.vue'
import AdminMain from '@/pages/AdminMain.vue'

Vue.use(Router)

async function rerouteIfNotLoggedIn(to, from, next) {
  try {
    let isLoggedIn = await store.dispatch('checkAndSetLoginStatus')
    if (isLoggedIn) {
      next()
    }
    else {
      next({ name: 'login' })
    }
  }
  catch (err) {
    next({ name: 'login' })
  }
}

async function rerouteIfLoggedIn(to, from, next) {
  try {
    let isLoggedIn = await store.dispatch('checkAndSetLoginStatus')
    if (!isLoggedIn) {
      next()
    }
    else {
      next({ name: 'landingPage' })
    }
  }
  catch (err) {
    next({ name: 'landingPage' })
  }
}

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landingPage',
      component: AdminMain,
      beforeEnter: rerouteIfNotLoggedIn,
      meta: {
        redirectOnLogout: true,
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: rerouteIfLoggedIn,
      meta: {
        redirectOnLogin: true,
      },
    },
    {
      path: '*',
      beforeEnter (to, from, next) {
        next({name: 'landingPage'})
      }
    },
  ],
  scrollBehavior () {
    return {x: 0, y: 0}
  }
})

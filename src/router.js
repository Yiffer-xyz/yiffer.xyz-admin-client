import Vue from 'vue'
import store from '@/store.js'
import Router from 'vue-router'
import Login from '@/pages/Login.vue'
import AdminMain from '@/pages/AdminMain.vue'
import PendingComic from '@/pages/PendingComic.vue'
import NoAccess from '@/pages/NoAccess.vue'

Vue.use(Router)

async function rerouteIfNotModOrAdmin(to, from, next) {
  try {
    let userData = await store.dispatch('getAndSetLoginStatus')
    
    if (userData) {
      if (userData.userType === 'moderator' || userData.userType === 'admin') {
        next()
      }
      else {
        next({ name: 'noAccess' })
        return
      }
    }
    else {
      next({ name: 'login' })
      return
    }
  }
  catch (err) {
    next({ name: 'login' })
    return
  }
}

async function rerouteIfLoggedIn(to, from, next) {
  try {
    let userData = await store.dispatch('getAndSetLoginStatus')
    if (!userData) {
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
      beforeEnter: rerouteIfNotModOrAdmin,
      meta: {
        redirectOnLogout: true,
      },
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
      path: '/no-access',
      name: 'noAccess',
      component: NoAccess,
      meta: {
        redirectOnLogout: true,
      },
    },
    {
      path: '/pending-comic/:comicName',
      name: 'pendingComic',
      component: PendingComic,
      beforeEnter: rerouteIfNotModOrAdmin,
      meta: {
        redirectOnLogout: true,
      }
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

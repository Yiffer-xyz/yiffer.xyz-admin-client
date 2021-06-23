import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCookies from 'vue-cookies'
import "vue-material-design-icons/styles.css"
import breakpoint from 'better-vue-breakpoints'
import Meta from 'vue-meta';
import VueCroppie from "vue-croppie";
import 'croppie/croppie.css'

import MenuDown from "vue-material-design-icons/ChevronDown.vue"
import MenuUp from "vue-material-design-icons/ChevronUp.vue"
Vue.component("menu-down-icon", MenuDown)
Vue.component("menu-up-icon", MenuUp)

Vue.config.productionTip = false

Vue.use(VueCookies)

Vue.use(Meta);

Vue.use(VueCroppie);

Vue.use(breakpoint, {
  xs: 500,
  sm: 900,
  md: 1200,
  lg: 1920,
  xl: 1920,
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

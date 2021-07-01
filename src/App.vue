<template>
  <div id="app">
    <nav>
      <div class="navInner">
        <div class="navLeft">
          <span class="smallYifferTitle"
                style="padding: 0 1rem 0 0.5rem;">
            <a 
              href="https://yiffer.xyz"
              :class="{'coloredSmallYifferTitle': isDarkTheme && this.$route.path !== '/'}"
              class="shrikhand smallYifferTitleLink">
              {{$breakpoint.smAndDown ? 'Y' : 'Yiffer.xyz'}}
            </a>
          </span>

          <router-link 
            v-if="!$store.getters.isAuthenticated"
            class="navlink"
            :to="{ name: 'login' }">
            Log in
          </router-link>

          <span 
            v-show="$store.getters.isAuthenticated" 
            class="navlink"
            @click="logout()">
            Log out
          </span>
        </div>

        <div class="navRight">
          <span @click="setTheme('light')"
                v-if="$breakpoint.xs"
                class="navlink">
            <LightIcon/>
          </span>
          <span @click="setTheme('light')"
                v-else
                class="navlink">
            Light
          </span>

          <span @click="setTheme('dark')"
                v-if="$breakpoint.xs"
                class="navlink">
            <DarkIcon/>
          </span>
          <span @click="setTheme('dark')"
                v-else
                class="navlink">
            Dark
          </span>
        </div>
      </div>
    </nav>

    <main class="main">
      <router-view/>
    </main>

    <footer class="footer" style="display: flex;"> 
      <p style="display: flex;">
        Made by
        <a href="https://twitter.com/LewdMalann" target="_blank" class="underline-link ml-4">
          <TwitterIcon/>Malann
        </a>
      </p>
    </footer>
  </div>
</template>

<script>
import TwitterIcon from 'vue-material-design-icons/Twitter.vue'
import DarkIcon from 'vue-material-design-icons/LightbulbOutline.vue'
import LightIcon from 'vue-material-design-icons/Lightbulb.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    TwitterIcon, DarkIcon, LightIcon,
  },

  metaInfo() {
    return {
      meta: [
        {name: 'theme-color', content: '#a4f5e4'},
        {name: 'twitter:card', content: 'summary'},
        {vmid: 'twitterTitle', name: 'twitter:title', content: 'Advertising - Yiffer.xyz'},
        {vmid: 'twitterDesc', name: 'twitter:description', content: "Advertise on the internet's best furry comics website!"},
        // image must be an absolute path
        {name: 'twitter:image', content: 'https://yiffer.xyz/preload-icon.jpg'},
        
        {vmid: 'ogTitle', property: 'og:title', content: 'Advertising - Yiffer.xyz'},
        {property: 'og:site_name', content: 'Yiffer.xyz'},
        {property: 'og:type', content: 'website'},
        {property: 'og:image', content: 'https://yiffer.xyz/preload-icon.jpg'},
        {vmid: 'ogDesc', property: 'og:description', content: "Advertise on the internet's best furry comics website!"}
      ]
    }
  },

  methods: {
    setTheme( themeColor ) {
      document.body.classList.remove('dark')
      document.body.classList.remove('redblue')
      document.body.classList.remove('pink')
      if ( themeColor === 'dark' ) {
        document.body.classList.add('dark')
        this.$store.commit('setDarkTheme', true)
        this.$cookies.set('theme', 'dark')
      }
      else if ( themeColor === 'redblue') {
        document.body.classList.add('redblue')
        this.$store.commit('setDarkTheme', false)
        this.$cookies.set('theme', 'light')
      }
      else if ( themeColor === 'pink') {
        document.body.classList.add('pink')
        this.$store.commit('setDarkTheme', false)
        this.$cookies.set('theme', 'light')
      }
      else {
        this.$store.commit('setDarkTheme', false)
        this.$cookies.set('theme', 'light')
      }
    },

    logout () {
      this.$store.dispatch('logout')
      if (this.$route.meta.redirectOnLogout) {
        this.$router.replace('/login')
      }
    }
  },

  computed: {
    ...mapGetters(['isDarkTheme']),
  },

  data: function () {
    return {
      darkTheme: false,
    }
  },

  created: function () {
    this.$cookies.config('60d')
    this.$store.dispatch('getAndSetLoginStatus')
    if (this.$cookies.get('theme') && this.$cookies.get('theme')==='dark') {
      this.setTheme('dark')
    }
    else {
      this.setTheme('light')
    }
  },
}
</script>

<style lang="scss">
@import "@/scss/button-styles.scss";
@import "@/scss/text-styles.scss";
@import "@/scss/forms.scss";
@import "@/scss/general.scss";
@import "@/scss/shadows.scss";

$footerHeight: 2.25rem;

nav {
  background: linear-gradient(to right, $themeGreen1, $themeGreen2);
  width: 100%;
  box-shadow: 0 0px 5px #0000001a;
}

.navInner {
  max-width: 80%;
  @media screen and (max-width: 1000px) {
    max-width: 100%;
  }
  margin: auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  button {
    border: none;
    outline: none;
  }
}

.navLeft, .navRight {
  padding: 0.5rem 4rem;
  @media screen and (max-width: 1000px) {
    padding: 0.5rem 0rem;
  }
}

.navlink {
  color: $themeDark1;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  @media screen and (max-width: 550px) {
    padding: 0.5rem 0.25rem;
  }
  font-weight: 600;
  &:hover {
    cursor: pointer;
    color: $themeBlueDarker;
  }
  span {
    margin-bottom: -1px;
  }
}

.navRight {
  @media screen and (max-width: 500px) {
    padding: 0.5rem 0.5rem 0.5rem 0;
    .navlink {
      padding: 0 0.5rem;
    }
  }
}
.navLeft {
  @media screen and (max-width: 500px) {
    .navlink:first-child {
      padding: 0 0.25rem 0 0.5rem !important;
      svg {
        margin-bottom: -1px;
      }
    }
  }
}

.footer {
  box-shadow: 0 0px 5px #0000001a;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, $themeGreen1, $themeGreen2);
  height: $footerHeight;
  width: 100%;
  margin-top: 2rem;
  position: absolute;
  bottom: 0;
  p, a {
    font-size: 0.85rem !important;
    font-weight: 400;
    color: $themeDark1;
  }
  p {
    margin: 0 1rem;
  }
}

.dark {
  nav {
    background: transparent;
    box-shadow: none;
    a, span {
      color: $themeBlueDTText;
      &:hover {
        color: $themeBlueDTText;
      }
    }
  }
  .footer {
    border-style: solid;
    border-width: 0;
    border-top-width: 4px;
    border-image: linear-gradient(to left, $themeGreen1, $themeGreen2) 1; 
    background: $themeDark4;
    p {
      color: white;
    }
    a {
      color: $themeBlueDTText;
    }
  }
}

.main {
  padding-bottom: $footerHeight + 1.5rem;
}
</style>

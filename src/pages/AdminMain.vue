<template>
  <div style="width: 100%">
    <span :class="{'coloredYifferTitle': isDarkTheme, 'yifferTitle': !isDarkTheme}">
      Admin - Yiffer.xyz
    </span>

    <p class="link-color cursorPointer mt-8 mb-8"
       @click="isMiniStatusShown = !isMiniStatusShown">
      {{isMiniStatusShown ? 'Hide' : 'Click to read a mini-status about this page\'s future'}}
    </p>
    <div v-if="isMiniStatusShown" class="full-width-text mb-32">
      <p class="mt-0">
        This admin panel <i>works</i>, but it's far from perfect. I have "modernized" the most essential features, but you'll notice that others look and feel clunky. I'm sorry that you have to work with these shortcomings. I am aware that the "box" design is not very good. I am aware that the... everything being centered... is bad, and I am aware that some of this panel is not well suited for phones. 
      </p>
      <p>
        Reworking this admin panel is on my to-do list, and I have begun, but it will take some time as there's just a lot of functionality here. If you have suggestions for improvements that will help <i>a lot</i> and require seemingly little effort to implement, please let me know and I will see if I can make time for it asap. Otherwise, thank you for helping out and thank you for your patience🙏.
      </p>
    </div>

    <div v-if="isSomeError" class="adminErrorBox">
      <p v-if="allComics.failed">
        Fetching the list of comics failed. If the problem persists, please message an administrator.
      </p>
      <p v-if="allKeywords.failed">
        Fetching the list of tags failed. If the problem persists, please message an administrator.
      </p>
    </div>

    <div class="admin-content-container" v-if="userData">
      <keyword-suggestions />

      <comic-suggestions />

      <add-page :comicList="allComics.payload"
                @refresh-comic-list="refreshComicList" />

      <KeywordManager :comicList="allComics.payload"
                      @refresh-comic-list="refreshComicList" />

      <correct-comic :comicList="allComics.payload" 
                     :artistList="artistList"
                     @refresh-comic-list="refreshComicList" />

      <page-manager :comicList="allComics.payload"
                    @refresh-comic-list="refreshComicList" />

      <add-comic :artistList="artistList" 
                 :comicList="allComics.payload"
                 @refresh-pending-comics="refreshPendingComics" />

      <artist-manager :artistList="artistList"
                      @refresh-artist-list="refreshArtistList" />

      <pending-comics :pendingComics="pendingComics"
                      @refresh-pending-comics="refreshPendingComics"
                      @refresh-comic-list="refreshComicList" />

      <mod-scoreboard/>

      <UserManager v-if="userData.userType==='admin'"/>

      <AdAdmin v-if="userData.userType==='admin'"/>

      <VisitorStats/>

      <AddBlog v-if="userData.userType==='admin'"/>

      <ModLog v-if="userData.userType==='admin'"/>

      <ModApplications v-if="userData.userType==='admin'"/>

      <Feedback v-if="userData.userType==='admin'"/>
    </div>
  </div>
</template>

<script>
import AddPage from '@/pages/admin-panel/AddPage.vue'
import KeywordManager from '@/pages/admin-panel/KeywordManager.vue'
import CorrectComic from '@/pages/admin-panel/CorrectComic.vue'
import AddComic from '@/pages/admin-panel/AddComic.vue'
import ArtistManager from '@/pages/admin-panel/ArtistManager.vue'
import PendingComics from '@/pages/admin-panel/PendingComics.vue'
import KeywordSuggestions from '@/pages/admin-panel/KeywordSuggestions.vue'
import ComicSuggestions from '@/pages/admin-panel/ComicSuggestions.vue'
import PageManager from '@/pages/admin-panel/PageManager.vue'
import UserManager from '@/pages/admin-panel/UserManager.vue'
import ModScoreboard from '@/pages/admin-panel/ModScoreboard.vue'
import ModLog from '@/pages/admin-panel/ModLog.vue'
import AdAdmin from '@/pages/admin-panel/AdAdmin.vue'
import VisitorStats from '@/pages/admin-panel/VisitorStats.vue'
import AddBlog from '@/pages/admin-panel/AddBlog.vue'
import ModApplications from '@/pages/admin-panel/ModApplications.vue'
import Feedback from '@/pages/admin-panel/Feedback.vue'

import ArtistApi from '@/api/artistApi'
import comicApi from '@/api/comicApi'
import { mapGetters } from 'vuex'
import { doFetch } from '../utils/statefulFetch'

export default {
  name: 'admin',

  components: {
    'add-page': AddPage,
    KeywordManager,
    'correct-comic': CorrectComic,
    'add-comic': AddComic,
    'artist-manager': ArtistManager,
    'pending-comics': PendingComics,
    'keyword-suggestions': KeywordSuggestions,
    'comic-suggestions': ComicSuggestions,
    'page-manager': PageManager,
    UserManager,
    'mod-scoreboard': ModScoreboard,
    ModLog,
    AdAdmin,
    VisitorStats,
    AddBlog,
    ModApplications,
    Feedback,
  },

  data: function () {
    return {
      isMiniStatusShown: false,
      alphabeticComicList: [],
      artistList: [],
      keywordSuggestionList: [],
      pendingComics: [],
    }
  },

  computed: {
    ...mapGetters([
      'allComics',
      'userData',
      'allKeywords',
      'isDarkTheme',
    ]),

    isSomeError () {
      return this.allComics.failed || this.allKeywords.failed
    }
  },

  async mounted () {
    if (!this.allComics.fetched && !this.allComics.fetching) {
      doFetch(this.$store.commit, 'allComics', comicApi.getAllComics())
    }
    if (!this.allKeywords.fetched && !this.allKeywords.fetching) {
      this.$store.dispatch('fetchKeywordList')
    }
    this.artistList = await ArtistApi.getArtistList()
    this.refreshPendingComics()
  },

  methods: {
    async refreshComicList () {
      doFetch(this.$store.commit, 'allComics', comicApi.getAllComics())
    },
    async refreshArtistList () {
      this.artistList = await ArtistApi.getArtistList()
    },
    async refreshPendingComics () {
      this.pendingComics = await comicApi.getPendingComics()
    },
  },

  metaInfo () {
    let title = `Admin - Yiffer.xyz`
    return {
      title: title,
      meta: [
        {vmid: 'twitterTitle', name: 'twitter:title', content: title},
        {vmid: 'ogTitle', property: 'og:title', content: title},
        {vmid: 'twitterDesc', name: 'twitter:description', content: "The internet's best collection of high quality furry porn comics, easily readable and free!"},
        {vmid: 'ogDesc', property: 'og:description', content: "The internet's best collection of high quality furry porn comics, easily readable and free!"}
      ]
    }
  },
}

</script>

<style lang="scss">
@import "../scss/shadows.scss";

.mdi-arrow {
  font-size: 28px;
}
.close-component-arrow {
  margin-top: 16px;
  &:hover {
    cursor: pointer;
  }
}

.admin-content-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  max-width: 90%;
  margin: auto;
  justify-content: center;

  @media (max-width: 900px) {
    max-width: 100%;    
  }
}

.admin-content-box {
  @include simpleshadow;

  background-color: white;
  width: 300px;
  margin: 16px;
  height: 156px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.5rem 0.75rem 0.75rem 0.75rem;
  &:hover {
    cursor: pointer;
  }

  h2 {
    font-weight: 300 !important;
  }

  .description-text {
    text-align: left;
    margin-left: 20px;
    margin-right: 20px;
  }

  @media (max-width: 900px) {
    height: auto;
    padding: 8px 4px;
    margin: 8px 2px;
    h2 {
      font-size: 24px;
    }
    .description-text {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
}

.adminErrorBox {
  padding: 1rem;
  background-color: rgb(228, 94, 94);
  width: fit-content;
  margin: 1rem auto;
  p {
    color: white;
  }
}

.admin-content-box-open {
  @include simpleshadow-active;
  border-width: 0;
  border-style: hidden;
  border-top-width: 10px;
  border-top-style: solid;
  border-image: linear-gradient(to right, $themeGreen1, $themeGreen2) 1; 

  width: 95%;
  height: auto;
  &:hover {
    cursor: initial;
  }
  h2 {
    margin-bottom: 8px;
    @media (max-width: 900px) {
      margin-bottom: 4px;
    }
  }

  &.admin-content-box-grow {
    width: 200%;
  }
}

.admin-content-box-inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.paddedAdminBox {
  padding-left: 1rem;
  padding-right: 1rem;
  p {
    text-align: left;
  }
}

.dark {
  .admin-content-box {
    background-color: $themeDark2;
  }
}
</style>


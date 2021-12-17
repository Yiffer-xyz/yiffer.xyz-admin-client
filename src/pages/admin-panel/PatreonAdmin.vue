<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">
      Patreon admin
      <span v-if="unprocessedLinks.length>0" class="red-color"> ({{unprocessedLinks.length}})</span>
      <span v-else style="color: #999;">(0)</span>
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen">
      <div class="verticalFlex" style="max-width: 100%;">
        <div v-if="unprocessedLinks.length>0">
          <p class="admin-mini-header textAlignLeft">
            Links in need of approval
          </p>
          
          <ResponseMessage v-if="processLink.failed"
                           :message="processLink.errorMessage"
                           messageType="error"
                           @closeMessage="clearErrorMsg"
                           style="margin: 1rem 0"/>

          <div v-for="unpLink in unprocessedLinks" :key="unpLink.userId" class="unprocessedLink">
            <p>
              User: {{unpLink.username}}
            </p>
            <a :href="unpLink.patreonDisplayLink" class="underline-link textAlignLeft" target="_blank" rel="noopener noreferrer nofollow">
              {{unpLink.patreonDisplayLink}}
            </a>
            <div class="horizontalFlex mt-4 mb-12" style="gap: 8px;">
              <LoadingButton text="Approve"
                             @click="() => processSomeLink(unpLink.userId, true)"
                             :isLoading="processLink.fetching"/>
              <LoadingButton text="Reject" color="error"
                             @click="() => processSomeLink(unpLink.userId, false)"
                             :isLoading="processLink.fetching"/>
            </div>
          </div>
        </div>

        <p v-else>
          There are no patron links in need of processing.
        </p>
      </div>

      <div class="verticalFlex mt-32" style="max-width: 100%;">
        <h2 class="adminHeader">
          All patrons
        </h2>
        
        <ResponseMessage v-if="clearPatronFieldReq.failed"
                         :message="clearPatronFieldReq.errorMessage"
                         messageType="error"
                         @closeMessage="clearErrorMsg"
                         style="margin: 1rem 0"/>

        <div v-if="allPatrons.length > 0"
             class="scrolling-table-container scrolling-table-container-vertical"
             style="max-height: 70vh; margin: 8px auto 0 auto">
          <table class="yTable">
            <thead>
              <tr>
                <th>Action</th>
                <th>Username</th>
                <th>Display name</th>
                <th v-if="patreonTiers.length">Tier</th>
                <th>Picture</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patron in allPatrons" :key="patron.userId">
                <td>
                  <button class="y-button yButtonRound y-button-neutral"
                          v-if="actionPatronUserId !== patron.userId"
                          @click="() => actionPatronUserId = patron.userId">
                    <EditIcon title=""/>
                  </button>
                  <div v-else>
                    <button class="y-button y-button-neutral button-with-icon mb-4"
                            @click="() => actionPatronUserId = null">
                      <LeftArrow/>Back
                    </button>

                    <LoadingButton text="Clear name"
                                   v-if="patron.patreonDisplayName"
                                   @click="clearPatronField(patron.userId, 'display-name')"
                                   class="mb-4"
                                   color="error"
                                   :isLoading="clearPatronFieldReq.fetching"/>

                    <LoadingButton text="Clear picture"
                                   v-if="patron.hasPatreonPicture"
                                   @click="clearPatronField(patron.userId, 'picture')"
                                   class="mb-4"
                                   color="error"
                                   :isLoading="clearPatronFieldReq.fetching"/>

                    <LoadingButton text="Clear link"
                                   v-if="patron.patreonDisplayLink"
                                   @click="clearPatronField(patron.userId, 'display-link')"
                                   color="error"
                                   :isLoading="clearPatronFieldReq.fetching"/>
                  </div>
                </td>
                <td>
                  <p>{{patron.username}}</p>
                </td>
                <td>
                  <p>{{patron.patreonDisplayName}}</p>
                </td>
                <td>
                  <p v-if="patreonTiers.length">
                    ${{patreonTiers.find(t => t.dbTierNumber === patron.patreonTier).amountCents/100}}
                  </p>
                </td>
                <td>
                  <CheckboxIcon v-if="patron.hasPatreonPicture" title=""/>
                  <CrossIcon v-else-if="patron.patreonTier >= 2" title=""/>
                </td>
                <td>
                  <a :href="patron.patreonDisplayLink" v-if="patron.patreonDisplayLink" class="underline-link textAlignLeft" target="_blank" rel="noopener noreferrer nofollow">
                    {{patron.patreonDisplayLink}}
                  </a>
                  <CrossIcon v-else-if="patron.patreonTier >= 3" title=""/>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else>
          No patrons
        </p>
      </div>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import patreonApi from '@/api/patreonApi'
import config from '@/config.json'
import { doFetch, fetchClear } from '@/utils/statefulFetch'
import CheckboxIcon from 'vue-material-design-icons/CheckboxMarkedCircle.vue'
import CrossIcon from 'vue-material-design-icons/Close.vue'
import EditIcon from 'vue-material-design-icons/Pencil.vue'
import LeftArrow from 'vue-material-design-icons/ArrowLeft.vue'

import { mapGetters } from 'vuex'
import LoadingButton from '@/components/LoadingButton.vue'

export default {
  name: 'patreonAdmin',

  components: {
    LoadingButton,
    CheckboxIcon, CrossIcon, EditIcon, LeftArrow,
  },

  computed: {
    ...mapGetters(['processLink', 'clearPatronFieldReq']),
  },

  data: function () {
    return {
      actionPatronUserId: null,
      unprocessedLinks: [],
      allPatrons: [],
      patreonTiers: [],
      isOpen: false,
      config,
    }
  },

  methods: {
    async getUnprocessedLinks () {
      let links = await patreonApi.getUnprocessedLinks()
      this.unprocessedLinks = links
    },

    async getAllPatrons () {
      let patrons = await patreonApi.getAllPatrons()
      this.allPatrons = patrons.sort((p1, p2) => p1.patreonTier > p2.patreonTier ? -1 : 1)
    },

    async getPatreonTiers () {
      let tiers = await patreonApi.getPatreonTiers()
      this.patreonTiers = tiers
    },

    async processSomeLink (userId, isApproved) {
      let result = await doFetch(this.$store.commit, 'processLink', patreonApi.processLink(userId, isApproved))
      if (result) {
        this.unprocessedLinks = result
      }
    },

    async clearPatronField (userId, fieldName) {
      let result = await doFetch(this.$store.commit, 'clearPatronFieldReq', patreonApi.clearPatronField(userId, fieldName))
      if (result) {
        this.allPatrons = result.sort((p1, p2) => p1.patreonTier > p2.patreonTier ? -1 : 1)
      }
    },

    clearErrorMsg () {
      fetchClear(this.$store.commit, 'processLink')
      fetchClear(this.$store.commit, 'clearPatronFieldReq')
    },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
  
  mounted () {
    this.getUnprocessedLinks()
    this.getPatreonTiers()
    this.getAllPatrons()
  }
}
</script>

<style lang="scss" scoped>
.unprocessedLink:not(:last-child) {
  border-bottom: 1px solid #ccc;
}
.unprocessedLink {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
  width: 100%;
  align-items: flex-start;
}
</style>
<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer">
      Ad admin
      <span v-if="numberOfPendingAds>0" class="red-color"> ({{numberOfPendingAds}})</span>
      <span v-else style="color: #999;">(0)</span>
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen">

    <ResponseMessage :message="responseMessage" :messageType="responseMessageType" @closeMessage="closeResponseMessage" class="mb-16"/>

    <Loading text="Saving..." v-if="isSaving" class="mb-16"/>

    <MultiToggleButton :items="['Non-ended', 'Pending', 'Soon active', 'Active', 'All']"
                        :initialValue="'Non-ended'"
                        :allowMultiple="false"
                        :allowNone="false"
                        @on-change="onAdSelectionChange"
                        class="mb-16"/>

      <div class="scrolling-table-container" v-show="displayedAds.length>0">
        <table v-if="displayedAds" class="yTable yTableLeft">
          <thead>
            <tr>
              <th></th>
              <th>Id</th>
              <th>Clicks</th>
              <th>Type</th>
              <th>Price</th>
              <th>User</th>
              <th>Status</th>
              <th>Link</th>
              <th>Media</th>
              <th>Main txt</th>
              <th>2nd txt</th>
              <th>Appl. date</th>
              <th>Act. date</th>
              <th>Deac. date</th>
              <th>Notes</th>
              <th>Adm. notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in displayedAds" :key="ad.id">
              <td style="height: 2rem;">
                <button @click="editAd(ad)" v-if="!editedAd" class="y-button y-button-neutral yButtonRound">
                  <EditIcon/>
                </button>

                <div v-if="isThisAdBeingEdited(ad.id)" class="horizontalFlex">
                  <button @click="cancelEditing" class="y-button y-button-neutral yButtonRound mr-4">
                    <CancelIcon/>
                  </button>
                  <button @click="saveEditedAd" class="y-button yButtonRound">
                    <SaveIcon/>
                  </button>
                </div>
              </td>

              <td>
                {{ad.id}}
              </td>

              <td>
                {{ad.clicks}}
              </td>

              <td>
                {{ad.adType}}
              </td>

              <td>
                <p v-if="!isThisAdBeingEdited(ad.id)">
                  {{ad.price}}$
                </p>
                <input v-else type="number" v-model="editedAd.price" style="width: 3rem;"/>
              </td>

              <td>
                {{ad.username}}
              </td>

              <td>
                <div v-if="!isThisAdBeingEdited(ad.id)" class="verticalFlex">
                  <p  :class="getAdStatusClass(ad.status)">
                    {{ad.status}}
                  </p>
                  <p v-if="ad.correctionNote" style="font-size: 0.8rem; white-space: normal;"> 
                    {{ad.correctionNote}}
                  </p>
                </div>
                <div v-else class="verticalFlex">
                  <select v-model="editedAd.status" style="width: 10rem;">
                    <option value="PENDING">PENDING</option>
                    <option value="NEEDS CORRECTION">NEEDS CORRECTION</option>
                    <option value="AWAITING PAYMENT">AWAITING PAYMENT</option>
                    <option value="ACTIVE SOON">ACTIVE SOON</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ACTIVE, AWAITING RENEWAL PAYMENT">ACTIVE, AWAITING RENEWAL PAYMENT</option>
                    <option value="ACTIVE, RENEWAL PAID">ACTIVE, RENEWAL PAID</option>
                    <option value="ENDED">ENDED</option>
                  </select>
                  <textarea v-if="editedAd.status === 'NEEDS CORRECTION'"
                            v-model="editedAd.correctionNote"
                            rows="3"
                            class="mt-4"
                            placeholder="Correction note"
                            type="text"/>
                </div>
              </td>

              <td style="white-space: pre-wrap;">
                <a :href="ad.link" target="_blank" style="min-width: 6rem; word-break: normal;" class="underline-link">{{ad.link}}</a>
              </td>

              <td>
                <a :href="`${config.paidImagesDirectory}/${ad.id}.${ad.filetype}`" target="_blank">
                  View
                </a>
              </td>

              <td style="white-space: pre-wrap;">
                <p v-if="ad.mainText" style="min-width: 8rem;">{{ad.mainText}}</p>
              </td>

              <td style="white-space: pre-wrap;">
                <p v-if="ad.mainText" style="min-width: 8rem;">{{ad.secondaryText}}</p>
              </td>

              <td>
                {{formatTimestamp(ad.applicationDate)}}
              </td>

              <td>
                <p v-if="!isThisAdBeingEdited(ad.id)">
                  {{formatTimestamp(ad.activationDate)}}
                </p>
                <input type="date" v-else v-model="editedAd.activationDate"/>
              </td>
              
              <td>
                <p v-if="!isThisAdBeingEdited(ad.id)">
                  {{formatTimestamp(ad.deactivationDate)}}
                </p>
                <input type="date" v-else v-model="editedAd.deactivationDate"/>
              </td>

              <td style="white-space: pre-wrap;">
                <p v-if="!isThisAdBeingEdited(ad.id) && ad.advertiserNotes" style="min-width: 8rem;">{{ad.advertiserNotes}}</p>
              </td>

              <td style="white-space: pre-wrap;">
                <p v-if="!isThisAdBeingEdited(ad.id) && ad.adminNotes" style="min-width: 8rem;">{{ad.adminNotes}}</p>
                <input type="text" v-if="isThisAdBeingEdited(ad.id)" v-model="editedAd.adminNotes"/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-show="displayedAds.length===0">
        No ads
      </p>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import adApi from '@/api/advertisingApi'
import config from '@/config.json'

import MultiToggleButton from '@/components/MultiToggleButton'
import ResponseMessage from '@/components/ResponseMessage.vue'
import Loading from '@/components/LoadingIndicator.vue'

import CancelIcon from 'vue-material-design-icons/Close.vue'
import EditIcon from 'vue-material-design-icons/Pencil.vue'
import SaveIcon from 'vue-material-design-icons/ContentSave.vue'
import { format } from 'date-fns'

export default {
  name: 'adAdmin',

  components: {
    MultiToggleButton, ResponseMessage, Loading,
    EditIcon, CancelIcon, SaveIcon,
  },

  data: function () {
    return {
      displayedAds: [],
      editedAd: null,
      responseMessage: '',
      responseMessageType: 'success',
      isSaving: false,
      numberOfPendingAds: 0,
      isOpen: false,
      config,
    }
  },

  methods: {
    editAd (ad) {
      this.editedAd = {
        id: ad.id,
        price: ad.price,
        status: ad.status,
        correctionNote: '',
        activationDate: ad.activationDate ? ad.activationDate.substring(0,10) : null,
        deactivationDate: ad.deactivationDate ? ad.deactivationDate.substring(0,10) : null,
        adminNotes: ad.adminNotes,
      }
    },

    cancelEditing () {
      this.editedAd = null
    },

    async saveEditedAd () {
      this.isSaving = true
      let response = await adApi.updateAd(this.editedAd)
      this.isSaving = false

      if (response.success) {
        let adIndex = this.displayedAds.findIndex(ad => ad.id === this.editedAd.id)
        this.$set(this.displayedAds, adIndex, response.ad)
        this.responseMessageType = 'success'
        this.responseMessage = `Successfully edited ${this.editedAd.id}`
        this.cancelEditing()
      }
      else {
        this.responseMessageType = 'error'
        this.responseMessage = response.message
      }
    },

    isThisAdBeingEdited (adId) {
      return this.editedAd && this.editedAd.id === adId
    },
    
    async onAdSelectionChange (newAdSelection) {
      this.displayedAds = []
      newAdSelection = newAdSelection[0]
      let recalculatePending = true

      if (newAdSelection === 'Active') {
        this.displayedAds = await adApi.getAdsByStatuses([adStatuses.active])
        recalculatePending = false
      }
      else if (newAdSelection === 'Pending') {
        this.displayedAds = await adApi.getAdsByStatuses([adStatuses.pending])
      }
      else if (newAdSelection === 'Soon active') {
        this.displayedAds = await adApi.getAdsByStatuses([adStatuses.activeSoon, adStatuses.activeRenewalPaid])
        recalculatePending = false
      }
      else if (newAdSelection === 'Non-ended') {
        this.displayedAds = await adApi.getAdsByStatuses(
          Object.values(adStatuses).filter(s => s!==adStatuses.ended && s!==adStatuses.cancelled))
      }
      else {
        this.displayedAds = await adApi.getAllAds()
      }

      if (recalculatePending) {
        this.numberOfPendingAds = this.displayedAds.filter(ad => ad.status === adStatuses.pending).length
      }
    },

    formatTimestamp (timestamp) {
      if (!timestamp) { return '' }
      return format(new Date(timestamp), 'MMM do yyyy')
    },

    getAdStatusClass (status) {
      if (['PENDING', 'ACTIVE SOON'].includes(status)) {
        return 'monoInfo'
      }
      else if (['NEEDS CORRECTION', 'AWAITING PAYMENT', 'ACTIVE, AWAITING RENEWAL PAYMENT '].includes(status)) {
        return 'monoWarning'
      }
      else if (status === 'ENDED') {
        return 'monoError'
      }
      else {
        return 'monoSuccess'
      }
    },
    
    closeResponseMessage () { this.responseMessage = '' },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },
  
  async mounted () {
    await this.onAdSelectionChange('Non-ended')
  }
}

const adStatuses = {
  pending: 'PENDING',
  needsCorrection: 'NEEDS CORRECTION',
  awaitingPayment: 'AWAITING PAYMENT',
  activeSoon: 'ACTIVE SOON',
  active: 'ACTIVE',
  activeAwaitingRenewal: 'ACTIVE, AWAITING RENEWAL PAYMENT',
  activeRenewalPaid: 'ACTIVE, RENEWAL PAID',
  ended: 'ENDED',
  cancelled: 'CANCELLED',
}
</script>

<style lang="scss">
#adButtonContainer {
  button {
    margin: 0.25rem;
  }
}
</style>
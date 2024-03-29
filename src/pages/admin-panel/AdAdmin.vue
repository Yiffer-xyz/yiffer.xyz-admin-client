<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">
      Ad admin
      <span v-if="numberOfPendingAds>0" class="red-color"> ({{numberOfPendingAds}})</span>
      <span v-else style="color: #999;">(0)</span>
    </h2>
    <span class="admin-content-box-inner" v-if="isOpen">

    <FetchResponseMessage :fetchStates="[updateAd]" 
                          :successMessage="successMessage" 
                          disableElevation
                          class="mb-16"/>

    <Loading text="Saving..." v-if="updateAd.fetching" class="mb-16"/>

    <MultiToggleButton :items="['All', 'Pending', 'Active', 'Needs correction']"
                       :initialValue="'All'"
                       :allowMultiple="false"
                       :allowNone="false"
                       @on-change="onAdSelectionChange"
                       class="mb-16"/>

      <div class="scrolling-table-container" v-show="displayedAds.length>0" style="max-height: 70vh;">
        <table v-if="displayedAds" class="yTable yTableLeft">
          <thead>
            <tr>
              <th></th>
              <th>Id</th>
              <th>Clicks</th>
              <th>User</th>
              <th>Expires</th>
              <th>Type</th>
              <th>Media</th>
              <th>Status</th>
              <th>Name</th>
              <th>$</th>
              <th>Link</th>
              <th>Media</th>
              <th>Main txt</th>
              <th>2nd txt</th>
              <th>Created</th>
              <th>Notes</th>
              <th>Adm. notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in displayedAds" :key="ad.id">
              <td style="height: 2rem;">
                <button v-if="!editedAd" @click="editAd(ad)" class="y-button yButtonRound mr-4">
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
                {{ad.username}}
              </td>

              <td>
                <p v-if="!isThisAdBeingEdited(ad.id)">
                  {{formatTimestamp(ad.expiryDate)}}
                </p>
                <div v-else class="verticalFlex">
                  <div class="verticalFlex">
                    <div>
                      <input type="radio" v-model="editedAd.expiryDateChoice" value="manual" id="expiryManual"/>
                      <label for="expiryManual">Manual</label>
                    </div>
                    <div>
                      <input type="radio" v-model="editedAd.expiryDateChoice" value="extend" id="expiryExtend"/>
                      <label for="expiryExtend">Extend months</label>
                    </div>
                    <div>
                      <input type="radio" v-model="editedAd.expiryDateChoice" value="null" id="expiryClear"/>
                      <label for="expiryClear">Null</label>
                    </div>
                  </div>

                  <input type="date"
                         v-if="editedAd.expiryDateChoice === 'manual'"
                         v-model="editedAd.expiryDate"
                         class="mt-8"/>


                  <TextInput v-else-if="editedAd.expiryDateChoice === 'extend'"
                             @change="newVal => editedAd.extendMonths = newVal"
                             type="number"
                             :title="`+ months${(!editedAd.expiryDate || editedAd.expiryDate.includes('1970')) ? ' (from now)' : ''}`"
                             textAlign="left"
                             classes="mt-8"/>

                </div>
              </td>

              <td>
                {{ad.adType}}
              </td>

              <td>
                <div v-if="!isThisAdBeingEdited(ad.id)">
                  {{ad.filetype}}
                </div>
                <TextInput v-else
                           :value="editedAd.filetype"
                           @change="newVal => editedAd.filetype = newVal"
                           type="text"
                           title="Filetype"
                           textAlign="left"/>
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
                  <Select :options="adStatusOptions"
                          title="Status"
                          :defaultValue="adStatusOptions.find(opt => opt.value === editedAd.status)"
                          @change="newVal => editedAd.status = newVal"/>   

                  <TextInput v-if="editedAd.status === adStatuses.needsCorrection || editedAd.status === adStatuses.activeNeedsCorrection"
                             :value="editedAd.correctionNote"
                             @change="newVal => editedAd.correctionNote = newVal"
                             type="textarea"
                             :textAreaRows="2"
                             title="Correction note"
                             classes="mt-16"
                             textAlign="left"/>
                </div>
              </td>

              <td>
                {{ad.adName}}
              </td>

              <td>
                <span v-if="ad && ad.payments && ad.payments.length > 0">
                  <p v-for="(payment, index) in ad.payments" :key="index" :title="formatTimestamp(payment.date)">
                    ${{payment.amount}}, {{formatShortTimestamp(payment.date)}}
                  </p>
                </span>

                <button v-if="isThisAdBeingEdited(ad.id) && editedAd.payment === null"
                        class="y-button y-button-small mt-4"
                        @click="editedAd.payment = 0">
                  Add
                </button>

                <TextInput @change="newVal => editedAd.payment = newVal"
                           @clear="editedAd.payment = null"
                           type="number"
                           class="mt-8"
                           includeClearButton
                           alwaysShowClearButton
                           v-if="isThisAdBeingEdited(ad.id) && editedAd.payment !== null"
                           title="Amount ($)"
                           textAlign="left"/>
              </td>

              <td style="white-space: pre-wrap;">
                <a :href="ad.link" v-if="!isThisAdBeingEdited(ad.id)" target="_blank" style="min-width: 6rem; word-break: normal;" class="underline-link">{{ad.link}}</a>
                <TextInput v-else
                           :value="editedAd.link"
                           @change="newVal => editedAd.link = newVal"
                           type="text"
                           title="Link"
                           wrapperStyle="max-width: 16rem;"
                           textAlign="left"/>
              </td>

              <td>
                <a :href="`${config.paidImagesBaseUrl}/${ad.id}.${ad.filetype}`"
                   class="underline-link"
                   target="_blank">
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
                {{formatTimestamp(ad.createdDate)}}
              </td>

              <td style="white-space: pre-wrap;">
                <p v-if="!isThisAdBeingEdited(ad.id) && ad.advertiserNotes" style="min-width: 8rem;">{{ad.advertiserNotes}}</p>
              </td>

              <td style="white-space: pre-wrap;">
                <p v-if="!isThisAdBeingEdited(ad.id) && ad.adminNotes" style="min-width: 8rem;">{{ad.adminNotes}}</p>
                <TextInput v-if="isThisAdBeingEdited(ad.id)"
                           :value="editedAd.adminNotes"
                           @change="newVal => editedAd.adminNotes = newVal"
                           type="text"
                           title="Admin notes"
                           wrapperStyle="width: 12rem;"
                           textAlign="left"/>
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
import { doFetch } from '@/utils/statefulFetch'

import MultiToggleButton from '@/components/MultiToggleButton'
import FetchResponseMessage from '@/components/FetchResponseMessage.vue'
import Loading from '@/components/LoadingIndicator.vue'
import TextInput from '@/components/TextInput.vue'
import Select from '@/components/Select.vue'

import CancelIcon from 'vue-material-design-icons/Close.vue'
import EditIcon from 'vue-material-design-icons/Pencil.vue'
import SaveIcon from 'vue-material-design-icons/ContentSave.vue'
import { format } from 'date-fns'
import { mapGetters } from 'vuex'

export default {
  name: 'adAdmin',

  components: {
    MultiToggleButton, FetchResponseMessage, Loading,
    EditIcon, CancelIcon, SaveIcon, TextInput, Select,
  },

  computed: {
    ...mapGetters(['updateAd']),
  },

  data () {
    return {
      displayedAds: [],
      editedAd: null,
      successMessage: '',
      numberOfPendingAds: 0,
      isOpen: false,
      config,
      adStatuses,
      adStatusOptions,
      paymentAdId: null,
      addPaymentAmount: 0,
    }
  },

  methods: {
    editAd (ad) {
      this.editedAd = {
        id: ad.id,
        link: ad.link,
        status: ad.status,
        correctionNote: '',
        expiryDate: format(new Date(ad.expiryDate), 'yyyy-MM-dd'),
        adminNotes: ad.adminNotes,
        extendMonths: 0,
        expiryDateChoice: ad.expiryDate ? 'manual' : 'null',
        payment: null,
        filetype: ad.filetype,
      }
    },

    cancelEditing () {
      this.editedAd = null
    },

    async saveEditedAd () {
      if (this.updateAd.fetching) { return }

      let extendMonths = null
      let customExpiryDate = null

      if (this.editedAd.expiryDateChoice === 'extend') {
        extendMonths = this.editedAd.extendMonths
      }
      else if (this.editedAd.expiryDateChoice === 'manual') {
        customExpiryDate = this.editedAd.expiryDate
      }

      let result = await doFetch(this.$store.commit, 'updateAd', adApi.updateAd(
        this.editedAd.id,
        this.editedAd.status,
        this.editedAd.adminNotes, 
        this.editedAd.correctionNote,
        this.editedAd.link,
        extendMonths,
        customExpiryDate,
        this.editedAd.payment,
        this.editedAd.filetype,
      ))
      let adIndex = this.displayedAds.findIndex(ad => ad.id === this.editedAd.id)

      if (this.editedAd.status === 'DELETED') {
        this.displayedAds.splice(adIndex, 1)
        this.successMessage = `Successfully deleted ${this.editedAd.id}`
        this.cancelEditing()
      }
      else if (result) {
        this.$set(this.displayedAds, adIndex, result)
        this.successMessage = `Successfully edited ${this.editedAd.id}`
        this.cancelEditing()
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
        this.displayedAds = await adApi.getAdsByStatuses([adStatuses.pending, adStatuses.activeButPending])
      }
      else if (newAdSelection === 'Needs correction') {
        this.displayedAds = await adApi.getAdsByStatuses([adStatuses.needsCorrection, adStatuses.activeNeedsCorrection])
        recalculatePending = false
      }
      else {
        this.displayedAds = await adApi.getAllAds()
      }

      if (recalculatePending) {
        this.numberOfPendingAds = this.displayedAds.filter(
          ad => [adStatuses.pending, adStatuses.activeButPending].includes(ad.status)
        ).length
      }
    },

    formatTimestamp (timestamp) {
      if (!timestamp) { return '' }
      return format(new Date(timestamp), 'MMM do yyyy')
    },

    formatShortTimestamp (timestamp) {
      if (!timestamp) { return '' }
      return format(new Date(timestamp), `MMM do`)
    },

    getAdStatusClass (status) {
      if ([adStatuses.pending, adStatuses.activeButPending].includes(status)) {
        return 'monoInfo'
      }
      else if ([adStatuses.needsCorrection, adStatuses.awaitingPayment, adStatuses.activeNeedsCorrection].includes(status)) {
        return 'monoWarning'
      }
      else if ([adStatuses.ended].includes(status)) {
        return 'monoError'
      }
      else {
        return 'monoSuccess'
      }
    },
    
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
  active: 'ACTIVE',
  activeButPending: 'ACTIVE BUT PENDING',
  activeNeedsCorrection: 'ACTIVE BUT NEEDS CORR.',
  ended: 'ENDED',
  deleted: 'DELETED',
}

const adStatusOptions = Object.values(adStatuses).map(status => ({
  text: status.substr(0,1) + status.substr(1).toLowerCase(),
  value: status
}))
</script>

<style lang="scss">
#adButtonContainer {
  button {
    margin: 0.25rem;
  }
}
</style>
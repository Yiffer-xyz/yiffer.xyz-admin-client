<template>
  <div class="loginWrapper">
    <p class="modalHeader">Log in</p>

    <form @submit.prevent="submitLogin"
          class="login-register-form">

      <TextInput @change="newVal => loginUsername = newVal"
                 v-if="!fetchLogin.fetched"
                 title="Username or email"
                 textAlign="left"
                 classes="width100 mb-32"/>

      <TextInput @change="newVal => loginPassword = newVal"
                 v-if="!fetchLogin.fetched"
                 type="password"
                 title="Password"
                 textAlign="left"
                 classes="width100 mb-16"/>

      <ResponseMessage :message="responseMessage"
                       :messageType="fetchLogin.failed ? 'error' : 'success'"
                       :preventClose="fetchLogin.fetched"
                       @closeMessage="responseMessage = ''"
                       disableElevation
                       :style="fetchLogin.fetched ? 'margin-top: 1rem; width: 100%;' : 'margin-bottom: 1rem; width: 100%;'"/>

      <LoadingButton text="Log in"
                     v-if="!fetchLogin.fetched"
                     :isLoading="fetchLogin.fetching"
                     style="margin: auto; margin-top: 2rem;"/>
    </form>

    <p class="mt-48" style="font-size: 0.9rem;">
      To sign up or reset your password, please head over to the <a href="https://yiffer.xyz" class="underline-link" style="font-size: 0.9rem;">main site</a>.
    </p>
  </div>
</template>

<script>
import ResponseMessage from '@/components/ResponseMessage.vue'
import TextInput from '@/components/TextInput.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import authApi from '@/api/authApi'
import { fetchClear, doFetch } from '@/utils/statefulFetch'
import { mapGetters } from 'vuex'

export default {
  components: {
    ResponseMessage, LoadingButton, TextInput,
  },

  computed: {
    ...mapGetters(['fetchLogin'])
  },

  data () {
    return { 
      loginUsername: '',
      loginPassword: '',
      responseMessage: '',
    }
  },

  methods: {
    async submitLogin () {
      await doFetch(this.$store.commit, 'fetchLogin', 
        authApi.login(this.loginUsername, this.loginPassword))
    },
  },
  
  watch: {
    fetchLogin () {
      if (this.fetchLogin.failed) {
        this.responseMessage = this.fetchLogin.errorMessage
      }
      else if (this.fetchLogin.fetching) {
        this.responseMessage = ''
      }
      else if (this.fetchLogin.fetched) {
        this.$store.dispatch('setUserData', this.fetchLogin.payload)
        fetchClear(this.$store.commit, 'fetchLogin')
        if (this.$route.meta.redirectOnLogin) {
          this.$router.push({path: '/'})
        }
      }
    },
  },

  mounted () {
    fetchClear(this.$store.commit, 'fetchLogin')
  },
}
</script>

<style scoped>
.loginWrapper {
  max-width: 16rem;
  margin: 5rem auto 0 auto;
}
.modalHeader {
  margin-bottom: 2rem;
  font-size: 28px;
  font-weight: 400;

  @media (max-width: 900px) {
    font-size: 25px;
  }

}
</style>
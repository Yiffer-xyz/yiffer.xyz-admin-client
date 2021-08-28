<template>
  <div class="admin-content-box" @click="openComponent" :class="{'admin-content-box-open': isOpen}">
    <h2 @click="closeComponent" class="cursorPointer adminHeader">
      Comic problems
      <span v-if="problems.length>0" class="red-color"> ({{problems.length}})</span>
      <span v-else style="color: #999;">(0)</span>
    </h2>

    <span class="admin-content-box-inner" v-if="isOpen">
      <ResponseMessage :message="assignRemoveResponseMessage"
                        messageType="error"
                        @closeMessage="assignRemoveResponseMessage = ''"
                        class="mb-16"/>

      <div class="scrolling-table-container scrolling-table-container-vertical" style="max-height: 70vh;">
        <table class="yTable">
          <thead>
            <tr>
              <th>Comic name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Assigned mod</th>
              <th class="textAlignCenter">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(problem, index) in problems" :key="index">
              <td>
                <a :href="`https://yiffer.xyz/${problem.comicName}`" target="_blank" class="underline-link">
                  {{problem.comicName}} <RightArrow/>
                </a>
              </td>
              <td>
                {{problem.problemCategoryName}}
              </td>
              <td style="max-width: 30rem; white-space: pre-wrap;">{{problem.description}}</td>
              <td>
                {{problem.assignedModName || '-'}}
              </td>
              <td>
                <div class="verticalFlex">
                  <LoadingButton class="mb-4"
                                 @click="assignComicProblem(problem.id)"
                                 v-if="!(problem.assignedModId && !isProblemAssignedToMe(problem))"
                                 :isDisabled="isFetchingProblems"
                                 :color="isProblemAssignedToMe(problem) ? 'error' : 'primary'"
                                 :text="isProblemAssignedToMe(problem) ? 'Unassign from me' : 'Assign to me'"
                                 :isLoading="!!assigningId && assigningId === problem.id">
                    
                  </LoadingButton>
                  <LoadingButton :isLoading="!!removingId && removingId === problem.id"
                                 text="Done / remove"
                                 :isDisabled="isFetchingProblems"
                                 v-if="!(problem.assignedModId && !isProblemAssignedToMe(problem))"
                                 @click="removeComicProblem(problem.id)"/>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="userData.userType==='admin'" class="maxWidth100">
        <h2 class="adminHeader textLeft width100" style="margin-top: 40px;">
          Manage categories
        </h2>

        <div class="scrolling-table-container mb-24 scrolling-table-container-vertical" style="max-height: 70vh;">
          <table class="yTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Helper text</th>
                <th class="textAlignCenter">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in problemCategories" :key="category.id">
                <td>
                  <p v-if="!isEditingThisCategory(category.id)">
                    {{category.name}}
                  </p>
                  
                  <TextInput v-else
                             :value="editedCategory.name"
                             @change="newVal => editedCategory.name = newVal"
                             title="Category name"
                             textAlign="left"/>
                </td>
                <td style="max-width: 30rem; white-space: pre-wrap;">
                  <p v-if="!isEditingThisCategory(category.id)">{{category.helperText}}</p>
                  
                  <TextInput v-else
                             :value="editedCategory.helperText"
                             @change="newVal => editedCategory.helperText = newVal"
                             title="Helper text"
                             textAlign="left"/>
                </td>
                <td class="horizontalFlex">
                  <button class="y-button yButtonRound mr-8"
                          v-if="!isChangingCategory(category.id)"
                          :disabled="!isChangingCategory(category.id) && isChangingSomeCategory"
                          :class="{'y-button-disabled': !isChangingCategory(category.id) && isChangingSomeCategory}"
                          @click="startEditingCategory(category)">
                    <EditIcon/>
                  </button>
                  <button class="y-button yButtonRound"
                          v-if="!isChangingCategory(category.id)"
                          :disabled="!isChangingCategory(category.id) && isChangingSomeCategory"
                          :class="{'y-button-disabled': !isChangingCategory(category.id) && isChangingSomeCategory}"
                          @click="startDeleteCategory(category)">
                    <DeleteIcon/>
                  </button>

                  <!-- DELETE CONFIRM -->
                  <button class="y-button yButtonRound y-button-red mr-8"
                          v-if="isDeletingThisCategory(category.id)"
                          @click="finishDeletingCategory()">
                    <DeleteIcon/>
                  </button>
                  
                  <!-- SAVE -->
                  <button class="y-button yButtonRound mr-8"
                          v-if="isEditingThisCategory(category.id)"
                          @click="finishEditingCategory()">
                    <CheckIcon/>
                  </button>
                  
                  <!-- CANCEL -->
                  <button class="y-button yButtonRound y-button-neutral"
                          v-if="isChangingCategory(category.id)"
                          @click="cancelChangingCategory()">
                    <CancelIcon/>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button class="y-button y-button-neutral button-with-icon"
                v-if="!isAddingCategory"
                @click="startAddingCategory()">
          <PlusIcon/> New category
        </button>

        <div v-else>
          <p class="bold textAlignLeft">
            New category
          </p>

          <ResponseMessage :message="newCategoryResponseMessage"
                           messageType="error"
                           @closeMessage="newCategoryResponseMessage = ''"
                           class="mb-16 mt-8"
                           style="margin-left: 0;"/>

          <TextInput :value="newCategoryName"
                     @change="newVal => newCategoryName = newVal"
                     title="Category name"
                     textAlign="left"
                     class="mt-8 mb-24"/>

          <TextInput :value="newCategoryHelperText"
                     @change="newVal => newCategoryHelperText = newVal"
                     title="Description"
                     textAlign="left"
                     type="textarea"
                     class="mt-24 mb-16"/>

          <div class="horizontalFlex justifyContentEnd">
            <button class="y-button y-button-neutral button-with-icon mr-8"
                    @click="isAddingCategory = false">
              <CrossIcon/> Cancel
            </button>
            <LoadingButton class="y-button button-with-icon"
                           @click="finishAddingCategory()"
                           text="Add category"
                           iconType="check"
                           :isLoading="isSubmittingNewCategory"
                           :isDisabled="!newCategoryName || !newCategoryHelperText"/>
          </div>
        </div>
      </div>

      <menu-up-icon @click="closeComponent" class="mdi-arrow close-component-arrow"/>
    </span>

    <span v-else>
      <menu-down-icon class="mdi-arrow"/>
    </span>
  </div>
</template>

<script>
import miscApi from '@/api/miscApi'
import { mapGetters } from 'vuex'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import TextInput from '../../components/TextInput.vue'
import CrossIcon from 'vue-material-design-icons/Close.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import DeleteIcon from 'vue-material-design-icons/TrashCanOutline.vue'
import EditIcon from 'vue-material-design-icons/Pencil.vue'
import CancelIcon from 'vue-material-design-icons/Close.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import ResponseMessage from '@/components/ResponseMessage.vue'
import RightArrow from 'vue-material-design-icons/ArrowRight.vue'

export default {
  name: 'comicProblems',

  components: {
    PlusIcon, TextInput, CrossIcon, LoadingButton, DeleteIcon, EditIcon, CancelIcon, CheckIcon,
    ResponseMessage, RightArrow,
  },

  data: function () {
    return {
      problems: [],
      problemCategories: [],
      isFetchingProblems: false,

      isAddingCategory: false,
      isSubmittingNewCategory: false,
      newCategoryName: '',
      newCategoryHelperText: '',
      newCategoryResponseMessage: '',

      editedCategory: null,
      categoryToBeDeleted: null,

      isSubmitting: false,

      assigningId: null,
      assignRemoveResponseMessage: '',
      removingId: null,

      isOpen: false,
    }
  },

  methods: {
    async getCategories () {
      let categories = await miscApi.getProblemCategories()
      this.problemCategories = categories
    },

    async getProblems () {
      this.isFetchingProblems = true
      let problems = await miscApi.getComicProblems()
      this.problems = problems
      this.isFetchingProblems = false
    },

    startAddingCategory () {
      this.newCategoryName = ''
      this.newCategoryHelperText = ''
      this.isAddingCategory = true
    },

    startEditingCategory (category) {
      this.editedCategory = {...category}
    },

    startDeleteCategory (category) {
      this.categoryToBeDeleted = category
    },

    cancelChangingCategory () {
      this.categoryToBeDeleted = null
      this.editedCategory = null
    },

    isProblemAssignedToMe (problem) {
      return problem.assignedModId && problem.assignedModId === this.userData.id
    },

    isEditingThisCategory (categoryId) {
      return this.editedCategory && this.editedCategory.id === categoryId
    },

    isDeletingThisCategory (categoryId) {
      return this.categoryToBeDeleted && this.categoryToBeDeleted.id === categoryId
    },

    isChangingCategory (categoryId) {
      return this.isDeletingThisCategory(categoryId) || this.isEditingThisCategory(categoryId)
    },

    async assignComicProblem (problemId) {
      this.assigningId = problemId
      this.assignRemoveResponseMessage = ''
      let result = await miscApi.assignComicProblem(problemId)

      if (result.success) {
        this.getProblems()
      }
      else {
        this.assignRemoveResponseMessage = result.error
      }

      this.assigningId = null
    },

    async removeComicProblem (problemId) {
      this.removingId = problemId
      this.assignRemoveResponseMessage = ''
      let result = await miscApi.removeComicProblem(problemId)

      if (result.success) {
        this.getProblems()
      }
      else {
        this.assignRemoveResponseMessage = result.error
      }

      this.removingId = null
    },

    async finishAddingCategory () {
      this.isSubmittingNewCategory = true
      this.newCategoryResponseMessage = ''
      let result = await miscApi.addProblemCategory(this.newCategoryName, this.newCategoryHelperText)

      if (result.success) {
        this.isAddingCategory = false
        this.getCategories()
      }
      else {
        this.newCategoryResponseMessage = result.error
      }

      this.isSubmittingNewCategory = false
    },

    async finishDeletingCategory () {
      let result = await miscApi.deleteProblemCategory(this.categoryToBeDeleted.id)
      if (result.success) {
        this.categoryToBeDeleted = null
        this.getCategories()
      }
      else {
        this.newCategoryResponseMessage = result.error
      }
    },

    async finishEditingCategory () {
      let result = await miscApi.editProblemCategory(this.editedCategory.id, this.editedCategory.name, this.editedCategory.helperText)
      if (result.success) {
        let catIndex = this.problemCategories.findIndex(c => c.id === this.editedCategory.id)
        this.problemCategories[catIndex] = {...this.editedCategory}
        this.editedCategory = null
      }
      else {
        this.newCategoryResponseMessage = result.error
      }
    },

    openComponent () { if (!this.isOpen) { setTimeout( () => this.isOpen = true, 15 ) } },

    closeComponent () { setTimeout( () => this.isOpen = false, 15 ) }
  },

  mounted () {
    this.getCategories()
    this.getProblems()
  },

  computed: {
    ...mapGetters([
      'userData',
    ]),

    isChangingSomeCategory () {
      return this.categoryToBeDeleted || this.editedCategory
    },
  },
}
/*
Tai was here bitch.
*/
</script>
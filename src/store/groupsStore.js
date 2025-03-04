import { reactive } from 'vue'
import { groupsService } from '../api/groupsService'
import { userStore } from './userStore'

// Create a reactive state object
const state = reactive({
  groups: [],
  currentGroup: null,
  groupMembers: [],
  groupSettings: null,
  loading: false,
  error: null
})

// Create and export the groups store
export const groupsStore = {
  // Getters
  get groups() {
    return state.groups
  },
  get currentGroup() {
    return state.currentGroup
  },
  get groupMembers() {
    return state.groupMembers
  },
  get groupSettings() {
    return state.groupSettings
  },
  get loading() {
    return state.loading
  },
  get error() {
    return state.error
  },

  // Methods
  async fetchUserGroups() {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await userStore.getUserGroups()

      if (error) throw error

      state.groups = data || []
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchGroupById(groupId) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await groupsService.getGroupById(groupId)

      if (error) throw error

      state.currentGroup = data
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchGroupMembers(groupId) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await groupsService.getGroupMembers(groupId)

      if (error) throw error

      state.groupMembers = data || []
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async fetchGroupSettings(groupId) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await groupsService.getGroupSettings(groupId)

      if (error) throw error

      state.groupSettings = data
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async createGroup(name) {
    try {
      state.loading = true
      state.error = null

      if (!userStore.user) throw new Error('User not authenticated')

      const { data, error } = await groupsService.createGroup(name, userStore.user.id)

      if (error) throw error

      // Add the new group to the list
      await this.fetchUserGroups()

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async updateGroup(groupId, data) {
    try {
      state.loading = true
      state.error = null

      const { data: updatedGroup, error } = await groupsService.updateGroup(groupId, data)

      if (error) throw error

      // Update the current group if it's the one being updated
      if (state.currentGroup && state.currentGroup.id === groupId) {
        state.currentGroup = updatedGroup
      }

      // Update the group in the list
      const index = state.groups.findIndex(group => group.id === groupId)
      if (index !== -1) {
        state.groups[index] = { ...state.groups[index], ...updatedGroup }
      }

      return { data: updatedGroup, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async deleteGroup(groupId) {
    try {
      state.loading = true
      state.error = null

      const { success, error } = await groupsService.deleteGroup(groupId)

      if (error) throw error

      // Remove the group from the list
      state.groups = state.groups.filter(group => group.id !== groupId)

      // Clear current group if it's the one being deleted
      if (state.currentGroup && state.currentGroup.id === groupId) {
        state.currentGroup = null
      }

      return { success, error: null }
    } catch (error) {
      state.error = error.message
      return { success: false, error }
    } finally {
      state.loading = false
    }
  },

  async addMember(groupId, userId, isAdmin = false) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await groupsService.addMember(groupId, userId, isAdmin)

      if (error) throw error

      // Refresh members list if we're viewing this group
      if (state.currentGroup && state.currentGroup.id === groupId) {
        await this.fetchGroupMembers(groupId)
      }

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async removeMember(membershipId, groupId) {
    try {
      state.loading = true
      state.error = null

      const { success, error } = await groupsService.removeMember(membershipId)

      if (error) throw error

      // Refresh members list if we're viewing this group
      if (state.currentGroup && state.currentGroup.id === groupId) {
        await this.fetchGroupMembers(groupId)
      }

      return { success, error: null }
    } catch (error) {
      state.error = error.message
      return { success: false, error }
    } finally {
      state.loading = false
    }
  },

  async updateMemberRole(membershipId, isAdmin, groupId) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await groupsService.updateMemberRole(membershipId, isAdmin)

      if (error) throw error

      // Refresh members list if we're viewing this group
      if (state.currentGroup && state.currentGroup.id === groupId) {
        await this.fetchGroupMembers(groupId)
      }

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async updateGroupSettings(groupId, settings) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await groupsService.updateGroupSettings(groupId, settings)

      if (error) throw error

      // Update local state
      state.groupSettings = data

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  clearError() {
    state.error = null
  }
}

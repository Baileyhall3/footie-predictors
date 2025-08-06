import { reactive } from 'vue'
import { notificationsService } from '../api/notificationsService'
import { userStore } from './userStore'
import { Notification } from '../types'

const state = reactive<{
  notifications: Notification[],
  unreadNotifications: Notification[]
  loading: boolean,
  error: string | null
}>({
  notifications: [],
  unreadNotifications: [],
  loading: false,
  error: null
})


export const notificationsStore = {

  get notifications() {
    return state.notifications
  },
  get unreadNotifications() {
    return state.unreadNotifications
  },
  get loading() {
    return state.loading
  },
  get error() {
    return state.error
  },

  async fetchUserUnreadNotifications() {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await userStore.getUserUnreadNotifications()
      if (error) throw error

      state.unreadNotifications = data || []

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },
}
import { reactive } from 'vue'
import { notificationsService } from '../api/notificationsService'
import { userStore } from './userStore';
import { Notification } from '../types';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const state = reactive<{
  notifications: Notification[],
  unreadNotifications: number;
  loading: boolean,
  error: string | null
}>({
  notifications: [],
  unreadNotifications: 0,
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

  setInitial(notifications: Notification[]) {
    state.notifications = notifications;
    if (state.notifications.length > 0) {
      state.unreadNotifications = state.notifications.filter(x => !x.read).length;
    }
  },

  async fetchUserUnreadNotifications() {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await userStore.getUserUnreadNotifications()
      if (error) throw error

      state.notifications = data || [];
      if (state.notifications.length > 0) {
        state.unreadNotifications = state.notifications.filter(x => !x.read).length;
      }

      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  add(notification: Notification) {
    state.notifications.unshift(notification);
    if (!notification.read) {
      state.unreadNotifications++;
    }
    toast(`${notification.template_data.header}`, {
        "type": "success",
        "position": "top-center"
    });
  },

  removeNotificationById(id: number) {
    state.notifications = state.notifications.filter(x => x.id !== id);
  },

  clear() {
    state.notifications = [];
    state.unreadNotifications = 0; 
  }
}
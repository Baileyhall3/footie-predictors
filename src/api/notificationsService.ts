import { supabase } from './supabase.js';
import { supabaseDb } from './supabaseDb.js';
import { NotificationPriority, NotificationType } from '../types/dataObjects.js';

/**
 * Minimum required fields to create a notification
 */
export type CreatedNotification = {
    user_id: string,
    group_id?: string,
    template_data: Object,
    type: NotificationType
    priority: NotificationPriority
    expires_at?: Date
    link?: string
}

/**
 * Service for managing notifications and notifications_preferences
 */
export const notificationsService = {
    /**
     * Get all notifications for a user
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Object}>}
     */
    async getAllUserNotifcations(userId: string) {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
            )

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            return { data: null, error }
        }
    },

    /**
     * Get all notifications for a user for a particular group
     * @param {string} userId - User ID
     * @param {string} groupId - Group ID
     * @returns {Promise<{data: Array, error: Object}>}
     */
    async getUserGroupNotifcations(userId: string, groupId: string) {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('group_id', groupId)
                .order('created_at', { ascending: true })
            )

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error fetching notifications for group:', error)
            return { data: null, error }
        }
    },

    /**
     * Create a new notification
     * @param {CreatedNotification} notification - Notification data
     * @returns {Promise<{data: Object, error: Object}>}
     */
    async createNotifictaion(notification: CreatedNotification) {
        return supabaseDb.create('notifications', notification)
    },

    /**
     * Update notification to be read or unread
     * @param {string} id - Notification ID
     * @param {boolean} read - Whether to mark the notification as read
     * @returns {Promise<{data: Object, error: Object}>}
     */
    async updateNotificationReadStatus(id: string, read: boolean = true) {
        return supabaseDb.update('notifications', id, {
            read: read,
        });
    },

    /**
     * Delete a notification
     * @param {string} id - Notification ID
     * @returns {Promise<{success: boolean, error: Object}>}
     */
    async deleteNotification(id: string) {
        return supabaseDb.delete('notifications', id)
    },

    /**
     * Get all general notification preferences (no group associated) for a user
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Object}>}
     */
    async getUserGeneralPreferences(userId: string) {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', userId)
                .eq('group_id', null)
            )

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error fetching notification preferences:', error)
            return { data: null, error }
        }
    },

    /**
     * Get all general notification preferences (no group associated) for a user
     * @param {string} userId - User ID
     * @param {string} groupId - Group ID
     * @returns {Promise<{data: Array, error: Object}>}
     */
    async getUserGroupPreferences(userId: string, groupId: string) {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', userId)
                .eq('group_id', groupId)
            )

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error fetching notification preferences for group:', error)
            return { data: null, error }
        }
    },

    /**
     * Update notification to be read or unread
     * @param {string} id - Notification ID
     * @param {boolean} allowPush - Whether to allow notifications or not
     * @returns {Promise<{data: Object, error: Object}>}
     */
    async updateNotificationPreferencePush(id: string, allowPush: boolean) {
        return supabaseDb.update('notification_preferences', id, {
            allow_push: allowPush,
        });
    },
}
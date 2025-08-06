import { supabase } from './supabase.js';
import { supabaseDb } from './supabaseDb.js';
import { NotificationPriority, NotificationType } from '../types/dataObjects.js';
import { notificationsStore } from '../store/notificationsStore.js';

/**
 * Minimum required fields to create a notification
 */
export type CreatedNotification = {
    user_id: string,
    group_id?: string,
    template_data?: Object,
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
                .from('notifications_view')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
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
                .order('created_at', { ascending: false })
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
        const result = await supabaseDb.create('notifications', notification);

        // Refresh unread notifications
        await notificationsStore.fetchUserUnreadNotifications();

        return result;
    },

    async createWelcomeNotification(user) {
        const { data, error } = await this.createNotifictaion({
            user_id: user.id,
            group_id: null,
            template_data: {
                content: `Hello and welcome to Footie Predictors! Consider checking out the app info page to get started. Happy predicting and good luck!`
            },
            type: 'welcome_message',
            priority: 'info',
            expires_at: null,
            link: `/app-info`
        });

        // ${user.username}

        if (error) throw new Error(error);
        return { data, error: null }
    },

    /**
     * Update notification to be read or unread
     * @param {string} id - Notification ID
     * @param {boolean} read - Whether to mark the notification as read
     * @returns {Promise<{data: Object, error: Object}>}
     */
    async updateNotificationReadStatus(id: string, read: boolean = true) {
        const result = await supabaseDb.update('notifications', id, {
            read: read,
        });

        await notificationsStore.fetchUserUnreadNotifications();

        return result;
    },

    /**
     * Delete a notification
     * @param {string} id - Notification ID
     * @returns {Promise<{success: boolean, error: Object}>}
     */
    async deleteNotification(id: string) {
        const result = await supabaseDb.delete('notifications', id);

        await notificationsStore.fetchUserUnreadNotifications();

        return result;
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
                .is('group_id', null)
                .order('id', { ascending: true })
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
                .order('id', { ascending: true })
            )

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error fetching notification preferences for group:', error)
            return { data: null, error }
        }
    },

    /**
     * Update notification preference to be allowed or not
     * @param {string} id - Notification ID
     * @param {boolean} allowPush - Whether to allow notifications or not
     * @returns {Promise<{data: Object, error: Object}>}
     */
    async updateNotificationPreferencePush(id: string, allowPush: boolean) {
        return supabaseDb.update('notification_preferences', id, {
            allow_push: allowPush,
        });
    },

    /**
     * Get all unread notifications for a user
     * @param {string} userId - User ID
     * @returns {Promise<{data: Array, error: Object}>}
     */
    async getUserUnreadNotifications(userId: string) {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('notifications_view')
                .select('*')
                .eq('user_id', userId)
                .eq('read', false)
                .order('created_at', { ascending: false })
            )

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            return { data: null, error }
        }
    },
}
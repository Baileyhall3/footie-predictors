import { supabase } from './supabase'
import { supabaseDb } from './supabaseDb'
import { userStore } from '../store/userStore';

/**
 * Service for managing users
 */
export const userService = {
    /**
     * Upload a display image
     * @param {File} file - File to use as group icon
     * @param {string} groupId - Group ID
     * @returns {Promise<{url: string|null, error: any|null}>}
     */
    async uploadDisplayPicture(file) {
        if (!file) return { error: 'Missing file' };

        const userId = userStore.user.id;
    
        const fileExt = file.name.split('.').pop();
        const filePath = `user-${userId}.${fileExt}`;
    
        const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        });
    
        if (uploadError) {
            console.error('Upload error:', uploadError.message);
            return { error: uploadError };
        }
    
        const { data: publicUrlData } = supabase
        .storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
    
        await supabaseDb.update('users', userId, { profile_picture_url: publicUrlData.publicUrl });

        userStore.userProfile.profile_picture_url = publicUrlData.publicUrl;
    
        return { url: publicUrlData.publicUrl };
    },

    /**
     * Remove the user's profile picture
     * Deletes the image from storage and clears the DB field
     * @returns {Promise<{ success: boolean, error: any | null }>}
     */
    async removeDisplayPicture() {
        const userId = userStore.user.id;
        const profileUrl = userStore.userProfile.profile_picture_url;

        if (!profileUrl) {
            return { success: false, error: 'No profile picture to remove' };
        }

        try {
            // Extract the path from the public URL
            const fileName = profileUrl.split('/').pop();
            const filePath = `user-${userId}.${fileName?.split('.').pop()}`;

            // Delete the file from the storage bucket
            const { error: deleteError } = await supabase.storage
                .from('profile-pictures')
                .remove([filePath]);

            if (deleteError) {
                console.error('Delete error:', deleteError.message);
                return { success: false, error: deleteError };
            }

            // Clear the profile_picture_url in the database
            await supabaseDb.update('users', userId, { profile_picture_url: null });

            userStore.userProfile.profile_picture_url = null;

            return { success: true, error: null };
        } catch (err) {
            console.error('Unexpected error during removal:', err);
            return { success: false, error: err };
        }
    },
}
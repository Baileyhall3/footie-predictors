import { supabase } from './supabase'
import { supabaseDb } from './supabaseDb'

/**
 * Service for managing groups and group memberships
 */
export const groupsService = {
  /**
   * Get all groups
   * @param {Object} options - Query options
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getAllGroups(options = {}) {
    return supabaseDb.getAll('groups', options)
  },

  /**
   * Get a group by ID
   * @param {string} id - Group ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getGroupById(id) {
    return supabaseDb.getById('groups', id)
  },

  /**
   * Create a new group
   * @param {object} groupData - Group data
   * @param {string} adminId - User ID of the group admin
   * @param {File} iconFile - File for group icon
   * @param {object} seasonData - Season data
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createGroup(groupData, adminId, iconFile = null, seasonData) {
    try {
      const { data: group, error } = await supabaseDb.create('groups', {
        name: groupData.name,
        admin_id: adminId,
        description: groupData.description,
        exact_score_points: groupData.exact_score_pts,
        correct_result_points: groupData.correct_result_pts,
        incorrect_points: groupData.incorrect_points,
        is_public: groupData.is_public,
        group_pin: groupData.group_pin,
        max_members: groupData.max_members
      });
  
      if (error) throw error;

      if (iconFile) {
        const { url, error: uploadError } = await this.uploadGroupIcon(iconFile, group.id);
        if (uploadError) throw memberError;
        // supabaseDb.update('groups', group.id, { icon_url: url });
      }
  
      // Add creator as a group admin
      const { error: memberError } = await supabaseDb.create('group_members', {
        group_id: group.id,
        user_id: adminId,
        is_admin: true
      });
  
      if (memberError) throw memberError;

      
      const { data: sznData, error: seasonError } = await supabaseDb.create('seasons', {
        name: seasonData.name ?? 'Season 1',
        group_id: group.id,
        start_date: seasonData.start_date,
        end_date: seasonData.end_date
      });
      
      if (seasonError) throw seasonError;

      // const { error: leaderboardError } = await supabaseDb.create('leaderboard', {
      //   user_id: adminId,
      //   group_id: group.id,
      //   season_id: sznData.id
      // });

      // if (leaderboardError) throw leaderboardError;

      await supabaseDb.update('groups', group.id, { active_season_id: sznData.id });
  
      return { data: group, error: null };
    } catch (error) {
      console.error('Error creating group:', error);
      return { data: null, error };
    }
  },  

  /**
   * Update a group
   * @param {string} id - Group ID
   * @param {Object} data - Updated group data
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateGroup(id, data) {
    return supabaseDb.update('groups', id, data)
  },

  /**
   * Delete a group
   * @param {string} id - Group ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteGroup(id) {
    return supabaseDb.delete('groups', id)
  },

  /**
   * Get all members of a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGroupMembers(groupId, onlyFakeUsers = false) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) => {
        let query = supabase
          .from('group_members')
          .select(`
            id,
            is_admin,
            joined_at,
            has_requested,
            users (
              id,
              username,
              email,
              is_fake,
              bg_colour,
              profile_picture_url
            )
          `)
          .eq('group_id', groupId)

          // Apply filtering to return only fake users' predictions
          if (onlyFakeUsers) {
            query = query.eq('users.is_fake', true)
          }

          return query
        })

      if (error) throw error

      // Transform the data to a more usable format
      const members = data
        .filter(membership => membership.users)
        .map(membership => ({
        id: membership.users.id,
        username: membership.users.username,
        email: membership.users.email,
        is_admin: membership.is_admin,
        joined_at: membership.joined_at,
        membership_id: membership.id,
        is_fake: membership.users.is_fake,
        bg_colour: membership.users.bg_colour,
        profile_picture_url: membership.users.profile_picture_url,
        has_requested: membership.has_requested
      }))

      return { data: members, error: null }
    } catch (error) {
      console.error('Error fetching group members:', error)
      return { data: null, error }
    }
  },

  /**
   * Get the admin of a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Object | null, error: Object | null}>}
   */
  async getGroupAdmin(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('groups')
          .select(`
            admin_id,
            users:admin_id (
              id,
              username,
              email
            )
          `)
          .eq('id', groupId)
          .single() // Ensure we only get one record
      );

      if (error) throw error;

      if (!data || !data.users) {
        return { data: null, error: 'Admin not found' };
      }

      // Format the admin object
      const admin = {
        id: data.users.id,
        username: data.users.username,
        email: data.users.email,
      };

      return { data: admin, error: null };
    } catch (error) {
      console.error('Error fetching group admin:', error);
      return { data: null, error };
    }
  },

  /**
   * Add a user to a group and create a record in the leaderboard
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @param {boolean} isRequesting - Whether the user is requesting to join group
   * @param {boolean} seasonId - Active season ID for the group
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async addMember(groupId, userId, isAdmin = false, isRequesting = false, seasonId) {
    const { data: groupMemberData, error: groupMemberError } = await supabaseDb.create('group_members', {
      group_id: groupId,
      user_id: userId,
      is_admin: isAdmin,
      has_requested: isRequesting
    });

    if (groupMemberError) {
      console.error('Error adding user to group:', groupMemberError);
      return { data: null, error: groupMemberError };
    }

    // Insert the new user into the leaderboard with total_points = 0
    let leaderboardData = {}
    if (!isRequesting) {
      const { data: lbData, error: leaderboardError } = await supabaseDb.create('leaderboard', {
        user_id: userId,
        group_id: groupId,
        season_id: seasonId
      });
  
      if (leaderboardError) {
        console.error('Error adding user to leaderboard:', leaderboardError);
        return { data: null, error: leaderboardError };
      }

      leaderboardData = lbData;
    }

    return { data: { groupMemberData, leaderboardData }, error: null };
  },

  /**
   * Remove a user from a group
   * @param {string} membershipId - Membership ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async removeMember(membershipId) {
    return supabaseDb.delete('group_members', membershipId)
  },

  /**
   * Delete a fake user from the system
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, error: Object | null}>}
   */
  async deleteFakeUser(userId) {
      try {
          const { error } = await supabaseDb.delete('users', userId);
          if (error) {
              console.error('Error deleting user:', error);
              throw error;
          }

          return { success: true, error: null };
      } catch (error) {
          console.error('Delete failed:', error);
          return { success: false, error };
      }
  },

  /**
   * Update a member's role in a group
   * @param {string} membershipId - Membership ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateMemberRole(membershipId, isAdmin) {
    return supabaseDb.update('group_members', membershipId, { is_admin: isAdmin })
  },

  /**
   * Create a fake user and add them to a group
   * @param {string} groupId - Group ID where the fake user should be added
   * @param {string} username - Fake user's username
   * @param {string} seasonId - The season ID for which to insert into the leaderboard
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async addFakeUserToGroup(groupId, username, isAdmin = false, seasonId) {
    try {

      const { data: userData, error: userError } = await supabaseDb.create('users', {
        username,
        is_fake: true
      });
  
      if (userError) {
        console.error('Error creating fake user:', userError);
        return { data: null, error: userError };
      }
  
      const fakeUserId = userData.id; // Assuming the inserted user data contains the ID
  
      // Step 2: Add the fake user to the group
      const { data: memberData, error: memberError } = await supabaseDb.create('group_members', {
        group_id: groupId,
        user_id: fakeUserId,
        is_admin: isAdmin
      });
  
      if (memberError) {
        console.error('Error adding fake user to group:', memberError);
        return { data: null, error: memberError };
      }
  
      // Insert the new user into the leaderboard with total_points = 0
      const { data: leaderboardData, error: leaderboardError } = await supabaseDb.create('leaderboard', {
        user_id: fakeUserId,
        group_id: groupId,
        season_id: seasonId
      });
  
      if (leaderboardError) {
        console.error('Error adding user to leaderboard:', leaderboardError);
        return { data: null, error: leaderboardError };
      }
  
      return { data: { memberData, leaderboardData }, error: null };
    } catch (err) {
      console.error('Error creating member ', err);
      return { data: null, err }
    }
  },

  /**
   * Add an image to a group TODO: Make upload to buckets a general fn
   * @param {File} file - File to use as group icon
   * @param {string} groupId - Group ID
   * @returns {Promise<{url: string|null, error: any|null}>}
   */
  async uploadGroupIcon(file, groupId) {
    if (!file || !groupId) return { error: 'Missing file or group ID' };
  
    const fileExt = file.name.split('.').pop();
    const filePath = `group-${groupId}.${fileExt}`;
  
    const { data, error: uploadError } = await supabase.storage
      .from('group-icons')
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
      .from('group-icons')
      .getPublicUrl(filePath);
  
    await supabaseDb.update('groups', groupId, { icon_url: publicUrlData.publicUrl });
  
    return { url: publicUrlData.publicUrl };
  },

  /**
   * Delete a group's icon from Supabase Storage
   * @param {string} groupId - Group ID
   * @returns {Promise<{ success: boolean, error: any|null }>}
   */
  async deleteGroupIcon(groupId) {
      if (!groupId) return { success: false, error: 'Missing group ID' };

      const { data: files, error: listError } = await supabase.storage
        .from('group-icons')
        .list('', { search: `group-${groupId}` });

      if (listError) {
        console.error('Error listing files:', listError.message);
        return { success: false, error: listError };
      }

      const fileToDelete = files?.find(f => f.name.startsWith(`group-${groupId}`));
      if (!fileToDelete) {
        console.warn('No icon found for this group.');
        // Still update the DB just in case
        await supabaseDb.update('groups', groupId, { icon_url: null });
        return { success: true, error: null };
      }

      const { error: deleteError } = await supabase.storage
        .from('group-icons')
        .remove([fileToDelete.name]);

      if (deleteError) {
        console.error('Delete error:', deleteError.message);
        return { success: false, error: deleteError };
      }

      // Update the database to reflect the deletion
      await supabaseDb.update('groups', groupId, { icon_url: null });

      return { success: true, error: null };
    },


  /**
   * Get user stats across groups
   * @param {string | null} groupId - Group ID
   * @param {string} userId - user ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGroupStats(groupId = null, userId = null) {
    try {
      
      if (!groupId) {
        const { data, error } = await supabaseDb.customQuery((supabase) =>
          supabase
            .from('user_group_stats')
            .select(`*`)
            .eq('user_id', userId)
        );
    
        if (error) throw error;
  
        return { data, error: null }
      } else if (groupId && userId) {
        const { data, error } = await supabaseDb.customQuery((supabase) =>
          supabase
            .from('user_group_stats')
            .select(`*`)
            .eq('group_id', groupId)
            .eq('user_id', userId)
        );
    
        if (error) throw error;
  
        return { data, error: null }
      } else {
        const { data, error } = await supabaseDb.customQuery((supabase) =>
          supabase
            .from('user_group_stats')
            .select(`*`)
            .eq('group_id', groupId)
        );
    
        if (error) throw error;
  
        return { data, error: null }
      }
    } catch (error) {
      console.error('Error fetching group stats:', error)
      return { data: null, error }
    }
  },

  /**
   * Get all groups using view
   * @param {Object} options - Query options
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getAllGroupsUsingView(options = {}) {
    return supabaseDb.getAll('groups_view', options)
  },

  /**
   * Get group by ID using view
   * @param {number} groupId - The ID of the group for which to retrieve data
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGroupByIdUsingView(groupId) {
    return supabaseDb.getById('groups_view', groupId)
  },
  
  /**
   * Add a user to a group who has requested access
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @param {string} membershipId - Membership ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async approveMemberRequest(groupId, userId, membershipId) {
    await supabaseDb.update('group_members', membershipId, { has_requested: false })

    // Insert the new user into the leaderboard
    const { data: leaderboardData, error: leaderboardError } = await supabaseDb.create('leaderboard', {
      user_id: userId,
      group_id: groupId,
    }); // need to add seasonID here too

    if (leaderboardError) {
      console.error('Error adding user to leaderboard:', leaderboardError);
      return { data: null, error: leaderboardError };
    }

    return { data: { groupMemberData, leaderboardData }, error: null };
  },

}

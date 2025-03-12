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
   * @param {string} name - Group name
   * @param {string} adminId - User ID of the group admin
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createGroup(groupData, adminId) {
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
        max_members: groupData.max_members,
      });
  
      if (error) throw error;
  
      // Add creator as a group admin
      const { error: memberError } = await supabaseDb.create('group_members', {
        group_id: group.id,
        user_id: adminId,
        is_admin: true
      });
  
      if (memberError) throw memberError;
  
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
  async getGroupMembers(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('group_members')
          .select(`
            id,
            is_admin,
            joined_at,
            users (
              id,
              username,
              email,
              is_fake
            )
          `)
          .eq('group_id', groupId)
      )

      if (error) throw error

      // Transform the data to a more usable format
      const members = data.map(membership => ({
        id: membership.users.id,
        username: membership.users.username,
        email: membership.users.email,
        is_admin: membership.is_admin,
        joined_at: membership.joined_at,
        membership_id: membership.id,
        is_fake: membership.users.is_fake
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
   * Add a user to a group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async addMember(groupId, userId, isAdmin = false) {
    return supabaseDb.create('group_members', {
      group_id: groupId,
      user_id: userId,
      is_admin: isAdmin
    })
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
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async addFakeUserToGroup(groupId, username, isAdmin = false) {
    // Step 1: Insert fake user into users table
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

    return { data: memberData, error: null };
  },

}

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
      });
  
      if (error) throw error;
  
      // Add creator as a group admin
      const { error: memberError } = await supabaseDb.create('group_members', {
        group_id: group.id,
        user_id: adminId,
        is_admin: true
      });
  
      if (memberError) throw memberError;
  
      // Store group settings
      const { error: settingsError } = await supabaseDb.create('group_settings', {
        group_id: group.id,
        exact_score_points: groupData.exact_score_pts,
        correct_result_points: groupData.correct_result_pts,
        incorrect_points: groupData.incorrect_points,
        is_public: groupData.is_public,
        max_members: groupData.max_members,
      });
  
      if (settingsError) throw settingsError;
  
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
              email
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
        membership_id: membership.id
      }))

      return { data: members, error: null }
    } catch (error) {
      console.error('Error fetching group members:', error)
      return { data: null, error }
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
   * Update a member's role in a group
   * @param {string} membershipId - Membership ID
   * @param {boolean} isAdmin - Whether the user is an admin
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateMemberRole(membershipId, isAdmin) {
    return supabaseDb.update('group_members', membershipId, { is_admin: isAdmin })
  },

  /**
   * Get group settings
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getGroupSettings(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('group_settings')
          .select('*')
          .eq('group_id', groupId)
          .single()
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching group settings:', error)
      return { data: null, error }
    }
  },

  /**
   * Update group settings
   * @param {string} groupId - Group ID
   * @param {Object} settings - Updated settings
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateGroupSettings(groupId, settings) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('group_settings')
          .update(settings)
          .eq('group_id', groupId)
          .select()
      )

      if (error) throw error

      return { data: data[0], error: null }
    } catch (error) {
      console.error('Error updating group settings:', error)
      return { data: null, error }
    }
  }
}

import { reactive } from 'vue'
import { supabase } from '../api/supabase'
import { supabaseDb } from '../api/supabaseDb'
import { saveAuthState, clearAuthState, hasAuthState } from '../utils/authPersistence'

// Create a reactive state object
const state = reactive({
  user: null,
  session: null,
  userProfile: null,
  loading: false,
  error: null
})

// Create and export the user store
export const userStore = {
  // Getters
  get user() {
    return state.user
  },
  get session() {
    return state.session
  },
  get userProfile() {
    return state.userProfile
  },
  get loading() {
    return state.loading
  },
  get error() {
    return state.error
  },
  get isAuthenticated() {
    return !!state.user
  },

  // Methods
  async init() {
    try {
      // Get initial session
      const { data } = await supabase.auth.getSession()
      state.session = data.session
      state.user = data.session?.user || null
      
      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event)
        
        // Update the state directly
        state.session = session
        state.user = session?.user || null
        
        // Persist auth state to localStorage
        if (session) {
          saveAuthState(session)
        } else {
          clearAuthState()
        }
        
        // If user is logged in, fetch their profile
        if (state.user) {
          await this.fetchUserProfile()
        } else {
          state.userProfile = null
        }
      })
      
      // If user is logged in, fetch their profile
      if (state.user) {
        await this.fetchUserProfile()
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error initializing auth:', error)
      return { success: false, error }
    }
  },
  
  // Method to update session and user state
  updateAuthState(session) {
    state.session = session
    state.user = session?.user || null
    
    // Persist auth state to localStorage
    if (session) {
      saveAuthState(session)
    } else {
      clearAuthState()
    }
  },

  async fetchUserProfile() {
    if (!state.user) return null
    
    try {
      // First check if we already have the profile cached
      if (state.userProfile && state.userProfile.id === state.user.id) {
        return state.userProfile
      }
      
      state.loading = true
      const { data, error } = await supabaseDb.getById('users', state.user.id)
      
      if (error) throw error
      
      state.userProfile = data
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // If we can't fetch the profile, we should still have basic user info from auth
      if (!state.userProfile && state.user) {
        // Create a minimal profile from auth data
        state.userProfile = {
          id: state.user.id,
          email: state.user.email,
          username: state.user.email.split('@')[0] // Fallback username
        }
      }
      return state.userProfile
    } finally {
      state.loading = false
    }
  },

  async signUp(email, password, username) {
    try {
      state.loading = true
      state.error = null
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) throw error
      
      // Create user profile in the users table
      if (data.user) {
        const { error: profileError } = await supabaseDb.create('users', {
          id: data.user.id,
          email,
          username,
          password_hash: 'managed_by_supabase' // Supabase Auth handles password hashing
        })
        
        if (profileError) throw profileError
      }
      
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async signIn(email, password) {
    try {
      state.loading = true
      state.error = null
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Fetch user profile after successful login
      if (data.user) {
        await this.fetchUserProfile()
      }
      
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async signOut() {
    try {
      state.loading = true
      state.error = null
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      // Clear user data
      state.user = null
      state.session = null
      state.userProfile = null
      
      // Clear persisted auth state
      clearAuthState()
      
      // Clear any cached data in other stores
      // This prevents data leakage between users
      
      return { error: null }
    } catch (error) {
      state.error = error.message
      return { error }
    } finally {
      state.loading = false
    }
  },

  async resetPassword(email) {
    try {
      state.loading = true
      state.error = null
      
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
      if (error) throw error
      
      return { error: null }
    } catch (error) {
      state.error = error.message
      return { error }
    } finally {
      state.loading = false
    }
  },

  async updateProfile(profileData) {
    try {
      state.loading = true
      state.error = null
      
      if (!state.user) throw new Error('User not authenticated')
      
      const { data, error } = await supabaseDb.update('users', state.user.id, profileData)
      
      if (error) throw error
      
      // Update local state
      state.userProfile = data
      
      return { data, error: null }
    } catch (error) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async getUserGroups() {
    try {
      if (!state.user) throw new Error('User not authenticated');
  
      // Get groups where user is a member along with member count
      const { data, error } = await supabaseDb.customQuery((supabase) => 
        supabase
          .from('group_members')
          .select(`
            id,
            is_admin,
            joined_at,
            groups (
              id,
              name,
              created_at,
              group_members(count) 
            )
          `)
          .eq('user_id', state.user.id)
      );
  
      if (error) throw error;
  
      // Transform the data to include member count
      const groups = data.map(membership => ({
        ...membership.groups,
        is_admin: membership.is_admin,
        joined_at: membership.joined_at,
        membership_id: membership.id,
        member_count: membership.groups.group_members[0]?.count || 0 // Get count from the relation
      }));
  
      return { data: groups, error: null };
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return { data: null, error };
    }
  },
  
  clearError() {
    state.error = null
  }
}

// Initialize the store
userStore.init()

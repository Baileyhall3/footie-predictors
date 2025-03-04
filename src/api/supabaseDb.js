import { supabase } from './supabase'

/**
 * Generic database service for Supabase
 * This service provides methods for common database operations
 */
export const supabaseDb = {
  /**
   * Fetch all records from a table
   * @param {string} table - The name of the table
   * @param {Object} options - Query options
   * @param {Array} options.columns - Columns to select
   * @param {Object} options.filters - Filters to apply
   * @param {string} options.orderBy - Column to order by
   * @param {boolean} options.ascending - Order direction
   * @param {number} options.limit - Maximum number of records to return
   * @param {number} options.offset - Number of records to skip
   * @returns {Promise<{data: Array, error: Object}>} - The query result
   */
  async getAll(table, options = {}) {
    try {
      const {
        columns = '*',
        filters = {},
        orderBy = 'created_at',
        ascending = false,
        limit = 1000,
        offset = 0
      } = options

      let query = supabase
        .from(table)
        .select(columns)
        .order(orderBy, { ascending })
        .limit(limit)
        .range(offset, offset + limit - 1)

      // Apply filters
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(column, value)
        }
      })

      const { data, error } = await query

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error(`Error fetching from ${table}:`, error)
      return { data: null, error }
    }
  },

  /**
   * Fetch a single record by ID
   * @param {string} table - The name of the table
   * @param {string|number} id - The record ID
   * @param {string|Array} columns - Columns to select
   * @returns {Promise<{data: Object, error: Object}>} - The query result
   */
  async getById(table, id, columns = '*') {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error(`Error fetching ${table} with ID ${id}:`, error)
      return { data: null, error }
    }
  },

  /**
   * Create a new record
   * @param {string} table - The name of the table
   * @param {Object} data - The record data
   * @returns {Promise<{data: Object, error: Object}>} - The query result
   */
  async create(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()

      if (error) throw error

      return { data: result[0], error: null }
    } catch (error) {
      console.error(`Error creating record in ${table}:`, error)
      return { data: null, error }
    }
  },

  /**
   * Update an existing record
   * @param {string} table - The name of the table
   * @param {string|number} id - The record ID
   * @param {Object} data - The updated data
   * @returns {Promise<{data: Object, error: Object}>} - The query result
   */
  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()

      if (error) throw error

      return { data: result[0], error: null }
    } catch (error) {
      console.error(`Error updating record in ${table}:`, error)
      return { data: null, error }
    }
  },

  /**
   * Delete a record
   * @param {string} table - The name of the table
   * @param {string|number} id - The record ID
   * @returns {Promise<{success: boolean, error: Object}>} - The query result
   */
  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true, error: null }
    } catch (error) {
      console.error(`Error deleting record from ${table}:`, error)
      return { success: false, error }
    }
  },

  /**
   * Execute a custom query
   * @param {Function} queryFn - Function that takes supabase client and returns a query
   * @returns {Promise<{data: any, error: Object}>} - The query result
   */
  async customQuery(queryFn) {
    try {
      const { data, error } = await queryFn(supabase)

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error executing custom query:', error)
      return { data: null, error }
    }
  }
}

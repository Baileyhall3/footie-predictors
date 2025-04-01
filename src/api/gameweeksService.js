import { supabase } from './supabase.js';
import { supabaseDb } from './supabaseDb.js';

/**
 * Service for managing gameweeks and matches
 */
export const gameweeksService = {
  /**
   * Get all gameweeks for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGameweeks(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('gameweeks')
          .select('*')
          .eq('group_id', groupId)
          .order('week_number', { ascending: true })
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching gameweeks:', error)
      return { data: null, error }
    }
  },

  /**
   * Get active gameweek for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Object | null, error: Object | null}>}
   */
  async getActiveGameweek(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('gameweeks')
          .select('*')
          .eq('group_id', groupId)
          .eq('is_active', true)
          .limit(1)
      )

      if (error) throw error;

      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Error fetching gameweek:', error)
      return { data: null, error }
    }
  },

  /**
   * Get a gameweek by ID
   * @param {string} id - Gameweek ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getGameweekById(id) {
    return supabaseDb.getById('gameweeks', id)
  },

  /**
   * Create a new gameweek
   * @param {Object} gameweek - Gameweek data
   * @param {string} gameweek.group_id - Group ID
   * @param {number} gameweek.week_number - Week number
   * @param {string} gameweek.deadline - Deadline timestamp
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createGameweek(gameweek) {
    return supabaseDb.create('gameweeks', gameweek)
  },

  /**
   * Update a gameweek
   * @param {string} id - Gameweek ID
   * @param {Object} data - Updated gameweek data
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateGameweek(id, data) {
    return supabaseDb.update('gameweeks', id, data)
  },

  /**
   * Delete a gameweek
   * @param {string} id - Gameweek ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteGameweek(id) {
    return supabaseDb.delete('gameweeks', id)
  },

  /**
   * Get all matches for a gameweek, including team crest URLs
   * @param {string} gameweekId - Gameweek ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getMatches(gameweekId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select(`
            *,
            homeClub:clubs!home_team_api_id(api_club_id, crest_url),
            awayClub:clubs!away_team_api_id(api_club_id, crest_url)
          `)
          .eq('gameweek_id', gameweekId)
          .order('match_time', { ascending: true })
      );

      if (error) throw error;

      // Map the data to include crest URLs
      const formattedData = data.map((match) => ({
        ...match,
        home_team_crest: match.homeClub?.crest_url || null,
        away_team_crest: match.awayClub?.crest_url || null,
      }));

      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Error fetching matches:', error);
      return { data: null, error };
    }
  },

  /**
   * Get a match by ID
   * @param {string} id - Match ID
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async getMatchById(id) {
    return supabaseDb.getById('matches', id)
  },

  /**
   * Create a new match
   * @param {Object} match - Match data
   * @param {string} match.gameweek_id - Gameweek ID
   * @param {number} match.api_match_id - API match ID
   * @param {string} match.home_team - Home team name
   * @param {string} match.away_team - Away team name
   * @param {string} match.match_time - Match time timestamp
   * @param {number} match.home_team_api_id - API home team ID
   * @param {number} match.away_team_api_id - API away team ID
   * @param {string} match.home_team_crest - API home team crest URL
   * @param {string} match.away_team_crest - API match away crest URL
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async createMatch(match) {

    if (match.api_match_id) {
      // Ensure home team exists in the 'clubs' table
      await this.upsertClub(match.home_team_api_id, match.home_team, match.home_team_crest);
  
      // Ensure away team exists in the 'clubs' table
      await this.upsertClub(match.away_team_api_id, match.away_team, match.away_team_crest);
    }

    const matchesTableValues = {
      gameweek_id: match.gameweek_id,
      api_match_id: match.api_match_id,
      home_team: match.home_team,
      away_team: match.away_team,
      match_time: match.match_time,
      home_team_api_id: match.home_team_api_id,
      away_team_api_id: match.away_team_api_id

    }

    return supabaseDb.create('matches', matchesTableValues)
  },

  /**
   * Insert a club if it does not exist
   * @param {number} api_team_id - API team ID
   * @param {string} team_name - Team name
   * @param {string} team_crest - Team crest URL
   */
  async upsertClub(api_team_id, team_name, team_crest) {
    const { data, error } = await supabaseDb
      .from('clubs')
      .select('id')
      .eq('api_club_id', api_team_id)
      .single(); // Fetch existing club

    if (!data) {
      // Club doesn't exist, insert it
      await supabaseDb.from('clubs').insert({
        api_team_id,
        name: team_name,
        crest_url: team_crest,
      });
    }
  },

  /**
   * Check if a club exists, insert if it doesn't
   * @param {number} api_team_id - API team ID
   * @param {string} team_name - Team name
   * @param {string} team_crest - Team crest URL
   */
  async upsertClub(api_team_id, team_name, team_crest) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('clubs')
          .select('id')
          .eq('api_club_id', api_team_id)
          .single()
      );

      if (error && error.code !== 'PGRST116') {
        // Ignore "no rows found" errors, only log unexpected ones
        console.error('Error checking club existence:', error);
        return;
      }

      if (!data) {
        // Insert club if it doesn't exist
        const { error: insertError } = await supabaseDb.customQuery((supabase) =>
          supabase.from('clubs').insert({
            api_club_id: api_team_id,
            name: team_name,
            crest_url: team_crest,
          })
        );

        if (insertError) {
          console.error('Error inserting club:', insertError);
        }
      }
    } catch (err) {
      console.error('Unexpected error in upsertClub:', err);
    }
  },

  /**
   * Update a match
   * @param {string} id - Match ID
   * @param {Object} data - Updated match data
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateMatch(id, data) {
    return supabaseDb.update('matches', id, data)
  },

  /**
   * Delete a match
   * @param {string} id - Match ID
   * @returns {Promise<{success: boolean, error: Object}>}
   */
  async deleteMatch(id) {
    return supabaseDb.delete('matches', id)
  },

  /**
   * Update match scores
   * @param {string} id - Match ID
   * @param {number} homeScore - Home team score
   * @param {number} awayScore - Away team score
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async updateMatchScore(id, homeScore, awayScore) {
    return supabaseDb.update('matches', id, {
      final_home_score: homeScore,
      final_away_score: awayScore
    })
  },

  /**
   * Get all matches for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getGroupMatches(groupId) {
    try {
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select(`
            *,
            gameweeks!inner (
              id,
              week_number,
              deadline,
              group_id
            )
          `)
          .eq('gameweeks.group_id', groupId)
          .order('match_time', { ascending: true })
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching group matches:', error)
      return { data: null, error }
    }
  },

  /**
   * Get upcoming matches for a group with team names and crests
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUpcomingMatches(groupId) {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select(`
            id,
            match_time,
            api_match_id,
            home_team_api_id,
            away_team_api_id,
            home_team,
            away_team,
            gameweeks!inner (
              id,
              week_number,
              deadline,
              group_id
            ),
            home_club:clubs!home_team_api_id(api_club_id, name, crest_url),
            away_club:clubs!away_team_api_id(api_club_id, name, crest_url)
          `)
          .eq('gameweeks.group_id', groupId)
          .gt('match_time', now)
          .order('match_time', { ascending: true })
      );

      if (error) throw error;

      // Transform the data into the required format
      const formattedData = data.map(match => ({
        id: match.id,
        match_time: match.match_time,
        api_match_id: match.api_match_id,
        home_team_id: match.home_team_api_id,
        home_team: match.home_club?.name ?? match.home_team ?? "Unknown",
        home_team_crest: match.home_club?.crest_url || null,
        away_team_id: match.away_team_api_id,
        away_team: match.away_club?.name ?? match.away_team ?? "Unknown",
        away_team_crest: match.away_club?.crest_url || null,
        gameweeks: match.gameweeks
      }));

      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return { data: null, error };
    }
  },

  /**
   * Get finished matches
   * @param {string} gameweekId - Gamewek ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async fetchFinishedMatches(gameweekId = null) {
    if (!gameweekId) {
      console.log('all matchessss')

      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select('*')
          .is('final_home_score', null)
          .is('final_away_score', null)
      );
    
      if (error) {
        console.error("Error fetching matches:", error);
        return [];
      }
    
      return data;
    } else {
      console.log('gameweek matchessss')
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('matches')
          .select('*')
          .is('final_home_score', null)
          .is('final_away_score', null)
          .eq('gameweek_id', gameweekId)
      );
    
      if (error) {
        console.error("Error fetching matches:", error);
        return [];
      }
      
      return data;
    }
  },

  /**
   * Get upcoming matches for a group
   * @param {string} groupId - Group ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async getUserGameweekScores(gameweekId, userId) {
    try {      
      const { data, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('scores')
          .select('*')
          .eq('gameweek_id', gameweekId)
          .eq('user_id', userId)
      )

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user gameweek scores:', error)
      return { data: null, error }
    }
  },

  /**
   * Gets gameweeks whose deadlines are in the past and locks them
   * @param {string} gameweekId - Gameweek ID
   * @returns {Promise<{data: Array, error: Object}>}
   */
  async updateGameweeksLockStatus(gameweekId = null) {
    console.log("Checking gameweeks that need to be locked...");
    try {      
      const { data: gameweeks, error } = await supabaseDb.customQuery((supabase) =>
        supabase
          .from('gameweeks')
          .select('*')
          .lte('deadline', new Date().toISOString())  // Deadline has passed
          .eq('is_locked', false)
      )

      if (error) {
        console.error("❌ Error fetching gameweeks:", error);
        return;
      }
    
      if (!gameweeks.length) {
        console.log("✅ No gameweeks need updating.");
        return;
      }

      const updates = gameweeks.map((gw) =>
        supabase
          .from('gameweeks')
          .update({ is_locked: true })
          .eq('id', gw.id)
          .then(response => {
            if (response.error) throw response.error;
          })
      );
      
      await Promise.all(updates);
      console.log(`✅ Successfully locked ${gameweeks.length} gameweeks.`);
      
    } catch (error) {
      console.error('Error fetching unlocked gameweeks:', error)
      return { data: null, error }
    }
  },
}

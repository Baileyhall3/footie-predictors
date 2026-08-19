import { supabase } from './supabase.js';
import { supabaseDb } from './supabaseDb.js';

export interface Competition {
    id: string,
    name: string,
    emblem: string | null
}

export const competitionsService = {
    async getCompetitions(): Promise<{data: Array<Competition> | null, error: any}> {
        try {
            const { data, error } = await supabaseDb.customQuery((supabase) =>
            supabase
                .from('competitions')
                .select('*')
            )

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error fetching user predictions:', error)
            return { data: null, error }
        }
    },
}
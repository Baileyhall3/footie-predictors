// import { supabase } from './supabaseClient';

// export const getGameweeks = async () => {
//     const { data, error } = await supabase.from('gameweeks').select('*');
//     if (error) throw error;
//     return data;
// };

// export const getPredictionsByGameweek = async (gameweekId: number, userId: string) => {
//     const { data, error } = await supabase
//         .from('predictions')
//         .select('*')
//         .eq('gameweek_id', gameweekId)
//         .eq('user_id', userId);
//     if (error) throw error;
//     return data;
// };

export const getGameweeks = () => {
    return [
        { id: 1, number: 1, status: 'Locked' },
        { id: 2, number: 2, status: 'Locked' },
        { id: 3, number: 3, status: 'Pending' },
    ];
};

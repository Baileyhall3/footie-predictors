export interface Season {
    id: string,
    name: string,
    group_id: string,
    start_date: string | Date | null,
    end_date: string | Date | null,
    winner_id: string | null,
    created_at: string | Date,
    is_finished: boolean | null,
    group_name: string,
    admin_id: string,
    group_icon_url: string | null,
    group_admin_name: string,
    winner_name: string | null,
    is_active: boolean
}

export interface Group {
    id: string,
    name: string,
    admin_id: string,
    created_at: string,
    descripton: string | null,
    exact_score_points: number,
    correct_result_points: number,
    incorrect_points: number | null,
    is_public: boolean,
    max_members: number,
    group_pin: number | null,
    icon_url: string | null,
    active_season_id: string
}

export interface Gameweek {
    id: string,
    group_id: string,
    week_number: number,
    deadline: string | Date,
    created_at: string | Date,
    is_locked: boolean,
    is_active: boolean,
    is_finished: boolean,
    winner_id: string | null,
    season_id: string,
}

export interface Prediction {
    api_match_id: number | null
    away_crest_url: string
    away_team: string
    away_team_api_id: number | null
    created_by_admin: boolean
    final_away_score: number | null
    final_home_score: number | null
    gameweek_id: string
    home_crest_url: string
    home_team: string
    home_team_api_id: number | null
    match_id: string
    match_time: string
    predicted_away_score: number | null
    predicted_home_score: number | null
    prediction_id: string
    total_correct_scores: number | null
    total_points: number | null
    user_id: string
    username: string
}

export interface GroupMember {
    id: string;
    email?: string;
    is_admin: boolean;
    is_fake: boolean;
    joined_at: Date | string;
    membership_id: string;
    username: string;
    bg_colour?: string
}
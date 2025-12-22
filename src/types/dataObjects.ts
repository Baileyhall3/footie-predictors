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
    description: string | null,
    exact_score_points: number,
    correct_result_points: number,
    incorrect_points: number | null,
    is_public: boolean,
    max_members: number,
    group_pin: number | null,
    icon_url: string | null,
    active_season_id: string,
    iAmMember: boolean,
    joinRequestSent: boolean,
    member_count: number,
    iAmAdmin: boolean,
    iAmOwner: boolean,
    owner: string
}

export interface Gameweek {
    id: string,
    group_id: string,
    group_name?: string,
    week_number: number,
    deadline: string | Date,
    created_at: string | Date,
    is_locked: boolean,
    is_active: boolean,
    is_finished: boolean,
    winner_id: string | null,
    winner_name?: string | null,
    season_id: string,
    season_name: string,
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
    bg_colour?: string;
    profile_picture_url?: string;
    has_requested: boolean
}

export interface LeaderboardEntry {
    id: string;
    position: number;
    total_correct_results: number;
    total_correct_scores: number;
    total_points: number;
    user_id: string;
    username: string;
    movement: string;
    bg_colour?: string;
    season_id: string;
    gameweek_wins?: number | null;
    profile_picture_url?: string;
}

export interface UserStats {
    avg_points_per_gameweek: number;
    correct_score_ratio_percent: number;
    gameweek_wins: number;
    group_id: string;
    group_name: string;
    icon_url: string | undefined;
    season_id: string;
    total_correct_results: number;
    total_correct_scores: number;
    total_gameweeks: number;
    total_points: number
    user_id: string;
    username: string;
}

export interface GwLeaderboardEntry {
    bg_colour: string,
    position: number,
    total_correct_scores: number | undefined,
    total_points: number,
    updated_at: Date | undefined,
    user_id: string,
    username: string
    profile_picture_url?: string;
}

export interface Match {
    home_team: string,
    away_team: string,
    match_time: Date | string,
    id: string,
    api_match_id?: string,
    home_team_crest?: string,
    home_team_api_id?: string,
    away_team_crest?: string,
    away_team_api_id?: string,
    group_id: string,
    gameweek_id: string
    final_home_score?: number,
    final_away_score?: number
}

export type NotificationType = 
    'gameweek_created' | 
    'gameweek_deadline' |
    'welcome_message' |
    'user_joined_group' |
    'user_left_group' |
    'admin_announcement' |
    'gameweek_finished' |
    'predictions_reminder'

export type NotificationPriority = 'info' | 'success' | 'warning' | 'urgent'

export interface NotificationTemplateData {
    header: string,
    content: string
    link_text?: string
}

export interface Notification {
    id: number
    user_id: string,
    group_id?: string,
    template_data: NotificationTemplateData,
    type: NotificationType
    priority: NotificationPriority
    expires_at?: Date
    link?: string
    read: boolean
    created_at: Date
    group_name: string,
    username: string,
    group_icon_url: string
}

export interface NotificationPreference {
    id: string,
    created_at: Date,
    user_id: string,
    group_id?: string,
    allow_push: boolean,
    type: NotificationType
}

export interface Achievement {
    id: number;
    achievement_id: number;
    user_id: string;
    is_unlocked: boolean;
    is_hidden: boolean;
    name: string;
    description: string;
    awarded_at: Date;
    icon: string;
}
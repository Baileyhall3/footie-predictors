import { supabase } from "../supabase";
import { userStore } from "../../store/userStore";
import { notificationsStore } from "../../store/notificationsStore";

let channel: ReturnType<typeof supabase.channel> | null = null;

export const realtimeNotificationsService = {
    startNotificationsRealtime() {
        if (channel || !userStore.user) return;
    
        channel = supabase
            .channel('user-notifications')
            .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userStore.user.id}`,
            },
            payload => {
                notificationsStore.add(payload.new);
            }
            )
            .subscribe();
    },
    
    stopNotificationsRealtime() {
        if (!channel) return;
        supabase.removeChannel(channel);
        channel = null;
    }
}
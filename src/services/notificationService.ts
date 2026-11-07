import { AppNotification } from '../types/index.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationRow {
  id: string;
  user_id: string;
  appointment_id: string | null;
  type: AppNotification['type'];
  channel: AppNotification['channel'];
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

function mapRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    appointmentId: row.appointment_id ?? undefined,
    type: row.type,
    channel: row.channel,
    title: row.title,
    body: row.body,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export const notificationService = {
  async list(userId: string, limit = 25): Promise<AppNotification[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('channel', 'in_app')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Could not load notifications:', error.message);
      return [];
    }

    return (data ?? []).map((row: NotificationRow) => mapRow(row));
  },

  async markRead(id: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase.rpc('mark_notification_read', { p_id: id });
    if (error) {
      console.warn('Could not mark notification as read:', error.message);
      return false;
    }
    return true;
  },

  async markAllRead(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.warn('Could not mark notifications as read:', error.message);
      return false;
    }
    return true;
  },

  /**
   * Subscribes to new in-app notifications for a user via Supabase Realtime.
   * Returns an unsubscribe function.
   */
  subscribe(userId: string, onNotification: (notification: AppNotification) => void): () => void {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return () => {};

    const channel: RealtimeChannel = client
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          if (row?.channel === 'in_app') {
            onNotification(mapRow(row));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  },
};

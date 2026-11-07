import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Calendar, X, BellRing } from 'lucide-react';
import { AppNotification, UserProfile } from '../types/index.ts';
import { notificationService } from '../services/notificationService.ts';

interface NotificationBellProps {
  user: UserProfile;
}

function timeAgo(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds)) return '';
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    let active = true;

    notificationService.list(user.id).then((items) => {
      if (active) setNotifications(items);
    });

    const unsubscribe = notificationService.subscribe(user.id, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setToast(notification);

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new window.Notification(notification.title, { body: notification.body });
        } catch {
          // ignore
        }
      }

      window.setTimeout(() => setToast(null), 6000);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) {
      notificationService.list(user.id).then(setNotifications);
    }
  };

  const handleMarkRead = async (notification: AppNotification) => {
    if (notification.isRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
    await notificationService.markRead(notification.id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await notificationService.markAllRead(user.id);
  };

  const enableBrowserAlerts = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setBrowserPermission(permission);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2.5 rounded-xl border-2 border-black bg-white dark:bg-[#182032] text-black dark:text-slate-200 shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell className="w-4 h-4 stroke-[2.5]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#FF6B8B] text-black border border-black text-[10px] font-black flex items-center justify-center shadow-neo-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#182032] rounded-2xl shadow-neo-lg border-2 border-black z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3.5 border-b-2 border-black bg-[#FAF7EE] dark:bg-[#0E131F]">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-black dark:text-[#FFCC24]" />
                <span className="text-sm font-black text-black dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FFCC24] text-black text-[10px] font-black border border-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-black text-black dark:text-[#FFCC24] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-10 text-center px-4 space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No notifications yet</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Appointment confirmations and updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleMarkRead(notification)}
                    className={`w-full text-left p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${notification.isRead ? 'opacity-70' : 'bg-[#F0E8FF]/30 dark:bg-[#5145FF]/10'
                      }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#F0E8FF] dark:bg-[#5145FF]/25 text-[#5145FF] dark:text-[#A594FD] shrink-0 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#171A3B] dark:text-white truncate">
                            {notification.title}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                            {timeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                          {notification.body}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FF745C] shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
              <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-[#FFFDF8] dark:bg-[#0B0C1E]">
                <button
                  type="button"
                  onClick={enableBrowserAlerts}
                  className="w-full py-2 rounded-xl bg-[#5145FF] text-white text-[11px] font-bold hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Enable desktop alerts
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Realtime toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="fixed bottom-5 right-5 z-[60] w-80 max-w-[calc(100vw-2.5rem)] p-4 rounded-2xl bg-[#171A3B] text-white shadow-2xl border border-white/10"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#5145FF] text-white shrink-0">
                <BellRing className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{toast.title}</p>
                <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">{toast.body}</p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-white/50 hover:text-white shrink-0 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

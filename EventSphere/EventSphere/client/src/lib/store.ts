import { create } from 'zustand';
import { User, Event, Notification } from '@shared/schema';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  showToast: boolean;
  currentToast: Notification | null;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: number) => void;
  showNotificationToast: (notification: Notification) => void;
  hideNotificationToast: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  showToast: false,
  currentToast: null,
  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length
  }),
  markAsRead: (id) => set((state) => {
    const updatedNotifications = state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    return { 
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.isRead).length
    };
  }),
  showNotificationToast: (notification) => set({
    showToast: true,
    currentToast: notification
  }),
  hideNotificationToast: () => set({
    showToast: false,
    currentToast: null
  }),
}));

interface EventsState {
  featuredEvents: Event[];
  categories: { name: string; count: number; icon: string }[];
  setFeaturedEvents: (events: Event[]) => void;
  setCategories: (categories: { name: string; count: number; icon: string }[]) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  featuredEvents: [],
  categories: [
    { name: 'Programming', count: 42, icon: 'ri-code-s-slash-line' },
    { name: 'Workshops', count: 28, icon: 'ri-presentation-line' },
    { name: 'Innovation', count: 15, icon: 'ri-lightbulb-line' },
    { name: 'Leadership', count: 23, icon: 'ri-group-line' },
  ],
  setFeaturedEvents: (events) => set({ featuredEvents: events }),
  setCategories: (categories) => set({ categories }),
}));

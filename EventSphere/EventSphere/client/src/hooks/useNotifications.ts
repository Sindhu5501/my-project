import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { useNotificationStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export const useNotifications = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    setNotifications, 
    markAsRead, 
    showNotificationToast, 
    hideNotificationToast,
    showToast,
    currentToast
  } = useNotificationStore();

  // Fetch user's notifications
  const { 
    data, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    staleTime: 1000 * 60, // 1 minute
    enabled: !!user, // Only run if user is logged in
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest("PUT", `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: (_, notificationId) => {
      // Update local state
      markAsRead(notificationId);
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Update notifications in store when data changes
  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data, setNotifications]);

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    await markAsReadMutation.mutateAsync(notificationId);
  };

  // Display a notification as toast
  const displayNotificationToast = (notification: Notification) => {
    showNotificationToast(notification);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markAsRead: handleMarkAsRead,
    showNotificationToast: displayNotificationToast,
    hideNotificationToast,
    showToast,
    currentToast
  };
};

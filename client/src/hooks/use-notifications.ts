import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";

export function useNotifications() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const wsRef = useRef<WebSocket | null>(null);

    // Fetch notifications
    const { data: notifications = [], isLoading } = useQuery<(Notification & { createdByName?: string; isRead?: boolean })[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const response = await fetch("/api/notifications/user");
            if (!response.ok) throw new Error("Failed to fetch notifications");
            return response.json();
        },
        enabled: !!user,
    });

    // Fetch unread count
    const { data: unreadCountData } = useQuery({
        queryKey: ["notifications-unread"],
        queryFn: async () => {
            const response = await fetch("/api/notifications/unread-count");
            if (!response.ok) throw new Error("Failed to fetch unread count");
            return response.json();
        },
        enabled: !!user,
        // Refetch every minute as backup
        refetchInterval: 60000,
    });

    const unreadCount = unreadCountData?.count || 0;

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: "POST",
            });
            if (!response.ok) throw new Error("Failed to mark as read");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
        },
    });

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch("/api/notifications/read-all", {
                method: "POST",
            });
            if (!response.ok) throw new Error("Failed to mark all as read");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
            toast({
                title: "Notificaciones actualizadas",
                description: "Todas las notificaciones han sido marcadas como leídas",
            });
        },
    });

    // WebSocket connection
    useEffect(() => {
        if (!user) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        const connect = () => {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            const playNotificationSound = () => {
                try {
                    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                    audio.volume = 0.5;
                    audio.play();
                } catch (error) {
                    console.error("Error playing notification sound:", error);
                }
            };

            ws.onopen = () => {
                // console.log("[Notifications] WS Connected");
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "notification" && data.target === "user-notifications") {
                        // Check if this notification is for us
                        const targetProfiles = data.profiles || [];
                        const userProfile = user.perfil || "";

                        // Check exact match or if profile is in the list
                        // Also handle "ALL" or similar if we implemented that (we used explicit lists)
                        const isForMe = targetProfiles.some((p: string) =>
                            userProfile.toLowerCase().includes(p.toLowerCase()) || p === "TODOS"
                        );

                        if (isForMe) {
                            // Play sound
                            playNotificationSound();

                            // Invalidate queries to fetch new data
                            queryClient.invalidateQueries({ queryKey: ["notifications"] });
                            queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });

                            // Show toast
                            toast({
                                title: data.notification.title,
                                description: data.notification.content,
                                variant: data.notification.priority === 'error' ? 'destructive' : 'default',
                            });
                        }
                    }
                } catch (e) {
                    console.error("Error parsing WS message for notifications:", e);
                }
            };

            ws.onclose = () => {
                // Simple reconnect logic handled by layout or just let it close
                // For now we won't infinitely reconnect here to avoid fighting with other consumers
                // But in a real app better centralized socket management is preferred
                setTimeout(connect, 5000);
            };

            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [user, queryClient, toast]);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
    };
}

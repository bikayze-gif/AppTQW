import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface PermissionProtectedRouteProps {
    children: React.ReactNode;
    requiredMenuItem: string;
}

export function PermissionProtectedRoute({ children, requiredMenuItem }: PermissionProtectedRouteProps) {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const profile = user?.perfil || "";

    const { data: allowedItems, isLoading } = useQuery<string[]>({
        queryKey: ["/api/sidebar-permissions", profile],
        enabled: !!profile,
    });

    useEffect(() => {
        if (!isLoading && allowedItems) {
            // Check if user has permission to access this menu item
            if (!allowedItems.includes(requiredMenuItem)) {
                // Redirect to landing page which will determine the correct first page
                setLocation("/supervisor");
            }
        }
    }, [allowedItems, isLoading, requiredMenuItem, setLocation]);

    // Show loading or nothing while checking permissions
    if (isLoading) {
        return null;
    }

    // If user doesn't have permission, don't render (will redirect)
    if (!allowedItems?.includes(requiredMenuItem)) {
        return null;
    }

    return <>{children}</>;
}

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
            // Fallback: if no permissions are configured for this profile, allow everything (matches sidebar)
            const hasExplicitConfig = allowedItems.length > 0;
            if (hasExplicitConfig && !allowedItems.includes(requiredMenuItem)) {
                // Redirect to landing page which will determine the correct first page
                setLocation("/supervisor");
            }
        }
    }, [allowedItems, isLoading, requiredMenuItem, setLocation]);

    // Show loading or nothing while checking permissions
    if (isLoading) {
        return null;
    }

    // If user has explicit permissions and this item is NOT included, don't render (will redirect)
    const hasExplicitConfig = allowedItems && allowedItems.length > 0;
    if (hasExplicitConfig && !allowedItems?.includes(requiredMenuItem)) {
        return null;
    }

    return <>{children}</>;
}

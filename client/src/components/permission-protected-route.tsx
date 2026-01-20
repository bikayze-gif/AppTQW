import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PermissionProtectedRouteProps {
    children: React.ReactNode;
    requiredMenuItem: string;
}

export function PermissionProtectedRoute({ children, requiredMenuItem }: PermissionProtectedRouteProps) {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const profile = user?.perfil || "";

    const { data: allowedItems, isLoading, error } = useQuery<string[]>({
        queryKey: ["/api/sidebar-permissions", profile],
        enabled: !!profile,
    });

    useEffect(() => {
        if (!isLoading && allowedItems) {
            // Check if user has permission to access this menu item
            // Fallback: if no permissions are configured for this profile, allow everything (matches sidebar)
            const hasExplicitConfig = allowedItems.length > 0;
            if (hasExplicitConfig && !allowedItems.includes(requiredMenuItem)) {
                console.log(`[PermissionProtectedRoute] User ${profile} does not have permission for ${requiredMenuItem}. Allowed: ${allowedItems.join(", ")}`);
                // Redirect to landing page which will determine the correct first page
                setLocation("/supervisor");
            }
        }
    }, [allowedItems, isLoading, requiredMenuItem, setLocation, profile]);

    // Show loading while checking permissions
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="space-y-4 w-full max-w-md p-6">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        );
    }

    // Show error if permissions failed to load
    if (error) {
        console.error(`[PermissionProtectedRoute] Error loading permissions for ${profile}:`, error);
        return (
            <div className="flex items-center justify-center h-screen p-6">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de Permisos</AlertTitle>
                    <AlertDescription>
                        No se pudieron cargar los permisos para tu perfil ({profile}).
                        Por favor, contacta al administrador del sistema.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // If user has explicit permissions and this item is NOT included, don't render (will redirect)
    const hasExplicitConfig = allowedItems && allowedItems.length > 0;
    if (hasExplicitConfig && !allowedItems?.includes(requiredMenuItem)) {
        return null;
    }

    // Log successful permission check
    console.log(`[PermissionProtectedRoute] User ${profile} has permission for ${requiredMenuItem}`);

    return <>{children}</>;
}

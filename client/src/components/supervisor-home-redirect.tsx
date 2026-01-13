import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Map menu labels to their routes
const MENU_ROUTES: Record<string, string> = {
    "Calendar": "/supervisor/calendar",
    "Messenger": "/supervisor/messenger",
    "Notes": "/supervisor",
    "Scrumboard": "/supervisor/scrumboard",
    "Facturación": "/supervisor/billing",
    "Logística": "/supervisor/logistica",
    "KPI": "/supervisor/kpi",
    "Calidad": "/supervisor/calidad",
    "Notifications": "/supervisor/notifications",
    "Configuración": "/supervisor/settings/parametros",
};

// Order of menu items (same as in supervisor-layout)
const MENU_ORDER = [
    "Calendar",
    "Messenger",
    "Notes",
    "Scrumboard",
    "Facturación",
    "Logística",
    "KPI",
    "Calidad",
    "Notifications",
    "Configuración",
];

export function SupervisorHomeRedirect() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const profile = user?.perfil || "";

    const { data: allowedItems, isLoading } = useQuery<string[]>({
        queryKey: ["/api/sidebar-permissions", profile],
        enabled: !!profile,
    });

    useEffect(() => {
        if (!isLoading && allowedItems && allowedItems.length > 0) {
            // Find the first allowed menu item in order
            const firstAllowed = MENU_ORDER.find(item => allowedItems.includes(item));
            if (firstAllowed && MENU_ROUTES[firstAllowed]) {
                // Only redirect if we're on the base /supervisor page and the first item is not Notes
                if (firstAllowed !== "Notes") {
                    setLocation(MENU_ROUTES[firstAllowed]);
                }
            }
        }
    }, [allowedItems, isLoading, setLocation]);

    // Show loading while checking permissions
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f172a]">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    // If Notes is allowed or no config, show Notes content (will be rendered by parent)
    // Otherwise this component already redirected
    return null;
}

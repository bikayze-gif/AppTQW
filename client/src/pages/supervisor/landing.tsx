import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { SupervisorLayout } from "@/components/supervisor/supervisor-layout";
import { Loader2 } from "lucide-react";

// Map menu labels to their routes
const MENU_ROUTES: Record<string, string> = {
    "Calendar": "/supervisor/calendar",
    "Messenger": "/supervisor/messenger",
    "Notes": "/supervisor/notes",
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

export default function SupervisorLanding() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const profile = user?.perfil || "";

    const { data: allowedItems, isLoading } = useQuery<string[]>({
        queryKey: ["/api/sidebar-permissions", profile],
        enabled: !!profile,
    });

    useEffect(() => {
        if (!isLoading && allowedItems) {
            // If no permissions configured, default to Notes
            if (allowedItems.length === 0) {
                setLocation("/supervisor/notes");
                return;
            }

            // Find the first allowed menu item in order
            const firstAllowed = MENU_ORDER.find(item => allowedItems.includes(item));
            if (firstAllowed && MENU_ROUTES[firstAllowed]) {
                setLocation(MENU_ROUTES[firstAllowed]);
            } else {
                // Fallback to Notes if nothing else is available
                setLocation("/supervisor/notes");
            }
        }
    }, [allowedItems, isLoading, setLocation]);

    // Show loading while checking permissions
    return (
        <SupervisorLayout>
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-3 text-slate-500">Cargando...</span>
            </div>
        </SupervisorLayout>
    );
}

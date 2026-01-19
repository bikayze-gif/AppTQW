
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SettingsLayout from "./layout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

// Helper to match menu items from supervisor-layout
// We should probably extract this to a shared file, but for now I'll duplicate the list
// to ensure I have the exact labels.
const MENU_ITEMS = [
    "Calendar",
    "Messenger",
    "Notes",
    "Scrumboard",
    "Facturación",
    "Logística",
    "Formulario SME",
    "Modulo Logistico",
    "KPI",
    "Calidad",
    "Notifications",
    "Configuración" // Always visible usually, but let's include it
];

export const PROFILES = [
    "SME",
    "Supervisor Tecnico",
    "Generico Bodega",
    "LOGISTICA",
    "administrador",
    "GERENCIA"
];

export default function SidebarPermissions() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [localPermissions, setLocalPermissions] = useState<Record<string, string[]>>({});

    // Fetch existing permissions
    const { data: permissionsData, isLoading } = useQuery<any[]>({
        queryKey: ["/api/sidebar-permissions"],
    });

    useEffect(() => {
        if (permissionsData) {
            const mapping: Record<string, string[]> = {};
            permissionsData.forEach((p: any) => {
                mapping[p.profile] = p.allowedMenuItems;
            });
            // Only initialize profiles that exist in the database
            // Don't auto-enable all items for missing profiles
            PROFILES.forEach(profile => {
                if (!mapping[profile]) {
                    mapping[profile] = []; // Empty by default
                }
            });
            setLocalPermissions(mapping);
        } else {
            // Initial state if no data yet - empty permissions
            const initial: Record<string, string[]> = {};
            PROFILES.forEach(profile => {
                initial[profile] = [];
            });
            setLocalPermissions(initial);
        }
    }, [permissionsData]);

    const updateMutation = useMutation({
        mutationFn: async ({ profile, allowedItems }: { profile: string, allowedItems: string[] }) => {
            return apiRequest("POST", "/api/sidebar-permissions", { profile, allowedItems });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sidebar-permissions"] });
            toast({
                title: "Permisos actualizados",
                description: "Los cambios se han guardado correctamente.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios.",
                variant: "destructive",
            });
        }
    });

    const handleToggle = (profile: string, itemLabel: string) => {
        setLocalPermissions(prev => {
            const currentItems = prev[profile] || [];
            const exists = currentItems.includes(itemLabel);
            let newItems;
            if (exists) {
                newItems = currentItems.filter(i => i !== itemLabel);
            } else {
                newItems = [...currentItems, itemLabel];
            }
            return { ...prev, [profile]: newItems };
        });
    };

    const handleSave = async () => {
        try {
            // Save each profile
            const promises = PROFILES.map(profile =>
                updateMutation.mutateAsync({
                    profile,
                    allowedItems: localPermissions[profile] || []
                })
            );
            await Promise.all(promises);
            // Force refetch to sync state
            await queryClient.refetchQueries({ queryKey: ["/api/sidebar-permissions"] });
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleAll = (profile: string) => {
        setLocalPermissions(prev => {
            const currentItems = prev[profile] || [];
            // If all items are selected, deselect all. Otherwise, select all
            const allSelected = MENU_ITEMS.every(item => currentItems.includes(item));
            return { ...prev, [profile]: allSelected ? [] : [...MENU_ITEMS] };
        });
    };


    if (isLoading) {
        return (
            <SettingsLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Permisos de Menú (v1.1)
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Configure qué elementos del menú lateral son visibles para cada perfil.
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Item del Menú</TableHead>
                                    {PROFILES.map(profile => (
                                        <TableHead key={profile} className="text-center">{profile}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Select All Row */}
                                <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-300 dark:border-slate-600">
                                    <TableCell className="font-bold text-slate-700 dark:text-slate-300">
                                        Seleccionar Todo
                                    </TableCell>
                                    {PROFILES.map(profile => {
                                        const currentItems = localPermissions[profile] || [];
                                        const allSelected = MENU_ITEMS.every(item => currentItems.includes(item));
                                        return (
                                            <TableCell key={`selectall-${profile}`} className="text-center">
                                                <Checkbox
                                                    checked={allSelected}
                                                    onCheckedChange={() => handleToggleAll(profile)}
                                                />
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                                {MENU_ITEMS.map((itemLabel) => (
                                    <TableRow key={itemLabel}>
                                        <TableCell className="font-medium">{itemLabel}</TableCell>
                                        {PROFILES.map(profile => {
                                            const isChecked = localPermissions[profile]?.includes(itemLabel);
                                            return (
                                                <TableCell key={`${profile}-${itemLabel}`} className="text-center">
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={() => handleToggle(profile, itemLabel)}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}

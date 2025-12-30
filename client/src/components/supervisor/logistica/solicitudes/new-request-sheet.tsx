import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2, ShoppingCart, Barcode, Package, Check, ChevronsUpDown, Search } from "lucide-react";
import { useMaterialRequest } from "./context";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function NewRequestSheet() {
    const { state, dispatch } = useMaterialRequest();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedTechnician, setSelectedTechnician] = useState("");
    const [openPopover, setOpenPopover] = useState(false);

    // Fetch technicians from DB
    const { data: technicians = [] } = useQuery<Array<{ id: number, name: string, rut: string }>>({
        queryKey: ["/api/materials/technicians"],
    });

    const handleSubmit = async () => {
        if (state.items.length === 0) {
            toast({ title: "Carrito vacío", description: "Agrega items antes de finalizar.", variant: "destructive" });
            return;
        }

        if (!selectedTechnician) {
            toast({ title: "Técnico no seleccionado", description: "Por favor selecciona un técnico destino.", variant: "destructive" });
            return;
        }

        try {
            dispatch({ type: 'SET_SUBMITTING', payload: true });

            const payload = {
                id_destino: parseInt(selectedTechnician),
                id_supervisor: 0,
                items: state.items.map(item => ({
                    material: item.material.name,
                    itemCode: item.material.id,
                    cantidad: item.quantity
                }))
            };

            const response = await fetch("/api/materials/solicitud", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Error al enviar solicitud");

            const data = await response.json();

            toast({ title: "Éxito", description: `Asignación creada con ticket: ${data.ticket}` });
            dispatch({ type: 'CLEAR_CART' });
            dispatch({ type: 'SET_SHEET_OPEN', payload: false });
            queryClient.invalidateQueries({ queryKey: ["/api/materials/solicitudes"] });

        } catch (error) {
            toast({ title: "Error", description: "No se pudo procesar la asignación.", variant: "destructive" });
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false });
        }
    };

    return (
        <Sheet open={state.isSheetOpen} onOpenChange={(open) => dispatch({ type: 'SET_SHEET_OPEN', payload: open })}>
            <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0 bg-slate-50 dark:bg-slate-900">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <SheetHeader>
                        <SheetTitle>Asignación de materiales</SheetTitle>
                        <SheetDescription>
                            Realiza traspasos de materiales directamente a técnicos vigentes.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Técnico Destino</Label>
                            <Popover open={openPopover} onOpenChange={setOpenPopover}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openPopover}
                                        className="w-full justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 px-3 font-normal"
                                    >
                                        <span className="truncate">
                                            {selectedTechnician
                                                ? technicians.find((tech) => tech.id.toString() === selectedTechnician)?.name
                                                : "Seleccionar técnico..."}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Buscar técnico por nombre o RUT..." className="h-9" />
                                        <CommandList className="max-h-64 overflow-y-auto">
                                            <CommandEmpty>No se encontraron técnicos.</CommandEmpty>
                                            <CommandGroup>
                                                {technicians.map((tech) => (
                                                    <CommandItem
                                                        key={tech.id}
                                                        value={tech.name + " " + tech.rut}
                                                        onSelect={() => {
                                                            setSelectedTechnician(tech.id.toString());
                                                            setOpenPopover(false);
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedTechnician === tech.id.toString() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900 dark:text-slate-100">{tech.name}</span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">{tech.rut}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Separator className="my-6" />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-500 font-semibold tracking-wider">Escanear Serie</span>
                            </div>
                        </div>

                        <ScannerInput />

                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                                    Items a Asignar
                                    <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-bold">
                                        {state.items.length}
                                    </span>
                                </Label>
                                {state.items.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'CLEAR_CART' })} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 h-8 text-xs font-medium transition-colors">
                                        Vaciar lista
                                    </Button>
                                )}
                            </div>
                            <div className="max-h-[400px] pr-2 -mr-2 overflow-y-auto custom-scrollbar">
                                <CartList />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
                    <Button
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={state.isSubmitting || state.items.length === 0 || !selectedTechnician}
                    >
                        {state.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Confirmar Asignación
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}


function ScannerInput() {
    const { dispatch } = useMaterialRequest();
    const [code, setCode] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const handleScan = (scannedCode: string) => {
        if (!scannedCode.trim()) return;

        dispatch({
            type: 'ADD_ITEM',
            payload: {
                material: {
                    id: scannedCode,
                    name: `Material Serie: ${scannedCode}`,
                    family: "SERIADO",
                    subFamily: "EQUIPOS"
                },
                quantity: 1,
                isSerialized: true,
                scannedSeries: [scannedCode]
            }
        });

        toast({
            title: "✓ Escaneado",
            description: `Serie ${scannedCode} agregada.`,
            className: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
        });

        setCode(""); // Limpiar para el siguiente
    };

    // Efecto para "auto-detectar" el fin del escaneo por tiempo de inactividad
    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (code.length > 2) { // Evitar disparar con 1-2 caracteres accidentales
            timeoutRef.current = setTimeout(() => {
                handleScan(code);
            }, 150); // 150ms es el estándar para pistolas de código de barra
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [code]);

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Barcode className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input
                ref={inputRef}
                placeholder="Escanear código de barra..."
                className="pl-11 h-12 font-mono text-base border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus-visible:ring-blue-500/20 transition-all"
                value={code}
                onChange={e => setCode(e.target.value)}
                autoFocus
            />
            {code && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                    <span className="text-[10px] font-bold text-blue-500 animate-pulse bg-blue-50 px-2 py-0.5 rounded">Escaneando...</span>
                </div>
            )}
        </div>
    );
}

function CartList() {
    const { state, dispatch } = useMaterialRequest();

    return (
        <div className="space-y-3">
            <AnimatePresence initial={false}>
                {state.items.map((item, index) => (
                    <motion.div
                        key={`${item.material.id}-${index}`}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30 transition-all"
                    >
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                            <Package className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                                {item.material.name}
                                {item.isSerialized && (
                                    <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                        Seriado
                                    </span>
                                )}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                                ID: {item.material.id}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                <span className="text-xs font-black text-slate-900 dark:text-white">x{item.quantity}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { materialId: item.material.id } })}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {state.items.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                >
                    <ShoppingCart className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">El carrito está vacío</p>
                    <p className="text-xs opacity-60">Escanea una serie para comenzar</p>
                </motion.div>
            )}
        </div>
    );
}

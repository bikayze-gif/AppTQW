import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, CheckCircle2, AlertCircle, Info, TrendingUp } from "lucide-react";

interface InventoryData {
    org: string;
    tipo: string;
    oracle: number;
    sap: number;
    cobertura: number;
    highlight?: boolean;
    status?: 'success' | 'warning' | 'error';
}

const data: InventoryData[] = [
    { org: 'G40', tipo: 'ASIGNADO A TECNICO', oracle: 3012, sap: 1109, cobertura: 36.82, highlight: true },
    { org: 'G40', tipo: 'DISPONIBLE', oracle: 1892, sap: 200, cobertura: 10.57 },
    { org: 'G40', tipo: 'ANALISIS', oracle: 119, sap: 0, cobertura: 0.00, status: 'error' },
    { org: 'D31', tipo: 'DISPONIBLE', oracle: 1319, sap: 387, cobertura: 29.34, highlight: true },
    { org: 'D31', tipo: 'ASIGNADO A TECNICO', oracle: 845, sap: 179, cobertura: 21.18 },
    { org: 'D31', tipo: 'ANALISIS', oracle: 297, sap: 2, cobertura: 0.67, status: 'error' },
    { org: 'A90', tipo: 'DISPONIBLE', oracle: 1155, sap: 313, cobertura: 27.10, highlight: true },
    { org: 'A90', tipo: 'ASIGNADO A TECNICO', oracle: 243, sap: 70, cobertura: 28.81 },
    { org: 'A90', tipo: 'ANALISIS', oracle: 74, sap: 0, cobertura: 0.00, status: 'error' },
    { org: 'J67', tipo: 'DISPONIBLE', oracle: 949, sap: 261, cobertura: 27.50, highlight: true },
    { org: 'J67', tipo: 'ASIGNADO A TECNICO', oracle: 723, sap: 418, cobertura: 57.81, status: 'success' },
    { org: 'J67', tipo: 'ANALISIS', oracle: 5, sap: 0, cobertura: 0.00, status: 'error' },
    { org: 'J63', tipo: 'DISPONIBLE', oracle: 919, sap: 64, cobertura: 6.96, status: 'warning' },
    { org: 'J63', tipo: 'ASIGNADO A TECNICO', oracle: 145, sap: 97, cobertura: 66.90, status: 'success' },
    { org: 'J63', tipo: 'ANALISIS', oracle: 16, sap: 0, cobertura: 0.00, status: 'error' },
];

export function InventorySummaryTable() {
    return (
        <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-500" />
                            Resumen de Inventario Oracle vs SAP
                        </CardTitle>
                        <CardDescription>
                            Análisis de cobertura y conciliación de stock por organización
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20">
                            Actualizado hace poco
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                <TableHead className="font-bold text-slate-900 dark:text-slate-100 py-4 px-6">Org</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-slate-100 py-4 px-6">Tipo Subinventory</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-slate-100 py-4 px-6 text-right">Total Oracle</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-slate-100 py-4 px-6 text-right">Con SAP</TableHead>
                                <TableHead className="font-bold text-slate-900 dark:text-slate-100 py-4 px-6 text-center">% Cobertura</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow
                                    key={`${item.org}-${item.tipo}-${index}`}
                                    className={item.highlight ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}
                                >
                                    <TableCell className="font-bold py-4 px-6">
                                        {item.highlight ? (
                                            <span className="text-blue-600 dark:text-blue-400">{item.org}</span>
                                        ) : (
                                            item.org
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">
                                        {item.tipo}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-right font-mono text-slate-700 dark:text-slate-300">
                                        {item.oracle.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-right font-mono text-slate-700 dark:text-slate-300">
                                        {item.sap.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`font-bold ${item.status === 'success' ? 'text-green-600 dark:text-green-400' :
                                                    item.status === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                                        item.status === 'error' ? 'text-red-600 dark:text-red-400' :
                                                            'text-slate-900 dark:text-slate-100'
                                                }`}>
                                                {item.cobertura.toFixed(2)}%
                                            </span>
                                            {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                            {item.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                                            {item.status === 'error' && <Info className="w-4 h-4 text-red-500 opacity-50" />}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

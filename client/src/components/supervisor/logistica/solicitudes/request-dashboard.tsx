import { MaterialRequestProvider } from "./context";
import { RequestTable } from "./request-table";
import { NewRequestSheet } from "./new-request-sheet";

export function RequestDashboard() {
    return (
        <MaterialRequestProvider>
            <div className="space-y-6">
                <RequestTable />
                <NewRequestSheet />
            </div>
        </MaterialRequestProvider>
    );
}

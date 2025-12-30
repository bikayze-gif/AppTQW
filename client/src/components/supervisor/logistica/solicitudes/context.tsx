import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// --- Types ---

export interface Material {
    id: string; // codigo item oracle
    name: string;
    family: string;
    subFamily: string;
}

export interface CartItem {
    material: Material;
    quantity: number;
    isSerialized: boolean;
    scannedSeries?: string[];
}

export interface MaterialRequest {
    id: number;
    ticketToken: string;
    date: string;
    materialName: string;
    quantity: number;
    originTechnician: string;
    supervisorName?: string;
    flagRegiones?: string;
    destinationTechnician: string; // "Bodega" or Technician Name
    status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
}

interface CartState {
    items: CartItem[];
    destinationId: number; // 0 for Bodega
    isSubmitting: boolean;
    isSheetOpen: boolean;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: { materialId: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { materialId: string; quantity: number } }
    | { type: 'SET_DESTINATION'; payload: number }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_SHEET_OPEN'; payload: boolean }
    | { type: 'SET_SUBMITTING'; payload: boolean };

// --- Context ---

const initialState: CartState = {
    items: [],
    destinationId: 0,
    isSubmitting: false,
    isSheetOpen: false,
};

const MaterialRequestContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

// --- Reducer ---

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(
                (item) => item.material.id === action.payload.material.id
            );

            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += action.payload.quantity;
                // Merge series if necessary
                if (action.payload.scannedSeries) {
                    newItems[existingItemIndex].scannedSeries = [
                        ...(newItems[existingItemIndex].scannedSeries || []),
                        ...action.payload.scannedSeries
                    ];
                }
                return { ...state, items: newItems };
            }
            return { ...state, items: [...state.items, action.payload] };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter((item) => item.material.id !== action.payload.materialId),
            };
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map((item) =>
                    item.material.id === action.payload.materialId
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        case 'SET_DESTINATION':
            return { ...state, destinationId: action.payload };
        case 'CLEAR_CART':
            return { ...state, items: [], destinationId: 0 };
        case 'SET_SHEET_OPEN':
            return { ...state, isSheetOpen: action.payload };
        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload };
        default:
            return state;
    }
}

// --- Provider ---

export function MaterialRequestProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    return (
        <MaterialRequestContext.Provider value={{ state, dispatch }}>
            {children}
        </MaterialRequestContext.Provider>
    );
}

// --- Hook ---

export function useMaterialRequest() {
    const context = useContext(MaterialRequestContext);
    if (context === undefined) {
        throw new Error('useMaterialRequest must be used within a MaterialRequestProvider');
    }
    return context;
}

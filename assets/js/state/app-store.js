/* =========================================================
   CarCare — Application Store
   ========================================================= */

import { readStorage, writeStorage } from "../utils/storage.js";

function createId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

export const STORAGE_KEYS = {
    vehicles: "vehicles",
    parts: "parts",
    partCategories: "partCategories",
    partBrands: "partBrands",
    services: "services",
    costs: "costs",
    settings: "settings"
};

export const DEFAULT_STATE = {
    vehicles: [
        {
            id: "vehicle-001",
            make: "Volkswagen",
            model: "Polo 6R",
            engine: "1.6 TDI",
            year: 2012,
            plate: "AB-123-CD",
            odometer: 245820,
            image: "assets/images/vehicle-polo.png"
        }
    ],

    parts: [
        {
            id: "part-001",
            name: "Engine Oil",
            category: "Engine",
            brand: "MANN",
            note: "High performance synthetic.",
            image: "",
            icon: "fa-solid fa-oil-can",
            color: "#DCEBFA",
            lifespan: "10000",
            lifespanUnit: "km",
            alertBefore: "1000",
            alertUnit: "km",
            status: "good"
        },
        {
            id: "part-002",
            name: "Brake Pads",
            category: "Chassis",
            brand: "TRW",
            note: "Front axle.",
            image: "",
            icon: "fa-solid fa-circle-stop",
            color: "#F4DDE3",
            lifespan: "40000",
            lifespanUnit: "km",
            alertBefore: "5000",
            alertUnit: "km",
            status: "attention"
        },
        {
            id: "part-003",
            name: "Air Filter",
            category: "Engine",
            brand: "Bosch",
            note: "Cabin / engine air filter.",
            image: "",
            icon: "fa-solid fa-filter",
            color: "#DDEFE4",
            lifespan: "15000",
            lifespanUnit: "km",
            alertBefore: "2000",
            alertUnit: "km",
            status: "good"
        }
    ],

    partCategories: ["Engine", "Chassis", "Electrical", "Body", "Other"],

    partBrands: [
        "Bosch", "MANN", "NGK", "Brembo", "TRW", "Valeo", "Febi",
        "SKF", "Continental", "Mahle", "OEM", "Other"
    ],

    services: [
        {
            id: "service-001",
            vehicleId: "vehicle-001",
            name: "Oil Change",
            date: "2026-09-15",
            odometer: 245200,
            cost: 8500,
            type: "maintenance"
        }
    ],

    costs: [
        {
            id: "cost-001",
            vehicleId: "vehicle-001",
            date: "2026-09-15",
            amount: 8500,
            category: "Maintenance",
            note: "Oil Change"
        },
        {
            id: "cost-002",
            vehicleId: "vehicle-001",
            date: "2026-09-10",
            amount: 4000,
            category: "Parts",
            note: "Air Filter"
        }
    ],

    settings: {
        currency: "DA",
        distanceUnit: "km"
    }
};

function loadState() {
    const storedParts = readStorage(STORAGE_KEYS.parts, DEFAULT_STATE.parts);
    const storedCategories = readStorage(STORAGE_KEYS.partCategories, DEFAULT_STATE.partCategories);
    const storedBrands = readStorage(STORAGE_KEYS.partBrands, DEFAULT_STATE.partBrands);

    var fixedCategories = ["Engine", "Chassis", "Electrical", "Body", "Other"];

    return {
        vehicles: readStorage(STORAGE_KEYS.vehicles, DEFAULT_STATE.vehicles),
        parts: Array.isArray(storedParts)
            ? storedParts.map((part) => ({
                id: part.id || createId(),
                name: part.name || "Unnamed Part",
                category: fixedCategories.indexOf(part.category) !== -1 ? part.category : "Other",
                brand: part.brand || "",
                note: part.note || part.notes || "",
                icon: part.icon || "",
                color: part.color || "#DCEBFA",
                lifespan: part.lifespan == null ? "" : String(part.lifespan),
                lifespanUnit: part.lifespanUnit || "km",
                alertBefore: part.alertBefore == null ? "" : String(part.alertBefore),
                alertUnit: part.alertUnit || part.lifespanUnit || "km",
                status: part.status || "good"
            }))
            : DEFAULT_STATE.parts,
        partCategories: fixedCategories,
        partBrands: Array.isArray(storedBrands) && storedBrands.length ? storedBrands : DEFAULT_STATE.partBrands,
        services: readStorage(STORAGE_KEYS.services, DEFAULT_STATE.services),
        costs: readStorage(STORAGE_KEYS.costs, DEFAULT_STATE.costs),
        settings: readStorage(STORAGE_KEYS.settings, DEFAULT_STATE.settings)
    };
}

let state = loadState();
const listeners = new Set();

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function persist() {
    writeStorage(STORAGE_KEYS.vehicles, state.vehicles);
    writeStorage(STORAGE_KEYS.parts, state.parts);
    writeStorage(STORAGE_KEYS.partCategories, state.partCategories);
    writeStorage(STORAGE_KEYS.partBrands, state.partBrands);
    writeStorage(STORAGE_KEYS.services, state.services);
    writeStorage(STORAGE_KEYS.costs, state.costs);
    writeStorage(STORAGE_KEYS.settings, state.settings);
}

function notify() {
    const snapshot = clone(state);
    listeners.forEach((listener) => listener(snapshot));
}

export function getState() {
    return clone(state);
}

export function setState(updater) {
    const nextState = typeof updater === "function"
        ? updater(clone(state))
        : updater;

    state = {
        ...state,
        ...nextState
    };

    persist();
    notify();

    return getState();
}

export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getVehicle(vehicleId) {
    return state.vehicles.find((vehicle) => vehicle.id === vehicleId) || null;
}

export function getActiveVehicle() {
    return state.vehicles[0] || null;
}

export function addVehicle(vehicle) {
    const item = {
        id: createId(),
        ...vehicle
    };

    setState((current) => ({
        vehicles: [...current.vehicles, item]
    }));

    return item;
}

export function updateVehicle(vehicleId, changes) {
    setState((current) => ({
        vehicles: current.vehicles.map((vehicle) =>
            vehicle.id === vehicleId
                ? { ...vehicle, ...changes }
                : vehicle
        )
    }));
}

export function addPart(part) {
    const item = {
        id: createId(),
        ...part
    };

    setState((current) => ({
        parts: [...current.parts, item]
    }));

    return item;
}

export function addService(service) {
    const item = {
        id: createId(),
        ...service
    };

    setState((current) => ({
        services: [...current.services, item]
    }));

    return item;
}

export function addCost(cost) {
    const item = {
        id: createId(),
        ...cost
    };

    setState((current) => ({
        costs: [...current.costs, item]
    }));

    return item;
}

export function updateSettings(changes) {
    setState((current) => ({
        settings: {
            ...current.settings,
            ...changes
        }
    }));
}

export function resetDemoData() {
    state = clone(DEFAULT_STATE);
    persist();
    notify();
    return getState();
}

export const appStore = {
    getState,
    setState,
    subscribe,
    getVehicle,
    getActiveVehicle,
    addVehicle,
    updateVehicle,
    addPart,
    addService,
    addCost,
    updateSettings,
    resetDemoData
};

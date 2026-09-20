/* =========================================================
   CarCare — LocalStorage Utility
   ========================================================= */

const STORAGE_PREFIX = "carcare:";

function makeKey(key) {
    return `${STORAGE_PREFIX}${key}`;
}

export function readStorage(key, fallback = null) {
    try {
        const raw = localStorage.getItem(makeKey(key));
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        console.warn(`[CarCare] Could not read "${key}" from storage.`, error);
        return fallback;
    }
}

export function writeStorage(key, value) {
    try {
        localStorage.setItem(makeKey(key), JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`[CarCare] Could not write "${key}" to storage.`, error);
        return false;
    }
}

export function removeStorage(key) {
    try {
        localStorage.removeItem(makeKey(key));
        return true;
    } catch (error) {
        console.warn(`[CarCare] Could not remove "${key}" from storage.`, error);
        return false;
    }
}

export function clearCarCareStorage() {
    try {
        Object.keys(localStorage)
            .filter((key) => key.startsWith(STORAGE_PREFIX))
            .forEach((key) => localStorage.removeItem(key));

        return true;
    } catch (error) {
        console.warn("[CarCare] Could not clear application storage.", error);
        return false;
    }
}

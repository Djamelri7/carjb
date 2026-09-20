/* =========================================================
   CarCare — Minimal Reactive Store
   ========================================================= */

export function createStore(initialState) {
    let state = JSON.parse(JSON.stringify(initialState));
    const listeners = new Set();

    function getState() {
        return typeof structuredClone === "function"
            ? structuredClone(state)
            : JSON.parse(JSON.stringify(state));
    }

    function setState(updater) {
        const nextState = typeof updater === "function"
            ? updater(getState())
            : updater;

        state = {
            ...state,
            ...nextState
        };

        listeners.forEach((listener) => listener(getState()));
        return getState();
    }

    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    return {
        getState,
        setState,
        subscribe
    };
}

/* =========================================================
   CarCare — Application Entry Point
   PHASE 06 — Theme Controller
   ========================================================= */

import { initRouter } from "./router.js";

const DEFAULT_THEME = "light";
const THEME_STORAGE_KEY = "carcare-theme";

function getStoredTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "dark" || stored === "light") {
        return stored;
    }

    return DEFAULT_THEME;
}

function updateThemeColor(theme) {
    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
        themeColor.content = theme === "dark" ? "#07131c" : "#f4f9fd";
    }
}

function applyTheme(theme) {
    const safeTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = safeTheme;
    document.documentElement.style.colorScheme = safeTheme;

    updateThemeColor(safeTheme);
}

function initTheme() {
    applyTheme(getStoredTheme());

    window.CarCareTheme = {
        get() {
            return document.documentElement.dataset.theme || DEFAULT_THEME;
        },

        set(theme) {
            const nextTheme = theme === "dark" ? "dark" : "light";

            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            applyTheme(nextTheme);
        },

        toggle() {
            this.set(this.get() === "dark" ? "light" : "dark");
        }
    };
}

function initApp() {
    initTheme();
    initRouter();
}

document.addEventListener("DOMContentLoaded", initApp);

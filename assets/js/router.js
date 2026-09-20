/* =========================================================
   CarCare — Router
   PHASE 08 — Route Configuration + Page Lifecycle
   ========================================================= */

import { createHeader } from "./components/header.js";
import { createBottomNavigation } from "./components/bottom-navigation.js";

const routes = {
    "/": {
        name: "dashboard",
        title: "Dashboard",
        load: () => import("./pages/dashboard.js")
    },
    "/dashboard": {
        name: "dashboard",
        title: "Dashboard",
        load: () => import("./pages/dashboard.js")
    },
    "/parts": {
        name: "parts",
        title: "Parts",
        load: () => import("./pages/parts.js")
    },
    "/service": {
        name: "services",
        title: "Services",
        load: () => import("./pages/services.js")
    },
    "/services": {
        name: "services",
        title: "Services",
        load: () => import("./pages/services.js")
    },
    "/car": {
        name: "vehicles",
        title: "Vehicle",
        load: () => import("./pages/vehicles.js")
    },
    "/vehicles": {
        name: "vehicles",
        title: "Vehicles",
        load: () => import("./pages/vehicles.js")
    },
    "/cost": {
        name: "costs",
        title: "Costs",
        load: () => import("./pages/costs.js")
    },
    "/costs": {
        name: "costs",
        title: "Costs",
        load: () => import("./pages/costs.js")
    },
    "/settings": {
        name: "settings",
        title: "Settings",
        load: () => import("./pages/settings.js")
    }
};

let currentPage = null;
let currentRoute = null;
let navigationSequence = 0;

function normalizePath(hash = window.location.hash) {
    const raw = String(hash).replace(/^#/, "").trim();

    if (!raw || raw === "/") {
        return "/";
    }

    const withoutQuery = raw.split("?")[0].split("#")[0];
    const normalized = `/${withoutQuery.replace(/^\/+/, "").replace(/\/+$/, "")}`;

    return normalized || "/";
}

function getRoute(path = normalizePath()) {
    return routes[path] || null;
}

function createNotFoundPage(path) {
    const section = document.createElement("section");

    section.className = "route-error";
    section.style.cssText = `
        min-height: 48vh;
        display: grid;
        place-items: center;
        text-align: center;
        padding: 40px 20px;
    `;

    section.innerHTML = `
        <div>
            <div style="font-size:56px;font-weight:800;color:var(--color-primary);">
                404
            </div>
            <h1 style="margin-top:4px;font-size:28px;">Page not found</h1>
            <p style="margin-top:8px;color:var(--color-text-secondary);">
                The route "${path}" does not exist.
            </p>
            <a
                href="#/"
                style="
                    display:inline-flex;
                    margin-top:20px;
                    padding:11px 18px;
                    border-radius:12px;
                    background:var(--color-primary);
                    color:#fff;
                    font-weight:800;
                "
            >
                Back Home
            </a>
        </div>
    `;

    return section;
}

async function unmountCurrentPage() {
    if (!currentPage) return;

    try {
        if (typeof currentPage.unmount === "function") {
            await currentPage.unmount();
        }
    } finally {
        currentPage = null;
    }
}

async function mountRoute(route, container, sequence) {
    const module = await route.load();

    // Ignore a slow import if the user navigated again.
    if (sequence !== navigationSequence) {
        return;
    }

    if (typeof module.mount !== "function") {
        throw new Error(`Route "${route.name}" must export mount().`);
    }

    const page = await module.mount();

    if (!(page instanceof Node)) {
        throw new Error(`Route "${route.name}" mount() must return a DOM Node.`);
    }

    if (sequence !== navigationSequence) {
        if (typeof module.unmount === "function") {
            await module.unmount();
        }
        return;
    }

    container.replaceChildren(page);

    currentPage = {
        name: route.name,
        module
    };
}

function getRouteSwipeDirection(fromPath, toPath) {
    if (!fromPath || fromPath === toPath) return null;

    const order = {
        "/": 0,
        "/dashboard": 0,
        "/parts": 1,
        "/car": 2,
        "/vehicles": 2,
        "/service": 3,
        "/services": 3,
        "/cost": 4,
        "/costs": 4,
        "/settings": 5
    };

    const fromIndex = order[fromPath];
    const toIndex = order[toPath];

    if (typeof fromIndex !== "number" || typeof toIndex !== "number" || fromIndex === toIndex) {
        return null;
    }

    // Moving to a later navigation item makes the new page enter from the right.
    return toIndex > fromIndex ? "left" : "right";
}

function animatePageEntry(page, direction) {
    if (!page || !direction) return;

    page.classList.add(`page-swipe-enter-${direction}`);

    const cleanup = () => {
        page.classList.remove(`page-swipe-enter-${direction}`);
        page.removeEventListener("animationend", cleanup);
    };

    page.addEventListener("animationend", cleanup, { once: true });
}

async function renderRoute() {
    const sequence = ++navigationSequence;
    const path = normalizePath();
    const route = getRoute(path);
    const previousPath = currentRoute;
    const pageSwipeDirection = getRouteSwipeDirection(previousPath, path);

    const root = document.querySelector("#app-root");

    if (!root) return;

    await unmountCurrentPage();

    if (sequence !== navigationSequence) return;

    let shell = root.querySelector(".app-shell");
    let main = shell ? shell.querySelector(".app-main") : null;
    let container = main ? main.querySelector(".page-container") : null;

    if (!shell || !main || !container) {
        root.replaceChildren();

        shell = document.createElement("div");
        shell.className = "app-shell";

        main = document.createElement("main");
        main.className = "app-main";

        container = document.createElement("div");
        container.className = "page-container";

        main.append(container);
        shell.append(main);
        root.append(
            createHeader(),
            shell,
            createBottomNavigation({
                onChange: (item) => {
                    if (item.action === "settings") return;
                    if (item.route) navigate(item.route);
                }
            })
        );
    }

    container.dataset.route = path;
    shell.classList.toggle("is-settings-route", path === "/settings");
    const bottomNav = root.querySelector(".bottom-nav");
    const isSettingsRoute = path === "/settings";

    // Settings is a full-page route. The Bottom Navigation must never
    // remain visible or keep a previous item (e.g. Car) active on this page.
    bottomNav?.classList.toggle("is-settings-hidden", isSettingsRoute);
    bottomNav?.setAttribute("aria-hidden", String(isSettingsRoute));
    if (isSettingsRoute) {
        bottomNav?.querySelectorAll(".bottom-nav__item").forEach((item) => {
            item.classList.remove("is-active");
            item.setAttribute("aria-current", "false");
        });
    }

    document.title = route
        ? `CarCare — ${route.title}`
        : "CarCare — Page Not Found";

    if (!route) {
        container.replaceChildren(createNotFoundPage(path));
        currentRoute = path;
        return;
    }

    try {
        await mountRoute(route, container, sequence);

        if (sequence !== navigationSequence) return;

        const mountedPage = container.firstElementChild;
        animatePageEntry(mountedPage, pageSwipeDirection);
        currentRoute = path;
    } catch (error) {
        console.error("[CarCare Router]", error);

        if (sequence !== navigationSequence) return;

        container.replaceChildren(
            createNotFoundPage("An unexpected application error occurred")
        );
    }
}

function updateActiveNavigation(nav) {
    const current = normalizePath();

    nav.querySelectorAll("[data-route]").forEach((item) => {
        const route = item.dataset.route;
        const active = route === current ||
            (current === "/dashboard" && route === "/") ||
            (current === "/services" && route === "/service") ||
            (current === "/vehicles" && route === "/car") ||
            (current === "/costs" && route === "/cost");

        item.classList.toggle("is-active", active);
    });
}

export function navigate(path) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const target = normalized === "/" ? "#/" : `#${normalized}`;

    if (window.location.hash === target) {
        renderRoute();
        return;
    }

    window.location.hash = target;
}

export function getCurrentRoute() {
    const path = normalizePath();
    const route = getRoute(path);

    return route
        ? { path, ...route }
        : { path, name: "not-found", title: "Page Not Found" };
}

export function initRouter() {
    window.addEventListener("hashchange", () => {
        renderRoute();
    });

    window.addEventListener("popstate", () => {
        renderRoute();
    });

    if (!window.location.hash) {
        window.location.hash = "#/";
        return;
    }

    renderRoute();
}

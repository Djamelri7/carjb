/* =========================================================
   CarCare — Reusable Bottom Navigation
   Floating active indicator with smooth horizontal swipe
   ========================================================= */

const DEFAULT_ITEMS = [
    { id: "statistics", label: "Statistics", icon: "fa-chart-pie", route: "/dashboard" },
    { id: "parts", label: "Parts", icon: "fa-toolbox", route: "/parts" },
    { id: "home", label: "Car", icon: "fa-car", route: "/vehicles" },
    { id: "calendar", label: "Service", icon: "fa-screwdriver-wrench", route: "/service" },
    { id: "cost", label: "Cost", icon: "fa-wallet", route: "/cost" }
];

export function createBottomNavigation({
    container = document.body,
    items = DEFAULT_ITEMS,
    activeItem = null,
    onChange = null
} = {}) {
    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "Primary navigation");
    nav.style.setProperty("--bottom-nav-height", "72px");

    const list = Array.isArray(items) && items.length === 5 ? items : DEFAULT_ITEMS;

    nav.innerHTML = `
        ${list.map((item) => `
            <button
                class="bottom-nav__item"
                type="button"
                data-nav-id="${escapeAttribute(item.id)}"
                ${item.route ? `data-route="${escapeAttribute(item.route)}"` : ""}
                aria-label="${escapeAttribute(item.label)}"
                aria-current="false"
            >
                <span class="bottom-nav__icon" aria-hidden="true">
                    <i class="fa-solid ${escapeAttribute(item.icon)}"></i>
                </span>
            </button>
        `).join("")}

        <span class="bottom-nav__indicator" aria-hidden="true">
            <span class="bottom-nav__indicator-circle">
                <i class="bottom-nav__indicator-icon fa-solid"></i>
            </span>
            <span class="bottom-nav__indicator-label"></span>
        </span>
    `;

    const indicator = nav.querySelector(".bottom-nav__indicator");
    const indicatorIcon = nav.querySelector(".bottom-nav__indicator-icon");
    const indicatorLabel = nav.querySelector(".bottom-nav__indicator-label");

    const setIndicatorContent = (item) => {
        if (!item) {
            indicator.classList.remove("is-visible");
            return;
        }

        indicatorIcon.className = `bottom-nav__indicator-icon fa-solid ${escapeAttribute(item.icon)}`;
        indicatorLabel.textContent = item.label;
        indicator.classList.add("is-visible");
    };

    const setActive = (id, { animate = false } = {}) => {
        const buttons = [...nav.querySelectorAll(".bottom-nav__item")];
        const previous = buttons.find((button) => button.classList.contains("is-active"));
        const next = buttons.find((button) => button.dataset.navId === id);
        const nextIndex = next ? buttons.indexOf(next) : -1;
        const nextItem = next ? list.find((item) => item.id === id) : null;

        if (!next || !nextItem) {
            buttons.forEach((button) => {
                button.classList.remove("is-active");
                button.setAttribute("aria-current", "false");
            });
            setIndicatorContent(null);
            return;
        }

        const previousIndex = previous ? buttons.indexOf(previous) : nextIndex;
        const direction = nextIndex > previousIndex ? 1 : nextIndex < previousIndex ? -1 : 0;

        // The indicator is a single physical object. It moves between the
        // five equal columns instead of creating/removing a new circle.
        indicator.style.setProperty("--indicator-index", nextIndex);
        indicator.style.setProperty("--indicator-direction", direction);
        indicator.classList.toggle("is-moving", Boolean(animate && direction));

        setIndicatorContent(nextItem);

        buttons.forEach((button, index) => {
            const active = index === nextIndex;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-current", active ? "page" : "false");
        });

        if (animate && direction) {
            indicator.classList.remove("is-settling");
            requestAnimationFrame(() => {
                indicator.classList.add("is-settling");
            });
        }
    };

    const resolveActiveId = () => {
        if (activeItem) return activeItem;

        const current = normalizePath();
        if (current === "/settings") return null;

        const routeAliases = {
            statistics: ["/", "/dashboard"],
            parts: ["/parts"],
            home: ["/car", "/vehicles"],
            calendar: ["/service", "/services"],
            cost: ["/cost", "/costs"]
        };

        const match = list.find((item) => {
            const aliases = routeAliases[item.id] || [];
            return aliases.includes(current) || item.route === current;
        });

        return match?.id || null;
    };

    setActive(resolveActiveId());

    nav.addEventListener("click", (event) => {
        const button = event.target.closest(".bottom-nav__item");
        if (!button || !nav.contains(button)) return;

        const item = list.find((entry) => entry.id === button.dataset.navId);
        if (!item) return;

        const currentActive = nav.querySelector(".bottom-nav__item.is-active");
        const shouldAnimate = Boolean(currentActive && currentActive !== button);

        setActive(item.id, { animate: shouldAnimate });
        onChange?.(item, nav);
    });

    const syncRouteState = () => {
        const current = normalizePath();
        const isSettings = current === "/settings";

        nav.classList.toggle("is-settings-hidden", isSettings);
        nav.setAttribute("aria-hidden", String(isSettings));

        if (isSettings) {
            nav.querySelectorAll(".bottom-nav__item").forEach((button) => {
                button.classList.remove("is-active");
                button.setAttribute("aria-current", "false");
            });
            setIndicatorContent(null);
            return;
        }

        setActive(resolveActiveId());
    };

    window.addEventListener("hashchange", syncRouteState);
    syncRouteState();

    if (container && container !== document.body) {
        container.append(nav);
    } else {
        document.body.append(nav);
    }

    return nav;
}

function normalizePath(hash = window.location.hash) {
    const raw = String(hash).replace(/^#/, "").trim();
    if (!raw || raw === "/") return "/";
    const path = raw.split("?")[0].split("#")[0];
    return `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

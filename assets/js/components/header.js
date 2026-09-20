/* =========================================================
   CarCare — Global Header Component
   Settings is a normal application route.
   ========================================================= */

export function createHeader() {
    const header = document.createElement("header");
    header.className = "app-header";

    header.innerHTML = `
        <a class="brand" href="#/" aria-label="CarCare home">
            <span class="brand__name">
                <span class="brand__car">Car</span><span class="brand__care">Care</span>
            </span>
            <span class="brand__tagline">Drive Better. Maintain Smarter.</span>
        </a>

        <div class="header-greeting">
            <h1 class="header-greeting__title">Good Morning, Ali 👋</h1>
            <p class="header-greeting__date">Tuesday, 16 September 2025</p>
        </div>

        <div class="header-actions">
            <label class="search-box" aria-label="Search">
                <i class="fa-solid fa-magnifying-glass search-box__icon"></i>
                <input type="search" placeholder="Search vehicles, parts, or services...">
            </label>

            <button class="icon-button" type="button" aria-label="Notifications">
                <i class="fa-regular fa-bell"></i>
                <span class="notification-dot" aria-hidden="true"></span>
            </button>

            <button class="avatar" type="button" aria-label="Profile">AD</button>

            <button
                class="icon-button settings-button"
                type="button"
                aria-label="Settings"
                aria-pressed="false"
                data-settings-toggle
            >
                <i class="fa-solid fa-gear"></i>
            </button>
        </div>
    `;

    let lastScrollY = window.scrollY || 0;
    let ticking = false;

    const updateHeaderVisibility = () => {
        const currentY = window.scrollY || 0;
        const scrollingDown = currentY > lastScrollY + 4;
        const hideThreshold = Math.max(window.innerHeight * 0.20, 1);

        if (currentY <= hideThreshold) {
            header.classList.remove("is-hidden");
        } else if (scrollingDown) {
            header.classList.add("is-hidden");
        } else if (currentY < lastScrollY - 4) {
            header.classList.remove("is-hidden");
        }

        lastScrollY = currentY;
        ticking = false;
    };

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateHeaderVisibility);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateHeaderVisibility();

    const settingsButton = header.querySelector("[data-settings-toggle]");

    const syncSettingsButton = () => {
        const isSettings = normalizeHeaderPath() === "/settings";
        settingsButton?.classList.toggle("is-active", isSettings);
        settingsButton?.setAttribute("aria-pressed", String(isSettings));
    };

    settingsButton?.addEventListener("click", (event) => {
        event.preventDefault();
        const isSettings = normalizeHeaderPath() === "/settings";

        if (isSettings) {
            // Close Settings by returning to the previous SPA route.
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.hash = "#/";
            }
            return;
        }

        window.location.hash = "#/settings";
    });

    window.addEventListener("hashchange", syncSettingsButton);
    syncSettingsButton();

    return header;
}


function normalizeHeaderPath(hash = window.location.hash) {
    const raw = String(hash).replace(/^#/, "").trim();
    if (!raw || raw === "/") return "/";
    const path = raw.split("?")[0].split("#")[0];
    return `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

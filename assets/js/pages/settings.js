/* =========================================================
   CarCare — Settings Page
   Normal application page; no modal/overlay behavior.
   ========================================================= */

export function mount() {
    const page = document.createElement("section");
    page.className = "settings-page";
    page.innerHTML = `
        <div class="settings-page__topbar">
            <button class="settings-page__back" type="button" data-settings-back>
                <i class="fa-solid fa-arrow-left"></i>
                <span>Back</span>
            </button>
            <div class="settings-page__title">
                <span class="settings-page__title-icon"><i class="fa-solid fa-sliders"></i></span>
                <div>
                    <h1>Settings</h1>
                    <p>Customize your CarCare experience</p>
                </div>
            </div>
        </div>

        <section class="settings-page__section settings-page__appearance">
            <div class="settings-page__section-heading">
                <span class="settings-page__icon settings-page__icon--sun"><i class="fa-solid fa-sun"></i></span>
                <div><strong>Appearance</strong><small>Make it look the way you like</small></div>
            </div>
            <div class="appearance-options">
                <button class="appearance-option" type="button" data-theme-choice="light">
                    <i class="fa-regular fa-sun"></i><span>Light</span>
                </button>
                <button class="appearance-option" type="button" data-theme-choice="dark">
                    <i class="fa-solid fa-moon"></i><span>Dark</span>
                </button>
                <button class="appearance-option" type="button" data-theme-choice="system">
                    <i class="fa-solid fa-desktop"></i><span>System</span>
                </button>
            </div>
        </section>

        <button class="settings-page__row" type="button" data-preference-setting>
            <span class="settings-page__icon settings-page__icon--cyan"><i class="fa-solid fa-sliders"></i></span>
            <span class="settings-page__copy"><strong>Preferences</strong><small>Set your app preferences</small></span>
            <i class="fa-solid fa-chevron-right settings-page__arrow"></i>
        </button>

        <button class="settings-page__row" type="button">
            <span class="settings-page__icon settings-page__icon--blue"><i class="fa-solid fa-database"></i></span>
            <span class="settings-page__copy"><strong>Data &amp; Storage</strong><small>Manage your app data</small></span>
            <i class="fa-solid fa-chevron-right settings-page__arrow"></i>
        </button>

        <button class="settings-page__row" type="button">
            <span class="settings-page__icon settings-page__icon--red"><i class="fa-regular fa-bell"></i></span>
            <span class="settings-page__copy"><strong>Notifications</strong><small>Control what you want to be notified about</small></span>
            <i class="fa-solid fa-chevron-right settings-page__arrow"></i>
        </button>

        <button class="settings-page__row" type="button">
            <span class="settings-page__icon settings-page__icon--green"><i class="fa-solid fa-shield-halved"></i></span>
            <span class="settings-page__copy"><strong>Privacy &amp; Security</strong><small>Keep your data safe</small></span>
            <i class="fa-solid fa-chevron-right settings-page__arrow"></i>
        </button>

        <button class="settings-page__row" type="button">
            <span class="settings-page__icon settings-page__icon--purple"><i class="fa-solid fa-circle-info"></i></span>
            <span class="settings-page__copy"><strong>About CarCare</strong><small>Version 1.0.0</small></span>
            <i class="fa-solid fa-chevron-right settings-page__arrow"></i>
        </button>

        <button class="settings-page__reset" type="button" data-reset-app>
            <i class="fa-regular fa-trash-can"></i>
            <span>Reset App Data</span>
        </button>

        <div class="settings-page__preferences" data-settings-preferences hidden>
            <div class="settings-page__subheader">
                <button class="settings-page__back settings-page__back--sub" type="button" data-preferences-back>
                    <i class="fa-solid fa-arrow-left"></i><span>Back</span>
                </button>
                <div><h2>Preferences</h2><p>Customize how CarCare works</p></div>
            </div>
            <div class="settings-page__preference-row">
                <span class="settings-page__icon settings-page__icon--soft"><i class="fa-solid fa-language"></i></span>
                <span class="settings-page__copy"><strong>Language</strong><small>Choose your language</small></span>
                <button class="settings-value-button" type="button">English <i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="settings-page__preference-row">
                <span class="settings-page__icon settings-page__icon--soft"><i class="fa-solid fa-gauge-high"></i></span>
                <span class="settings-page__copy"><strong>Units</strong><small>Distance, fuel consumption, etc.</small></span>
                <div class="segmented-control" role="group" aria-label="Units">
                    <button type="button" data-unit-choice="km">km</button>
                    <button type="button" data-unit-choice="miles">miles</button>
                </div>
            </div>
        </div>
    `;

    const mainSections = [...page.children].filter((el) => !el.matches(".settings-page__preferences"));
    const preferences = page.querySelector("[data-settings-preferences]");
    const preferenceButton = page.querySelector("[data-preference-setting]");
    const preferenceBack = page.querySelector("[data-preferences-back]");
    const backButton = page.querySelector("[data-settings-back]");
    const themeChoices = page.querySelectorAll("[data-theme-choice]");
    const unitChoices = page.querySelectorAll("[data-unit-choice]");

    const syncTheme = () => {
        const current = localStorage.getItem("carcare-theme-mode") || (window.CarCareTheme?.get?.() || "light");
        themeChoices.forEach((button) => button.classList.toggle("is-selected", button.dataset.themeChoice === current));
    };

    themeChoices.forEach((button) => {
        button.addEventListener("click", () => {
            const choice = button.dataset.themeChoice;
            if (choice === "system") {
                const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
                window.CarCareTheme?.set?.(prefersDark ? "dark" : "light");
            } else {
                window.CarCareTheme?.set?.(choice);
            }
            localStorage.setItem("carcare-theme-mode", choice);
            syncTheme();
        });
    });

    const storedUnit = localStorage.getItem("carcare-units") || "km";
    unitChoices.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.unitChoice === storedUnit);
        button.addEventListener("click", () => {
            unitChoices.forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            localStorage.setItem("carcare-units", button.dataset.unitChoice);
        });
    });

    preferenceButton?.addEventListener("click", () => {
        mainSections.forEach((el) => { el.hidden = true; });
        preferences.hidden = false;
        preferences.classList.add("is-active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    preferenceBack?.addEventListener("click", () => {
        preferences.hidden = true;
        mainSections.forEach((el) => { el.hidden = false; });
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    backButton?.addEventListener("click", () => {
        if (window.history.length > 1) window.history.back();
        else window.location.hash = "#/";
    });

    page.querySelector("[data-reset-app]")?.addEventListener("click", () => {
        if (!window.confirm("Reset all CarCare app data? This cannot be undone.")) return;
        ["carcare:vehicles", "carcare:parts", "carcare:services", "carcare:costs", "carcare:settings", "carcare-theme", "carcare-theme-mode", "carcare-units"].forEach((key) => localStorage.removeItem(key));
        window.location.hash = "#/";
        window.location.reload();
    });

    syncTheme();

    return page;
}

export function unmount() {}

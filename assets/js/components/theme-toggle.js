/* =========================================================
   CarCare — Theme Toggle Component
   ========================================================= */

export function createThemeToggle() {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "icon-button theme-toggle";
    button.setAttribute("aria-label", "Toggle dark mode");

    const sync = () => {
        const isDark = window.CarCareTheme?.get() === "dark";

        button.innerHTML = `
            <i class="fa-solid ${isDark ? "fa-sun" : "fa-moon"}"></i>
        `;

        button.title = isDark ? "Switch to light mode" : "Switch to dark mode";
        button.setAttribute("aria-pressed", String(isDark));
    };

    button.addEventListener("click", () => {
        window.CarCareTheme?.toggle();
        sync();
    });

    sync();

    return button;
}

/* =========================================================
   CarCare — Placeholder Page
   PHASE 08
   ========================================================= */

export function createPlaceholderPage(title, description) {
    const section = document.createElement("section");

    section.className = "placeholder-page";
    section.style.cssText = `
        min-height: 45vh;
        display: grid;
        place-items: center;
        text-align: center;
        padding: 40px 20px;
    `;

    section.innerHTML = `
        <div>
            <h1 style="font-size:28px;">${title}</h1>
            <p style="margin-top:8px;color:var(--color-text-secondary);">
                ${description}
            </p>
        </div>
    `;

    return section;
}


export function mount() {
    return createPlaceholderPage(
        "Services",
        "This page is reserved for its dedicated implementation phase."
    );
}

export function unmount() {
    // Reserved for page-specific cleanup.
}

/* =========================================================
   CarCare — Vehicle Details Page
   PHASE 09
   ========================================================= */

import { appStore, getActiveVehicle, updateVehicle } from "../state/index.js";

let pageRoot = null;
let unsubscribe = null;

function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function copyText(value) {
    if (!value) return;

    navigator.clipboard?.writeText(String(value)).catch(() => {});
}

function render() {
    if (!pageRoot) return;

    const vehicle = getActiveVehicle();

    if (!vehicle) {
        pageRoot.innerHTML = `
            <section class="vehicle-info-card">
                <h1>No vehicle found</h1>
                <p style="margin-top:8px;color:var(--color-text-secondary);">
                    Add a vehicle to see its details.
                </p>
            </section>
        `;
        return;
    }

    pageRoot.innerHTML = `
        <div class="vehicle-pagebar">
            <a class="vehicle-pagebar__back" href="#/" aria-label="Back to home">
                <i class="fa-solid fa-arrow-left"></i>
            </a>
            <h1 class="vehicle-pagebar__title">Vehicle Details</h1>
            <button class="vehicle-pagebar__menu" type="button" aria-label="More options">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
        </div>

        <section class="vehicle-hero">
            <div class="vehicle-hero__visual">
                <img
                    class="vehicle-hero__image"
                    src="${escapeHtml(vehicle.image || "assets/images/vehicle-polo.png")}"
                    alt="${escapeHtml(`${vehicle.make} ${vehicle.model}`)}"
                >
            </div>

            <div class="vehicle-hero__info">
                <div class="vehicle-hero__brand-mark">VW</div>
                <h2 class="vehicle-hero__model">
                    ${escapeHtml(vehicle.make)}<br>${escapeHtml(vehicle.model)}
                </h2>
                <p class="vehicle-hero__meta">
                    ${escapeHtml(vehicle.engine)} &nbsp;•&nbsp; ${escapeHtml(vehicle.year)}
                    &nbsp;•&nbsp; ${escapeHtml(vehicle.trim || "Comfortline")}
                </p>
                <div class="active-badge">Active</div>

                <div class="vehicle-plate">
                    <span>${escapeHtml(vehicle.plate)}</span>
                    <button
                        class="copy-button"
                        type="button"
                        data-copy="${escapeHtml(vehicle.plate)}"
                        aria-label="Copy license plate"
                    >
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>
        </section>

        <section class="vehicle-actions" aria-label="Vehicle actions">
            <button class="vehicle-action" type="button" data-action="edit">
                <i class="fa-solid fa-pen"></i>
                <span>Edit Vehicle</span>
            </button>

            <button class="vehicle-action vehicle-action--active" type="button" data-action="active">
                <i class="fa-solid fa-star"></i>
                <span>Set as Active</span>
            </button>

            <button class="vehicle-action vehicle-action--delete" type="button" data-action="delete">
                <i class="fa-regular fa-trash-can"></i>
                <span>Delete Vehicle</span>
            </button>
        </section>

        <section class="vehicle-summary" aria-label="Vehicle specifications">
            <div class="vehicle-summary__item">
                <i class="vehicle-summary__icon fa-solid fa-gas-pump"></i>
                <div>
                    <span class="vehicle-summary__value">Diesel</span>
                    <span class="vehicle-summary__label">Fuel</span>
                </div>
            </div>

            <div class="vehicle-summary__item">
                <i class="vehicle-summary__icon fa-solid fa-certificate"></i>
                <div>
                    <span class="vehicle-summary__value">Manual</span>
                    <span class="vehicle-summary__label">Transmission</span>
                </div>
            </div>

            <div class="vehicle-summary__item">
                <i class="vehicle-summary__icon fa-solid fa-car-side"></i>
                <div>
                    <span class="vehicle-summary__value">FWD</span>
                    <span class="vehicle-summary__label">Drive Type</span>
                </div>
            </div>

            <div class="vehicle-summary__item">
                <i class="vehicle-summary__icon fa-solid fa-gauge-high"></i>
                <div>
                    <span class="vehicle-summary__value">122 hp</span>
                    <span class="vehicle-summary__label">Engine Power</span>
                </div>
            </div>
        </section>

        <section class="vehicle-info-grid">
            <article class="vehicle-info-card">
                <header class="vehicle-info-card__header">
                    <h2 class="vehicle-info-card__heading">
                        <i class="fa-regular fa-id-card"></i>
                        Basic Information
                    </h2>
                    <button class="vehicle-info-card__edit" type="button" data-edit-section="basic">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                </header>

                <div class="vehicle-fields">
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Make</span>
                        <strong class="vehicle-field__value">${escapeHtml(vehicle.make)}</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Model</span>
                        <strong class="vehicle-field__value">${escapeHtml(vehicle.model)}</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Year</span>
                        <strong class="vehicle-field__value">${escapeHtml(vehicle.year)}</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Trim</span>
                        <strong class="vehicle-field__value">${escapeHtml(vehicle.trim || "Comfortline")}</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Color</span>
                        <strong class="vehicle-field__value">◯ White</strong>
                    </div>
                </div>
            </article>

            <article class="vehicle-info-card">
                <header class="vehicle-info-card__header">
                    <h2 class="vehicle-info-card__heading">
                        <i class="fa-solid fa-screwdriver-wrench"></i>
                        Technical Information
                    </h2>
                    <button class="vehicle-info-card__edit" type="button" data-edit-section="technical">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                </header>

                <div class="vehicle-fields">
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Engine</span>
                        <strong class="vehicle-field__value">1.6 TDI (1598 cc)</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Fuel Type</span>
                        <strong class="vehicle-field__value">Diesel</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Transmission</span>
                        <strong class="vehicle-field__value">Manual</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Drive Type</span>
                        <strong class="vehicle-field__value">FWD</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Engine Power</span>
                        <strong class="vehicle-field__value">90 kW (122 hp)</strong>
                    </div>
                </div>
            </article>

            <article class="vehicle-info-card">
                <header class="vehicle-info-card__header">
                    <h2 class="vehicle-info-card__heading">
                        <i class="fa-regular fa-address-card"></i>
                        Registration
                    </h2>
                    <button class="vehicle-info-card__edit" type="button" data-edit-section="registration">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                </header>

                <div class="vehicle-fields">
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">License Plate</span>
                        <strong class="vehicle-field__value">
                            ${escapeHtml(vehicle.plate)}
                            <button
                                class="copy-button"
                                type="button"
                                data-copy="${escapeHtml(vehicle.plate)}"
                                aria-label="Copy plate"
                            ><i class="fa-regular fa-copy"></i></button>
                        </strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">VIN</span>
                        <strong class="vehicle-field__value">
                            ${escapeHtml(vehicle.vin || "WVWZZZ6RZCY012345")}
                            <button
                                class="copy-button"
                                type="button"
                                data-copy="${escapeHtml(vehicle.vin || "WVWZZZ6RZCY012345")}"
                                aria-label="Copy VIN"
                            ><i class="fa-regular fa-copy"></i></button>
                        </strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Registration Date</span>
                        <strong class="vehicle-field__value">${escapeHtml(vehicle.registrationDate || "12 Mar 2012")}</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Country</span>
                        <strong class="vehicle-field__value">Algeria</strong>
                    </div>
                </div>
            </article>
        </section>

        <section class="vehicle-secondary-grid">
            <article class="odometer-card">
                <header class="vehicle-info-card__header">
                    <h2 class="vehicle-info-card__heading">
                        <i class="fa-solid fa-gauge-high"></i>
                        Current Odometer
                    </h2>
                </header>

                <div class="odometer-card__main">
                    <div>
                        <div class="odometer-value">${formatNumber(vehicle.odometer)} km</div>
                        <div class="odometer-date">Last updated: 15 Sep 2025</div>
                    </div>
                    <button class="outline-button" type="button" data-action="odometer">
                        Update
                    </button>
                </div>
            </article>

            <article class="ownership-card">
                <header class="vehicle-info-card__header">
                    <h2 class="vehicle-info-card__heading">
                        <i class="fa-solid fa-briefcase"></i>
                        Ownership
                    </h2>
                    <button class="vehicle-info-card__edit" type="button" data-edit-section="ownership">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                </header>

                <div class="vehicle-fields">
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Purchase Date</span>
                        <strong class="vehicle-field__value">Not specified</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Purchase Mileage</span>
                        <strong class="vehicle-field__value">Not specified</strong>
                    </div>
                    <div class="vehicle-field">
                        <span class="vehicle-field__label">Previous Owner</span>
                        <strong class="vehicle-field__value">Not specified</strong>
                    </div>
                </div>
            </article>

            <article class="notes-card">
                <header class="vehicle-info-card__header">
                    <h2 class="vehicle-info-card__heading">
                        <i class="fa-regular fa-note-sticky"></i>
                        Notes
                    </h2>
                    <button class="vehicle-info-card__edit" type="button" data-edit-section="notes">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                </header>

                <div class="vehicle-note">
                    My daily-use vehicle.<br>
                    Regular maintenance is done on time.
                </div>
            </article>
        </section>
    `;

    bindEvents();
}

function bindEvents() {
    pageRoot.querySelectorAll("[data-copy]").forEach((button) => {
        button.addEventListener("click", () => {
            copyText(button.dataset.copy);
            button.innerHTML = `<i class="fa-solid fa-check"></i>`;
            setTimeout(() => {
                button.innerHTML = `<i class="fa-regular fa-copy"></i>`;
            }, 900);
        });
    });

    pageRoot.querySelector("[data-action='odometer']")?.addEventListener("click", () => {
        const vehicle = getActiveVehicle();
        const value = prompt("Enter current odometer (km):", vehicle?.odometer ?? "");

        if (value === null) return;

        const odometer = Number(value);

        if (!Number.isFinite(odometer) || odometer < 0) {
            alert("Please enter a valid odometer value.");
            return;
        }

        updateVehicle(vehicle.id, { odometer });
    });

    pageRoot.querySelector("[data-action='edit']")?.addEventListener("click", () => {
        const vehicle = getActiveVehicle();
        const plate = prompt("License plate:", vehicle?.plate ?? "");

        if (plate === null) return;

        updateVehicle(vehicle.id, { plate: plate.trim() || vehicle.plate });
    });

    pageRoot.querySelectorAll("[data-edit-section]").forEach((button) => {
        button.addEventListener("click", () => {
            alert(`${button.dataset.editSection} editing will be connected to the form system in the next vehicle-management phase.`);
        });
    });

    pageRoot.querySelector("[data-action='active']")?.addEventListener("click", () => {
        alert("This vehicle is already the active vehicle.");
    });

    pageRoot.querySelector("[data-action='delete']")?.addEventListener("click", () => {
        alert("Vehicle deletion will be connected to the vehicle management flow in a later phase.");
    });
}

export function mount() {
    pageRoot = document.createElement("section");
    pageRoot.className = "vehicle-details-page";

    render();

    unsubscribe = appStore.subscribe(() => {
        render();
    });

    return pageRoot;
}

export function unmount() {
    unsubscribe?.();
    unsubscribe = null;
    pageRoot = null;
}

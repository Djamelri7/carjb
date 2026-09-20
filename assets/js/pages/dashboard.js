/* =========================================================
   CarCare — Dashboard Page
   PHASE 07 — Store-driven Dashboard
   ========================================================= */

import { appStore, selectDashboard } from "../state/index.js";

const maintenance = [
    { icon: "fa-oil-can", name: "Engine Oil", remaining: "650 km remaining", iconClass: "" },
    { icon: "fa-circle-dot", name: "Brake Pads", remaining: "2,400 km remaining", iconClass: "red" },
    { icon: "fa-grip-lines", name: "Air Filter", remaining: "4,800 km remaining", iconClass: "yellow" },
    { icon: "fa-temperature-half", name: "Coolant", remaining: "6 months remaining", iconClass: "yellow" }
];

const healthSystems = [
    { icon: "fa-car-battery", name: "Engine", state: "good" },
    { icon: "fa-bullseye", name: "Brakes", state: "good" },
    { icon: "fa-screwdriver-wrench", name: "Suspension", state: "warning" },
    { icon: "fa-bottle-water", name: "Fluids", state: "good" },
    { icon: "fa-car-battery", name: "Electrical", state: "good" }
];

let unsubscribe = null;
let dashboardRoot = null;

function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function renderDashboard() {
    if (!dashboardRoot) return;

    const data = selectDashboard(appStore.getState());
    const vehicle = data.vehicle;

    dashboardRoot.innerHTML = `
        <article class="dashboard-card vehicle-card">
            <div class="vehicle-card__image-wrap">
                <img
                    class="vehicle-card__image"
                    src="${vehicle?.image || "assets/images/vehicle-polo.png"}"
                    alt="${vehicle?.make || ""} ${vehicle?.model || "Vehicle"}"
                >
            </div>

            <div class="vehicle-card__details">
                <i class="fa-solid fa-chevron-right vehicle-card__arrow" aria-hidden="true"></i>
                <h2 class="vehicle-card__model">${vehicle ? `${vehicle.make} ${vehicle.model}` : "No vehicle"}</h2>
                <p class="vehicle-card__meta">
                    ${vehicle?.engine || "—"}${vehicle?.year ? `&nbsp; • &nbsp;${vehicle.year}` : ""}
                </p>

                <div class="vehicle-card__plate">
                    <span>${vehicle?.plate || "No plate"}</span>
                    <button type="button" aria-label="Edit license plate">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </div>

                <p class="vehicle-card__odometer">
                    ${formatNumber(vehicle?.odometer)} km
                </p>
            </div>
        </article>

        <article class="dashboard-card care-card">
            <header class="dashboard-card__header">
                <h2 class="dashboard-card__title">Vehicle Care</h2>
                <a class="card-link" href="#/services">
                    See Details <i class="fa-solid fa-chevron-right"></i>
                </a>
            </header>

            <div class="care-flow">
                <div class="care-item">
                    <div class="care-icon"><i class="fa-solid fa-gear"></i></div>
                    <span class="care-label">Parts</span>
                    <strong class="care-value">${data.partsCount}</strong>
                    <span class="care-note">Tracked</span>
                </div>

                <div class="care-item">
                    <div class="care-icon"><i class="fa-solid fa-wrench"></i></div>
                    <span class="care-label">Service</span>
                    <strong class="care-value">${data.servicesThisYear}</strong>
                    <span class="care-note">This year</span>
                </div>

                <div class="care-item">
                    <div class="care-icon"><i class="fa-solid fa-briefcase"></i></div>
                    <span class="care-label">Cost</span>
                    <strong class="care-value">${formatNumber(data.totalCost)} DA</strong>
                    <span class="care-note">Total</span>
                </div>
            </div>
        </article>

        <article class="dashboard-card maintenance-card">
            <header class="dashboard-card__header">
                <h2 class="dashboard-card__title">Upcoming Maintenance</h2>
                <a class="card-link" href="#/services">
                    View All <i class="fa-solid fa-chevron-right"></i>
                </a>
            </header>

            <div class="maintenance-list">
                ${maintenance.map(item => `
                    <div class="maintenance-item">
                        <div class="maintenance-icon ${item.iconClass}">
                            <i class="fa-solid ${item.icon}"></i>
                        </div>
                        <div class="maintenance-info">
                            <div class="maintenance-name">${item.name}</div>
                            <div class="maintenance-remaining">${item.remaining}</div>
                        </div>
                        <span class="status-badge">Due Soon</span>
                    </div>
                `).join("")}
            </div>
        </article>

        <article class="dashboard-card health-card">
            <header class="dashboard-card__header">
                <h2 class="dashboard-card__title">Vehicle Health</h2>
            </header>

            <div class="health-content">
                <div class="health-ring-wrap">
                    <div class="health-ring" style="--health:87">
                        <span class="health-ring__value">87%</span>
                    </div>
                    <span class="health-status">Good condition</span>
                </div>

                <div class="health-systems">
                    ${healthSystems.map(system => `
                        <div class="health-system">
                            <i class="fa-solid ${system.icon}"></i>
                            <span>${system.name}</span>
                            <span class="health-system__dot ${system.state === "warning" ? "warning" : ""}"></span>
                        </div>
                    `).join("")}
                </div>
            </div>
        </article>

        <article class="dashboard-card recent-card">
            <header class="dashboard-card__header">
                <h2 class="dashboard-card__title">Recent Maintenance</h2>
                <a class="card-link" href="#/services">
                    View All <i class="fa-solid fa-chevron-right"></i>
                </a>
            </header>

            <div class="recent-content">
                <div class="recent-icon">
                    <i class="fa-solid fa-wrench"></i>
                </div>
                <div>
                    <div class="recent-name">
                        ${data.services[0]?.name || "No maintenance yet"}
                    </div>
                    <div class="recent-meta">
                        ${data.services[0]
                            ? `${formatNumber(data.services[0].odometer)} km • ${data.services[0].date}`
                            : "Add your first service"}
                    </div>
                    <div class="recent-price">
                        ${data.services[0] ? `${formatNumber(data.services[0].cost)} DA` : "—"}
                    </div>
                </div>
            </div>
        </article>

        <article class="dashboard-card cost-card">
            <header class="dashboard-card__header">
                <h2 class="dashboard-card__title">This Month Cost</h2>
                <button class="cost-card__menu" type="button" aria-label="More options">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </header>

            <div class="cost-value">${formatNumber(data.monthlyCost)} DA</div>
            <div class="cost-change">
                <i class="fa-solid fa-arrow-down"></i>18%
            </div>
            <div class="cost-note">vs last month</div>
        </article>
    `;
}

export function mount() {
    dashboardRoot = document.createElement("section");
    dashboardRoot.className = "dashboard";

    renderDashboard();

    unsubscribe = appStore.subscribe(() => {
        renderDashboard();
    });

    return dashboardRoot;
}

export function unmount() {
    unsubscribe?.();
    unsubscribe = null;
    dashboardRoot = null;
}

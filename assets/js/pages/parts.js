/* =========================================================
   CarCare — Parts Catalog
   PHASE 11 — Redesigned Parts Catalog
   ========================================================= */

import { appStore, addPart } from "../state/index.js";

var pageRoot = null;
var unsubscribe = null;
var searchTerm = "";
var categoryFilter = "all";
var formOpen = false;
var editingId = null;
var pickerMode = null;
var pendingIcon = "";
var pendingCategory = "Engine";
var pendingColor = "";
var iconSearch = "";

var CATEGORIES = ["Engine", "Chassis", "Electrical", "Body", "Other"];

var DEFAULT_BRANDS = [
    "Bosch", "MANN", "NGK", "Brembo", "TRW", "Valeo", "Febi", "SKF",
    "Continental", "Mahle", "OEM", "Other"
];

var PART_COLORS = [
    { name: "Clear Blue", value: "#5AA9F5" },
    { name: "Fresh Green", value: "#58C98A" },
    { name: "Soft Violet", value: "#9A7BE8" },
    { name: "Warm Peach", value: "#F49A68" },
    { name: "Soft Amber", value: "#EFC54E" },
    { name: "Rose", value: "#E97FA8" },
    { name: "Mint", value: "#4EC9B4" },
    { name: "Cool Blue Gray", value: "#8EA8C4" },
    { name: "Teal", value: "#45C4D1" },
    { name: "Sky Blue", value: "#6EA9E8" }
];

var PART_ICONS = [
    { group: "General", icon: "fa-solid fa-puzzle-piece", label: "Part" },
    { group: "Engine", icon: "fa-solid fa-gears", label: "Engine" },
    { group: "Engine", icon: "fa-solid fa-oil-can", label: "Oil" },
    { group: "Engine", icon: "fa-solid fa-filter", label: "Filter" },
    { group: "Engine", icon: "fa-solid fa-fan", label: "Cooling" },
    { group: "Engine", icon: "fa-solid fa-gauge-high", label: "Gauge" },
    { group: "Engine", icon: "fa-solid fa-wind", label: "Air" },
    { group: "Engine", icon: "fa-solid fa-temperature-half", label: "Temperature" },
    { group: "Chassis", icon: "fa-solid fa-car-side", label: "Chassis" },
    { group: "Chassis", icon: "fa-solid fa-circle-stop", label: "Brake" },
    { group: "Chassis", icon: "fa-solid fa-arrows-up-down", label: "Suspension" },
    { group: "Chassis", icon: "fa-solid fa-dharmachakra", label: "Steering" },
    { group: "Chassis", icon: "fa-solid fa-circle", label: "Wheel" },
    { group: "Chassis", icon: "fa-solid fa-sliders", label: "Transmission" },
    { group: "Chassis", icon: "fa-solid fa-screwdriver-wrench", label: "Repair" },
    { group: "Electrical", icon: "fa-solid fa-bolt", label: "Electrical" },
    { group: "Electrical", icon: "fa-solid fa-car-battery", label: "Battery" },
    { group: "Electrical", icon: "fa-solid fa-lightbulb", label: "Light" },
    { group: "Electrical", icon: "fa-solid fa-plug", label: "Plug" },
    { group: "Electrical", icon: "fa-solid fa-microchip", label: "Module" },
    { group: "Electrical", icon: "fa-solid fa-toggle-on", label: "Switch" },
    { group: "Body", icon: "fa-solid fa-car", label: "Body" },
    { group: "Body", icon: "fa-solid fa-door-open", label: "Door" },
    { group: "Body", icon: "fa-solid fa-car-rear", label: "Rear" },
    { group: "Body", icon: "fa-solid fa-window-maximize", label: "Window" },
    { group: "Body", icon: "fa-solid fa-snowflake", label: "AC" },
    { group: "Other", icon: "fa-solid fa-wrench", label: "Tool" },
    { group: "Other", icon: "fa-solid fa-screwdriver", label: "Hardware" },
    { group: "Other", icon: "fa-solid fa-circle-question", label: "Other" }
];

var CATEGORY_ICONS = {
    Engine: "fa-solid fa-gears",
    Chassis: "fa-solid fa-car-side",
    Electrical: "fa-solid fa-bolt",
    Body: "fa-solid fa-car",
    Other: "fa-solid fa-puzzle-piece"
};

var CATEGORY_COLORS = {
    All: "#087FF5",
    Engine: "#087FF5",
    Chassis: "#EF5350",
    Electrical: "#7C4DFF",
    Body: "#19A974",
    Other: "#C58A2A"
};

function getCategoryColor(category) {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
}

var STATUS_OPTIONS = [
    { value: "good", label: "Good", icon: "fa-solid fa-circle-check", className: "is-good" },
    { value: "due-soon", label: "Due Soon", icon: "fa-solid fa-clock", className: "is-warning" },
    { value: "overdue", label: "Overdue", icon: "fa-solid fa-circle-exclamation", className: "is-danger" },
    { value: "attention", label: "Needs Attention", icon: "fa-solid fa-triangle-exclamation", className: "is-attention" }
];

function escapeHtml(value) {
    value = value == null ? "" : String(value);
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getParts() {
    var state = appStore.getState();
    return Array.isArray(state.parts) ? state.parts : [];
}

function getBrands() {
    var state = appStore.getState();
    return Array.isArray(state.partBrands) && state.partBrands.length ? state.partBrands : DEFAULT_BRANDS;
}

function normalizeCategory(category) {
    return CATEGORIES.indexOf(category) !== -1 ? category : "Other";
}

function getDefaultIcon(category) {
    return CATEGORY_ICONS[normalizeCategory(category || "Other")] || CATEGORY_ICONS.Other;
}

function getPartIcon(part) {
    return part && part.icon ? part.icon : getDefaultIcon(part && part.category);
}

function getPartColor(part) {
    var value = part && part.color;
    for (var i = 0; i < PART_COLORS.length; i += 1) {
        if (PART_COLORS[i].value === value) return value;
    }
    return getCategoryColor(normalizeCategory(part && part.category));
}

function getStatus(value) {
    for (var i = 0; i < STATUS_OPTIONS.length; i += 1) {
        if (STATUS_OPTIONS[i].value === value) return STATUS_OPTIONS[i];
    }
    return STATUS_OPTIONS[0];
}

function formatLifespan(part) {
    if (!part || !part.lifespan) return "No lifespan set";
    var value = Number(part.lifespan);
    if (!value || value < 0) return "No lifespan set";
    var unit = part.lifespanUnit || "km";
    return value.toLocaleString() + " " + unit;
}

function filteredParts() {
    return getParts().filter(function (part) {
        var category = normalizeCategory(part.category);
        var status = getStatus(part.status).label;
        var haystack = (part.name || "") + " " + category + " " + (part.brand || "") + " " + (part.note || "") + " " + status;
        var matchesSearch = !searchTerm || haystack.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
        var matchesCategory = categoryFilter === "all" || category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
}

function render() {
    if (!pageRoot) return;

    var parts = getParts();
    var visible = filteredParts();

    pageRoot.innerHTML = '' +
        '<div class="parts-pagebar">' +
            '<div class="parts-pagebar__identity">' +
                '<div class="parts-pagebar__icon"><i class="fa-solid fa-box-open"></i></div>' +
                '<div><h1 class="parts-pagebar__title">Parts</h1><p class="parts-pagebar__subtitle">Manage your vehicle parts catalog</p></div>' +
            '</div>' +
            '<button class="parts-add-header" type="button" data-add aria-label="Add new part"><i class="fa-solid fa-plus"></i><span>Add Part</span></button>' +
        '</div>' +

        '<nav class="parts-category-tabs" aria-label="Part categories">' +
            '<button class="parts-category-tab ' + (categoryFilter === "all" ? "is-active" : "") + '" data-category="all" style="--tab-color:' + getCategoryColor("All") + ';"><i class="fa-solid fa-layer-group"></i><span>All</span></button>' +
            CATEGORIES.map(function (category) {
                return '<button class="parts-category-tab ' + (categoryFilter === category ? "is-active" : "") + '" data-category="' + escapeHtml(category) + '" style="--tab-color:' + getCategoryColor(category) + ';"><i class="' + escapeHtml(CATEGORY_ICONS[category]) + '"></i><span>' + escapeHtml(category) + '</span></button>';
            }).join('') +
        '</nav>' +

        '<section class="parts-search-row">' +
            '<label class="parts-search">' +
                '<i class="fa-solid fa-magnifying-glass"></i>' +
                '<input data-search type="search" value="' + escapeHtml(searchTerm) + '" placeholder="Search parts..." aria-label="Search parts">' +
            '</label>' +
        '</section>' +

        '<section class="parts-list-card">' +
            '<header class="parts-list-card__header">' +
                '<div><h2>Parts</h2><span>' + visible.length + ' of ' + parts.length + '</span></div>' +
            '</header>' +
            '<div class="parts-list">' + (visible.length ? visible.map(renderPartRow).join('') : renderEmptyState()) + '</div>' +
        '</section>' +

        renderFormModal() +
        renderCategoryModal() +
        renderIconModal() +
        renderColorModal() +
        renderFilterModal();

    bindEvents();
}

function renderPartRow(part) {
    var category = normalizeCategory(part.category);
    var brand = part.brand || "No brand";
    var note = part.note || "";
    var icon = getPartIcon(part);
    var color = getPartColor(part);
    var status = getStatus(part.status);

    return '' +
        '<article class="part-row" data-edit="' + escapeHtml(part.id) + '">' +
            '<div class="part-row__icon" aria-hidden="true">' +
                '<i class="' + escapeHtml(icon) + '" style="color:' + escapeHtml(color) + ';"></i>' +
            '</div>' +
            '<div class="part-row__content">' +
                '<div class="part-row__title-line"><h3>' + escapeHtml(part.name || "Unnamed Part") + '</h3></div>' +
                '<div class="part-row__subline"><span>' + escapeHtml(category) + '</span><b>•</b><span>' + escapeHtml(brand) + '</span></div>' +
                '<div class="part-row__details"><span><i class="fa-regular fa-clock"></i> ' + escapeHtml(formatLifespan(part)) + '</span>' + (note ? '<span class="part-row__note">' + escapeHtml(note) + '</span>' : '') + '</div>' +
            '</div>' +
            '<div class="part-row__status"><span class="part-status ' + status.className + '">' + escapeHtml(status.label) + '</span></div>' +
            '<div class="part-row__actions">' +
                '<button class="part-action" type="button" data-edit-button="' + escapeHtml(part.id) + '" aria-label="Edit part"><i class="fa-solid fa-pen"></i></button>' +
                '<button class="part-delete" type="button" data-delete="' + escapeHtml(part.id) + '" aria-label="Delete part"><i class="fa-regular fa-trash-can"></i></button>' +
            '</div>' +
        '</article>';
}

function renderEmptyState() {
    return '' +
        '<div class="part-empty">' +
            '<div class="part-empty__icon"><i class="fa-solid fa-box-open"></i></div>' +
            '<div class="part-empty__title">No parts found</div>' +
            '<div class="part-empty__text">Add a part to your vehicle parts catalog.</div>' +
            '<button class="parts-secondary-button" type="button" data-empty-add><i class="fa-solid fa-plus"></i> Add Part</button>' +
        '</div>';
}

function getEditingPart() {
    var parts = getParts();
    for (var i = 0; i < parts.length; i += 1) {
        if (parts[i].id === editingId) return parts[i];
    }
    return null;
}

function renderFormModal() {
    if (!formOpen) return '';

    var current = getEditingPart();
    var icon = pendingIcon || (current && current.icon) || getDefaultIcon(current && current.category);
    var color = pendingColor || (current && current.color) || getCategoryColor(normalizeCategory(pendingCategory));
    var brands = getBrands();
    var statusValue = current && current.status ? current.status : "good";
    var lifespan = current && current.lifespan ? current.lifespan : "10000";
    var lifespanUnit = current && current.lifespanUnit ? current.lifespanUnit : "km";
    var alertBefore = current && current.alertBefore ? current.alertBefore : "1000";
    var alertUnit = current && current.alertUnit ? current.alertUnit : lifespanUnit;

    return '' +
        '<div class="parts-modal is-open" data-form-modal>' +
            '<div class="parts-modal__backdrop" data-close-form></div>' +
            '<div class="parts-modal__dialog parts-form-dialog" role="dialog" aria-modal="true" aria-labelledby="part-form-title">' +
                '<form data-form>' +
                    '<header class="parts-form-header">' +
                        '<div class="parts-form-heading">' +
                            '<div class="parts-form-heading__icon"><i class="' + escapeHtml(icon) + '" style="color:' + escapeHtml(color) + ';"></i></div>' +
                            '<div><h2 id="part-form-title">' + (current ? 'Edit Part' : 'Add New Part') + '</h2><p>' + (current ? 'Update the part details.' : 'Add a new part to your vehicle catalog.') + '</p></div>' +
                        '</div>' +
                        '<button class="parts-modal-close" type="button" data-close-form aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
                    '</header>' +

                    '<div class="parts-form-body">' +
                        '<div class="form-field form-field--full"><label for="part-name">Part Name <em>*</em></label><input id="part-name" name="name" required maxlength="80" value="' + escapeHtml(current && current.name ? current.name : '') + '" placeholder="e.g. Engine Oil, Brake Pads..."></div>' +

                        '<div class="form-field"><label>Category <em>*</em></label><button class="picker-select" type="button" data-open-category><span><i class="' + escapeHtml(getDefaultIcon(current && current.category)) + '"></i>' + escapeHtml(pendingCategory) + '</span><i class="fa-solid fa-chevron-down"></i></button></div>' +

                        '<div class="form-field"><label>Icon &amp; Color <em>*</em></label><div class="icon-color-control"><button class="icon-select-button" type="button" data-open-icon aria-label="Choose icon"><i class="' + escapeHtml(icon) + '" style="color:' + escapeHtml(color) + ';"></i></button><button class="color-select-button" type="button" data-open-color aria-label="Choose color"><span style="background:' + escapeHtml(color) + ';"></span><i class="fa-solid fa-chevron-down"></i></button></div></div>' +

                        '<div class="form-field form-field--full"><label for="part-brand">Brand</label><div class="select-wrap"><select id="part-brand" name="brand"><option value="">Select brand</option>' + brands.map(function (brand) { return '<option value="' + escapeHtml(brand) + '"' + (current && current.brand === brand ? ' selected' : '') + '>' + escapeHtml(brand) + '</option>'; }).join('') + '</select><i class="fa-solid fa-chevron-down"></i></div></div>' +

                        '<div class="form-field form-field--full"><label for="part-note">Note</label><textarea id="part-note" name="note" maxlength="200" placeholder="Add a short note about this part...">' + escapeHtml(current && current.note ? current.note : '') + '</textarea><span class="field-counter">Optional</span></div>' +

                        '<div class="form-section-title"><span>Part Lifespan</span><i class="fa-solid fa-circle-info" title="Expected replacement interval"></i></div>' +
                        '<div class="form-field"><label for="part-lifespan">Replacement Interval</label><div class="input-unit"><input id="part-lifespan" name="lifespan" inputmode="numeric" type="number" min="0" step="1" value="' + escapeHtml(lifespan) + '"><div class="select-wrap"><select id="part-lifespan-unit" name="lifespanUnit"><option value="km"' + (lifespanUnit === 'km' ? ' selected' : '') + '>km</option><option value="months"' + (lifespanUnit === 'months' ? ' selected' : '') + '>months</option><option value="years"' + (lifespanUnit === 'years' ? ' selected' : '') + '>years</option></select><i class="fa-solid fa-chevron-down"></i></div></div></div>' +
                        '<div class="form-field"><label for="part-alert">Alert Before</label><div class="input-unit"><input id="part-alert" name="alertBefore" inputmode="numeric" type="number" min="0" step="1" value="' + escapeHtml(alertBefore) + '"><div class="select-wrap"><select id="part-alert-unit" name="alertUnit"><option value="km"' + (alertUnit === 'km' ? ' selected' : '') + '>km</option><option value="months"' + (alertUnit === 'months' ? ' selected' : '') + '>months</option><option value="years"' + (alertUnit === 'years' ? ' selected' : '') + '>years</option></select><i class="fa-solid fa-chevron-down"></i></div></div></div>' +

                        '<div class="form-field form-field--full"><label for="part-status">Current Status</label><div class="status-select-wrap"><select id="part-status" name="status">' + STATUS_OPTIONS.map(function (item) { return '<option value="' + item.value + '"' + (statusValue === item.value ? ' selected' : '') + '>' + item.label + '</option>'; }).join('') + '</select><i class="fa-solid fa-chevron-down"></i></div></div>' +
                    '</div>' +

                    '<footer class="parts-form-footer"><button class="parts-secondary-button parts-footer-button" type="button" data-close-form>Cancel</button><button class="parts-primary-button parts-footer-button" type="submit"><i class="fa-regular fa-floppy-disk"></i> ' + (current ? 'Save Changes' : 'Save Part') + '</button></footer>' +
                '</form>' +
            '</div>' +
        '</div>';
}

function renderCategoryModal() {
    if (pickerMode !== 'category') return '';

    var current = getEditingPart();
    var selected = pendingCategory;
    var descriptions = {
        Engine: "Engine parts and related components",
        Chassis: "Brakes, suspension and steering",
        Electrical: "Electrical system components",
        Body: "Body, interior and exterior parts",
        Other: "Other parts and accessories"
    };

    return '' +
        '<div class="parts-modal is-open" data-picker-modal>' +
            '<div class="parts-modal__backdrop" data-close-picker></div>' +
            '<div class="parts-modal__dialog parts-picker-dialog category-dialog" role="dialog" aria-modal="true" aria-labelledby="category-title">' +
                '<header class="picker-header"><div class="picker-title"><span class="picker-title-icon"><i class="fa-regular fa-folder-open"></i></span><h3 id="category-title">Select Category</h3></div><button type="button" data-close-picker aria-label="Close"><i class="fa-solid fa-xmark"></i></button></header>' +
                '<div class="category-grid">' + CATEGORIES.map(function (category) {
                    var active = category === selected ? ' is-selected' : '';
                    return '<button type="button" class="category-card ' + active + '" data-category-pick="' + escapeHtml(category) + '"><span class="category-card__icon"><i class="' + escapeHtml(CATEGORY_ICONS[category]) + '"></i></span><strong>' + escapeHtml(category) + '</strong><small>' + escapeHtml(descriptions[category]) + '</small></button>';
                }).join('') + '</div>' +
            '</div>' +
        '</div>';
}

function renderIconModal() {
    if (pickerMode !== 'icon') return '';

    var query = iconSearch.trim().toLowerCase();
    var filtered = PART_ICONS.filter(function (item) {
        var text = item.label + ' ' + item.group + ' ' + item.icon;
        return !query || text.toLowerCase().indexOf(query) !== -1;
    });

    return '' +
        '<div class="parts-modal is-open" data-picker-modal>' +
            '<div class="parts-modal__backdrop" data-close-picker></div>' +
            '<div class="parts-modal__dialog parts-picker-dialog icon-dialog" role="dialog" aria-modal="true" aria-labelledby="icon-title">' +
                '<header class="picker-header"><div class="picker-title"><span class="picker-title-icon"><i class="fa-regular fa-face-smile"></i></span><h3 id="icon-title">Choose Icon</h3></div><button type="button" data-close-picker aria-label="Close"><i class="fa-solid fa-xmark"></i></button></header>' +
                '<label class="icon-search"><i class="fa-solid fa-magnifying-glass"></i><input data-icon-search type="search" value="' + escapeHtml(iconSearch) + '" placeholder="Search icons..."></label>' +
                '<div class="icon-filter-tabs">' + ['All', 'Engine', 'Chassis', 'Electrical', 'Body', 'Other'].map(function (item) { return '<button type="button" class="icon-filter-tab ' + (item === 'All' ? 'is-active' : '') + '">' + item + '</button>'; }).join('') + '</div>' +
                '<div class="icon-grid">' + (filtered.length ? filtered.map(function (item) { return '<button type="button" class="icon-option ' + (pendingIcon === item.icon ? 'is-selected' : '') + '" data-icon-value="' + escapeHtml(item.icon) + '" title="' + escapeHtml(item.label) + '"><i class="' + escapeHtml(item.icon) + '"></i></button>'; }).join('') : '<div class="icon-empty"><i class="fa-solid fa-magnifying-glass"></i><strong>No icons found</strong></div>') + '</div>' +
            '</div>' +
        '</div>';
}

function renderColorModal() {
    if (pickerMode !== 'color') return '';

    return '' +
        '<div class="parts-modal is-open" data-picker-modal>' +
            '<div class="parts-modal__backdrop" data-close-picker></div>' +
            '<div class="parts-modal__dialog parts-picker-dialog color-dialog" role="dialog" aria-modal="true" aria-labelledby="color-title">' +
                '<header class="picker-header"><div class="picker-title"><span class="picker-title-icon"><i class="fa-solid fa-palette"></i></span><h3 id="color-title">Choose Color</h3></div><button type="button" data-close-picker aria-label="Close"><i class="fa-solid fa-xmark"></i></button></header>' +
                '<div class="color-grid">' + PART_COLORS.map(function (item) { return '<button type="button" class="color-option ' + (pendingColor === item.value ? 'is-selected' : '') + '" data-color="' + item.value + '" style="--swatch:' + item.value + ';" aria-label="' + escapeHtml(item.name) + '"><span></span></button>'; }).join('') + '</div>' +
                '<button type="button" class="use-category-color" data-category-color><i class="fa-solid fa-layer-group"></i><span>Use Category Color</span><i class="fa-solid fa-rotate-left"></i></button>' +
            '</div>' +
        '</div>';
}

function renderFilterModal() {
    if (pickerMode !== 'filter') return '';

    return '' +
        '<div class="parts-modal is-open" data-picker-modal>' +
            '<div class="parts-modal__backdrop" data-close-picker></div>' +
            '<div class="parts-modal__dialog parts-picker-dialog filter-dialog" role="dialog" aria-modal="true" aria-labelledby="filter-title">' +
                '<header class="picker-header"><div class="picker-title"><span class="picker-title-icon"><i class="fa-solid fa-sliders"></i></span><h3 id="filter-title">Filter Parts</h3></div><button type="button" data-close-picker aria-label="Close"><i class="fa-solid fa-xmark"></i></button></header>' +
                '<div class="filter-options">' +
                    '<button type="button" class="filter-option ' + (categoryFilter === 'all' ? 'is-selected' : '') + '" data-filter-category="all"><span>All Categories</span><i class="fa-solid fa-check"></i></button>' +
                    CATEGORIES.map(function (category) { return '<button type="button" class="filter-option ' + (categoryFilter === category ? 'is-selected' : '') + '" data-filter-category="' + escapeHtml(category) + '"><span>' + escapeHtml(category) + '</span><i class="fa-solid fa-check"></i></button>'; }).join('') +
                '</div>' +
            '</div>' +
        '</div>';
}

function openForm(id) {
    editingId = id || null;
    var current = null;
    var parts = getParts();
    for (var i = 0; i < parts.length; i += 1) {
        if (parts[i].id === editingId) { current = parts[i]; break; }
    }
    pendingIcon = current && current.icon ? current.icon : "";
    pendingCategory = current && current.category ? normalizeCategory(current.category) : "Engine";
    pendingColor = current && current.color ? current.color : "";
    iconSearch = "";
    pickerMode = null;
    formOpen = true;
    render();
    var nameField = pageRoot.querySelector('#part-name');
    if (nameField) nameField.focus();
}

function closeForm() {
    formOpen = false;
    editingId = null;
    pickerMode = null;
    pendingIcon = "";
    pendingCategory = "Engine";
    pendingColor = "";
    iconSearch = "";
    render();
}

function bindEvents() {
    var search = pageRoot.querySelector('[data-search]');
    if (search) {
        search.addEventListener('input', function (event) {
            searchTerm = event.target.value;
            render();
            var next = pageRoot.querySelector('[data-search]');
            if (next) {
                next.focus();
                next.setSelectionRange(searchTerm.length, searchTerm.length);
            }
        });
    }

    pageRoot.querySelectorAll('[data-category]').forEach(function (button) {
        button.addEventListener('click', function () {
            categoryFilter = button.getAttribute('data-category') || 'all';
            render();
        });
    });

    var addButton = pageRoot.querySelector('[data-add]');
    if (addButton) addButton.addEventListener('click', function () { openForm(); });

    var emptyAdd = pageRoot.querySelector('[data-empty-add]');
    if (emptyAdd) emptyAdd.addEventListener('click', function () { openForm(); });

    var filterOpen = pageRoot.querySelector('[data-filter-open]');
    if (filterOpen) filterOpen.addEventListener('click', function () { pickerMode = 'filter'; render(); });

    pageRoot.querySelectorAll('[data-edit-button]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            openForm(button.getAttribute('data-edit-button'));
        });
    });

    pageRoot.querySelectorAll('.part-row[data-edit]').forEach(function (row) {
        var touchStartX = 0;
        var touchStartY = 0;
        var touchMoved = false;

        row.addEventListener('touchstart', function (event) {
            if (!event.touches || !event.touches.length) return;
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            touchMoved = false;
        }, { passive: true });

        row.addEventListener('touchmove', function (event) {
            if (!event.touches || !event.touches.length) return;
            var dx = event.touches[0].clientX - touchStartX;
            var dy = event.touches[0].clientY - touchStartY;
            if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
                touchMoved = true;
                if (dx < -35) {
                    pageRoot.querySelectorAll('.part-row.is-swiped').forEach(function (other) {
                        if (other !== row) other.classList.remove('is-swiped');
                    });
                    row.classList.add('is-swiped');
                } else if (dx > 35) {
                    row.classList.remove('is-swiped');
                }
            }
        }, { passive: true });

        row.addEventListener('touchend', function () {
            if (touchMoved) {
                row.setAttribute('data-swipe-guard', 'true');
                window.setTimeout(function () { row.removeAttribute('data-swipe-guard'); }, 80);
            }
        }, { passive: true });

        row.addEventListener('click', function () {
            if (row.getAttribute('data-swipe-guard') === 'true') return;
            if (row.classList.contains('is-swiped')) {
                row.classList.remove('is-swiped');
                return;
            }
            openForm(row.getAttribute('data-edit'));
        });
    });

    pageRoot.querySelectorAll('[data-delete]').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            var id = button.getAttribute('data-delete');
            if (!window.confirm('Delete this part from your catalog?')) return;
            appStore.setState(function (state) {
                return { parts: state.parts.filter(function (part) { return part.id !== id; }) };
            });
        });
    });

    pageRoot.querySelectorAll('[data-close-form]').forEach(function (button) {
        button.addEventListener('click', closeForm);
    });

    var form = pageRoot.querySelector('[data-form]');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var data = new FormData(form);
            var name = String(data.get('name') || '').trim();
            var category = pendingCategory || "Engine";
            var brand = String(data.get('brand') || '').trim();
            var note = String(data.get('note') || '').trim();
            var lifespan = String(data.get('lifespan') || '').trim();
            var lifespanUnit = String(data.get('lifespanUnit') || 'km');
            var alertBefore = String(data.get('alertBefore') || '').trim();
            var alertUnit = String(data.get('alertUnit') || lifespanUnit);
            var status = String(data.get('status') || 'good');

            if (!name) return;

            var current = getEditingPart();
            var part = {
                name: name,
                category: category,
                brand: brand,
                note: note,
                icon: pendingIcon || (current && current.icon ? current.icon : ''),
                color: pendingColor || "",
                lifespan: lifespan,
                lifespanUnit: lifespanUnit,
                alertBefore: alertBefore,
                alertUnit: alertUnit,
                status: status
            };

            if (editingId) {
                appStore.setState(function (state) {
                    return { parts: state.parts.map(function (item) { return item.id === editingId ? Object.assign({}, item, part) : item; }) };
                });
            } else {
                addPart(part);
            }

            closeForm();
        });
    }

    var categoryButton = pageRoot.querySelector('[data-open-category]');
    if (categoryButton) categoryButton.addEventListener('click', function () { pickerMode = 'category'; render(); });

    var iconButton = pageRoot.querySelector('[data-open-icon]');
    if (iconButton) iconButton.addEventListener('click', function () { pickerMode = 'icon'; iconSearch = ''; render(); var input = pageRoot.querySelector('[data-icon-search]'); if (input) input.focus(); });

    var colorButton = pageRoot.querySelector('[data-open-color]');
    if (colorButton) colorButton.addEventListener('click', function () { pickerMode = 'color'; render(); });

    var categoryColorButton = pageRoot.querySelector('[data-category-color]');
    if (categoryColorButton) categoryColorButton.addEventListener('click', function () { pendingColor = ""; pickerMode = null; render(); });

    pageRoot.querySelectorAll('[data-close-picker]').forEach(function (button) {
        button.addEventListener('click', function () { pickerMode = null; render(); });
    });

    pageRoot.querySelectorAll('[data-category-pick]').forEach(function (button) {
        button.addEventListener('click', function () {
            var category = button.getAttribute('data-category-pick') || 'Other';
            pendingCategory = category;
            pickerMode = null;
            render();
        });
    });

    var iconSearchInput = pageRoot.querySelector('[data-icon-search]');
    if (iconSearchInput) {
        iconSearchInput.addEventListener('input', function (event) {
            iconSearch = event.target.value;
            render();
            var next = pageRoot.querySelector('[data-icon-search]');
            if (next) { next.focus(); next.setSelectionRange(iconSearch.length, iconSearch.length); }
        });
    }

    pageRoot.querySelectorAll('[data-icon-value]').forEach(function (button) {
        button.addEventListener('click', function () {
            pendingIcon = button.getAttribute('data-icon-value') || '';
            pickerMode = null;
            iconSearch = '';
            render();
        });
    });

    pageRoot.querySelectorAll('[data-color]').forEach(function (button) {
        button.addEventListener('click', function () {
            pendingColor = button.getAttribute('data-color') || PART_COLORS[0].value;
            pickerMode = null;
            render();
        });
    });

    pageRoot.querySelectorAll('[data-filter-category]').forEach(function (button) {
        button.addEventListener('click', function () {
            categoryFilter = button.getAttribute('data-filter-category') || 'all';
            pickerMode = null;
            render();
        });
    });

}

export function mount() {
    pageRoot = document.createElement('section');
    pageRoot.className = 'parts-page';
    render();
    unsubscribe = appStore.subscribe(function () {
        if (pageRoot && !pickerMode) render();
    });
    return pageRoot;
}

export function unmount() {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
    pageRoot = null;
    searchTerm = '';
    categoryFilter = 'all';
    formOpen = false;
    editingId = null;
    pickerMode = null;
    pendingIcon = '';
    pendingColor = "";
    iconSearch = '';
    pendingCategory = "Engine";
}

/* =========================================================
   CarCare — Derived State / Dashboard Selectors
   ========================================================= */

export function selectDashboard(state) {
    const vehicle = state.vehicles[0] || null;
    const vehicleId = vehicle?.id;

    const parts = state.parts.filter((part) => part.vehicleId === vehicleId);
    const services = state.services.filter((service) => service.vehicleId === vehicleId);
    const costs = state.costs.filter((cost) => cost.vehicleId === vehicleId);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const monthlyCost = costs
        .filter((cost) => cost.date?.startsWith(currentMonth))
        .reduce((sum, cost) => sum + Number(cost.amount || 0), 0);

    const totalCost = costs.reduce(
        (sum, cost) => sum + Number(cost.amount || 0),
        0
    );

    return {
        vehicle,
        parts,
        services,
        costs,
        partsCount: parts.length,
        servicesThisYear: services.filter((service) => {
            return service.date?.startsWith(String(new Date().getFullYear()));
        }).length,
        totalCost,
        monthlyCost
    };
}

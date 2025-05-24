export function transformAppliedFiltersToArray(appliedFiltersObject) {
  if (!appliedFiltersObject || typeof appliedFiltersObject !== "object") {
    return [];
  }

  return Object.entries(appliedFiltersObject).map(
    ([filterName, filterData]) => ({
      name: filterName,
      status: filterData.status,
      explanation: filterData.explanation,
    })
  );
}

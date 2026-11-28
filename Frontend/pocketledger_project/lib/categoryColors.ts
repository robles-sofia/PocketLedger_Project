import { mockCategories } from "../mocks/categories";

const defaultColors = new Map<number, string>();
for (const category of mockCategories) {
  defaultColors.set(category.id, category.color);
}

const extraColors = ["#1E3A8A", "#A0401A", "#1E6B3A", "#6B2D5C", "#8C6D1F", "#0B5D63", "#8B1E3F", "#7A8B1F"];

export function categoryColorForId(id: number) {
  const color = defaultColors.get(id);
  if (color) {
    return color;
  }
  return extraColors[id % extraColors.length];
}

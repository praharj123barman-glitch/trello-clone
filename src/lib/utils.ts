import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BOARD_COLORS = [
  { name: "Blue", value: "#0079bf" },
  { name: "Orange", value: "#d29034" },
  { name: "Green", value: "#519839" },
  { name: "Red", value: "#b04632" },
  { name: "Purple", value: "#89609e" },
  { name: "Pink", value: "#cd5a91" },
  { name: "Teal", value: "#4bbf6b" },
  { name: "Sky", value: "#00aecc" },
  { name: "Grey", value: "#838c91" },
];

export const LABEL_COLORS = [
  { name: "Green", value: "#61bd4f" },
  { name: "Yellow", value: "#f2d600" },
  { name: "Orange", value: "#ff9f1a" },
  { name: "Red", value: "#eb5a46" },
  { name: "Purple", value: "#c377e0" },
  { name: "Blue", value: "#0079bf" },
  { name: "Sky", value: "#00c2e0" },
  { name: "Lime", value: "#51e898" },
  { name: "Pink", value: "#ff78cb" },
  { name: "Black", value: "#344563" },
];

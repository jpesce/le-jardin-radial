import { parseMonths } from "./months.js";

const raw = [
  {
    id: "snowdrop",
    name: "Snowdrop",
    colors: { blooming: "#F0F0F0" },
    months: { "1-2": "blooming", "3": "foliage", "4": "dormant", "5-12": "dormant" },
  },
  {
    id: "crocus",
    name: "Crocus",
    colors: { blooming: "#9B59B6" },
    months: { "1": "dormant", "2-3": "blooming", "4": "foliage", "5-12": "dormant" },
  },
  {
    id: "daffodil",
    name: "Daffodil",
    colors: { blooming: "#F1C40F" },
    months: { "1": "dormant", "2": "sprouting", "3-4": "blooming", "5": "foliage", "6-12": "dormant" },
  },
  {
    id: "hyacinth",
    name: "Hyacinth",
    colors: { blooming: "#5B9BD5" },
    months: { "1": "dormant", "2": "sprouting", "3-4": "blooming", "5": "foliage", "6-12": "dormant" },
  },
  {
    id: "tulip",
    name: "Tulip",
    colors: { blooming: "#E74C3C" },
    months: { "1-2": "dormant", "3": "sprouting", "4-5": "blooming", "6": "foliage", "7-12": "dormant" },
  },
  {
    id: "pansy",
    name: "Pansy",
    colors: { blooming: "#8E44AD" },
    months: { "1-2": "dormant", "3-5": "blooming", "6-8": "foliage", "9-11": "blooming", "12": "dormant" },
  },
  {
    id: "iris",
    name: "Iris",
    colors: { blooming: "#6C5CE7" },
    months: { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-6": "blooming", "7-10": "foliage", "11-12": "dormant" },
  },
  {
    id: "peony",
    name: "Peony",
    colors: { blooming: "#FDA7DF" },
    months: { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-6": "blooming", "7-9": "foliage", "10-12": "dormant" },
  },
  {
    id: "rose",
    name: "Rose",
    colors: { blooming: "#FF6B81" },
    months: { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-10": "blooming", "11": "foliage", "12": "dormant" },
  },
  {
    id: "lavender",
    name: "Lavender",
    colors: { blooming: "#A29BFE" },
    months: { "1-2": "dormant", "3": "sprouting", "4-5": "foliage", "6-8": "blooming", "9-10": "foliage", "11-12": "dormant" },
  },
  {
    id: "lily",
    name: "Lily",
    colors: { blooming: "#FFEAA7" },
    months: { "1-2": "dormant", "3": "sprouting", "4-5": "foliage", "6-8": "blooming", "9-10": "foliage", "11-12": "dormant" },
  },
  {
    id: "marigold",
    name: "Marigold",
    colors: { blooming: "#E67E22" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-10": "blooming", "11-12": "dormant" },
  },
  {
    id: "cosmos",
    name: "Cosmos",
    colors: { blooming: "#FD79A8" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-10": "blooming", "11-12": "dormant" },
  },
  {
    id: "zinnia",
    name: "Zinnia",
    colors: { blooming: "#D63031" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-9": "blooming", "10": "foliage", "11-12": "dormant" },
  },
  {
    id: "sunflower",
    name: "Sunflower",
    colors: { blooming: "#FDCB6E" },
    months: { "1-3": "dormant", "4": "sprouting", "5-6": "foliage", "7-9": "blooming", "10": "foliage", "11-12": "dormant" },
  },
  {
    id: "black-eyed-susan",
    name: "Black-eyed Susan",
    colors: { blooming: "#F9CA24" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-9": "blooming", "10": "foliage", "11-12": "dormant" },
  },
  {
    id: "dahlia",
    name: "Dahlia",
    colors: { blooming: "#E056A0" },
    months: { "1-3": "dormant", "4": "sprouting", "5-6": "foliage", "7-10": "blooming", "11-12": "dormant" },
  },
  {
    id: "aster",
    name: "Aster",
    colors: { blooming: "#A855F7" },
    months: { "1-3": "dormant", "4": "sprouting", "5-7": "foliage", "8-10": "blooming", "11-12": "dormant" },
  },
  {
    id: "chrysanthemum",
    name: "Chrysanthemum",
    colors: { blooming: "#F39C12" },
    months: { "1-3": "dormant", "4": "sprouting", "5-8": "foliage", "9-11": "blooming", "12": "dormant" },
  },
  {
    id: "hellebore",
    name: "Hellebore",
    colors: { blooming: "#A3CB38" },
    months: { "1-3": "blooming", "4-5": "foliage", "6-10": "dormant", "11": "sprouting", "12": "blooming" },
  },
  {
    id: "camellia",
    name: "Camellia",
    colors: { blooming: "#FF6348" },
    months: { "1-3": "blooming", "4-6": "foliage", "7-10": "dormant", "11": "sprouting", "12": "blooming" },
  },
  {
    id: "wisteria",
    name: "Wisteria",
    colors: { blooming: "#BE9FE1" },
    months: { "1-2": "dormant", "3": "sprouting", "4-5": "blooming", "6-10": "foliage", "11-12": "dormant" },
  },
  {
    id: "jasmine",
    name: "Jasmine",
    colors: { blooming: "#FFF9C4" },
    months: { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-9": "blooming", "10-11": "foliage", "12": "dormant" },
  },
  {
    id: "hibiscus",
    name: "Hibiscus",
    colors: { blooming: "#FF4757" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-10": "blooming", "11": "foliage", "12": "dormant" },
  },
];

export const flowers = raw.map((f) => ({
  ...f,
  monthStates: parseMonths(f.months),
}));

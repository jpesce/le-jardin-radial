import { parseMonths, firstBloomStart } from "./months.js";

export const raw = [
  {
    id: "snowdrop",
    names: { en: "Snowdrop", fr: "Perce-neige" },
    scientificName: "Galanthus nivalis",
    colors: { blooming: "#F0F0F0" },
    months: { "1-2": "blooming", "3": "foliage", "4": "dormant", "5-12": "dormant" },
  },
  {
    id: "crocus",
    names: { en: "Crocus", fr: "Crocus" },
    scientificName: "Crocus vernus",
    colors: { blooming: "#9B59B6" },
    months: { "1": "dormant", "2-3": "blooming", "4": "foliage", "5-12": "dormant" },
  },
  {
    id: "daffodil",
    names: { en: "Daffodil", fr: "Jonquille" },
    scientificName: "Narcissus pseudonarcissus",
    colors: { blooming: "#F1C40F" },
    months: { "1": "dormant", "2": "sprouting", "3-4": "blooming", "5": "foliage", "6-12": "dormant" },
  },
  {
    id: "hyacinth",
    names: { en: "Hyacinth", fr: "Jacinthe" },
    scientificName: "Hyacinthus orientalis",
    colors: { blooming: "#5B9BD5" },
    months: { "1": "dormant", "2": "sprouting", "3-4": "blooming", "5": "foliage", "6-12": "dormant" },
  },
  {
    id: "tulip",
    names: { en: "Tulip", fr: "Tulipe" },
    scientificName: "Tulipa gesneriana",
    colors: { blooming: "#E74C3C" },
    months: { "1-2": "dormant", "3": "sprouting", "4-5": "blooming", "6": "foliage", "7-12": "dormant" },
  },
  {
    id: "pansy",
    names: { en: "Pansy", fr: "Pensée" },
    scientificName: "Viola tricolor var. hortensis",
    colors: { blooming: "#8E44AD" },
    months: { "1-2": "dormant", "3-5": "blooming", "6-8": "foliage", "9-11": "blooming", "12": "dormant" },
  },
  {
    id: "iris",
    names: { en: "Iris", fr: "Iris" },
    scientificName: "Iris germanica",
    colors: { blooming: "#6C5CE7" },
    months: { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-6": "blooming", "7-10": "foliage", "11-12": "dormant" },
  },
  {
    id: "peony",
    names: { en: "Peony", fr: "Pivoine" },
    scientificName: "Paeonia lactiflora",
    colors: { blooming: "#FDA7DF" },
    months: { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-6": "blooming", "7-9": "foliage", "10-12": "dormant" },
  },
  {
    id: "rose",
    names: { en: "Rose", fr: "Rose" },
    scientificName: "Rosa gallica",
    colors: { blooming: "#FF6B81" },
    months: { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-10": "blooming", "11": "foliage", "12": "dormant" },
  },
  {
    id: "lavender",
    names: { en: "Lavender", fr: "Lavande" },
    scientificName: "Lavandula angustifolia",
    colors: { blooming: "#A29BFE" },
    months: { "1-2": "dormant", "3": "sprouting", "4-5": "foliage", "6-8": "blooming", "9-10": "foliage", "11-12": "dormant" },
  },
  {
    id: "lily",
    names: { en: "Lily", fr: "Lys" },
    scientificName: "Lilium candidum",
    colors: { blooming: "#FFEAA7" },
    months: { "1-2": "dormant", "3": "sprouting", "4-5": "foliage", "6-8": "blooming", "9-10": "foliage", "11-12": "dormant" },
  },
  {
    id: "marigold",
    names: { en: "Marigold", fr: "Souci" },
    scientificName: "Tagetes erecta",
    colors: { blooming: "#E67E22" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-10": "blooming", "11-12": "dormant" },
  },
  {
    id: "cosmos",
    names: { en: "Cosmos", fr: "Cosmos" },
    scientificName: "Cosmos bipinnatus",
    colors: { blooming: "#FD79A8" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-10": "blooming", "11-12": "dormant" },
  },
  {
    id: "zinnia",
    names: { en: "Zinnia", fr: "Zinnia" },
    scientificName: "Zinnia elegans",
    colors: { blooming: "#D63031" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-9": "blooming", "10": "foliage", "11-12": "dormant" },
  },
  {
    id: "sunflower",
    names: { en: "Sunflower", fr: "Tournesol" },
    scientificName: "Helianthus annuus",
    colors: { blooming: "#FDCB6E" },
    months: { "1-3": "dormant", "4": "sprouting", "5-6": "foliage", "7-9": "blooming", "10": "foliage", "11-12": "dormant" },
  },
  {
    id: "black-eyed-susan",
    names: { en: "Black-eyed Susan", fr: "Rudbeckie" },
    scientificName: "Rudbeckia hirta",
    colors: { blooming: "#F9CA24" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-9": "blooming", "10": "foliage", "11-12": "dormant" },
  },
  {
    id: "dahlia",
    names: { en: "Dahlia", fr: "Dahlia" },
    scientificName: "Dahlia pinnata",
    colors: { blooming: "#E056A0" },
    months: { "1-3": "dormant", "4": "sprouting", "5-6": "foliage", "7-10": "blooming", "11-12": "dormant" },
  },
  {
    id: "aster",
    names: { en: "Aster", fr: "Aster" },
    scientificName: "Aster amellus",
    colors: { blooming: "#A855F7" },
    months: { "1-3": "dormant", "4": "sprouting", "5-7": "foliage", "8-10": "blooming", "11-12": "dormant" },
  },
  {
    id: "chrysanthemum",
    names: { en: "Chrysanthemum", fr: "Chrysanthème" },
    scientificName: "Chrysanthemum morifolium",
    colors: { blooming: "#F39C12" },
    months: { "1-3": "dormant", "4": "sprouting", "5-8": "foliage", "9-11": "blooming", "12": "dormant" },
  },
  {
    id: "hellebore",
    names: { en: "Hellebore", fr: "Hellébore" },
    scientificName: "Helleborus niger",
    colors: { blooming: "#A3CB38" },
    months: { "1-3": "blooming", "4-5": "foliage", "6-10": "dormant", "11": "sprouting", "12": "blooming" },
  },
  {
    id: "camellia",
    names: { en: "Camellia", fr: "Camélia" },
    scientificName: "Camellia japonica",
    colors: { blooming: "#FF6348" },
    months: { "1-3": "blooming", "4-6": "foliage", "7-10": "dormant", "11": "sprouting", "12": "blooming" },
  },
  {
    id: "wisteria",
    names: { en: "Wisteria", fr: "Glycine" },
    scientificName: "Wisteria sinensis",
    colors: { blooming: "#BE9FE1" },
    months: { "1-2": "dormant", "3": "sprouting", "4-5": "blooming", "6-10": "foliage", "11-12": "dormant" },
  },
  {
    id: "jasmine",
    names: { en: "Jasmine", fr: "Jasmin" },
    scientificName: "Jasminum officinale",
    colors: { blooming: "#FFF9C4" },
    months: { "1-2": "dormant", "3": "sprouting", "4": "foliage", "5-9": "blooming", "10-11": "foliage", "12": "dormant" },
  },
  {
    id: "hibiscus",
    names: { en: "Hibiscus", fr: "Hibiscus" },
    scientificName: "Hibiscus rosa-sinensis",
    colors: { blooming: "#FF4757" },
    months: { "1-3": "dormant", "4": "sprouting", "5": "foliage", "6-10": "blooming", "11": "foliage", "12": "dormant" },
  },
];

export const flowers = raw
  .map((f) => {
    const monthStates = parseMonths(f.months);
    return { ...f, monthStates, firstBloom: firstBloomStart(monthStates) };
  })
  .sort((a, b) => a.firstBloom - b.firstBloom);

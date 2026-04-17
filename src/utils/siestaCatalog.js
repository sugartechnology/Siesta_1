export const catalogCollections = [
  {
    id: 1,
    name: "CONTRACT",
    value: "contract",
    crmValue: "CONTRACT",
    translationKey: "catalog.contract",
    image: "/assets/catalog-garden.png",
  },
  {
    id: 2,
    name: "RATTAN",
    value: "rattan",
    crmValue: "RATTAN",
    translationKey: "catalog.rattan",
    image: "/assets/catalog-rattan.png",
  },
  {
    id: 3,
    name: "GARDEN",
    value: "garden",
    crmValue: "GARDEN",
    translationKey: "catalog.garden",
    image: "/assets/catalog-contract.png",
  },
];

const createSubCategory = ({
  id,
  name,
  value,
  image,
  multiline = false,
  gridArea = "",
  displayName,
}) => ({
  id,
  name,
  value,
  crmValue: name,
  image,
  multiline,
  gridArea,
  displayName: displayName ?? name,
});

export const categoriesMap = {
  contract: [
    createSubCategory({
      id: 1,
      name: "Chairs",
      value: "chairs",
      image: "/assets/subcategory-chairs.png",
      gridArea: "row-column-span-3",
    }),
    createSubCategory({
      id: 3,
      name: "Stools & Complements",
      value: "stools & complements",
      image: "/assets/subcategory-stools.png",
      multiline: true,
      gridArea: "row-span-2",
      displayName: "Stools &\nComplements",
    }),
    createSubCategory({
      id: 4,
      name: "Sunlounger & Lounge",
      value: "sunlounger & lounge",
      image: "/assets/subcategory-sunlounger.png",
      multiline: true,
      gridArea: "row-column-span-3",
      displayName: "Sunlounger &\nLounge",
    }),
    createSubCategory({
      id: 2,
      name: "Lighting",
      value: "lighting",
      image: "/assets/subcategory-lighting.png",
      gridArea: "row-column-span-3",
    }),
    createSubCategory({
      id: 5,
      name: "Tables",
      value: "tables",
      image: "/assets/subcategory-tables.png",
      gridArea: "row-column-span-3",
    }),
  ],
  garden: [
    createSubCategory({
      id: 1,
      name: "Chairs",
      value: "chairs",
      image: "/assets/subcategory0-chairs.png",
    }),
    createSubCategory({
      id: 3,
      name: "Children Group",
      value: "children group",
      image: "/assets/subcategory0-children-group.jpg",
      multiline: true,
    }),
    createSubCategory({
      id: 5,
      name: "Tables",
      value: "tables",
      image: "/assets/subcategory0-tables.png",
    }),
    createSubCategory({
      id: 2,
      name: "Stools & Multi Purpose",
      value: "stools & multi purpose",
      image: "/assets/subcategory0-stool-multipurpose.jpg",
      multiline: true,
      gridArea: "column-span-3",
    }),
    createSubCategory({
      id: 4,
      name: "Sunloungers",
      value: "sunloungers",
      image: "/assets/subcategory0-sunloungers.jpg",
      multiline: true,
      gridArea: "column-span-3",
    }),
  ],
  rattan: [
    createSubCategory({
      id: 1,
      name: "Chairs",
      value: "chairs",
      image: "/assets/subcategory1-chairs.png",
    }),
    createSubCategory({
      id: 5,
      name: "Bar Stool",
      value: "bar-stool",
      image: "/assets/subcategory1-bar-stool.jpg",
    }),
    createSubCategory({
      id: 2,
      name: "Tables",
      value: "tables",
      image: "/assets/subcategory1-tables.png",
    }),
    createSubCategory({
      id: 3,
      name: "Lounge",
      value: "lounge",
      image: "/assets/subcategory1-lounge.png",
      multiline: true,
      gridArea: "column-span-3",
    }),
    createSubCategory({
      id: 4,
      name: "Sunlounger",
      value: "sunloungers",
      image: "/assets/subcategory1-sunloungers.png",
      multiline: true,
      gridArea: "column-span-3",
    }),
  ],
};

export const getCollectionConfig = (collectionSlug) =>
  catalogCollections.find((collection) => collection.value === collectionSlug);

export const getSubCategoriesForCollection = (collectionSlug) =>
  categoriesMap[collectionSlug] ?? [];

export const getSubCategoryConfig = (collectionSlug, subCategorySlug) =>
  getSubCategoriesForCollection(collectionSlug).find(
    (subCategory) => subCategory.value === subCategorySlug
  );

export const getDefaultCollectionSlug = () => catalogCollections[0]?.value ?? "";

export const getDefaultSubCategorySlug = (
  collectionSlug = getDefaultCollectionSlug()
) => getSubCategoriesForCollection(collectionSlug)[0]?.value ?? "";

export const normalizeCatalogSelection = (collectionSlug, subCategorySlug) => {
  const normalizedCollection =
    getCollectionConfig(collectionSlug)?.value ?? getDefaultCollectionSlug();
  const normalizedSubCategory = getSubCategoryConfig(
    normalizedCollection,
    subCategorySlug
  )
    ? subCategorySlug
    : getDefaultSubCategorySlug(normalizedCollection);

  return {
    collectionSlug: normalizedCollection,
    subCategorySlug: normalizedSubCategory,
  };
};

export const getCollectionCrmValue = (collectionSlug) =>
  getCollectionConfig(collectionSlug)?.crmValue ?? collectionSlug;

export const getSubCategoryCrmValue = (collectionSlug, subCategorySlug) =>
  getSubCategoryConfig(collectionSlug, subCategorySlug)?.crmValue ??
  subCategorySlug;

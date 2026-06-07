import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchProductVariants } from "../api/Api";
import {
  buildCatalogProductsPath,
  getNextPage,
  NavigationState,
} from "../utils/NavigationState";
import { startCreateSpaceFlow } from "../utils/createSpaceFlow";
import {
  catalogCollections,
  categoriesMap,
  getDefaultCollectionSlug,
  getDefaultSubCategorySlug,
  normalizeCatalogSelection,
} from "../utils/siestaCatalog";
import DesignFlowNav from "../components/DesignFlowNav";
import { useProductCart } from "../contexts/ProductCartContext";
import "./Products.css";
import { useTranslation } from "react-i18next";

const normalizeImageList = (images) =>
  Array.isArray(images)
    ? images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
    : [];

const normalizeCatalogProduct = (item) => {
  const firstPrice = Array.isArray(item?.prices) ? item.prices[0] : null;
  const rawPrice = item?.price ?? firstPrice?.amount ?? null;
  const numericPrice =
    rawPrice === null || rawPrice === undefined ? null : Number(rawPrice);

  return {
    ...item,
    productId: item?.id ?? item?.productId,
    name: item?.name ?? item?.baseName,
    code: item?.sku ?? item?.code ?? "",
    price: Number.isNaN(numericPrice) ? null : numericPrice,
    currency:
      item?.currency ??
      firstPrice?.currency?.currencyCode ??
      firstPrice?.currencyCode ??
      null,
    images: normalizeImageList(item?.images),
    thumbnailUrl: item?.thumbnailUrl ?? item?.thumbnail ?? null,
  };
};

const buildCatalogSelection = (category, subCategory) => {
  const { collectionSlug, subCategorySlug } = normalizeCatalogSelection(
    category,
    subCategory
  );

  return {
    selectedCategories: collectionSlug ? [collectionSlug] : [],
    selectedSubCategories: subCategorySlug ? [subCategorySlug] : [],
  };
};

export default function Products() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // URL parametrelerinden initial state oluştur
  const getInitialFilterState = () => {
    const category = searchParams.get("category") ?? getDefaultCollectionSlug();
    const subCategory =
      searchParams.get("subCategory") ?? getDefaultSubCategorySlug(category);
    const search = searchParams.get("search") || "";
    const catalogSelection = buildCatalogSelection(category, subCategory);

    return {
      searchQuery: search,
      page: 0,
      ...catalogSelection,
      selectedRooms: [],
      selectedStyles: [],
      activeFilters: [],
    };
  };

  // Combined filter and pagination state
  const [filterState, setFilterState] = useState(getInitialFilterState);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Dışardan seçili ürünleri set etme fonksiyonları
  const getInitialSelectedProducts = () => {
    // 1. URL parametresinden (selectedProducts)
    const selectedProductsParam = searchParams.get("selectedProducts");
    if (selectedProductsParam) {
      try {
        return JSON.parse(decodeURIComponent(selectedProductsParam));
      } catch (e) {
        console.error("Error parsing selectedProducts from URL:", e);
      }
    }

    // 2. Location state'inden (navigate ile gönderilen)
    if (NavigationState.selectedProducts) {
      return NavigationState.selectedProducts;
    }

    // 3. Varsayılan boş array
    return [];
  };

  const {
    items: selectedProducts,
    setItems: setSelectedProducts,
    addProduct: addProductToSelection,
    removeProduct: removeProductFromSelection,
    getQuantity: getProductQuantity,
    totalCount: selectedCount,
  } = useProductCart();

  useEffect(() => {
    const initial = getInitialSelectedProducts();
    if (initial.length > 0) {
      setSelectedProducts(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (
      category &&
      NavigationState.flowType !== "new" &&
      NavigationState.productsEntry !== "design"
    ) {
      NavigationState.productsEntry = "catalog";
    }
  }, [searchParams]);

  // Dışardan seçili ürünleri set et
  const selectedCollection =
    filterState.selectedCategories[0] ?? getDefaultCollectionSlug();
  const { subCategorySlug: selectedSubCategory } = normalizeCatalogSelection(
    selectedCollection,
    filterState.selectedSubCategories[0]
  );
  const availableSubCategories = categoriesMap[selectedCollection] ?? [];

  const selectedCollectionMeta = catalogCollections.find(
    (collection) => collection.value === selectedCollection
  );
  const collectionLabel = selectedCollectionMeta
    ? t(selectedCollectionMeta.translationKey)
    : selectedCollection;
  const selectedSubCategoryMeta = availableSubCategories.find(
    (subCategory) => subCategory.value === selectedSubCategory
  );
  const categoryLabel = selectedSubCategoryMeta?.name ?? selectedSubCategory ?? "";
  const showFilterBreadcrumb = Boolean(collectionLabel && categoryLabel);

  const sentinelRef = useRef(null);

  // Filter options

  const [variants, setVariants] = useState([]);
  const [isStartingDesign, setIsStartingDesign] = useState(false);

  const formatPrice = (product) => {
    if (product?.price === null || product?.price === undefined) {
      return "-";
    }

    const amount = Number(product.price);
    if (Number.isNaN(amount)) {
      return "-";
    }

    if (product.currency) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: product.currency,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch (error) {
        console.warn("Price formatting failed:", error);
      }
    }

    return `$${amount.toFixed(2)}`;
  };

  const removeFilter = (filterType, filter) => {
    setFilterState((prev) => {
      const newState = {
        ...prev,
        [filterType]: prev[filterType].filter((f) => f !== filter),
      };
      //updateURL(newState);
      return newState;
    });
  };

  // URL'i güncelle

  const getFilter = () => {
    const filter = {
      search: filterState.searchQuery,
      filters: [],
    };
    if (filterState.selectedCategories.length > 0) {
      filter.filters.push({
        key: "Category",
        options: filterState.selectedCategories.map((c) => {
          return {
            key: c,
            selected: true,
          };
        }),
      });
    }
    if (filterState.selectedSubCategories.length > 0) {
      filter.filters.push({
        key: "SubCategory",
        options: filterState.selectedSubCategories.map((c) => {
          return {
            key: c,
            selected: true,
          };
        }),
      });
    }
    if (filterState.selectedRooms.length > 0) {
      filter.filters.push({
        key: "Rooms",
        options: filterState.selectedRooms.map((c) => c.value),
      });
    }
    if (filterState.selectedStyles.length > 0) {
      filter.filters.push({
        key: "Styles",
        options: filterState.selectedStyles.map((c) => c.value),
      });
    }
    console.log("filter", filter);
    return filter;
  };

  const fetchProductsData = async (pageNum = filterState.page) => {
    try {
      setLoading(true);
      // Seçili filtreleri API formatına çevir
      const filter = getFilter();
      const data = await fetchProducts({}, filter, pageNum);
      // CRM PagedFilterable: { content, page: { totalPages } }
      const rawItems = data.content ?? [];
      const items = rawItems.map(normalizeCatalogProduct);
      const totalPages = data.page?.totalPages ?? 0;
      setHasMore(pageNum + 1 < totalPages);
      setProducts((prev) => (pageNum === 0 ? items : [...prev, ...items]));
    } catch (e) {
      setHasMore(false);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("selectedCategories", filterState.selectedCategories);
    setProducts(filterState.page === 0 ? [] : products);
    setHasMore(true);
    setLoading(true);
    fetchProductsData(filterState.page);
  }, [filterState]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading && hasMore) {
          console.log("Loading more products...");
          setFilterState((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      },
      {
        root: null,
        rootMargin: "600px 0px", // erken yükleme için önden 400px
        threshold: 0.01,
      }
    );

    io.observe(el);
    return () => io.unobserve(el);
  }, [loading, hasMore]);

  const handleProductClick = (product) => {
    console.log("product", product);
    setSelectedProduct(product);
    fetchProductVariants(product.name || "").then(
      (variants) => {
        const v = variants
          .map(normalizeCatalogProduct)
          .reduce((acc, variant) => {
          const f = acc.find(
            (existingVariant) =>
              existingVariant.sku === variant.sku ||
              existingVariant.productId === variant.productId
          );
          if (!f) {
            acc.push(variant);
          }
          return acc;
        }, []);
        setVariants(v);
        console.log("variants", v);
        setShowVariantModal(true);
      }
    );
  };

  const handleGoToDesign = async () => {
    if (selectedCount === 0 || isStartingDesign) {
      return;
    }

    NavigationState.selectedProducts = selectedProducts;

    const isCatalogFlow = NavigationState.productsEntry === "catalog";
    const inDesignFlow =
      !isCatalogFlow &&
      (NavigationState.flowType === "new" ||
        NavigationState.productsEntry === "design" ||
        Boolean(NavigationState.section?.id));

    if (inDesignFlow) {
      navigate(
        getNextPage("products", {
          selectedProducts,
        })
      );
      return;
    }

    if (!isCatalogFlow) {
      navigate("/projects");
      return;
    }

    const returnPath = buildCatalogProductsPath(
      searchParams.get("category") ?? selectedCollection,
      searchParams.get("subCategory") ?? selectedSubCategory
    );
    const productsToKeep = [...selectedProducts];

    try {
      setIsStartingDesign(true);
      NavigationState.catalogReturnPath = returnPath;
      await startCreateSpaceFlow();
      NavigationState.catalogReturnPath = returnPath;
      NavigationState.productsEntry = "catalog";
      NavigationState.fromCatalogDesign = true;
      NavigationState.selectedProducts = productsToKeep;
      navigate("/camera");
    } catch (error) {
      console.error("Error starting design from catalog:", error);
      NavigationState.catalogReturnPath = returnPath;
      navigate(returnPath);
    } finally {
      setIsStartingDesign(false);
    }
  };

  const renderFiltersByName = (filterName, filters) => {
    return filters[filterName].map((filter, index) =>
      renderFilter(filterName, filter, index)
    );
  };

  const renderFilter = (filterType, filter, index) => {
    return (
      <div key={index} className="filter-chip">
        <span>{filter}</span>
        <button onClick={() => removeFilter(filterType, filter)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="products-container">
        <div className="products-page-header">
          <DesignFlowNav currentStepId="products" />
          {showFilterBreadcrumb && (
            <nav
              className="products-filter-breadcrumb"
              aria-label={t("products.filterBreadcrumb")}
            >
              <span className="products-filter-breadcrumb__segment">
                {collectionLabel}
              </span>
              <span className="products-filter-breadcrumb__sep" aria-hidden="true">
                ›
              </span>
              <span className="products-filter-breadcrumb__segment products-filter-breadcrumb__segment--current">
                {categoryLabel}
              </span>
            </nav>
          )}
        </div>

        <div className="products-filters-container">
          <div className="products-filters-section">
            <div className="products-filters-row">
              <label className="products-filter-field products-filter-field--collection">
                <select
                className="products-filter-select"
                aria-label={t("products.collection")}
                value={selectedCollection}
                onChange={(e) => {
                  const nextSelection = buildCatalogSelection(
                    e.target.value,
                    selectedSubCategory
                  );
                  setFilterState((prev) => ({
                    ...prev,
                    page: 0,
                    ...nextSelection,
                  }));
                  //updateURL(newState);
                }}
              >
                {catalogCollections.map((collection) => {
                  return (
                    <option key={collection.value} value={collection.value}>
                      {t(collection.translationKey)}
                    </option>
                  );
                })}
              </select>
              </label>
              <label className="products-filter-field products-filter-field--category">
                <select
                className="products-filter-select"
                aria-label={t("products.category")}
                value={selectedSubCategory}
                onChange={(e) => {
                  const nextSelection = buildCatalogSelection(
                    selectedCollection,
                    e.target.value
                  );
                  setFilterState((prev) => ({
                    ...prev,
                    page: 0,
                    ...nextSelection,
                  }));
                  //updateURL(newState);
                }}
              >
                {availableSubCategories.map((c) => {
                  return (
                    <option key={c.value} value={c.value}>
                      {c.name}
                    </option>
                  );
                })}
              </select>
              </label>
              {/*
              

              <FilterButton
                label="Category"
                options={categoryOptions}
                selectedValues={filterState.selectedCategories}
                onSelectionChange={(values) => {
                  const newState = {
                    ...filterState,
                    page: 0,
                    selectedCategories: values,
                  };
                  setFilterState(newState);
                  //updateURL(newState);
                }}
                placeholder="Select categories..."
              />
              <FilterButton
                label="Sub Category"
                options={subCategoryOptions}
                selectedValues={filterState.selectedSubCategories}
                onSelectionChange={(values) => {
                  const newState = {
                    ...filterState,
                    page: 0,
                    selectedSubCategories: values,
                  };
                  setFilterState(newState);
                  //updateURL(newState);
                }}
                placeholder="Select sub categories..."
              />
              */}
            </div>

            <div className="products-search-bar">
              <svg width="16" height="16" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path
                  d="M6.5 11.5C9.26142 11.5 11.5 9.26142 11.5 6.5C11.5 3.73858 9.26142 1.5 6.5 1.5C3.73858 1.5 1.5 3.73858 1.5 6.5C1.5 9.26142 3.73858 11.5 6.5 11.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.5 13.5L10.1 10.1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="search"
                placeholder={t("products.search")}
                onChange={(e) => {
                  const newState = {
                    ...filterState,
                    page: 0,
                    searchQuery:
                      e.target.value.length < 3 ? "" : e.target.value,
                  };
                  setFilterState(newState);
                  //updateURL(newState);
                }}
              />
            </div>
          </div>
          {/* Active Filters
          <div className="active-filters">
            {renderFiltersByName("selectedCategories", filterState)}
            {renderFiltersByName("selectedSubCategories", filterState)}
          </div>
           */}
        </div>

        {/* Products Grid */}
        <div className="products-grid-container">
          <div className="products-grid">
            {products.map((product) => {
              const quantity = getProductQuantity(product.productId);
              return (
              <div
                key={product.productId}
                className={`product-card${quantity > 0 ? " product-card--selected" : ""}`}
              >
                <div
                  className="product-image-container"
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={
                      product.images[1] ||
                      product.images[0] ||
                      product.thumbnailUrl ||
                      product.thumbnail ||
                      "/assets/product-placeholder.png"
                    }
                    alt={product.name}
                    className="product-image"
                  />
                  {quantity > 0 && (
                    <span className="product-selected-badge">{quantity}</span>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-action-slot">
                    {quantity > 0 ? (
                      <div className="p-quantity-control">
                        <button
                          type="button"
                          className="p-quantity-btn"
                          onClick={() =>
                            removeProductFromSelection(product.productId, 1)
                          }
                          aria-label="-"
                        >
                          −
                        </button>
                        <span className="p-quantity-value">
                          {getProductQuantity(product.productId)}
                        </span>
                        <button
                          type="button"
                          className="p-quantity-btn"
                          onClick={() => addProductToSelection(product, 1)}
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="product-add-btn"
                        onClick={() => handleProductClick(product)}
                      >
                        <span>{t("products.add")}</span>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path
                            d="M10 5V15M5 10H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* View All Products Button */}
          <div
            ref={sentinelRef}
            style={{ height: "1px", width: "100%", display: "block" }}
          >
            {" "}
          </div>
          {hasMore && (
            <button type="button" className="view-all-btn">
              {t("products.viewAll")}
            </button>
          )}
        </div>
        <div className="products-footer">
          {selectedCount > 0 && (
            <span className="products-selection-count">
              {selectedCount} {t("products.selected")}
            </span>
          )}
          <button
            type="button"
            className="products-complete-btn"
            onClick={handleGoToDesign}
            disabled={selectedCount === 0 || isStartingDesign}
          >
            <span>
              {isStartingDesign ? t("products.startingDesign") : t("products.goToDesign")}
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Variant Modal */}
      {showVariantModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowVariantModal(false)}
          />
          <div className="variant-modal">
            <div className="modal-header">
              <h2>{t("products.variantsTitle", { name: selectedProduct.name })}</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowVariantModal(false)}
                aria-label={t("common.cancel")}
              >
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                  <path
                    d="M16 5L5 16M5 5L16 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="variants-grid">
              {variants.map((variant) => {
                return (
                  <div
                    key={variant.id}
                    className={`variant-item ${"in-stock"}`}
                  >
                    <div className="variant-image-container">
                      <img
                        src={
                          
                          variant.images[1] ||
                          variant.images[0] ||
                          variant.thumbnailUrl ||
                          variant.thumbnail ||
                          "/assets/product-placeholder.png"
                        }
                        alt={variant.name}
                        className="variant-image"
                      />
                    </div>
                    <p className="variant-title">{variant.name}</p>
                    {/*<p className="variant-color">{variant.name}</p>*/}
                    <div className="variant-qty-control">
                      <button
                        type="button"
                        className="variant-qty-btn"
                        onClick={() => removeProductFromSelection(variant.productId, 1)}
                        disabled={getProductQuantity(variant.productId) === 0}
                        aria-label="-"
                      >
                        −
                      </button>
                      <span className="variant-qty-value">
                        {getProductQuantity(variant.productId)}
                      </span>
                      <button
                        type="button"
                        className="variant-qty-btn"
                        onClick={() => addProductToSelection(variant, 1)}
                        aria-label="+"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="variant-modal-done-btn"
              onClick={() => setShowVariantModal(false)}
            >
              {t("products.done")}
            </button>
          </div>
        </>
      )}
    </>
  );
}

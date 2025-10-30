import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchProductVariants } from "../api/Api";
import FilterButton from "../components/FilterButton";
import { getNextPage, NavigationState } from "../utils/NavigationState";
import "./Products.css";

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // URL parametrelerinden initial state oluştur
  const getInitialFilterState = () => {
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const search = searchParams.get("search") || "";

    return {
      searchQuery: search,
      page: 0,
      selectedCategories: category ? [category] : [],
      selectedSubCategories: subCategory
        ? [decodeURIComponent(subCategory)]
        : [],
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

  // Seçili ürünlerin state'i (ProductQuantityDTO benzeri)
  const [selectedProducts, setSelectedProducts] = useState(
    getInitialSelectedProducts
  );

  // Dışardan seçili ürünleri set et
  const setSelectedProductsFromExternal = (products) => {
    setSelectedProducts(products);
  };

  // Seçili ürünleri temizle
  const clearSelectedProducts = () => {
    setSelectedProducts([]);
  };

  const sentinelRef = useRef(null);

  // Filter options
  const categoryOptions = [
    { value: "contract", label: "Contract" },
    { value: "garden", label: "Garden" },
    { value: "rattan", label: "Rattan" },
  ];

  const subCategoryOptions = [
    {
      value: "chairs",
      label: "Chairs",
    },
    {
      value: "tables",
      label: "Tables",
    },
    {
      value: "stools & complements",
      label: "Stools & Complements",
    },
    {
      value: "sunlounger & lounge",
      label: "Sunlounger & Lounge",
    },
    {
      value: "lounge",
      label: "Lounge",
    },
    {
      value: "li̇ghti̇ng",
      label: "Lighting",
    },
    {
      value: "stools & multi purpose",
      label: "Stools & Multi Purpose",
    },
    {
      value: "sunlounger",
      label: "Sunlounger",
    },
    {
      value: "children group",
      label: "Children Group",
    },
    {
      value: "sunloungers",
      label: "Sunloungers",
    },
    {
      value: "bar stool",
      label: "Bar Stool",
    },
  ];

  const [variantQuantities, setVariantQuantities] = useState({
    1: 2, // Black
    2: 0, // White
    3: 1, // Olive Green
    4: 0, // Taupe
    5: 1, // Dark Grey
    6: 0, // Marsala
  });

  const [variants, setVariants] = useState([
    { id: 1, name: "Black", stock: 2, image: "/assets/variant-black.png" },
    { id: 2, name: "White", stock: 0, image: "/assets/variant-white.png" },
    {
      id: 3,
      name: "Olive Green",
      stock: 1,
      image: "/assets/variant-olive-green.png",
    },
    { id: 4, name: "Taupe", stock: 0, image: "/assets/variant-taupe.png" },
    {
      id: 5,
      name: "Dark Grey",
      stock: 1,
      image: "/assets/variant-dark-grey.png",
    },
    { id: 6, name: "Marsala", stock: 0, image: "/assets/variant-marsala.png" },
  ]);

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
  const updateURL = (newFilterState, selectedProductsToUpdate = null) => {
    const params = new URLSearchParams();

    if (newFilterState.searchQuery) {
      params.set("search", newFilterState.searchQuery);
    }
    if (newFilterState.selectedCategories.length > 0) {
      params.set("category", newFilterState.selectedCategories[0]);
    }
    if (newFilterState.selectedSubCategories.length > 0) {
      params.set("subCategory", newFilterState.selectedSubCategories[0]);
    }

    // Seçili ürünleri URL'e ekle
    const productsToSave = selectedProductsToUpdate || selectedProducts;
    if (productsToSave.length > 0) {
      params.set(
        "selectedProducts",
        encodeURIComponent(JSON.stringify(productsToSave))
      );
    }

    setSearchParams(params);
  };

  // Ürün ekleme/çıkarma fonksiyonları
  const addProductToSelection = (product, quantity = 1) => {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.productId
      );

      let updated;
      if (existingIndex >= 0) {
        // Ürün zaten var, miktarını artır
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
      } else {
        // Yeni ürün ekle
        updated = [
          ...prev,
          {
            quantity: quantity,
            productId: product.productId,
            baseName: product.name,
            description: product.description,
            url: product.images[0],
          },
        ];
      }

      // URL'i güncelle
      //updateURL(filterState, updated);
      return updated;
    });
  };

  const removeProductFromSelection = (productId, quantity = 1) => {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === productId
      );

      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        const newQuantity = updated[existingIndex].quantity - quantity;

        if (newQuantity <= 0) {
          // Miktar 0 veya altına düştü, ürünü kaldır
          updated = updated.filter((item) => item.productId !== productId);
        } else {
          // Miktarı güncelle
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQuantity,
          };
        }
      } else {
        updated = prev;
      }

      // URL'i güncelle
      //updateURL(filterState, updated);
      return updated;
    });
  };

  const getProductQuantity = (productId) => {
    const selected = selectedProducts.find(
      (item) => item.productId === productId
    );
    return selected ? selected.quantity : 0;
  };

  const handleAddToCart = (product) => {
    addProductToSelection(product, 1);
    console.log("Product added to selection:", product);
  };

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
      const items = data.results.content ?? [];

      setHasMore(pageNum + 1 < data.results.totalPages);
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

  const handleQuantityChange = (variantId, delta) => {
    setVariantQuantities((prev) => {
      const currentQty = prev[variantId] || 0;
      const newQty = Math.max(0, currentQty + delta); // Don't allow negative quantities
      return {
        ...prev,
        [variantId]: newQty,
      };
    });
  };

  const handleProductClick = (product) => {
    console.log("product", product);
    setSelectedProduct(product);
    fetchProductVariants(product.name ? product.name.toLowerCase() : "").then(
      (variants) => {
        setVariants(variants);
        console.log("variants", variants);
        setShowVariantModal(true);
      }
    );
  };

  const handleGenerateDesign = () => {
    // Sonraki sayfayı belirle
    const nextPage = getNextPage("products", {
      selectedProducts: selectedProducts,
    });

    navigate(nextPage);
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
        <div className="products-filters-container">
          {/* Filters and Search */}
          <div className="products-filters-section">
            <div className="filter-buttons">
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
            </div>

            <div className="search-bar">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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
                type="text"
                placeholder="Search"
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
          {/* Active Filters */}
          <div className="active-filters">
            {renderFiltersByName("selectedCategories", filterState)}
            {renderFiltersByName("selectedSubCategories", filterState)}
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid-container">
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.productId} className="product-card">
                <div
                  className="product-image-container"
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={product.images[1] || "/assets/product-placeholder.png"}
                    alt={product.name}
                    className="product-image"
                  />

                  {/* Product Actions (Visible on hover) 
                  <div className="product-actions">
                    <button className="action-btn wishlist">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M15.75 3.375C14.625 2.25 12.75 2.0625 11.25 2.8125C10.5 3.1875 9.75 3.9375 9 4.875C8.25 3.9375 7.5 3.1875 6.75 2.8125C5.25 2.0625 3.375 2.25 2.25 3.375C0.75 4.875 0.75 7.3125 2.25 8.8125L9 15.5625L15.75 8.8125C17.25 7.3125 17.25 4.875 15.75 3.375Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button className="action-btn quick-view">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 7.5C8.625 7.5 7.5 8.625 7.5 10C7.5 11.375 8.625 12.5 10 12.5C11.375 12.5 12.5 11.375 12.5 10C12.5 8.625 11.375 7.5 10 7.5Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10C17.5 10 15 15 10 15C5 15 2.5 10 2.5 10Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      className="action-btn variants"
                      onClick={() => handleAddToCart(product)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 5C10.5523 5 11 4.55228 11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4C9 4.55228 9.44772 5 10 5Z"
                          fill="currentColor"
                        />
                        <path
                          d="M10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10C9 10.5523 9.44772 11 10 11Z"
                          fill="currentColor"
                        />
                        <path
                          d="M10 17C10.5523 17 11 16.5523 11 16C11 15.4477 10.5523 15 10 15C9.44772 15 9 15.4477 9 16C9 16.5523 9.44772 17 10 17Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div> */}
                </div>

                <div className="product-info">
                  <div className="product-details">
                    <p className="product-code">
                      Code: {product.productId.substring(0, 3) || product.code}
                    </p>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="p-product-price">${product.price}</p>
                  </div>
                  {/* Seçili ürün kontrolü */}
                  {getProductQuantity(product.productId) > 0 ? (
                    <div className="p-quantity-control">
                      <button
                        className="p-quantity-btn"
                        onClick={() =>
                          removeProductFromSelection(product.productId, 1)
                        }
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M4 8H12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <span className="p-quantity">
                        {getProductQuantity(product.productId)}
                      </span>
                      <button
                        className="p-quantity-btn"
                        onClick={() => addProductToSelection(product, 1)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M8 4V12M4 8H12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 5V15M5 10H15"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* View All Products Button */}
          <div
            ref={sentinelRef}
            style={{ height: "1px", width: "100%", display: "block" }}
          >
            {" "}
          </div>
          <button className="view-all-btn">View all products</button>
        </div>
        <button className="generate-design-btn" onClick={handleGenerateDesign}>
          Generate
        </button>
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
              <h2>{selectedProduct.name} Variants</h2>
              <button
                className="close-btn"
                onClick={() => setShowVariantModal(false)}
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
                const currentQuantity = variantQuantities[variant.id] || 0;
                return (
                  <div
                    key={variant.id}
                    className={`variant-item ${
                      currentQuantity > 0 ? "in-stock" : ""
                    }`}
                  >
                    <div className="variant-image-container">
                      <img
                        src={variant.thumbnail}
                        alt={variant.name}
                        className="variant-image"
                      />
                    </div>
                    <p className="variant-title">{variant.name}</p>
                    {/*<p className="variant-color">{variant.name}</p>*/}
                    <div className="p-quantity-control">
                      <button
                        className="quantity-btn"
                        onClick={() => addProductToSelection(variant, -1)}
                        disabled={currentQuantity === 0}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M4 8H12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <span className="quantity">
                        {getProductQuantity(variant.productId)}
                      </span>
                      <button
                        className="quantity-btn"
                        onClick={() => addProductToSelection(variant, 1)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M8 4V12M4 8H12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="add-to-design-btn"
              onClick={() => setShowVariantModal(false)}
            >
              Add to Design
            </button>
          </div>
        </>
      )}
    </>
  );
}

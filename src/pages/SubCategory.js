import { useNavigate, useSearchParams } from "react-router-dom";
import { startNewSectionFlow } from "../utils/NavigationState";
import {
  getSubCategoriesForCollection,
  normalizeCatalogSelection,
} from "../utils/siestaCatalog";
import "./SubCategory.css";

const extractPath = (category, subCategory) => {
  return `/products?category=${encodeURIComponent(
    category
  )}&subCategory=${encodeURIComponent(subCategory)}`;
};

export default function SubCategory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { collectionSlug } = normalizeCatalogSelection(
    searchParams.get("category")
  );

  const subCategories = getSubCategoriesForCollection(collectionSlug);

  const handleCategoryClick = (category, subCategory) => {
    startNewSectionFlow();
    navigate(extractPath(category, subCategory.value));
  };

  return (
    <div className="sub-category-grid">
      {subCategories.map((subCategory) => (
        <div
          key={subCategory.id}
          className={`sub-category-card ${subCategory.gridArea}`}
          onClick={() => handleCategoryClick(collectionSlug, subCategory)}
          style={{ backgroundImage: `url(${subCategory.image})` }}
        >
          <div className="sub-category-overlay"></div>
          <p
            className={`sub-category-name ${subCategory.multiline ? "multiline" : ""
              }`}
          >
            {subCategory.displayName ?? subCategory.name}
          </p>
        </div>
      ))}
    </div>
  );
}

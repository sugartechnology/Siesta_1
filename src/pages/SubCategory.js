import { useNavigate, useSearchParams } from "react-router-dom";
import { startNewSectionFlow, categoriesMap } from "../utils/NavigationState";
import "./SubCategory.css";
import { useTranslation } from "react-i18next";

const extractPath = (category, subCategory) => {
  return `/products?category=${encodeURIComponent(
    category
  )}&subCategory=${encodeURIComponent(subCategory)}`;
};

export default function SubCategory() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const subCategories = categoriesMap[category];

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
          onClick={() => handleCategoryClick(category, subCategory)}
          style={{ backgroundImage: `url(${subCategory.image})` }}
        >
          <div className="sub-category-overlay"></div>
          <p
            className={`sub-category-name ${subCategory.multiline ? "multiline" : ""
              }`}
          >
            {subCategory.name}
          </p>
        </div>
      ))}
    </div>
  );
}

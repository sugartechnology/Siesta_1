import { useNavigate } from "react-router-dom";
import "./Catalog.css";
import { useTranslation } from "react-i18next";
import { catalogCollections } from "../utils/siestaCatalog";

export default function Catalog() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const categories = catalogCollections.map((category) => ({
    ...category,
    name: t(category.translationKey),
    path: `/subcategory?category=${encodeURIComponent(category.value)}`,
  }));

  return (
    <div className="catalog-categories">
      {categories.map((category) => (
        <div
          key={category.id}
          className="category-card"
          onClick={() => navigate(category.path)}
        >
          <div className="category-image-container">
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
            />
            <div className="category-overlay"></div>
          </div>
          <div className="category-label">
            <h2 className="category-name">{category.name}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

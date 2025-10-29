import { useNavigate, useSearchParams } from "react-router-dom";
import { NavigationState, startNewSectionFlow } from "../utils/NavigationState";
import "./SubCategory.css";

export default function SubCategory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const categories = [
    {
      id: 1,
      name: "Chairs",
      value: "chairs",
      image: "/assets/subcategory-chairs.png",
      path: `/products?category=${category}&subCategory=chairs`,
      gridArea: "chairs",
      multiline: false,
    },
    {
      id: 2,
      name: "Lighting",
      value: "lighting",
      image: "/assets/subcategory-lighting.png",
      path: `/products?category=${category}&subCategory=lighting`,
      gridArea: "lighting",
      multiline: false,
    },
    {
      id: 3,
      name: "Stools &\nComplements",
      value: "stools & complements",
      image: "/assets/subcategory-stools.png",
      path: `/products?category=${category}&subCategory=${encodeURIComponent(
        "stools & complements"
      )}`,
      gridArea: "stools",
      multiline: true,
    },
    {
      id: 4,
      name: "Sunlounger &\nLounge",
      value: "sunlounger & lounge",
      image: "/assets/subcategory-sunlounger.png",
      path: `/products?category=${category}&subCategory=${encodeURIComponent(
        "sunlounger & lounge"
      )}`,
      gridArea: "sunlounger",
      multiline: true,
    },
    {
      id: 5,
      name: "Tables",
      value: "tables",
      image: "/assets/subcategory-tables.png",
      path: `/products?category=${category}&subCategory=tables`,
      gridArea: "tables",
      multiline: false,
    },
  ];

  const handleCategoryClick = (category) => {
    startNewSectionFlow();
    navigate(category.path);
  };

  return (
    <div className="sub-category-grid">
      {categories.map((category) => (
        <div
          key={category.id}
          className={`sub-category-card ${category.gridArea}`}
          onClick={() => handleCategoryClick(category)}
          style={{ backgroundImage: `url(${category.image})` }}
        >
          <div className="sub-category-overlay"></div>
          <p
            className={`sub-category-name ${
              category.multiline ? "multiline" : ""
            }`}
          >
            {category.name}
          </p>
        </div>
      ))}
    </div>
  );
}

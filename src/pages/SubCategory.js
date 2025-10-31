import { useNavigate, useSearchParams } from "react-router-dom";
import { NavigationState, startNewSectionFlow } from "../utils/NavigationState";
import "./SubCategory.css";

export default function SubCategory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  console.log("category", category);
  const categoriesMap = {
    contract: [
      {
        id: 1,
        name: "Chairs",
        value: "chairs",
        image: "/assets/subcategory-chairs.png",
        path: `/products?category=${category}&subCategory=chairs`,
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
        multiline: true,
        gridArea: "row-span-2",
      },

      {
        id: 4,
        name: "Sunlounger &\nLounge",
        value: "sunlounger & lounge",
        image: "/assets/subcategory-sunlounger.png",
        path: `/products?category=${category}&subCategory=${encodeURIComponent(
          "sunlounger & lounge"
        )}`,
        multiline: true,
      },
      {
        id: 2,
        name: "Lighting",
        value: "lighting",
        image: "/assets/subcategory-lighting.png",
        path: `/products?category=${category}&subCategory=lighting`,
        multiline: false,
      },
      {
        id: 5,
        name: "Tables",
        value: "tables",
        image: "/assets/subcategory-tables.png",
        path: `/products?category=${category}&subCategory=tables`,
        multiline: false,
      },
    ],

    garden: [
      {
        id: 1,
        name: "Chairs",
        value: "chairs",
        image: "/assets/subcategory0-chairs.png",
        path: `/products?category=${category}&subCategory=chairs`,
        gridArea: "",
        multiline: false,
      },
      {
        id: 3,
        name: "Children Group",
        value: "children group",
        image: "/assets/subcategory0-children-group.jpg",
        path: `/products?category=${category}&subCategory=${encodeURIComponent(
          "children group"
        )}`,
        gridArea: "",
        multiline: true,
      },
      {
        id: 5,
        name: "Tables",
        value: "tables",
        image: "/assets/subcategory0-tables.png",
        path: `/products?category=${category}&subCategory=tables`,
        gridArea: "",
        multiline: false,
      },
      {
        id: 2,
        name: "Stools & Multi Purpose",
        value: "stools & multi purpose",
        image: "/assets/subcategory0-stool-multipurpose.jpg",
        path: `/products?category=${category}&subCategory=${encodeURIComponent(
          "stools & multi purpose"
        )}`,
        multiline: true,
        gridArea: "column-span-3",
      },

      {
        id: 4,
        name: "Sunloungers",
        value: "sunloungers",
        image: "/assets/subcategory0-sunloungers.jpg",
        path: `/products?category=${category}&subCategory=${encodeURIComponent(
          "sunloungers"
        )}`,
        gridArea: "column-span-3",
        multiline: true,
      },
    ],

    rattan: [
      {
        id: 1,
        name: "Chairs",
        value: "chairs",
        image: "/assets/subcategory1-chairs.png",
        path: `/products?category=${category}&subCategory=chairs`,
        gridArea: "",
        multiline: false,
      },
      {
        id: 5,
        name: "Bar Stool",
        value: "bar-stool",
        image: "/assets/subcategory1-bar-stool.jpg",
        path: `/products?category=${category}&subCategory=bar-stool`,
        multiline: false,
      },
      {
        id: 2,
        name: "Tables",
        value: "tables",
        image: "/assets/subcategory1-tables.png",
        path: `/products?category=${category}&subCategory=tables`,
        gridArea: "",
        multiline: false,
      },
      {
        id: 3,
        name: "Lounge",
        value: "lounge",
        image: "/assets/subcategory1-lounge.png",
        path: `/products?category=${category}&subCategory=lounge`,
        multiline: true,
        gridArea: "column-span-3",
      },
      {
        id: 4,
        name: "Sunloungers",
        value: "sunloungers",
        image: "/assets/subcategory1-sunloungers.png",
        path: `/products?category=${category}&subCategory=sunloungers`,
        multiline: true,
        gridArea: "column-span-3",
      },
    ],
  };

  const categories = categoriesMap[category];

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

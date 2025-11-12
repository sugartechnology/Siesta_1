import { useNavigate } from "react-router-dom";
import "./Catalog.css";

export default function Catalog() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: "Contract",
      value: "contract",
      image: "/assets/catalog-garden.png",
      path: "/subcategory?category=contract",
    },
    {
      id: 2,
      name: "Rattan",
      value: "rattan",
      image: "/assets/catalog-rattan.png",
      path: "/subcategory?category=rattan",
    },
    {
      id: 3,
      name: "Garden",
      value: "garden",
      image: "/assets/catalog-contract.png",
      path: "/subcategory?category=garden",
    },
  ];

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

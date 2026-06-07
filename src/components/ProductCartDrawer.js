import { useTranslation } from "react-i18next";
import { useProductCart } from "../contexts/ProductCartContext";
import "./ProductCartDrawer.css";

export default function ProductCartDrawer({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { items, removeProduct, addProduct, clearCart } = useProductCart();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="product-cart-backdrop"
        onClick={onClose}
        aria-label={t("common.cancel")}
      />
      <aside className="product-cart-drawer" aria-label={t("products.cartTitle")}>
        <div className="product-cart-drawer__header">
          <h2 className="product-cart-drawer__title">{t("products.cartTitle")}</h2>
          <button
            type="button"
            className="product-cart-drawer__close"
            onClick={onClose}
            aria-label={t("common.cancel")}
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="product-cart-drawer__empty">{t("products.cartEmpty")}</p>
        ) : (
          <>
            <ul className="product-cart-drawer__list">
              {items.map((item) => (
                <li key={item.productId} className="product-cart-row">
                  <img
                    src={item.url}
                    alt=""
                    className="product-cart-row__thumb"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/product-placeholder.png";
                    }}
                  />
                  <div className="product-cart-row__body">
                    <span className="product-cart-row__name">
                      {item.baseName || item.name}
                    </span>
                    <div className="product-cart-row__qty">
                      <button
                        type="button"
                        className="product-cart-row__qty-btn"
                        onClick={() => removeProduct(item.productId, 1)}
                        aria-label="-"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="product-cart-row__qty-btn"
                        onClick={() => addProduct(item, 1)}
                        aria-label="+"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="product-cart-drawer__clear-btn"
              onClick={clearCart}
            >
              {t("products.clearCart")}
            </button>
          </>
        )}
      </aside>
    </>
  );
}

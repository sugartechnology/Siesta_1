import "./TopMenu.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import ProductCartDrawer from "./ProductCartDrawer";
import { useProductCart } from "../contexts/ProductCartContext";
import { useTranslation } from "react-i18next";
import { CartIcon, MAIN_NAV_ITEMS, ProfileIcon } from "./navIcons";

const TopMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const auth = useAuth();
  const { t } = useTranslation();
  const { totalCount } = useProductCart();
  const showCart = location.pathname.startsWith("/products");

  const handleLogout = () => {
    setProfileOpen(false);
    auth.logout();
  };

  return (
    <div className="top-menu">
      <div className="menu-section">
        <nav className="nav-links" aria-label={t("nav.bottomMenu", { defaultValue: "Main navigation" })}>
          {MAIN_NAV_ITEMS.map(({ id, path, match, Icon, labelKey }) => {
            const isActive = match(location.pathname);

            return (
              <button
                key={id}
                type="button"
                className={`nav-link nav-link--${id}${isActive ? " nav-link--active" : ""}`}
                onClick={() => navigate(path)}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="nav-link__icon">
                  <Icon active={isActive} size={18} />
                </span>
                <span className="nav-link__label">{t(labelKey)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="logo-section">
        <div className="logo">
          <img src="/assets/logo.png" alt="Siesta Exclusive" />
        </div>
      </div>

      <div className="menu-actions">
        {showCart && (
          <button
            type="button"
            className="top-menu__cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label={t("products.cartTitle")}
          >
            <CartIcon size={20} />
            {totalCount > 0 && (
              <span className="top-menu__cart-badge">{totalCount}</span>
            )}
          </button>
        )}
        <LanguageSwitcher />
        <button
          type="button"
          className={`profile-icon${profileOpen ? " profile-icon--open" : ""}`}
          onClick={() => setProfileOpen((o) => !o)}
          aria-label={t("nav.accountSettings")}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
        >
          <ProfileIcon size={20} />
          {profileOpen && (
            <div className="top-menu__profile-dropdown">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/account-settings");
                }}
              >
                {t("nav.accountSettings")}
              </button>
              <button type="button" onClick={handleLogout}>
                {t("nav.logout")}
              </button>
            </div>
          )}
        </button>
      </div>

      <ProductCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default TopMenu;

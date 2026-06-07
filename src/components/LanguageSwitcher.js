import { useTranslation } from "react-i18next";
import { setAppLanguagePreference } from "../utils/nativeAppLanguage";
import "./LanguageSwitcher.css";

const LANGUAGES = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
];

const LanguageSwitcher = ({ variant = "light" }) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.resolvedLanguage?.startsWith("en") ? "en" : "tr";

  const changeLanguage = (lng) => {
    if (lng === currentLang) return;
    setAppLanguagePreference(i18n, lng);
  };

  return (
    <div
      className={`language-switcher language-switcher--${variant}`}
      role="group"
      aria-label={t("language.select")}
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`language-switcher__option${
            currentLang === code ? " is-active" : ""
          }`}
          onClick={() => changeLanguage(code)}
          aria-pressed={currentLang === code}
          aria-label={t(`language.${code}`)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

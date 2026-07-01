import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../auth/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const REMEMBER_ME_KEY = "siesta_login_prefs";

const emailInputProps = {
  type: "email",
  inputMode: "email",
  spellCheck: false,
  autoCapitalize: "off",
  autoCorrect: "off",
  placeholder: "",
};

const passwordInputProps = {
  spellCheck: false,
  autoCapitalize: "off",
  autoCorrect: "off",
  placeholder: "",
};

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2.25 12C3.75 7.5 7.5 4.5 12 4.5C16.5 4.5 20.25 7.5 21.75 12C20.25 16.5 16.5 19.5 12 19.5C7.5 19.5 3.75 16.5 2.25 12Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 3l18 18M10.2 10.2C9.82 10.58 9.6 11.1 9.6 11.7C9.6 12.86 10.54 13.8 11.7 13.8C12.3 13.8 12.82 13.58 13.2 13.2M6.53 6.67C4.74 7.97 3.3 9.77 2.25 12C3.75 16.5 7.5 19.5 12 19.5C13.77 19.5 15.4 18.97 16.77 18.05M9.9 5.27C10.58 5.1 11.28 5 12 5C16.5 5 20.25 8 21.75 12C21.2 13.36 20.4 14.58 19.4 15.58"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function PasswordField({
  id,
  name,
  label,
  hint,
  hintId,
  value,
  onChange,
  autoComplete,
  enterKeyHint,
  hasError = false,
  errorMessage = "",
  isVisible,
  onToggleVisibility,
  toggleLabel,
}) {
  return (
    <div className="input-group">
      <label htmlFor={id} className="input-label">
        {label}
      </label>
      <p id={hintId} className="input-hint">
        {hint}
      </p>
      <div className="password-input-wrap">
        <input
          {...passwordInputProps}
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`input-field ${hasError ? "input-error" : ""}`}
          autoComplete={autoComplete}
          enterKeyHint={enterKeyHint}
          aria-describedby={hintId}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={onToggleVisibility}
          aria-label={toggleLabel}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {errorMessage && <span className="field-error">{errorMessage}</span>}
    </div>
  );
}

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRePassword, setRegisterRePassword] = useState("");

  const [loginError, setLoginError] = useState("");
  const [registerErrors, setRegisterErrors] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);

  const imgBackground = "/assets/login_background.webp";
  const auth = useAuth();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_ME_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const rememberedEmail =
        typeof parsed?.email === "string"
          ? parsed.email
          : typeof parsed?.username === "string"
            ? parsed.username
            : "";

      if (parsed?.rememberMe && rememberedEmail) {
        setRememberMe(true);
        setLoginEmail(rememberedEmail);
      }
    } catch (error) {
      console.error("Failed to read remember-me prefs:", error);
    }
  }, []);

  const handleRememberMeChange = (checked) => {
    setRememberMe(checked);
    if (!checked) {
      try {
        localStorage.removeItem(REMEMBER_ME_KEY);
      } catch (error) {
        console.error("Failed to clear remember-me prefs:", error);
      }
    }
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError(t("login.errors.loginRequired"));
      return;
    }

    if (!validateEmail(loginEmail)) {
      setLoginError(t("login.errors.emailInvalid"));
      return;
    }

    auth
      .login(loginEmail.trim(), loginPassword)
      .then(() => {
        try {
          if (rememberMe) {
            localStorage.setItem(
              REMEMBER_ME_KEY,
              JSON.stringify({
                rememberMe: true,
                email: loginEmail.trim(),
              })
            );
          } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
          }
        } catch (storageError) {
          console.error("Failed to persist remember-me prefs:", storageError);
        }
        navigate("/home");
      })
      .catch((error) => {
        console.error("Login error:", error);
        setLoginError(t("login.errors.invalidCredentials"));
      });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const errors = {
      name: "",
      email: "",
      password: "",
      rePassword: "",
    };

    let hasError = false;

    if (!registerName.trim()) {
      errors.name = t("login.errors.nameRequired");
      hasError = true;
    } else if (registerName.trim().length < 2) {
      errors.name = t("login.errors.nameMinLength");
      hasError = true;
    }

    if (!registerEmail.trim()) {
      errors.email = t("login.errors.emailRequired");
      hasError = true;
    } else if (!validateEmail(registerEmail)) {
      errors.email = t("login.errors.emailInvalid");
      hasError = true;
    }

    if (!registerPassword) {
      errors.password = t("login.errors.passwordRequired");
      hasError = true;
    } else if (registerPassword.length < 6) {
      errors.password = t("login.errors.passwordMinLength");
      hasError = true;
    }

    if (!registerRePassword) {
      errors.rePassword = t("login.errors.confirmPasswordRequired");
      hasError = true;
    } else if (registerPassword !== registerRePassword) {
      errors.rePassword = t("login.errors.passwordMismatch");
      hasError = true;
    }

    setRegisterErrors(errors);
    setRegisterSuccess(false);

    if (!hasError) {
      setRegisterLoading(true);
      try {
        await auth.register(registerName, registerEmail.trim(), registerPassword);
        setRegisterSuccess(true);
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterRePassword("");
        setRegisterErrors({ name: "", email: "", password: "", rePassword: "" });

        setTimeout(() => {
          setIsLogin(true);
          setRegisterSuccess(false);
        }, 2000);
      } catch (error) {
        console.error("Registration error:", error);
        setRegisterErrors({
          name: "",
          email: error.message || t("login.errors.registerFailed"),
          password: "",
          rePassword: "",
        });
      } finally {
        setRegisterLoading(false);
      }
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setLoginError("");
    setShowLoginPassword(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setRegisterErrors({ name: "", email: "", password: "", rePassword: "" });
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
  };

  return (
    <div className="login-container">
      <div className="login-language-control">
        <LanguageSwitcher variant="glass" />
      </div>

      <div className="login-background">
        <img
          src={imgBackground}
          alt="Background"
          className="background-image"
        />
        <div className="background-overlay"></div>
      </div>

      <div className="login-content">
        <div className="login-welcome-text">
          <h2 className="welcome-subtitle">{t("login.welcomeSubtitle")}</h2>
          <h1 className="welcome-title">Siesta Exclusive AI</h1>
        </div>

        <h3 className="login-page-title">
          {isLogin ? t("login.signInToContinue") : t("login.createYourAccount")}
        </h3>

        <div className="login-card">
          {isLogin ? (
            <form onSubmit={handleSignIn} className="login-form">
              {loginError && <div className="error-message">{loginError}</div>}

              <div className="input-group">
                <label htmlFor="login-email" className="input-label">
                  {t("login.email")}
                </label>
                <p id="login-email-hint" className="input-hint">
                  {t("login.emailHint")}
                </p>
                <input
                  {...emailInputProps}
                  id="login-email"
                  name="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input-field"
                  autoComplete="username"
                  enterKeyHint="next"
                  aria-describedby="login-email-hint"
                />
              </div>

              <PasswordField
                id="login-password"
                name="password"
                label={t("login.password")}
                hint={t("login.passwordHint")}
                hintId="login-password-hint"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="current-password"
                enterKeyHint="done"
                isVisible={showLoginPassword}
                onToggleVisibility={() => setShowLoginPassword((prev) => !prev)}
                toggleLabel={
                  showLoginPassword
                    ? t("login.hidePassword")
                    : t("login.showPassword")
                }
              />

              <div className="remember-me-row">
                <label className="remember-me-label">
                  <input
                    type="checkbox"
                    className="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberMeChange(e.target.checked)}
                  />
                  {t("login.rememberMe")}
                </label>
              </div>

              <button type="button" className="forgot-password-btn">
                {t("login.forgotPassword")}
              </button>

              <button type="submit" className="sign-in-btn">
                {t("login.signIn")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="login-form">
              {registerSuccess && (
                <div className="success-message">{t("login.registerSuccess")}</div>
              )}

              <div className="input-group">
                <label htmlFor="register-name" className="input-label">
                  {t("login.fullName")}
                </label>
                <p id="register-name-hint" className="input-hint">
                  {t("login.fullNameHint")}
                </p>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder=""
                  className={`input-field ${registerErrors.name ? "input-error" : ""}`}
                  autoComplete="name"
                  enterKeyHint="next"
                  aria-describedby="register-name-hint"
                />
                {registerErrors.name && (
                  <span className="field-error">{registerErrors.name}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="register-email" className="input-label">
                  {t("login.email")}
                </label>
                <p id="register-email-hint" className="input-hint">
                  {t("login.registerEmailHint")}
                </p>
                <input
                  {...emailInputProps}
                  id="register-email"
                  name="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={`input-field ${registerErrors.email ? "input-error" : ""}`}
                  autoComplete="email"
                  enterKeyHint="next"
                  aria-describedby="register-email-hint"
                />
                {registerErrors.email && (
                  <span className="field-error">{registerErrors.email}</span>
                )}
              </div>

              <PasswordField
                id="register-password"
                name="new-password"
                label={t("login.password")}
                hint={t("login.registerPasswordHint")}
                hintId="register-password-hint"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                autoComplete="new-password"
                enterKeyHint="next"
                hasError={Boolean(registerErrors.password)}
                errorMessage={registerErrors.password}
                isVisible={showRegisterPassword}
                onToggleVisibility={() =>
                  setShowRegisterPassword((prev) => !prev)
                }
                toggleLabel={
                  showRegisterPassword
                    ? t("login.hidePassword")
                    : t("login.showPassword")
                }
              />

              <PasswordField
                id="register-confirm-password"
                name="confirm-password"
                label={t("login.confirmPassword")}
                hint={t("login.confirmPasswordHint")}
                hintId="register-confirm-password-hint"
                value={registerRePassword}
                onChange={(e) => setRegisterRePassword(e.target.value)}
                autoComplete="new-password"
                enterKeyHint="done"
                hasError={Boolean(registerErrors.rePassword)}
                errorMessage={registerErrors.rePassword}
                isVisible={showRegisterConfirmPassword}
                onToggleVisibility={() =>
                  setShowRegisterConfirmPassword((prev) => !prev)
                }
                toggleLabel={
                  showRegisterConfirmPassword
                    ? t("login.hidePassword")
                    : t("login.showPassword")
                }
              />

              <button
                type="submit"
                className="sign-in-btn"
                disabled={registerLoading}
              >
                {registerLoading ? t("login.saving") : t("login.signUp")}
              </button>
            </form>
          )}

          {isLogin ? (
            <div className="signup-link">
              {t("login.dontHaveAccount")}{" "}
              <span className="signup-link-text" onClick={switchToRegister}>
                {t("login.signUp")}
              </span>
            </div>
          ) : (
            <div className="signup-link">
              {t("login.alreadyHaveAccount")}{" "}
              <span className="signup-link-text" onClick={switchToLogin}>
                {t("login.signIn")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

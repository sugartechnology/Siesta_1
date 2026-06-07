import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../auth/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRePassword, setRegisterRePassword] = useState("");

  // Error states
  const [loginError, setLoginError] = useState("");
  const [registerErrors, setRegisterErrors] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const imgBackground = "/assets/login_background.webp";


  const auth = useAuth();
  const REMEMBER_ME_KEY = "siesta_login_prefs";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_ME_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (parsed?.rememberMe && typeof parsed.username === "string") {
        setRememberMe(true);
        setLoginUsername(parsed.username);
      }
    } catch (error) {
      console.error("Failed to read remember-me prefs:", error);
    }
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();
    setLoginError("");

    // Accept any login info as long as both fields have values
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both username and password");
      return;
    }

    auth
      .login(loginUsername, loginPassword)
      .then(() => {
        console.log("Login successful");
        try {
          if (rememberMe) {
            const prefs = {
              rememberMe: true,
              username: loginUsername,
            };
            localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(prefs));
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
        setLoginError("Invalid username or password");
      });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Reset errors
    const errors = {
      name: "",
      email: "",
      password: "",
      rePassword: "",
    };

    let hasError = false;

    // Validate name
    if (!registerName.trim()) {
      errors.name = "Name is required";
      hasError = true;
    } else if (registerName.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      hasError = true;
    }

    // Validate email
    if (!registerEmail.trim()) {
      errors.email = "Email is required";
      hasError = true;
    } else if (!validateEmail(registerEmail)) {
      errors.email = "Please enter a valid email address";
      hasError = true;
    }

    // Validate password
    if (!registerPassword) {
      errors.password = "Password is required";
      hasError = true;
    } else if (registerPassword.length < 6) {
      errors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    // Validate re-password
    if (!registerRePassword) {
      errors.rePassword = "Please confirm your password";
      hasError = true;
    } else if (registerPassword !== registerRePassword) {
      errors.rePassword = "Passwords do not match";
      hasError = true;
    }

    setRegisterErrors(errors);
    setRegisterSuccess(false);

    if (!hasError) {
      setRegisterLoading(true);
      try {
        await auth.register(registerName, registerEmail, registerPassword);
        setRegisterSuccess(true);
        // Clear register form
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterRePassword("");
        setRegisterErrors({ name: "", email: "", password: "", rePassword: "" });

        // Show success message and switch to login after 2 seconds
        setTimeout(() => {
          setIsLogin(true);
          setRegisterSuccess(false);
        }, 2000);
      } catch (error) {
        console.error("Registration error:", error);
        setRegisterErrors({
          name: "",
          email: error.message || "Kayıt başarısız. Lütfen tekrar deneyin.",
          password: "",
          rePassword: "",
        });
      } finally {
        setRegisterLoading(false);
      }
    }
  };

  const handleContinueWithoutLogin = () => {
    navigate("/home");
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setLoginError("");
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setRegisterErrors({ name: "", email: "", password: "", rePassword: "" });
  };

  return (
    <div className="login-container">
      <div className="login-language-control">
        <LanguageSwitcher variant="glass" />
      </div>

      {/* Background Image */}
      <div className="login-background">
        <img
          src={imgBackground}
          alt="Background"
          className="background-image"
        />
        <div className="background-overlay"></div>
      </div>

      {/* Login Content */}
      <div className="login-content">
        {/* Logo
        <div className="login-logo-container">
          <img src={imgLogo} alt="Siesta" className="login-logo" />
        </div>
 */}
        {/* Welcome Text */}
        <div className="login-welcome-text">
          <h2 className="welcome-subtitle">{t('login.welcomeSubtitle')}</h2>
          <h1 className="welcome-title">Siesta Exclusive AI</h1>
        </div>

        {/* Sign in to continue - Moved outside card */}
        <h3 className="login-page-title">
          {isLogin ? t('login.signInToContinue') : t('login.createYourAccount')}
        </h3>

        {/* Login/Register Form Card */}
        <div className="login-card">
          {isLogin ? (
            // LOGIN FORM
            <form onSubmit={handleSignIn} className="login-form">
              {loginError && <div className="error-message">{loginError}</div>}

              {/* Username Field */}
              <div className="input-group">
                <label htmlFor="login-username" className="input-label">{t('login.username')}</label>
                <input
                  id="login-username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="johndoe@mail.com"
                  className="input-field"
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label htmlFor="login-password" className="input-label">{t('login.password')}</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="•••••••••"
                  className="input-field"
                  autoComplete="current-password"
                />
              </div>

              {/* Remember Me */}
              <div className="remember-me-row">
                <label className="remember-me-label">
                  <input
                    type="checkbox"
                    className="remember-me-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {t('login.rememberMe')}
                </label>
              </div>

              {/* Forgot Password */}
              <button type="button" className="forgot-password-btn">
                {t('login.forgotPassword')}
              </button>

              {/* Sign In Button */}
              <button type="submit" className="sign-in-btn">
                {t('login.signIn')}
              </button>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegister} className="login-form">
              {registerSuccess && (
                <div className="success-message">
                  Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
                </div>
              )}
              {/* Name Field */}
              <div className="input-group">
                <label htmlFor="register-name" className="input-label">{t('login.fullName')}</label>
                <input
                  id="register-name"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="John Doe"
                  className={`input-field ${registerErrors.name ? "input-error" : ""}`}
                  autoComplete="name"
                />
                {registerErrors.name && (
                  <span className="field-error">{registerErrors.name}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="input-group">
                <label htmlFor="register-email" className="input-label">{t('login.email')}</label>
                <input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="johndoe@mail.com"
                  className={`input-field ${registerErrors.email ? "input-error" : ""}`}
                  autoComplete="email"
                />
                {registerErrors.email && (
                  <span className="field-error">{registerErrors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label htmlFor="register-password" className="input-label">{t('login.password')}</label>
                <input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="•••••••••"
                  className={`input-field ${registerErrors.password ? "input-error" : ""}`}
                  autoComplete="new-password"
                />
                {registerErrors.password && (
                  <span className="field-error">{registerErrors.password}</span>
                )}
              </div>

              {/* Re-Password Field */}
              <div className="input-group">
                <label htmlFor="register-confirm-password" className="input-label">{t('login.confirmPassword')}</label>
                <input
                  id="register-confirm-password"
                  type="password"
                  value={registerRePassword}
                  onChange={(e) => setRegisterRePassword(e.target.value)}
                  placeholder="•••••••••"
                  className={`input-field ${registerErrors.rePassword ? "input-error" : ""}`}
                  autoComplete="new-password"
                />
                {registerErrors.rePassword && (
                  <span className="field-error">
                    {registerErrors.rePassword}
                  </span>
                )}
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="sign-in-btn"
                disabled={registerLoading}
              >
                {registerLoading ? t('login.saving') : t('login.signUp')}
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          {isLogin ? (
            <div className="signup-link">
              {t('login.dontHaveAccount')}{" "}
              <span className="signup-link-text" onClick={switchToRegister}>
                {t('login.signUp')}
              </span>
            </div>
          ) : (
            <div className="signup-link">
              {t('login.alreadyHaveAccount')}{" "}
              <span className="signup-link-text" onClick={switchToLogin}>
                {t('login.signIn')}
              </span>
            </div>
          )}

          {/* Continue Without Login 
          {isLogin && (
            <div className="continue-without-login">
              <button
                className="continue-link"
                onClick={handleContinueWithoutLogin}
              >
                Continue Without Login
              </button>
            </div>
          )}*/}
        </div>
      </div>
    </div>
  );
};

export default Login;

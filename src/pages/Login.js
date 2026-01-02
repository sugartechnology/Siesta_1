import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../auth/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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

  const imgLogo = "/assets/logo_big.png";
  const imgBackground = "/assets/login_background.jpg";
  const imgFacebook =
    "http://localhost:3845/assets/88b63fe33fffe95c43e282e2280b18c129842d26.svg";
  const imgGoogle =
    "http://localhost:3845/assets/6976bc1ec977a49f1b8210b6a3215c023b636d69.svg";
  const imgApple =
    "http://localhost:3845/assets/aa9ac7f11aa49d2924c673c3aa1f0b953d28b9b8.svg";

  const auth = useAuth();

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

  const handleSocialLogin = (provider) => {
    // Simulate social login - in real app, this would handle OAuth
    alert(`Logging in with ${provider}...`);
    navigate("/home");
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
          <h2 className="welcome-subtitle">Welcome to</h2>
          <h1 className="welcome-title">SiestaAI</h1>
        </div>

        {/* Sign in to continue - Moved outside card */}
        <h3 className="login-page-title">
          {isLogin ? "Sign in to continue" : "Create your account"}
        </h3>

        {/* Login/Register Form Card */}
        <div className="login-card">
          {isLogin ? (
            // LOGIN FORM
            <form onSubmit={handleSignIn} className="login-form">
              {loginError && <div className="error-message">{loginError}</div>}

              {/* Username Field */}
              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="johndoe@mail.com"
                  className="input-field"
                />
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="•••••••••"
                  className="input-field"
                />
              </div>

              {/* Forgot Password */}
              <button type="button" className="forgot-password-btn">
                Forgot password?
              </button>

              {/* Sign In Button */}
              <button type="submit" className="sign-in-btn">
                Sign In
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
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="John Doe"
                  className={`input-field ${
                    registerErrors.name ? "input-error" : ""
                  }`}
                />
                {registerErrors.name && (
                  <span className="field-error">{registerErrors.name}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="johndoe@mail.com"
                  className={`input-field ${
                    registerErrors.email ? "input-error" : ""
                  }`}
                />
                {registerErrors.email && (
                  <span className="field-error">{registerErrors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="•••••••••"
                  className={`input-field ${
                    registerErrors.password ? "input-error" : ""
                  }`}
                />
                {registerErrors.password && (
                  <span className="field-error">{registerErrors.password}</span>
                )}
              </div>

              {/* Re-Password Field */}
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input
                  type="password"
                  value={registerRePassword}
                  onChange={(e) => setRegisterRePassword(e.target.value)}
                  placeholder="•••••••••"
                  className={`input-field ${
                    registerErrors.rePassword ? "input-error" : ""
                  }`}
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
                {registerLoading ? "Kaydediliyor..." : "Sign Up"}
              </button>
            </form>
          )}

          {/* Social Login Divider */}
          <div className="social-divider">
            <div className="divider-line"></div>
            <span className="divider-text">
              or {isLogin ? "Sign in" : "Sign up"} with
            </span>
            <div className="divider-line"></div>
          </div>

          {/* Social Login Buttons 
          <div className="social-buttons">
            <button className="social-btn" onClick={() => handleSocialLogin('Facebook')}>
              <img src={imgFacebook} alt="Facebook" />
            </button>
            <button className="social-btn" onClick={() => handleSocialLogin('Google')}>
              <img src={imgGoogle} alt="Google" />
            </button>
            <button className="social-btn" onClick={() => handleSocialLogin('Apple')}>
              <img src={imgApple} alt="Apple" />
            </button>
          </div>
          */}
          {/* Toggle between Login and Register */}
          {isLogin ? (
            <div className="signup-link">
              Don't have an account?{" "}
              <span className="signup-link-text" onClick={switchToRegister}>
                Sign Up
              </span>
            </div>
          ) : (
            <div className="signup-link">
              Already have an account?{" "}
              <span className="signup-link-text" onClick={switchToLogin}>
                Sign In
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Login.css";
import { PasswordField } from "./Login";
import { useAuth } from "../auth/useAuth";
import { changeCurrentUserPassword } from "../api/Api";
import LanguageSwitcher from "../components/LanguageSwitcher";

// Same rules as the CRM (LinkedUserPasswordSyncService.validatePassword):
// trimmed, at least 4 characters, at most 72 bytes.
const MIN_PASSWORD_LENGTH = 4;
const MAX_PASSWORD_BYTES = 72;

/**
 * Shown when the CRM requires a new password (after signing in with a temporary password).
 * The CRM blocks every other request until the password is changed, and ends all sessions
 * after the change, so we sign in again with the new password and continue to /home.
 */
const ChangePassword = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const auth = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({ current: "", new: "", confirm: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const imgBackground = "/assets/login_background.webp";

  const validate = () => {
    const nextErrors = { current: "", new: "", confirm: "" };
    const trimmedNewPassword = newPassword.trim();

    if (!currentPassword.trim()) {
      nextErrors.current = t("login.changePassword.errors.currentRequired");
    }

    if (!trimmedNewPassword) {
      nextErrors.new = t("login.errors.passwordRequired");
    } else if (trimmedNewPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.new = t("login.changePassword.errors.tooShort");
    } else if (
      new TextEncoder().encode(trimmedNewPassword).length > MAX_PASSWORD_BYTES
    ) {
      nextErrors.new = t("login.changePassword.errors.tooLong");
    }

    if (!confirmNewPassword.trim()) {
      nextErrors.confirm = t("login.errors.confirmPasswordRequired");
    } else if (confirmNewPassword.trim() !== trimmedNewPassword) {
      nextErrors.confirm = t("login.errors.passwordMismatch");
    }

    setErrors(nextErrors);
    return !nextErrors.current && !nextErrors.new && !nextErrors.confirm;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    const trimmedNewPassword = newPassword.trim();
    setSaving(true);

    try {
      await changeCurrentUserPassword(
        currentPassword,
        trimmedNewPassword,
        confirmNewPassword.trim(),
        i18n.language
      );
    } catch (error) {
      console.error("Change password error:", error);
      // 400 = CRM validation message (e.g. wrong current password), already in the app language.
      setFormError(
        error?.status === 400 && error.payload?.message
          ? error.payload.message
          : t("login.recovery.failed")
      );
      setSaving(false);
      return;
    }

    try {
      await auth.login(auth.user?.email, trimmedNewPassword);
      navigate("/home");
    } catch (error) {
      console.error("Sign-in after password change failed:", error);
      auth.logout();
    }
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
          <h1 className="welcome-title">Siesta Exclusive AI</h1>
        </div>

        <h3 className="login-page-title">{t("login.changePassword.title")}</h3>

        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <p className="input-hint">{t("login.changePassword.info")}</p>

            {formError && <div className="error-message">{formError}</div>}

            <PasswordField
              id="current-password"
              name="current-password"
              label={t("login.changePassword.currentPassword")}
              hint={t("login.changePassword.currentPasswordHint")}
              hintId="current-password-hint"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              enterKeyHint="next"
              hasError={Boolean(errors.current)}
              errorMessage={errors.current}
              isVisible={showCurrentPassword}
              onToggleVisibility={() => setShowCurrentPassword((prev) => !prev)}
              toggleLabel={
                showCurrentPassword
                  ? t("login.hidePassword")
                  : t("login.showPassword")
              }
            />

            <PasswordField
              id="new-password"
              name="new-password"
              label={t("login.changePassword.newPassword")}
              hint={t("login.changePassword.newPasswordHint")}
              hintId="new-password-hint"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              enterKeyHint="next"
              hasError={Boolean(errors.new)}
              errorMessage={errors.new}
              isVisible={showNewPassword}
              onToggleVisibility={() => setShowNewPassword((prev) => !prev)}
              toggleLabel={
                showNewPassword ? t("login.hidePassword") : t("login.showPassword")
              }
            />

            <PasswordField
              id="confirm-new-password"
              name="confirm-new-password"
              label={t("login.changePassword.confirmNewPassword")}
              hint={t("login.changePassword.confirmNewPasswordHint")}
              hintId="confirm-new-password-hint"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
              enterKeyHint="done"
              hasError={Boolean(errors.confirm)}
              errorMessage={errors.confirm}
              isVisible={showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
              toggleLabel={
                showConfirmPassword
                  ? t("login.hidePassword")
                  : t("login.showPassword")
              }
            />

            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => auth.logout()}
            >
              {t("login.recovery.backToSignIn")}
            </button>

            <button type="submit" className="sign-in-btn" disabled={saving}>
              {saving ? t("login.saving") : t("login.changePassword.save")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;

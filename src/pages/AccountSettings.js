import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  getCurrentUser,
  updateUserProfile,
  suspendUserAccount,
  reactivateUserAccount,
} from "../api/Api";
import "./AccountSettings.css";
import { useTranslation } from "react-i18next";

const AccountSettings = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
      });
      setIsSuspended(userData.suspended || false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setError(t('accountSettings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateUserProfile(formData);
      setSuccess(t('accountSettings.updateSuccess'));
      await loadUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(t('accountSettings.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendAccount = async () => {
    if (
      !window.confirm(
        t('accountSettings.suspendConfirm')
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await suspendUserAccount();
      setIsSuspended(true);
      setSuccess(t('accountSettings.suspendSuccess'));
      // Logout after suspension
      setTimeout(() => {
        auth.logout();
      }, 2000);
    } catch (error) {
      console.error("Error suspending account:", error);
      setError(t('accountSettings.suspendError'));
    } finally {
      setSaving(false);
    }
  };

  const handleReactivateAccount = async () => {
    try {
      setSaving(true);
      await reactivateUserAccount();
      setIsSuspended(false);
      setSuccess(t('accountSettings.reactivateSuccess'));
      await loadUserData();
    } catch (error) {
      console.error("Error reactivating account:", error);
      setError(t('accountSettings.reactivateError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="account-settings-container">
        <div className="loading">{t('accountSettings.loading')}</div>
      </div>
    );
  }

  return (
    <div className="account-settings-container">
      <div className="account-settings-header">
        <h1>{t('accountSettings.title')}</h1>
      </div>

      <div className="account-settings-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSave} className="account-form">
          <div className="form-group">
            <label htmlFor="name" className="input-label">{t('accountSettings.fullName')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSuspended || saving}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="input-label">{t('accountSettings.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSuspended || saving}
              className="input-field"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="sign-in-btn"
              disabled={isSuspended || saving}
            >
              {saving ? t('accountSettings.saving') : t('accountSettings.save')}
            </button>
          </div>
        </form>

        <div className="account-actions">
          <h2>{t('accountSettings.actions')}</h2>

          {isSuspended ? (
            <div className="suspended-notice">
              <p>{t('accountSettings.suspendedNotice')}</p>
              <button
                className="reactivate-button"
                onClick={handleReactivateAccount}
                disabled={saving}
              >
                {t('accountSettings.reactivateAccount')}
              </button>
            </div>
          ) : (
            <button
              className="suspend-button"
              onClick={handleSuspendAccount}
              disabled={saving}
            >
              {t('accountSettings.suspendAccount')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;


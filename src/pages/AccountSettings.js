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

const AccountSettings = () => {
  const navigate = useNavigate();
  const auth = useAuth();
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
      setError("Failed to load user information");
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
      setSuccess("Profile updated successfully");
      await loadUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to suspend your account? You will not be able to log in after suspension."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await suspendUserAccount();
      setIsSuspended(true);
      setSuccess("Your account has been suspended");
      // Logout after suspension
      setTimeout(() => {
        auth.logout();
      }, 2000);
    } catch (error) {
      console.error("Error suspending account:", error);
      setError("Failed to suspend account");
    } finally {
      setSaving(false);
    }
  };

  const handleReactivateAccount = async () => {
    try {
      setSaving(true);
      await reactivateUserAccount();
      setIsSuspended(false);
      setSuccess("Your account has been reactivated");
      await loadUserData();
    } catch (error) {
      console.error("Error reactivating account:", error);
      setError("Failed to reactivate account");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="account-settings-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="account-settings-container">
      <div className="account-settings-header">
        <h1>Account Settings</h1>
      </div>

      <div className="account-settings-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSave} className="account-form">
          <div className="form-group">
            <label htmlFor="name" className="input-label">Full Name</label>
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
            <label htmlFor="email" className="input-label">Email</label>
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
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        <div className="account-actions">
          <h2>Account Actions</h2>
          
          {isSuspended ? (
            <div className="suspended-notice">
              <p>Your account is currently suspended.</p>
              <button
                className="reactivate-button"
                onClick={handleReactivateAccount}
                disabled={saving}
              >
                Reactivate Account
              </button>
            </div>
          ) : (
            <button
              className="suspend-button"
              onClick={handleSuspendAccount}
              disabled={saving}
            >
              Suspend Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;


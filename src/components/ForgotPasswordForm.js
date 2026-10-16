import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getPasswordRecoveryOptions,
  sendTemporaryPassword,
} from "../api/Api";
import "./ForgotPasswordForm.css";

const toMinutes = (seconds) => Math.max(1, Math.ceil(seconds / 60));

/**
 * "Forgot password?" flow inside the login card.
 * Steps: identify (email/username) → channel (email or SMS) → sent.
 * The CRM sends a temporary password; the user signs in with it.
 */
function ForgotPasswordForm({ initialIdentifier = "", onBack }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState("identify");
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(null);
  const [sentResult, setSentResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 400 = CRM validation message (e.g. daily limit), already in the app language.
  const getErrorMessage = (err) =>
    err?.status === 400 && err.payload?.message
      ? err.payload.message
      : t("login.recovery.failed");

  const handleLookup = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError(t("login.recovery.identifierRequired"));
      return;
    }

    setLoading(true);
    try {
      const result = await getPasswordRecoveryOptions(
        trimmedIdentifier,
        i18n.language
      );
      if (!result?.matched) {
        setError(t("login.recovery.notFound"));
      } else if (result.supportRequired) {
        setError(t("login.recovery.supportRequired"));
      } else {
        const options = result.availableChannels || [];
        setChannels(options);
        setSelectedChannel(options[0]?.channel || "");
        setRetryAfterSeconds(result.retryAfterSeconds || null);
        setStep("channel");
      }
    } catch (err) {
      console.error("Password recovery lookup error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await sendTemporaryPassword(
        identifier.trim(),
        selectedChannel,
        i18n.language
      );
      if (result?.sent) {
        setSentResult(result);
        setStep("sent");
      } else if (result?.supportRequired) {
        setError(t("login.recovery.supportRequired"));
      } else if (result?.retryAfterSeconds) {
        setError(
          t("login.recovery.alreadySent", {
            minutes: toMinutes(result.retryAfterSeconds),
          })
        );
      } else {
        setError(t("login.recovery.failed"));
      }
    } catch (err) {
      console.error("Password recovery send error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const backButton = (
    <button
      type="button"
      className="forgot-password-btn"
      onClick={() => onBack(identifier.trim())}
    >
      {t("login.recovery.backToSignIn")}
    </button>
  );

  if (step === "sent") {
    return (
      <div className="login-form">
        <div className="success-message">
          {t("login.recovery.sent", {
            destination: sentResult.maskedDestination,
            minutes: toMinutes(sentResult.expiresInSeconds),
          })}
        </div>
        <button
          type="button"
          className="sign-in-btn"
          onClick={() => onBack(identifier.trim())}
        >
          {t("login.recovery.backToSignIn")}
        </button>
      </div>
    );
  }

  if (step === "channel") {
    return (
      <form onSubmit={handleSend} className="login-form">
        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <span id="recovery-channel-label" className="input-label">
            {t("login.recovery.channelLabel")}
          </span>
          <p className="input-hint">{t("login.recovery.channelHint")}</p>
          <div
            className="recovery-channel-list"
            role="radiogroup"
            aria-labelledby="recovery-channel-label"
          >
            {channels.map((option) => (
              <label key={option.channel} className="recovery-channel-option">
                <input
                  type="radio"
                  name="recovery-channel"
                  value={option.channel}
                  checked={selectedChannel === option.channel}
                  onChange={() => setSelectedChannel(option.channel)}
                />
                {option.channel === "SMS"
                  ? t("login.recovery.channelSms", {
                      destination: option.maskedDestination,
                    })
                  : t("login.recovery.channelEmail", {
                      destination: option.maskedDestination,
                    })}
              </label>
            ))}
          </div>
          {retryAfterSeconds && (
            <p className="input-hint">
              {t("login.recovery.alreadySent", {
                minutes: toMinutes(retryAfterSeconds),
              })}
            </p>
          )}
        </div>

        {backButton}

        <button
          type="submit"
          className="sign-in-btn"
          disabled={loading || !selectedChannel}
        >
          {loading ? t("login.recovery.pleaseWait") : t("login.recovery.send")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLookup} className="login-form">
      {error && <div className="error-message">{error}</div>}

      <div className="input-group">
        <label htmlFor="recovery-identifier" className="input-label">
          {t("login.recovery.identifierLabel")}
        </label>
        <p id="recovery-identifier-hint" className="input-hint">
          {t("login.recovery.identifierHint")}
        </p>
        <input
          id="recovery-identifier"
          name="username"
          type="text"
          inputMode="email"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="input-field"
          autoComplete="username"
          enterKeyHint="send"
          aria-describedby="recovery-identifier-hint"
        />
      </div>

      {backButton}

      <button type="submit" className="sign-in-btn" disabled={loading}>
        {loading ? t("login.recovery.pleaseWait") : t("login.recovery.continue")}
      </button>
    </form>
  );
}

export default ForgotPasswordForm;

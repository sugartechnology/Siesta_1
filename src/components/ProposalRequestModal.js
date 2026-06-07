import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { requestProjectProposal } from "../utils/requestProposal";
import ProposalPdfPreview from "./ProposalPdfPreview";
import "./ProposalRequestModal.css";

export default function ProposalRequestModal({
  isOpen,
  project,
  pdfBlob,
  pdfFileName,
  isGenerating = false,
  onClose,
}) {
  const { t } = useTranslation();
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setMarketingConsent(false);
      setIsSubmitting(false);
      setSubmitResult(null);
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleDownload = () => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = pdfFileName || "siesta-proposal.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      window.setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  };

  const handleSubmit = async () => {
    if (!marketingConsent || isSubmitting || isGenerating) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const result = await requestProjectProposal({
        projectId: project?.id,
        projectName: project?.name,
        marketingConsent,
      });
      setSubmitResult(result);
    } catch (error) {
      console.error("Proposal request failed:", error);
      setSubmitError(t("projects.proposal.requestError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="proposal-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="proposal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-modal-title"
      >
        <header className="proposal-modal__header">
          <div>
            <h2 id="proposal-modal-title">{t("projects.proposal.modalTitle")}</h2>
            <p className="proposal-modal__subtitle">
              {t("projects.proposal.modalSubtitle", { name: project?.name || "" })}
            </p>
          </div>
          <button
            type="button"
            className="proposal-modal__close"
            onClick={onClose}
            aria-label={t("common.cancel")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="proposal-modal__preview-wrap">
          {isGenerating ? (
            <div className="proposal-modal__loading">
              <span className="proposal-modal__spinner" aria-hidden="true" />
              <p>{t("projects.proposal.generating")}</p>
            </div>
          ) : pdfBlob ? (
            <ProposalPdfPreview
              pdfBlob={pdfBlob}
              fileName={pdfFileName}
              onDownload={handleDownload}
              onPrint={handlePrint}
              downloadLabel={t("projects.proposal.download")}
              printLabel={t("projects.proposal.print")}
              unavailableLabel={t("projects.proposal.previewUnavailable")}
            />
          ) : (
            <div className="proposal-modal__loading">
              <p>{t("projects.proposal.previewUnavailable")}</p>
            </div>
          )}
        </div>

        {submitResult?.success ? (
          <div className="proposal-modal__success" role="status">
            <p className="proposal-modal__success-title">
              {t("projects.proposal.requestSuccessTitle")}
            </p>
            <p>{t("projects.proposal.requestSuccess")}</p>
            <p className="proposal-modal__reference">
              {t("projects.proposal.referenceId", {
                id: submitResult.referenceId,
              })}
            </p>
          </div>
        ) : (
          <div className="proposal-modal__footer">
            <label className="proposal-modal__consent">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                disabled={isSubmitting || isGenerating}
              />
              <span>{t("projects.proposal.marketingConsent")}</span>
            </label>

            {submitError && (
              <p className="proposal-modal__error" role="alert">
                {submitError}
              </p>
            )}

            <button
              type="button"
              className="proposal-modal__submit"
              onClick={handleSubmit}
              disabled={!marketingConsent || isSubmitting || isGenerating}
            >
              {isSubmitting
                ? t("projects.proposal.requestSending")
                : t("projects.proposal.requestButton")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

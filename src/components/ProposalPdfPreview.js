import { useEffect, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import "./ProposalPdfPreview.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

export default function ProposalPdfPreview({
  pdfBlob,
  fileName,
  onDownload,
  onPrint,
  downloadLabel = "Download",
  printLabel = "Print",
  unavailableLabel = "Preview unavailable",
}) {
  const [pageImages, setPageImages] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(pdfBlob));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfBlob) {
      setPageImages([]);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;

    const renderPages = async () => {
      setIsLoading(true);
      setError(null);
      setPageImages([]);

      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const images = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.35 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          images.push(canvas.toDataURL("image/jpeg", 0.92));
        }

        if (!cancelled) {
          setPageImages(images);
        }
      } catch (renderError) {
        console.error("PDF preview render failed:", renderError);
        if (!cancelled) {
          setError(renderError);
          setPageImages([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    renderPages();

    return () => {
      cancelled = true;
    };
  }, [pdfBlob]);

  const handleDownload = () => {
    if (!pdfBlob || !onDownload) return;
    onDownload();
  };

  const handlePrint = () => {
    if (!pdfBlob || !onPrint) return;
    onPrint();
  };

  return (
    <div className="proposal-pdf-preview">
      <div className="proposal-pdf-preview__toolbar">
        <button
          type="button"
          className="proposal-pdf-preview__icon-btn"
          onClick={handleDownload}
          disabled={!pdfBlob || isLoading}
          aria-label={downloadLabel}
          title={downloadLabel}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3v12m0 0l4-4m-4 4l-4-4M4 19h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="proposal-pdf-preview__icon-btn"
          onClick={handlePrint}
          disabled={!pdfBlob || isLoading}
          aria-label={printLabel}
          title={printLabel}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v6H7v-6Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="proposal-pdf-preview__scroll">
        {isLoading ? (
          <div className="proposal-pdf-preview__state">
            <span className="proposal-pdf-preview__spinner" aria-hidden="true" />
          </div>
        ) : error ? (
          <div className="proposal-pdf-preview__state">{unavailableLabel}</div>
        ) : pageImages.length === 0 ? (
          <div className="proposal-pdf-preview__state">{unavailableLabel}</div>
        ) : (
          <div className="proposal-pdf-preview__pages">
            {pageImages.map((src, index) => (
              <img
                key={`page-${index + 1}`}
                src={src}
                alt={`Page ${index + 1}`}
                className="proposal-pdf-preview__page"
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

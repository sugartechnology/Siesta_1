import { jsPDF } from "jspdf";
import { getProductsByIds } from "../api/Api";

const LOGO_URL = "/assets/logo_big.png";
const PAGE_MARGIN = 16;
const CONTENT_WIDTH = 210 - PAGE_MARGIN * 2;
const PRODUCT_THUMB_SIZE = 20;
const PRODUCT_ROW_HEIGHT = 24;

const sanitizeFileName = (name) =>
  String(name || "siesta-project")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || "siesta-project";

function isDataUrl(url) {
  return typeof url === "string" && url.startsWith("data:");
}

function getImageRequestHeaders() {
  const headers = {};
  const authToken = localStorage.getItem("auth_token");
  if (authToken && authToken !== "null" && authToken !== "undefined") {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const companySlug = process.env.REACT_APP_COMPANY_SLUG;
  const tenantId = process.env.REACT_APP_TENANT_ID;
  if (companySlug) headers["X-Company-Slug"] = companySlug;
  if (tenantId) headers["X-Tenant-Id"] = tenantId;
  return headers;
}

function resolveAssetUrl(url) {
  if (!url) return null;
  if (isDataUrl(url) || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    const apiBase = process.env.REACT_APP_API_URL || "";
    const apiOrigin = apiBase.replace(/\/api\/?$/, "");
    if (apiOrigin && !url.startsWith("/assets/")) {
      return `${apiOrigin}${url}`;
    }
    return `${window.location.origin}${url}`;
  }
  return url;
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

async function loadImageViaCanvas(url) {
  const resolvedUrl = resolveAssetUrl(url);
  if (!resolvedUrl) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = resolvedUrl;
  });
}

const imageDataUrlCache = new Map();

async function loadImageDataUrl(url) {
  const resolvedUrl = resolveAssetUrl(url);
  if (!resolvedUrl) return null;
  if (isDataUrl(resolvedUrl)) return resolvedUrl;

  if (imageDataUrlCache.has(resolvedUrl)) {
    return imageDataUrlCache.get(resolvedUrl);
  }

  const candidates = [resolvedUrl];
  if (
    resolvedUrl.startsWith("http") &&
    !resolvedUrl.includes(window.location.host)
  ) {
    candidates.push(resolvedUrl.replace(/^https?:\/\/[^/]+/, window.location.origin));
  }

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        mode: "cors",
        credentials: "include",
        headers: getImageRequestHeaders(),
      });
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        if (dataUrl) {
          imageDataUrlCache.set(resolvedUrl, dataUrl);
          return dataUrl;
        }
      }
    } catch {
      // Try next strategy.
    }
  }

  const canvasDataUrl = await loadImageViaCanvas(resolvedUrl);
  if (canvasDataUrl) {
    imageDataUrlCache.set(resolvedUrl, canvasDataUrl);
  }
  return canvasDataUrl;
}

function getImageFormat(dataUrl) {
  if (dataUrl?.includes("image/png")) return "PNG";
  if (dataUrl?.includes("image/webp")) return "WEBP";
  if (dataUrl?.includes("image/jpeg") || dataUrl?.includes("image/jpg")) {
    return "JPEG";
  }
  return "JPEG";
}

async function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

function fitInBox(boxWidth, boxHeight, imageWidth, imageHeight) {
  if (!imageWidth || !imageHeight) {
    return { width: boxWidth, height: boxHeight };
  }

  const ratio = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  return {
    width: imageWidth * ratio,
    height: imageHeight * ratio,
  };
}

function getSectionDesignImageUrl(section) {
  const completedDesigns = (section.designs || []).filter(
    (design) => design?.status !== "PROCESSING"
  );

  for (const design of completedDesigns) {
    const url =
      design?.resultImageUrl || design?.imageUrl || design?.thumbnailUrl;
    if (url) return url;
  }

  return (
    section.resultImageUrl ||
    section.thumbnailUrl ||
    section.rootImageUrl ||
    null
  );
}

function getSectionProductRefs(section) {
  return (section.productIds || []).map((item) => {
    if (item && typeof item === "object") {
      return {
        productId: item.productId || item.id,
        quantity: Math.max(1, Number(item.quantity) || 1),
        embedded: item,
      };
    }
    return { productId: item, quantity: 1, embedded: null };
  });
}

function unwrapProductsResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.products)) return response.products;
  return [];
}

function collectImageCandidates(source) {
  if (!source || typeof source !== "object") {
    return [];
  }

  const candidates = [];

  const push = (value) => {
    if (typeof value === "string" && value.trim()) {
      candidates.push(value.trim());
    }
  };

  if (Array.isArray(source.images)) {
    source.images.forEach((image) => {
      push(image);
      push(image?.url);
      push(image?.imageUrl);
      push(image?.thumbnailUrl);
    });
  }

  [source.media, source.imageList, source.pictures].forEach((collection) => {
    if (!Array.isArray(collection)) return;
    collection.forEach((entry) => {
      push(entry);
      push(entry?.url);
      push(entry?.imageUrl);
      push(entry?.thumbnailUrl);
    });
  });

  [
    source.thumbnailUrl,
    source.thumbnail,
    source.url,
    source.imageUrl,
    source.image,
    source.primaryImageUrl,
    source.coverImageUrl,
  ].forEach(push);

  return candidates;
}

function normalizeProduct(product) {
  const productId = product?.productId || product?.id;
  return productId ? { ...product, productId } : product;
}

function getProductImageUrl(product, embedded) {
  const candidates = [
    ...collectImageCandidates(product),
    ...collectImageCandidates(embedded),
  ];

  const unique = [...new Set(candidates)];
  return unique.find((url) => !url.includes("product-placeholder")) || unique[0] || null;
}

async function buildProductMap(sections) {
  const refs = sections.flatMap((section) => getSectionProductRefs(section));
  const embeddedById = new Map();

  refs.forEach((ref) => {
    if (!ref.productId) return;
    embeddedById.set(ref.productId, ref.embedded);
    embeddedById.set(String(ref.productId), ref.embedded);
  });

  const ids = [...new Set(refs.map((ref) => ref.productId))].filter(Boolean);

  if (ids.length === 0) {
    return new Map();
  }

  let apiProducts = [];
  try {
    apiProducts = unwrapProductsResponse(await getProductsByIds(ids));
  } catch (error) {
    console.warn("Could not load products for PDF:", error);
  }

  const map = new Map();

  ids.forEach((id) => {
    const apiProduct = apiProducts.find(
      (product) =>
        product?.productId === id ||
        product?.id === id ||
        String(product?.productId) === String(id) ||
        String(product?.id) === String(id)
    );
    const embedded = embeddedById.get(id) || embeddedById.get(String(id));
    const merged = normalizeProduct(
      apiProduct ? { ...embedded, ...apiProduct } : embedded || { productId: id }
    );
    map.set(merged.productId, merged);
    map.set(String(merged.productId), merged);
  });

  return map;
}

function formatDate(locale) {
  try {
    return new Date().toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString();
  }
}

function ensureSpace(doc, y, needed, labels) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed <= pageHeight - PAGE_MARGIN) {
    return y;
  }

  doc.addPage();
  return drawPageHeader(doc, labels) + 6;
}

function drawPageHeader(doc, labels) {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = PAGE_MARGIN;

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(PAGE_MARGIN, y + 14, pageWidth - PAGE_MARGIN, y + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(labels.brandName, PAGE_MARGIN, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(labels.title, pageWidth - PAGE_MARGIN, y + 10, { align: "right" });

  return y + 22;
}

export async function generateProjectProformaPdf(project, { t, locale = "en" } = {}) {
  imageDataUrlCache.clear();

  const labels = {
    brandName: t("projects.proforma.brandName"),
    title: t("projects.proforma.title"),
    projectLabel: t("projects.proforma.projectLabel"),
    sectionLabel: t("projects.proforma.sectionLabel"),
    designResult: t("projects.proforma.designResult"),
    productsUsed: t("projects.proforma.productsUsed"),
    productName: t("projects.proforma.productName"),
    quantity: t("projects.proforma.quantity"),
    noDesign: t("projects.proforma.noDesign"),
    noProducts: t("projects.proforma.noProducts"),
    generatedOn: t("projects.proforma.generatedOn"),
    footer: t("projects.proforma.footer"),
  };

  const sections = project?.sections || [];
  const productMap = await buildProductMap(sections);
  const logoDataUrl = await loadImageDataUrl(LOGO_URL);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = PAGE_MARGIN;

  if (logoDataUrl) {
    const logoBox = 22;
    const dims = await getImageDimensions(logoDataUrl);
    const logoSize = fitInBox(logoBox, logoBox, dims?.width, dims?.height);
    const logoX = (pageWidth - logoSize.width) / 2;
    doc.addImage(
      logoDataUrl,
      getImageFormat(logoDataUrl),
      logoX,
      y,
      logoSize.width,
      logoSize.height,
      undefined,
      "FAST"
    );
    y += logoSize.height + 8;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    doc.text(labels.brandName, pageWidth / 2, y + 6, { align: "center" });
    y += 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(labels.title, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text(`${labels.projectLabel}: ${project?.name || "-"}`, PAGE_MARGIN, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`${labels.generatedOn}: ${formatDate(locale)}`, PAGE_MARGIN, y);
  y += 10;

  doc.setDrawColor(229, 231, 235);
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
  y += 10;

  if (sections.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(labels.noDesign, PAGE_MARGIN, y);
  }

  for (const section of sections) {
    y = ensureSpace(doc, y, 40, labels);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(`${labels.sectionLabel}: ${section.title || "-"}`, PAGE_MARGIN, y);
    y += 8;

    const designUrl = getSectionDesignImageUrl(section);
    const designDataUrl = await loadImageDataUrl(designUrl);
    const designBoxHeight = 88;
    const designBoxWidth = CONTENT_WIDTH;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(labels.designResult, PAGE_MARGIN, y);
    y += 5;

    if (designDataUrl) {
      const dims = await getImageDimensions(designDataUrl);
      const size = fitInBox(designBoxWidth, designBoxHeight, dims?.width, dims?.height);
      const imageX = PAGE_MARGIN + (designBoxWidth - size.width) / 2;

      doc.setDrawColor(243, 244, 246);
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(PAGE_MARGIN, y, designBoxWidth, designBoxHeight, 2, 2, "FD");

      doc.addImage(
        designDataUrl,
        getImageFormat(designDataUrl),
        imageX,
        y + (designBoxHeight - size.height) / 2,
        size.width,
        size.height,
        undefined,
        "FAST"
      );
      y += designBoxHeight + 8;
    } else {
      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(PAGE_MARGIN, y, designBoxWidth, 28, 2, 2, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text(labels.noDesign, pageWidth / 2, y + 16, { align: "center" });
      y += 36;
    }

    y = ensureSpace(doc, y, 20, labels);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(labels.productsUsed, PAGE_MARGIN, y);
    y += 6;

    const productRefs = getSectionProductRefs(section);

    if (productRefs.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(labels.noProducts, PAGE_MARGIN, y);
      y += 10;
    } else {
      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(75, 85, 99);
      doc.text(labels.productName, PAGE_MARGIN + PRODUCT_THUMB_SIZE + 6, y + 5.5);
      doc.text(labels.quantity, pageWidth - PAGE_MARGIN - 3, y + 5.5, {
        align: "right",
      });
      y += 10;

      for (const ref of productRefs) {
        y = ensureSpace(doc, y, PRODUCT_ROW_HEIGHT, labels);
        const product =
          productMap.get(ref.productId) ||
          productMap.get(String(ref.productId));
        const name =
          product?.name ||
          product?.baseName ||
          ref.embedded?.baseName ||
          ref.embedded?.name ||
          ref.productId ||
          "-";
        const thumbDataUrl = await loadImageDataUrl(
          getProductImageUrl(product, ref.embedded)
        );
        const textX = PAGE_MARGIN + 3 + PRODUCT_THUMB_SIZE + 4;

        if (thumbDataUrl) {
          doc.setDrawColor(229, 231, 235);
          doc.roundedRect(
            PAGE_MARGIN + 3,
            y - 3,
            PRODUCT_THUMB_SIZE,
            PRODUCT_THUMB_SIZE,
            1,
            1,
            "S"
          );
          doc.addImage(
            thumbDataUrl,
            getImageFormat(thumbDataUrl),
            PAGE_MARGIN + 3,
            y - 3,
            PRODUCT_THUMB_SIZE,
            PRODUCT_THUMB_SIZE,
            undefined,
            "FAST"
          );
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(17, 24, 39);
        const nameLines = doc.splitTextToSize(name, CONTENT_WIDTH - 36);
        doc.text(nameLines, textX, y + 2);
        doc.text(String(ref.quantity), pageWidth - PAGE_MARGIN - 3, y + 2, {
          align: "right",
        });
        y += Math.max(PRODUCT_ROW_HEIGHT, nameLines.length * 4.5 + 2);
      }
    }

    y += 6;
    doc.setDrawColor(243, 244, 246);
    doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
    y += 10;
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(labels.footer, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`${page} / ${pageCount}`, pageWidth - PAGE_MARGIN, pageHeight - 10, {
      align: "right",
    });
  }

  return {
    blob: doc.output("blob"),
    fileName: `${sanitizeFileName(project?.name)}-siesta-proforma.pdf`,
  };
}

export async function shareProjectProformaPdf(project, { t, locale } = {}) {
  const { blob, fileName } = await generateProjectProformaPdf(project, { t, locale });
  const file = new File([blob], fileName, { type: "application/pdf" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: project?.name || fileName,
      text: t("projects.proforma.shareText", { name: project?.name || "" }),
      files: [file],
    });
    return "shared";
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}

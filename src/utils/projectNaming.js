/** @returns {string} e.g. 2026_06_01 */
export function getProjectDatePrefix(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}_${month}_${day}`;
}

/**
 * @param {Array<{ name?: string }>} existingProjects
 * @returns {string} e.g. 2026_06_01_P1
 */
export function generateProjectName(existingProjects = [], date = new Date()) {
  const prefix = getProjectDatePrefix(date);
  const pattern = new RegExp(`^${prefix}_P(\\d+)$`, "i");
  let maxIndex = 0;

  for (const project of existingProjects) {
    const match = String(project?.name || "").match(pattern);
    if (match) {
      maxIndex = Math.max(maxIndex, Number.parseInt(match[1], 10));
    }
  }

  return `${prefix}_P${maxIndex + 1}`;
}

const SECTION_NAME_PATTERNS = [
  /^Section\s+(\d+)$/i,
  /^Alan\s+(\d+)$/i,
  /^Bölüm\s+(\d+)$/i,
];

export function generateSectionName(index = 1) {
  return `Section ${index}`;
}

/** @deprecated Use generateSectionName or generateNextSectionName */
export function generateDefaultSectionName(index = 1) {
  return generateSectionName(index);
}

export function getNextSectionIndex(sections = []) {
  let maxIndex = 0;

  for (const section of sections) {
    const title = String(section?.title || "");
    for (const pattern of SECTION_NAME_PATTERNS) {
      const match = title.match(pattern);
      if (match) {
        maxIndex = Math.max(maxIndex, Number.parseInt(match[1], 10));
        break;
      }
    }
  }

  return maxIndex + 1;
}

export function generateNextSectionName(sections = []) {
  return generateSectionName(getNextSectionIndex(sections));
}

export function getProjectSortTimestamp(project) {
  const value =
    project?.updatedAt ||
    project?.modifiedAt ||
    project?.lastModified ||
    project?.createdAt ||
    project?.createdDate ||
    null;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function sortProjectsByNewest(projects = []) {
  return [...projects].sort(
    (a, b) => getProjectSortTimestamp(b) - getProjectSortTimestamp(a)
  );
}

/** Minimal project payload for quick create → camera flow */
export function buildQuickProjectPayload(name) {
  return {
    name,
    details: "",
    mobilePhone: "",
    address: {
      line1: "",
      line2: "",
      district: "",
      city: "",
      state: "",
      postalCode: "",
      countryCode: "",
      lat: null,
      lon: null,
      placeId: "",
      timeZone: "",
      formatted: "",
    },
    sections: [],
    rootImageUrl: null,
    resultImageUrl: null,
    thumbnailUrl: null,
    type: null,
    style: null,
  };
}

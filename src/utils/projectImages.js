const getDesignImageUrl = (design) => {
  if (!design || design.status === "PROCESSING") {
    return null;
  }

  return (
    design.resultImageUrl ||
    design.imageUrl ||
    design.thumbnailUrl ||
    null
  );
};

const getDesignTimestamp = (entry) => {
  const value =
    entry?.createdAt ||
    entry?.updatedAt ||
    entry?.generatedAt ||
    entry?.modifiedAt ||
    entry?.lastModified ||
    null;

  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const collectGeneratedDesigns = (project) => {
  const sections = project?.sections || [];
  const designs = [];

  sections.forEach((section, sectionIndex) => {
    (section.designs || []).forEach((design, designIndex) => {
      const url = getDesignImageUrl(design);
      if (url) {
        designs.push({
          url,
          timestamp: getDesignTimestamp(design),
          sectionIndex,
          designIndex,
        });
      }
    });

    const sectionUrl =
      section.resultImageUrl ||
      (section.designs?.length ? null : section.thumbnailUrl);

    if (sectionUrl) {
      designs.push({
        url: sectionUrl,
        timestamp: getDesignTimestamp(section),
        sectionIndex,
        designIndex: -1,
      });
    }
  });

  return designs;
};

export const getLatestGeneratedDesignUrl = (project) => {
  const designs = collectGeneratedDesigns(project);
  if (designs.length === 0) {
    return null;
  }

  designs.sort((a, b) => {
    if (b.timestamp !== a.timestamp) {
      return b.timestamp - a.timestamp;
    }
    if (b.sectionIndex !== a.sectionIndex) {
      return b.sectionIndex - a.sectionIndex;
    }
    return b.designIndex - a.designIndex;
  });

  return designs[0].url;
};

export const getProjectListThumbnail = (project) =>
  getLatestGeneratedDesignUrl(project) ||
  project?.thumbnailUrl ||
  project?.resultImageUrl ||
  project?.rootImageUrl ||
  "/assets/logo_big.png";

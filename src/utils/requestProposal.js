/**
 * Dummy proposal request service.
 * Replace with real backend integration when available.
 */
export async function requestProjectProposal({
  projectId,
  projectName,
  marketingConsent,
}) {
  await new Promise((resolve) => {
    setTimeout(resolve, 1200);
  });

  return {
    success: true,
    referenceId: `SIESTA-${String(projectId || "draft").slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`,
    messageKey: "projects.proposal.requestSuccess",
    emailSentTo: "sales@siestaexclusive.com",
    projectName: projectName || "",
    marketingConsent: Boolean(marketingConsent),
  };
}

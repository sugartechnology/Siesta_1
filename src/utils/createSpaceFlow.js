import { createProject } from "../api/Api";
import {
  DefaultNavigationState,
  startNewSectionFlow,
} from "./NavigationState";
import {
  buildQuickProjectPayload,
  generateNextSectionName,
  generateProjectName,
} from "./projectNaming";

/**
 * Creates a project on the API and starts the new-section design flow
 * (camera → photograph → products → section-details).
 */
export async function startCreateSpaceFlow({ existingProjects = [] } = {}) {
  const name = generateProjectName(existingProjects);
  const project = await createProject(buildQuickProjectPayload(name));
  const apiSections = (project?.sections || []).filter((item) => item?.id);

  const section =
    apiSections.length > 0
      ? {
          ...apiSections[0],
          title:
            apiSections[0].title === project.name
              ? generateNextSectionName(apiSections)
              : apiSections[0].title,
        }
      : {
          ...DefaultNavigationState.section,
          title: generateNextSectionName(apiSections),
        };

  startNewSectionFlow(project, section);

  return { project, section };
}

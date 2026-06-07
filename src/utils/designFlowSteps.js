import { NavigationState } from "./NavigationState";

export const NEW_DESIGN_FLOW_STEPS = [
  { id: "camera", path: "/camera", labelKey: "designFlow.stepPhoto" },
  { id: "photograph", path: "/photograph", labelKey: "designFlow.stepEdit" },
  { id: "products", path: "/products", labelKey: "designFlow.stepProducts" },
  { id: "section-details", path: "/section-details", labelKey: "designFlow.stepDesign" },
];

export function getDesignFlowSteps(flowType = NavigationState.flowType) {
  return flowType === "new" ? NEW_DESIGN_FLOW_STEPS : [];
}

export function getDesignFlowStepIndex(stepId, flowType = NavigationState.flowType) {
  const steps = getDesignFlowSteps(flowType);
  return steps.findIndex((step) => step.id === stepId);
}

export function getDesignFlowStepPath(stepId, flowType = NavigationState.flowType) {
  const steps = getDesignFlowSteps(flowType);
  return steps.find((step) => step.id === stepId)?.path ?? null;
}

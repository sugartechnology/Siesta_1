import React, { createContext, useContext, useRef, useCallback, useEffect } from "react";
import { generateDesignForSection, getSectionById } from "../api/Api";
import DesignGenerationToast from "../components/DesignGenerationToast";
import { setContextSection, NavigationState } from "../utils/NavigationState";

const POLL_INTERVAL = 5000;

const SectionDesignContext = createContext(null);

export function SectionDesignProvider({ children }) {
  const pollTimeoutRef = useRef(null);
  const registeredSectionIdsRef = useRef(new Set());
  const processingSectionIdsRef = useRef(new Set());
  const generationMetaRef = useRef(new Map());
  const subscribersRef = useRef(new Set());

  const notifySubscribers = useCallback((newSection) => {
    subscribersRef.current.forEach((cb) => {
      try {
        cb(newSection);
      } catch (e) {
        console.error("SectionDesignContext subscriber error:", e);
      }
    });
  }, []);

  const pollSection = useCallback(
    (sectionId) => {
      getSectionById(sectionId)
        .then((newSection) => {
          const meta = generationMetaRef.current.get(sectionId);
          if (meta) {
            generationMetaRef.current.set(sectionId, {
              ...meta,
              section: newSection,
              wasProcessing:
                meta.wasProcessing ||
                newSection.designs?.[0]?.status === "PROCESSING",
            });
          }

          setContextSection(newSection);
          notifySubscribers(newSection);

          const status = newSection.designs?.[0]?.status;
          if (status !== "PROCESSING") {
            processingSectionIdsRef.current.delete(sectionId);
          }
          if (status === "COMPLETED" || status === "FAILED" || status === "ERROR") {
            generationMetaRef.current.delete(sectionId);
          }
        })
        .catch((err) => {
          console.error("SectionDesignContext polling error:", err);
        });
    },
    [notifySubscribers]
  );

  const scheduleNextPoll = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    const ids = new Set([
      ...registeredSectionIdsRef.current,
      ...processingSectionIdsRef.current,
    ]);
    if (ids.size === 0) return;

    pollTimeoutRef.current = setTimeout(() => {
      ids.forEach((sectionId) => pollSection(sectionId));
      pollTimeoutRef.current = null;
      scheduleNextPoll();
    }, POLL_INTERVAL);
  }, [pollSection]);

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startGeneration = useCallback(
    (projectId, sectionId, prompt, meta = {}) => {
      stopPolling();

      generationMetaRef.current.set(sectionId, {
        projectId,
        project: meta.project || NavigationState.project || null,
        section: meta.section || NavigationState.section || null,
        wasProcessing: true,
      });

      return generateDesignForSection(projectId, sectionId, prompt)
        .then(() => {
          const current =
            NavigationState.section?.id === sectionId
              ? NavigationState.section
              : meta.section || { id: sectionId };
          const section = {
            ...current,
            designs: [{ status: "PROCESSING" }, ...(current.designs || [])],
          };

          const existingMeta = generationMetaRef.current.get(sectionId) || {};
          generationMetaRef.current.set(sectionId, {
            ...existingMeta,
            projectId,
            project: meta.project || existingMeta.project || NavigationState.project || null,
            section,
            wasProcessing: true,
          });

          setContextSection(section);
          processingSectionIdsRef.current.add(sectionId);
          notifySubscribers(section);
          scheduleNextPoll();
        })
        .catch((error) => {
          processingSectionIdsRef.current.delete(sectionId);
          generationMetaRef.current.delete(sectionId);
          throw error;
        });
    },
    [notifySubscribers, scheduleNextPoll, stopPolling]
  );

  const getGenerationMeta = useCallback((sectionId) => {
    return generationMetaRef.current.get(sectionId) || null;
  }, []);

  const registerSection = useCallback((sectionId) => {
    if (!sectionId) return;
    registeredSectionIdsRef.current.add(sectionId);
    scheduleNextPoll();
  }, [scheduleNextPoll]);

  const unregisterSection = useCallback((sectionId) => {
    if (!sectionId) return;
    registeredSectionIdsRef.current.delete(sectionId);
  }, []);

  const subscribeSectionUpdates = useCallback((callback) => {
    subscribersRef.current.add(callback);
    return () => subscribersRef.current.delete(callback);
  }, []);

  const value = {
    startGeneration,
    registerSection,
    unregisterSection,
    subscribeSectionUpdates,
    getGenerationMeta,
  };

  return (
    <SectionDesignContext.Provider value={value}>
      {children}
      <DesignGenerationToast />
    </SectionDesignContext.Provider>
  );
}

export function useSectionDesign() {
  const ctx = useContext(SectionDesignContext);
  if (!ctx) {
    throw new Error("useSectionDesign must be used within SectionDesignProvider");
  }
  return ctx;
}

import React, { createContext, useContext, useRef, useCallback, useEffect } from "react";
import { generateDesignForSection, getSectionById } from "../api/Api";
import { setContextSection, NavigationState } from "../utils/NavigationState";

const POLL_INTERVAL = 5000;

const SectionDesignContext = createContext(null);

export function SectionDesignProvider({ children }) {
  const pollTimeoutRef = useRef(null);
  const registeredSectionIdsRef = useRef(new Set());
  const processingSectionIdsRef = useRef(new Set());
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
          setContextSection(newSection);
          notifySubscribers(newSection);
          if (
            newSection.design &&
            newSection.design.status !== "PROCESSING"
          ) {
            processingSectionIdsRef.current.delete(sectionId);
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
    (sectionId, prompt) => {
      generateDesignForSection(sectionId, prompt).then(() => {
        const current =
          NavigationState.section?.id === sectionId
            ? NavigationState.section
            : { id: sectionId };
        const section = {
          ...current,
          design: { ...(current.design || {}), status: "PROCESSING" },
        };
        setContextSection(section);
        processingSectionIdsRef.current.add(sectionId);
        notifySubscribers(section);
        scheduleNextPoll();
      });
    },
    [notifySubscribers, scheduleNextPoll]
  );

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
  };

  return (
    <SectionDesignContext.Provider value={value}>
      {children}
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

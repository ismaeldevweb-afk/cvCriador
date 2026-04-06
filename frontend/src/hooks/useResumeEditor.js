import { useCallback, useState } from "react";
import {
  createCertification,
  createEducation,
  createEmptyResume,
  createExperience,
  createLanguage,
  createProject,
  normalizeResume,
} from "../utils/resumeDefaults";

const listFactories = {
  experience: createExperience,
  education: createEducation,
  languages: createLanguage,
  certifications: createCertification,
  projects: createProject,
};

export function useResumeEditor(initialResume) {
  const [resume, setResume] = useState(() => normalizeResume(initialResume ?? createEmptyResume()));

  const replaceResume = useCallback((nextResume) => {
    setResume(normalizeResume(nextResume));
  }, []);

  const updateTitle = useCallback((value) => {
    setResume((current) => ({
      ...current,
      title: value,
    }));
  }, []);

  const updatePersonal = useCallback((field, value) => {
    setResume((current) => ({
      ...current,
      personal: {
        ...current.personal,
        [field]: value,
      },
    }));
  }, []);

  const updateSummary = useCallback((value) => {
    setResume((current) => ({
      ...current,
      summary: value,
    }));
  }, []);

  const updateAdditionalInfo = useCallback((value) => {
    setResume((current) => ({
      ...current,
      additionalInfo: value,
    }));
  }, []);

  const updateListItem = useCallback((section, itemId, field, value) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }, []);

  const addListItem = useCallback((section) => {
    setResume((current) => ({
      ...current,
      [section]: [...current[section], listFactories[section]()],
    }));
  }, []);

  const removeListItem = useCallback((section, itemId) => {
    setResume((current) => {
      const nextItems = current[section].filter((item) => item.id !== itemId);

      return {
        ...current,
        [section]: nextItems.length > 0 ? nextItems : [listFactories[section]()],
      };
    });
  }, []);

  const updateSkill = useCallback((index, value) => {
    setResume((current) => ({
      ...current,
      skills: current.skills.map((skill, skillIndex) => (skillIndex === index ? value : skill)),
    }));
  }, []);

  const addSkill = useCallback(() => {
    setResume((current) => ({
      ...current,
      skills: [...current.skills, ""],
    }));
  }, []);

  const removeSkill = useCallback((index) => {
    setResume((current) => ({
      ...current,
      skills: current.skills.length === 1 ? [""] : current.skills.filter((_, itemIndex) => itemIndex !== index),
    }));
  }, []);

  const setTemplate = useCallback((template) => {
    setResume((current) => ({
      ...current,
      template,
    }));
  }, []);

  const updateCustomization = useCallback((field, value) => {
    setResume((current) => ({
      ...current,
      customization: {
        ...current.customization,
        [field]: value,
      },
    }));
  }, []);

  const resetResume = useCallback(() => {
    setResume(createEmptyResume());
  }, []);

  return {
    resume,
    replaceResume,
    updateTitle,
    updatePersonal,
    updateSummary,
    updateAdditionalInfo,
    updateListItem,
    addListItem,
    removeListItem,
    updateSkill,
    addSkill,
    removeSkill,
    setTemplate,
    updateCustomization,
    resetResume,
  };
}

import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_STUDENT_PROFILE, MOCK_PREDICTION_RESPONSE, MOCK_ROADMAP_RESPONSE } from '../utils/mockData';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  // Pure in-memory state, strictly adhering to NO localStorage rule
  const [profile, setProfile] = useState(DEFAULT_STUDENT_PROFILE);
  const [prediction, setPrediction] = useState(MOCK_PREDICTION_RESPONSE);
  const [roadmap, setRoadmap] = useState(MOCK_ROADMAP_RESPONSE);
  const [inputMode, setInputMode] = useState('manual'); // 'manual' | 'csv'

  const updateProfile = (newFields) => {
    setProfile((prev) => ({ ...prev, ...newFields }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_STUDENT_PROFILE);
  };

  const value = {
    profile,
    setProfile,
    updateProfile,
    resetProfile,
    prediction,
    setPrediction,
    roadmap,
    setRoadmap,
    inputMode,
    setInputMode,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}

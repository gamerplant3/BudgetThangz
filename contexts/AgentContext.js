import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  clearCohereApiKey,
  getCohereApiKey,
  hasCohereApiKey,
  setCohereApiKey,
} from '../services/cohereApiKey';

const AgentContext = createContext();

export const useAgentContext = () => useContext(AgentContext);

export const AgentProvider = ({ children }) => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  const refreshApiKeyStatus = useCallback(async () => {
    setIsCheckingKey(true);
    try {
      setHasApiKey(await hasCohereApiKey());
    } catch (e) {
      console.error(e);
      setHasApiKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  }, []);

  useEffect(() => {
    refreshApiKeyStatus();
  }, [refreshApiKeyStatus]);

  const saveApiKey = useCallback(async apiKey => {
    await setCohereApiKey(apiKey);
    setHasApiKey(true);
  }, []);

  const removeApiKey = useCallback(async () => {
    await clearCohereApiKey();
    setHasApiKey(false);
  }, []);

  const loadApiKey = useCallback(async () => getCohereApiKey(), []);

  return (
    <AgentContext.Provider
      value={{
        hasApiKey,
        isCheckingKey,
        refreshApiKeyStatus,
        saveApiKey,
        removeApiKey,
        loadApiKey,
      }}>
      {children}
    </AgentContext.Provider>
  );
};

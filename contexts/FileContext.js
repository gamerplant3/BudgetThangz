import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FileContext = createContext();

export const useFileContext = () => useContext(FileContext);

export const FileProvider = ({ children }) => {
  const [budgetItems, setBudgetItems] = useState([]);
  const [ongoingSpending, setOngoingSpending] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const budget = await AsyncStorage.getItem('user_budget_data');
      const spending = await AsyncStorage.getItem('ongoing_spending');
      if (budget) setBudgetItems(JSON.parse(budget));
      if (spending) setOngoingSpending(JSON.parse(spending));
    } catch (e) { console.error(e); }
  };

  const saveBudget = async (newBudget) => {
    setBudgetItems(newBudget);
    await AsyncStorage.setItem('user_budget_data', JSON.stringify(newBudget));
  };

  const addOngoingSpend = async (item) => {
    const updated = [...ongoingSpending, { ...item, id: Date.now() }];
    setOngoingSpending(updated);
    await AsyncStorage.setItem('ongoing_spending', JSON.stringify(updated));
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove(['user_budget_data', 'ongoing_spending']);
      setBudgetItems([]);
      setOngoingSpending([]);
    } catch (e) {
      console.error("Failed to clear data", e);
    }
  };

  const saveOngoingList = async (newList) => {
    setOngoingSpending(newList);
    await AsyncStorage.setItem('ongoing_spending', JSON.stringify(newList));
  };

  return (
    <FileContext.Provider value={{
      budgetItems,
      ongoingSpending,
      saveBudget,
      addOngoingSpend,
      clearAllData,
      saveOngoingList
    }}>
      {children}
    </FileContext.Provider>
  );
};


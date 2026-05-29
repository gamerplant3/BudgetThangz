import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { useFileContext } from '../contexts/FileContext';

export default function AgentBar() {
  const { budgetItems, saveBudget, addOngoingSpend } = useFileContext();
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAgentSubmit = async () => {
    if (!inputMessage.trim()) return;
    setLoading(true);

    try {
      /**
       * DEVICE IP CONFIGURATION:
       * If testing on an Android Emulator, use 'http://10.0.2.2:8000'
       * If testing on an iOS Simulator, use 'http://localhost:8000'
       * If testing on actual phone, use computer's local network IP (e.g., 'http://192.168.1.X:8000')
       */
      const backendUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

      const response = await fetch(`${backendUrl}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          current_budget_items: budgetItems // Pass the current list as context
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();

      if (data.type === 'action_execution_plan' && data.actions.length > 0) {
        // a mutable copy of budget items in case we need to filter
        let updatedBudgetList = [...budgetItems];
        let didModifyBudget = false;

        data.actions.forEach(action => {
          const params = typeof action.payload === 'string' ? JSON.parse(action.payload) : action.payload;

          if (action.target_action === 'stage_ongoing_spend') {
            addOngoingSpend({
              label: params.label,
              amount: parseFloat(params.amount),
              type: params.type || 'expense',
              date: params.date
            });
          } else if (action.target_action === 'stage_budget_item') {
            updatedBudgetList.push({
              id: Date.now(),
              label: params.label,
              amount: parseFloat(params.amount),
              type: params.type,
              frequency: params.frequency,
              date: params.date || ''
            });
            didModifyBudget = true;
          } else if (action.target_action === 'delete_budget_item') {
            updatedBudgetList = updatedBudgetList.filter(item => item.id !== params.id);
            didModifyBudget = true;
          }
        });

        // If the agent added or removed structural budget elements, save the array
        if (didModifyBudget) {
          saveBudget(updatedBudgetList);
        }

        Alert.alert("Success", data.agent_reply);
        setInputMessage('');
      } else {
        // Conversational response fallback handling
        Alert.alert("AI Assistant", data.agent_reply);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Failed", "Could not reach the AI server agent. Verify network/IP host configurations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.barContainer}>
      <TextInput
        style={styles.agentInput}
        placeholder="🤖 Beep boop, what do you want..."
        placeholderTextColor="#94a3b8"
        value={inputMessage}
        onChangeText={setInputMessage}
        editable={!loading}
      />
      <TouchableOpacity style={styles.sendBtn} onPress={handleAgentSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnText}>Send</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 10,
    alignItems: 'center'
  },
  agentInput: { flex: 1, color: 'white', fontSize: 14, paddingVertical: 4, paddingHorizontal: 8 },
  sendBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});
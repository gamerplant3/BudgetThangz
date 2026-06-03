import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFileContext } from '../contexts/FileContext';
import { useAgentContext } from '../contexts/AgentContext';
import { chatWithBudgetAgent } from '../services/budgetAgent';
import { applyAgentActions } from '../utils/applyAgentActions';

export default function AgentBar() {
  const { budgetItems, saveBudget, ongoingSpending, addOngoingSpend, saveOngoingList } =
    useFileContext();
  const { hasApiKey, isCheckingKey, loadApiKey } = useAgentContext();
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const agentEnabled = hasApiKey && !isCheckingKey;

  const handleAgentSubmit = async () => {
    if (!agentEnabled || !inputMessage.trim()) {
      return;
    }

    setLoading(true);

    try {
      const apiKey = await loadApiKey();
      if (!apiKey) {
        Alert.alert(
          'API key required',
          'Add your Cohere API key in Settings to use the assistant.',
        );
        return;
      }

      const data = await chatWithBudgetAgent({
        message: inputMessage,
        budgetItems,
        ongoingSpending,
        apiKey,
      });

      if (data.type === 'action_execution_plan' && data.actions.length > 0) {
        applyAgentActions({
          actions: data.actions,
          budgetItems,
          ongoingSpending,
          saveBudget,
          addOngoingSpend,
          saveOngoingList,
        });
        Alert.alert('Success', data.agent_reply);
        setInputMessage('');
      } else {
        Alert.alert('AI Assistant', data.agent_reply);
        setInputMessage('');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Assistant unavailable',
        error.message || 'Could not reach Cohere. Check your API key and internet connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {!agentEnabled && !isCheckingKey && (
        <Text style={styles.hintText}>
          Add your Cohere API key in Settings to enable the assistant.
        </Text>
      )}
      <View style={[styles.barContainer, !agentEnabled && styles.barDisabled]}>
        <TextInput
          style={styles.agentInput}
          placeholder={
            agentEnabled
              ? '🤖 Beep boop, what do you want...'
              : 'Assistant disabled — add API key in Settings'
          }
          placeholderTextColor="#94a3b8"
          value={inputMessage}
          onChangeText={setInputMessage}
          editable={agentEnabled && !loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !agentEnabled && styles.sendBtnDisabled]}
          onPress={handleAgentSubmit}
          disabled={!agentEnabled || loading}>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.btnText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  hintText: {
    color: '#64748b',
    fontSize: 12,
    marginHorizontal: 15,
    marginBottom: 4,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  barDisabled: { opacity: 0.55 },
  agentInput: { flex: 1, color: 'white', fontSize: 14, paddingVertical: 4, paddingHorizontal: 8 },
  sendBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#475569' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
});

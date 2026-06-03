import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import logo from '../assets/logo.png';
import { useAgentContext } from '../contexts/AgentContext';

const COHERE_DASHBOARD_URL = 'https://dashboard.cohere.com/api-keys';

const SettingsScreen = () => {
  const { hasApiKey, saveApiKey, removeApiKey, refreshApiKeyStatus } = useAgentContext();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      Alert.alert('API key required', 'Paste your Cohere API key to enable the assistant.');
      return;
    }

    setSaving(true);
    try {
      await saveApiKey(trimmed);
      setApiKeyInput('');
      Alert.alert('Saved', 'Your API key is stored securely on this device. The assistant is enabled.');
    } catch (e) {
      console.error(e);
      Alert.alert('Could not save', 'Failed to store the API key. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearKey = () => {
    Alert.alert(
      'Remove API key?',
      'The AI assistant on Home will be disabled until you add a key again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeApiKey();
              setApiKeyInput('');
              await refreshApiKeyStatus();
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Could not remove the API key.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>

        <Text style={styles.title}>▼・ᴥ・▼</Text>
        <Text style={styles.title}>ABOUT</Text>
        <View style={styles.section}>
          <Text style={styles.aboutBody}>
            A simple budgeting app that calculates your monthly budget and how much you have left
            based on your spending.
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>AI assistant</Text>
          <Text style={styles.aboutBody}>
            The agent uses your own Cohere API key; stored on the device keychain. Requests go directly
            to Cohere over HTTPS.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(COHERE_DASHBOARD_URL)}>
            <Text style={styles.link}>Get a key from the Cohere dashboard →</Text>
          </TouchableOpacity>

          <Text style={styles.statusLabel}>
            Status: {hasApiKey ? 'API key saved on this device' : 'No API key — assistant disabled'}
          </Text>

          <TextInput
            style={styles.keyInput}
            placeholder="Paste Cohere API key"
            placeholderTextColor="#94a3b8"
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!saving}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, saving && styles.btnDisabled]}
            onPress={handleSaveKey}
            disabled={saving}>
            <Text style={styles.primaryBtnText}>{hasApiKey ? 'Update API key' : 'Save API key'}</Text>
          </TouchableOpacity>

          {hasApiKey && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleClearKey}>
              <Text style={styles.secondaryBtnText}>Remove API key</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>How to Use</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>
              Enter your known income and expenses (label, amount, frequency/date) under the
              Budget tab.
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>
              Optionally, log spending under the Spending tab.
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>
              On Home, use the assistant (after saving your Cohere key here) for natural-language
              updates.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Screens</Text>
          <View style={styles.pageSummary}>
            <Text style={styles.pageName}>Home:</Text>
            <Text style={styles.pageDescription}>
              Landing page, quick look at how you are doing, AI assistant.
            </Text>
          </View>
          <View style={styles.pageSummary}>
            <Text style={styles.pageName}>Budget:</Text>
            <Text style={styles.pageDescription}>Income and planned expenses.</Text>
          </View>
          <View style={styles.pageSummary}>
            <Text style={styles.pageName}>Spending:</Text>
            <Text style={styles.pageDescription}>One-off transactions.</Text>
          </View>
          <View style={styles.pageSummary}>
            <Text style={styles.pageName}>Settings:</Text>
            <Text style={styles.pageDescription}>About and AI API key.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333', textAlign: 'center' },
  section: { width: '100%' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2A2F87',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  logoContainer: { alignItems: 'center' },
  logo: { width: 300, height: 100, resizeMode: 'contain' },
  aboutBody: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 8 },
  link: { fontSize: 13, color: '#2A2F87', marginBottom: 12, textDecorationLine: 'underline' },
  statusLabel: { fontSize: 13, color: '#444', marginBottom: 8, fontWeight: '600' },
  keyInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  primaryBtn: {
    backgroundColor: '#2A2F87',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#b91c1c', fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },
  step: { flexDirection: 'row', marginBottom: 8, paddingRight: 10 },
  stepNumber: { fontWeight: 'bold', color: '#2A2F87', marginRight: 10, fontSize: 14 },
  stepText: { fontSize: 14, color: '#555', lineHeight: 20, flex: 1 },
  pageSummary: { marginBottom: 12 },
  pageName: { fontWeight: 'bold', color: '#2A2F87', fontSize: 14, marginBottom: 2 },
  pageDescription: { fontSize: 14, color: '#555', lineHeight: 20 },
});

export default SettingsScreen;

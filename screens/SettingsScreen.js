import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Image } from 'react-native';
import logo from '../assets/logo.png';

const SettingsScreen = ({ navigation }) => {

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <View style={styles.logoContainer}>
          <Image
            source={logo}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>▼・ᴥ・▼</Text>
        <Text style={styles.title}>ABOUT</Text>
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.aboutBody}>
            A simple budgeting app that calculates your monthly budget and how much you have left based on your spending.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>How to Use</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>Enter your known income and expenses (label, amount, frequency/date) under the 'Budget' tab.</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>Optionally, enter how much you spent after a grocery run, eating out, etc. under the 'Ongoing' tab.</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>Let the app do the rest :)</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Screen descriptions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Screens</Text>
          <View style={styles.pageSummary}>
            <Text style={styles.pageName}>Home:</Text>
            <Text style={styles.pageDescription}>Landing page, quick look at how you're doing.</Text>
          </View>
          <View style={styles.pageSummary}>
            <Text style={styles.pageName}>Budget:</Text>
            <Text style={styles.pageDescription}>User input of income and expenses.</Text>
          </View>
          <View style={styles.pageSummary}>
            <Text style={styles.pageName}>Settings:</Text>
            <Text style={styles.pageDescription}>You're look at it, lol</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  section: { width: '100%' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },

  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#2A2F87', marginBottom: 10, textTransform: 'uppercase' },

  logoContainer: { alignItems: 'center' },
  logo: { width: 300, height: 100, resizeMode: 'contain' },

  // About
  aboutBody: { fontSize: 13, color: '#666', lineHeight: 18},
  version: { fontSize: 12, color: '#aaa', marginTop: 15, textAlign: 'center' },

  // Numbered steps
  step: { flexDirection: 'row', marginBottom: 8, paddingRight: 10 },
  stepNumber: { fontWeight: 'bold', color: '#2A2F87', marginRight: 10, fontSize: 14 },
  stepText: { fontSize: 14, color: '#555', lineHeight: 20 },

  // Page descriptions
  pageSummary: { marginBottom: 12 },
  pageName: { fontWeight: 'bold', color: '#2A2F87', fontSize: 14, marginBottom: 2 },
  pageDescription: { fontSize: 14, color: '#555', lineHeight: 20 },
});

export default SettingsScreen;
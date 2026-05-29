import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFileContext } from '../contexts/FileContext';
import logo from '../assets/logo.png';
import AgentBar from '../components/AgentBar';

export default function HomeScreen() {
  const { budgetItems, ongoingSpending } = useFileContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonthLabel, setSelectedMonthLabel] = useState('');

  const freqConfig = {
    weekly: 52 / 12,
    biweekly: 26 / 12,
    monthly: 1,
    quarterly: 4 / 12,
    annual: 1 / 12,
    once: 0 // Handled separately if date matches
  };

  useEffect(() => {
    const displayMonth = selectedDate.toLocaleString('default', { month: 'long' }).toUpperCase();
    const displayYear = selectedDate.getFullYear();
    setSelectedMonthLabel(`${displayMonth} ${displayYear}`);
  }, [selectedDate]);

  const calculateRemaining = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    // 1. Calculate Monthly Budgeted Net
    const monthlyBudgetNet = budgetItems.reduce((acc, item) => {
      let monthlyVal = 0;

      if (item.frequency === 'once') {
        // only include one-time items if they match the selected month/year
        const itemDate = new Date(item.date + 'T12:00:00');
        if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
          monthlyVal = item.amount;
        }
      } else {
        // Recurring items always count toward the monthly net
        monthlyVal = item.amount * (freqConfig[item.frequency] || 1);
      }

      return item.type === 'income' ? acc + monthlyVal : acc - monthlyVal;
    }, 0);

    // 2. Subtract actual ongoing transactions logged for this month
    const totalSpentThisMonth = ongoingSpending
      .filter(s => {
        const d = new Date(s.date + 'T12:00:00');
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, s) => {
        return s.type === 'income' ? acc - s.amount : acc + s.amount;
      }, 0);

    return monthlyBudgetNet - totalSpentThisMonth;
  };

  const remaining = calculateRemaining();

  const recentTransactions = [...ongoingSpending]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <LinearGradient colors={['#f0f9ff', '#e0f2fe', '#fdf2f8']} style={styles.container} >
      {/* AGENT INPUT BAR */}
      <View style={{ width: '100%', marginBottom: 10 }}>
         <AgentBar />
      </View>

      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image
            source={logo}
            style={styles.logo}
          />
        </View>

        <Text style={styles.header}>▼・ᴥ・▼</Text>

        <View style={styles.monthBox}>
          <Text style={styles.selectedMonth}>{selectedMonthLabel}</Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.label}>REMAINING BUDGET</Text>

          <Text style={[
            styles.amount,
            { color: remaining >= 0 ? '#2e7d32' : '#d32f2f' }
          ]}>
            ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>

          <View style={styles.divider} />

          <View style={styles.recentSection}>
            <Text style={styles.label}>RECENT ACTIVITY</Text>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((item, index) => (
                <View key={item.id || index} style={styles.transactionRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.transLabel} numberOfLines={1}>{item.label}</Text>
                    <Text style={styles.transDate}>
                      {new Date(item.date + 'T12:00:00').toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[
                    styles.transAmount,
                    { color: item.type === 'income' ? '#2e7d32' : '#d32f2f' }
                  ]}>
                    {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noData}>No recent transactions found.</Text>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 15,
  },
  header: { fontSize: 25, marginBottom: 10 },
  logoContainer: { alignItems: 'center' },
  logo: { width: 280, height: 90, resizeMode: 'contain' },
  monthBox: { backgroundColor: '#f1f5f9', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, marginBottom: 30 },
  selectedMonth: { color: '#64748b', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  balanceContainer: { alignItems: 'center', width: '100%' },
  label: { fontSize: 12, color: '#94a3b8', fontWeight: '800', marginBottom: 5 },
  amount: { fontSize: 42, fontWeight: 'bold', marginBottom: 0 },
  divider: { height: 1, backgroundColor: '#f1f5f9', width: '80%', marginTop: 10, marginBottom: 20 },
  recentSection: { width: '100%', alignItems: 'center' },
  recentTitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  transLabel: { fontSize: 14, color: '#334155', fontWeight: '500' },
  transDate: { fontSize: 11, color: '#cbd5e1' },
  transAmount: { fontSize: 14, fontWeight: 'bold' },
  noData: { fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginTop: 10, fontStyle: 'italic' }
});
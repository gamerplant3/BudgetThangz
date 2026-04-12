import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useFileContext } from '../contexts/FileContext';

export default function SpendingScreen() {
  const { ongoingSpending, saveOngoingList, addOngoingSpend, clearAllSpending } = useFileContext();

  const [view, setView] = useState('monthly');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [dateTarget, setDateTarget] = useState('budget');

  // for ongoing screen
  const [editingOngoingId, setEditingOngoingId] = useState(null);
  const [editOngoingForm, setEditOngoingForm] = useState({});
  const [ongoingData, setOngoingData] = useState({
    label: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0]
  });

  const freqConfig = {
    weekly: { label: 'Weekly', factor: 52 },
    biweekly: { label: 'Bi-Weekly', factor: 26 },
    monthly: { label: 'Monthly', factor: 12 },
    quarterly: { label: 'Quarterly', factor: 4 },
    annual: { label: 'Annual', factor: 1 },
    once: { label: 'One-Time', factor: 0 }
  };

  const isThisWeek = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    const end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= start && date <= end;
  };

  const isThisMonth = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date.getUTCMonth() === now.getUTCMonth() && date.getUTCFullYear() === now.getUTCFullYear();
  };

  const handleClearAll = async () => {
    await clearAllSpending();
    setAlertMsg("Spending cleared!");
  };

  // add, delete, or edit ongoing spending entry
  const handleAddOngoing = () => {
    if (!ongoingData.label || !ongoingData.amount) return;

    const entryToSave = {
      id: Date.now(),
      label: ongoingData.label,
      amount: parseFloat(ongoingData.amount),
      type: ongoingData.type,
      date: ongoingData.date
    };

    addOngoingSpend(entryToSave);

    setOngoingData({
      label: '',
      amount: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const deleteOngoingItem = (id) => {
    const updated = ongoingSpending.filter(item => item.id !== id);
    saveOngoingList(updated);
  };

  const saveOngoingEdit = () => {
    const updated = ongoingSpending.map(item =>
      item.id === editingOngoingId ? { ...editOngoingForm, amount: parseFloat(editOngoingForm.amount) } : item
    );
    saveOngoingList(updated);
    setEditingOngoingId(null);
  };

  const ongoingTotal = (() => {
    return ongoingSpending
      .filter(s => isThisMonth(s.date))
      .reduce((acc, s) => {
        return s.type === 'income' ? acc + s.amount : acc - s.amount;
      }, 0);
  })();

  return (
    <LinearGradient colors={['#f0f9ff', '#e0f2fe', '#fdf2f8']} style={styles.pageWrapper}>
      {/* Popup message */}
      {alertMsg && (
        <Modal transparent visible animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{alertMsg}</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setAlertMsg(null)}>
                <Text style={styles.modalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Date time picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          onChange={(e, d) => {
            setShowDatePicker(false);
            if (d) {
              const dateStr = d.toISOString().split('T')[0];
              if (dateTarget === 'ongoing') {
                setOngoingData({ ...ongoingData, date: dateStr });
              } else if (editingBudgetId) {
                setEditBudgetForm({ ...editBudgetForm, date: dateStr });
              } else {
                setBudgetData({ ...budgetData, date: dateStr });
              }
            }
          }}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        <View style={styles.textwrapper}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Spending</Text>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllBtn}>
              <Text style={styles.clearAllBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.runningTotal}>
            Running Total:
            <Text style={{ color: ongoingTotal >= 0 ? '#2e7d32' : '#d32f2f' }}>
              {ongoingTotal < 0 ? ' -' : ' '}${Math.abs(ongoingTotal).toFixed(2)}
            </Text>
          </Text>

          <View style={styles.compactForm}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.flexInput}
                placeholder="Label (e.g. Groceries)"
                value={ongoingData.label}
                onChangeText={(t) => setOngoingData({...ongoingData, label: t})}
              />
              <TextInput
                style={styles.flexInput}
                placeholder="Amount"
                keyboardType="numeric"
                value={ongoingData.amount}
                onChangeText={(t) => setOngoingData({...ongoingData, amount: t})}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.pickerCell, {flex: 1.2}]}>
                <Picker
                  selectedValue={ongoingData.type}
                  onValueChange={(v) => setOngoingData({...ongoingData, type: v})}
                  itemStyle={{ color: 'black' }}
                >
                  <Picker.Item label="Expense" value="expense" color="black" style={{fontSize: 14}} />
                  <Picker.Item label="Income" value="income" color="black" style={{fontSize: 14}} />
                </Picker>
              </View>

              <TouchableOpacity
                style={[styles.flexInput, {flex: 1}]}
                onPress={() => {
                  setDateTarget('ongoing');
                  setShowDatePicker(true);
                }}
              >
                <Text style={{ color: 'black' }}>📅 {ongoingData.date}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addBtn} onPress={handleAddOngoing}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tableGroup}>
            <Text style={styles.tableHeader}>RECENT ACTIVITY (THIS MONTH)</Text>
            {ongoingSpending.filter(s => isThisMonth(s.date)).map(item => (
              <View key={item.id}>
                {editingOngoingId === item.id ? (
                  /* EDITING ROW */
                  <View style={styles.editRow}>
                    <View style={styles.editGrid}>
                      <TextInput
                        style={styles.flexInput}
                        value={editOngoingForm.label}
                        onChangeText={t => setEditOngoingForm({...editOngoingForm, label: t})}
                      />
                      <TextInput
                        style={styles.flexInput}
                        keyboardType="numeric"
                        value={editOngoingForm.amount.toString()}
                        onChangeText={t => setEditOngoingForm({...editOngoingForm, amount: t})}
                      />
                    </View>
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={saveOngoingEdit}><Text style={styles.emojiBtn}>✔️</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => setEditingOngoingId(null)}><Text style={styles.emojiBtn}>❌</Text></TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* STANDARD ROW */
                  <View style={styles.itemRow}>
                    <View style={{flex: 2}}>
                      <Text style={styles.labelCol}>{item.label}</Text>
                      <Text style={styles.smallDate}>{new Date(item.date + 'T12:00:00').toLocaleDateString()}</Text>
                    </View>
                    <Text style={[styles.amountCol, {color: item.type === 'income' ? '#2e7d32' : '#d32f2f'}]}>
                      {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                    </Text>
                    <View style={styles.actionCol}>
                      <TouchableOpacity onPress={() => {
                          setEditingOngoingId(item.id);
                          setEditOngoingForm({...item});
                      }}>
                        <Text style={styles.emojiBtn}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteOngoingItem(item.id)}>
                        <Text style={styles.emojiBtn}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // page
  pageWrapper: { flex: 1 },
  scrollPadding: { paddingTop: 15, paddingBottom: 15, paddingHorizontal: 15 },
  textwrapper: { backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 13 },

  // title and top buttons
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  header: { fontSize: 20, color: '#444', fontWeight: 'bold' },
  runningTotal: { fontSize: 16, color: '#444' },
  btnRow: { flexDirection: 'row', gap: 10 },
  clearAllBtn: { backgroundColor: '#e3f2fd', padding: 8, borderRadius: 5 },
  clearAllBtnText: { color: '#2196f3', fontSize: 13 },

  // modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '60%', backgroundColor: 'white', padding: 15, borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#333' },
  modalBtn: { backgroundColor: '#ff8237', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  modalBtnText: { color: 'white', fontWeight: 'bold' },

  // user inputs
  compactForm: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, gap: 8 },
  inputRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  flexInput: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', padding: 6, borderRadius: 4, flex: 1, fontSize: 14 },
  pickerCell: { backgroundColor: '#eeeeee', borderRadius: 4, borderWidth: 1, borderColor: '#ddd', height: 35, justifyContent: 'center', overflow: 'hidden' },
  addBtn: { backgroundColor: '#2e7d32', paddingVertical: 7, paddingHorizontal: 18, borderRadius: 4, alignItems: 'center' },

  // list of items
  tableGroup: { marginTop: 20 },
  tableHeader: { fontSize: 11, fontWeight: 'bold', color: '#666', backgroundColor: '#fafafa', paddingVertical: 5, marginBottom: 5 },
  itemRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  labelCol: { flex: 2, fontSize: 15 },
  smallDate: { fontSize: 11, color: '#888' },
  amountCol: { flex: 1.5, textAlign: 'right', fontWeight: 'bold', fontSize: 15 },
  actionCol: { flexDirection: 'row', gap: 10, marginLeft: 15 },
  emojiBtn: { fontSize: 16 },

  // editing view
  editRow: { backgroundColor: '#f0f7ff', padding: 10, borderRadius: 8, marginVertical: 5 },
  editGrid: { gap: 8 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 10 },

  // summary
  summaryContainer: { marginTop: 0, paddingTop: 18 },
  viewToggle: { flexDirection: 'row', backgroundColor: '#eee', padding: 3, borderRadius: 6, alignItems: 'center', marginBottom: 20 },
  toggleLabel: { fontSize: 13, paddingHorizontal: 5, color: '#666', fontWeight: 'bold' },
  toggleBtn: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  toggleBtnActive: { backgroundColor: 'white', borderRadius: 4 },
  toggleText: { fontSize: 13, color: '#444' },
  statsWrapped: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { minWidth: '30%', marginBottom: 10 },
  statLabel: { fontSize: 13, color: '#666' },
  statValue: { fontSize: 15 }
});
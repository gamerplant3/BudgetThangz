import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useFileContext } from '../contexts/FileContext';

export default function BudgetScreen() {
  const { budgetItems, saveBudget, clearAllBudget } = useFileContext();

  const [activeTab, setActiveTab] = useState('BUDGET'); // 'BUDGET' or 'ONGOING'
  const [view, setView] = useState('monthly');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [dateTarget, setDateTarget] = useState('budget');

  // for budget screen
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editBudgetForm, setEditBudgetForm] = useState({});
  const [budgetData, setBudgetData] = useState({
    label: '', amount: '', type: 'expense', frequency: 'monthly', date: ''
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
    await clearAllBudget();
    setAlertMsg("Budget cleared!");
  };

  // add, delete, or edit budget entry
  const handleAddBudgetEntry = () => {
    if (!budgetData.label || !budgetData.amount) return;
    const newItem = { ...budgetData, id: Date.now(), amount: parseFloat(budgetData.amount) };
    saveBudget([...budgetItems, newItem]);
    setBudgetData({ label: '', amount: '', type: 'expense', frequency: 'monthly', date: '' });
  };

  const deleteBudgetItem = (id) => {
    saveBudget(budgetItems.filter(i => i.id !== id));
  };

  const saveBudgetEdit = () => {
    const updated = budgetItems.map(i => i.id === editingBudgetId ? { ...editBudgetForm, amount: parseFloat(editBudgetForm.amount) } : i);
    saveBudget(updated);
    setEditingBudgetId(null);
  };

  // numbers
  const budgetTotals = (() => {
    let totalInc = 0; let totalExp = 0;
    budgetItems.forEach(item => {
      let val = 0;
      if (item.frequency === 'once') {
        if (view === 'annual' || (view === 'monthly' && isThisMonth(item.date)) || (view === 'weekly' && isThisWeek(item.date))) {
          val = item.amount;
        }
      } else {
        val = (item.amount * freqConfig[item.frequency].factor) / (view === 'weekly' ? 52 : view === 'monthly' ? 12 : 1);
      }
      if (item.type === 'income') totalInc += val; else totalExp += val;
    });
    return { inc: totalInc, exp: totalExp, net: totalInc - totalExp };
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

      <ScrollView contentContainerStyle={styles.scrollPadding} keyboardShouldPersistTaps="handled">
        <View style={styles.textwrapper}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Budget</Text>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllBtn}>
              <Text style={styles.clearAllBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 16, color: '#444' }}> Planned income and expenses </Text>

          {/* Budget Form */}
          <View style={styles.compactForm}>
            <View style={styles.inputRow}>
             <TextInput style={styles.flexInput} placeholder="Label (e.g. Rent)" value={budgetData.label} onChangeText={(t) => setBudgetData({...budgetData, label: t})} />
             <TextInput style={styles.flexInput} placeholder="Amount" keyboardType="numeric" value={budgetData.amount} onChangeText={(t) => setBudgetData({...budgetData, amount: t})} />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.pickerCell, { flex: budgetData.frequency === 'once' ? 1 : 1.1 }]}>
                <Picker
                  selectedValue={budgetData.frequency}
                  onValueChange={(v) => setBudgetData({...budgetData, frequency: v})}
                  mode="dropdown"
                  itemStyle={{ color: 'black' }}
                >
                  {Object.keys(freqConfig).map(k => (
                    <Picker.Item
                      key={k}
                      label={freqConfig[k].label}
                      value={k}
                      style={{ fontSize: 14, color: 'black'}}
                    />
                  ))}
                </Picker>
              </View>

              <View style={[styles.pickerCell, {flex: 1}]}>
                <Picker
                  selectedValue={budgetData.type}
                  onValueChange={(v) => setBudgetData({...budgetData, type: v})}
                  mode="dropdown"
                  itemStyle={{ color: 'black' }}
                >
                  <Picker.Item label="Income" value="income" color="black" style={{fontSize: 14}} />
                  <Picker.Item label="Expense" value="expense" color="black" style={{fontSize: 14}} />
                </Picker>
              </View>

              {/* Only show Add button in 3rd row if not 'once' frequency */}
              {budgetData.frequency !== 'once' && (
                <TouchableOpacity style={styles.addBtn} onPress={handleAddBudgetEntry}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Third row: Only for one-time stuff */}
            {budgetData.frequency === 'once' && (
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={[styles.flexInput]}
                  onPress={() => {
                    setDateTarget('budget');
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={{ color: 'blue' }}>📅 {budgetData.date || 'Select Date'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddBudgetEntry}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Budget List */}
          {Object.keys(freqConfig).map(fKey => {
            const filtered = budgetItems.filter(i => i.frequency === fKey);
            if (filtered.length === 0) return null;
            return (
              <View key={fKey} style={styles.tableGroup}>
                <Text style={styles.tableHeader}>{freqConfig[fKey].label.toUpperCase()}</Text>
                {filtered.map(item => (
                  <View key={item.id}>
                    {editingBudgetId === item.id ? (
                      <View style={styles.editRow}>
                        <View style={styles.editGrid}>
                          <TextInput style={styles.flexInput} value={editBudgetForm.label} onChangeText={t => setEditBudgetForm({...editBudgetForm, label: t})} />
                          <TextInput style={styles.flexInput} keyboardType="numeric" value={editBudgetForm.amount.toString()} onChangeText={t => setEditBudgetForm({...editBudgetForm, amount: t})} />
                          {item.frequency === 'once' && (
                            <TouchableOpacity
                              style={styles.flexInput}
                              onPress={() => {
                                setDateTarget('edit');
                                setShowDatePicker(true);
                              }}
                            >
                              <Text>{editBudgetForm.date || 'Date'}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={styles.editActions}>
                          <TouchableOpacity onPress={saveBudgetEdit}><Text style={styles.emojiBtn}>✔️</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => setEditingBudgetId(null)}><Text style={styles.emojiBtn}>❌</Text></TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.itemRow}>
                        <Text style={styles.labelCol}>
                          {item.label} {item.frequency === 'once' && item.date ? <Text style={styles.smallDate}>({item.date})</Text> : null}
                        </Text>
                        <Text style={[styles.amountCol, { color: item.type === 'income' ? '#2e7d32' : '#d32f2f' }]}>
                          {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </Text>
                        <View style={styles.actionCol}>
                          <TouchableOpacity onPress={() => { setEditingBudgetId(item.id); setEditBudgetForm({...item}); }}><Text style={styles.emojiBtn}>✏️</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteBudgetItem(item.id)}><Text style={styles.emojiBtn}>🗑️</Text></TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            );
          })}

          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <View style={styles.viewToggle}>
              <Text style={styles.toggleLabel}>SUMMARY:</Text>
              {['weekly', 'monthly', 'annual'].map(v => (
                <TouchableOpacity key={v} onPress={() => setView(v)} style={[styles.toggleBtn, view === v && styles.toggleBtnActive]}>
                  <Text style={[styles.toggleText, view === v && {fontWeight: 'bold'}]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statsWrapped}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Income:</Text>
                <Text style={[styles.statValue, {color: '#2e7d32'}]}>${budgetTotals.inc.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Expenses:</Text>
                <Text style={[styles.statValue, {color: '#d32f2f'}]}>${budgetTotals.exp.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Net:</Text>
                <Text style={[styles.statValue, {color: budgetTotals.net >= 0 ? '#2e7d32' : '#d32f2f', fontWeight: 'bold'}]}>
                  ${budgetTotals.net.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </Text>
              </View>
            </View>
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
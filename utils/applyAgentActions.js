/**
 * Applies Cohere tool actions to budget/spending state via FileContext helpers.
 */
export function applyAgentActions({
  actions,
  budgetItems,
  ongoingSpending,
  saveBudget,
  addOngoingSpend,
  saveOngoingList,
}) {
  let updatedBudgetList = [...budgetItems];
  let updatedSpendingList = [...ongoingSpending];
  let didModifyBudget = false;
  let didModifySpending = false;

  actions.forEach(action => {
    const params =
      typeof action.payload === 'string' ? JSON.parse(action.payload) : action.payload;

    if (action.target_action === 'stage_ongoing_spend') {
      addOngoingSpend({
        label: params.label,
        amount: parseFloat(params.amount),
        type: params.type || 'expense',
        date: params.date,
      });
    } else if (action.target_action === 'stage_budget_item') {
      updatedBudgetList.push({
        id: Date.now(),
        label: params.label,
        amount: parseFloat(params.amount),
        type: params.type,
        frequency: params.frequency,
        date: params.date || '',
      });
      didModifyBudget = true;
    } else if (action.target_action === 'delete_budget_item') {
      updatedBudgetList = updatedBudgetList.filter(item => item.id !== params.id);
      didModifyBudget = true;
    } else if (action.target_action === 'modify_ongoing_spend') {
      updatedSpendingList = updatedSpendingList.map(item => {
        if (item.id === params.id) {
          return {
            ...item,
            label: params.label || item.label,
            amount: parseFloat(params.amount),
          };
        }
        return item;
      });
      didModifySpending = true;
    }
  });

  if (didModifyBudget) {
    saveBudget(updatedBudgetList);
  }
  if (didModifySpending) {
    saveOngoingList(updatedSpendingList);
  }
}

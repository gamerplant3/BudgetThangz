const COHERE_CHAT_URL = 'https://api.cohere.com/v2/chat';
const MODEL = 'command-r-plus-08-2024';

export const BUDGET_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'stage_budget_item',
      description:
        'Add a new planned, recurring income or expense item to the budget baseline.',
      parameters: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          amount: { type: 'number' },
          type: { type: 'string', enum: ['income', 'expense'] },
          frequency: {
            type: 'string',
            enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'annual', 'once'],
          },
          date: { type: 'string' },
        },
        required: ['label', 'amount', 'type', 'frequency'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'stage_ongoing_spend',
      description:
        'Record a completely new, individual transaction or purchase that just happened.',
      parameters: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          amount: { type: 'number' },
          type: { type: 'string', enum: ['expense', 'income'], default: 'expense' },
          date: { type: 'string' },
        },
        required: ['label', 'amount', 'type', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_budget_item',
      description: 'Remove or cancel an existing item from the baseline budget.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'modify_ongoing_spend',
      description:
        "Call this when the user wants to correct, modify, adjust, or change a recent transaction they just logged (e.g., 'oops, change that to $15.50').",
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description:
              'The unique internal ID of the matching transaction to modify.',
          },
          label: {
            type: 'string',
            description: 'The updated label, or the original label if unchanged.',
          },
          amount: {
            type: 'number',
            description: 'The corrected numerical dollar amount.',
          },
        },
        required: ['id', 'amount'],
      },
    },
  },
];

function buildSystemPrompt(budgetItems, ongoingSpending) {
  const currentDate = new Date().toISOString().split('T')[0];
  const budgetSummary =
    budgetItems
      .map(item => `- ID: ${item.id} | ${item.label} | $${item.amount}`)
      .join('\n') || 'None setup.';
  const spendingSummary =
    ongoingSpending
      .map(s => `- ID: ${s.id} | ${s.label} | $${s.amount} | Date: ${s.date}`)
      .join('\n') || 'None logged.';

  return (
    `You are the AI brain inside the 'BudgetThangz' finance app.\n` +
    `Current date: ${currentDate}.\n\n` +
    `ACTIVE RECENT TRANSACTIONS:\n${spendingSummary}\n\n` +
    `BASELINE BUDGET ITEMS:\n${budgetSummary}\n\n` +
    "If the user says 'oops', 'change that', or wants to correct an entry, look at the active transactions list, " +
    "find the item that matches the context (usually the most recent matching entry), extract its ID, and trigger 'modify_ongoing_spend'."
  );
}

function extractAssistantText(message) {
  const content = message?.content;
  if (!content) {
    return 'How can I help you adjust your records?';
  }
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    const textPart = content.find(part => part.type === 'text' || part.text != null);
    if (textPart?.text) {
      return textPart.text;
    }
    if (typeof content[0] === 'string') {
      return content[0];
    }
  }
  return 'How can I help you adjust your records?';
}

/**
 * Calls Cohere v2 chat with budget tools. Returns the same shape AgentBar expects.
 */
export async function chatWithBudgetAgent({
  message,
  budgetItems,
  ongoingSpending,
  apiKey,
}) {
  const response = await fetch(COHERE_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(budgetItems, ongoingSpending) },
        { role: 'user', content: message },
      ],
      tools: BUDGET_TOOLS,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cohere API error (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const assistantMessage = data.message ?? data;
  const toolCalls = assistantMessage.tool_calls ?? assistantMessage.toolCalls ?? [];

  if (toolCalls.length > 0) {
    return {
      type: 'action_execution_plan',
      actions: toolCalls.map(call => ({
        target_action: call.function?.name ?? call.name,
        payload: call.function?.arguments ?? call.parameters,
      })),
      agent_reply: 'Understood! I have processed those updates for you.',
    };
  }

  return {
    type: 'conversational',
    actions: [],
    agent_reply: extractAssistantText(assistantMessage),
  };
}

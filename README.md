
## BudgetThangz

A budgeting application with a simple interface built using React Native and Android Studio (Android SDK and Java JDK). It allows users to track their expenses, set budgets, and manage their finances on an ongoing basis.

### Features
- Expense Tracking: Users can log their expenses and categorize them for better organization.
- Recurring Transactions: Set up recurring transactions for regular expenses or income.
- Budget Management: You can see how much you have left in your budget after known/recurring income and expenses.
- Uses AsyncStorage for local data storage on the device (keeping it simple)


### Intelligence update!!
Added an AI-driven backend to my React Native frontend. Allows the user to manage their budget and their transactions using natural language input.

AI Agent Backend: A standalone Python service built using FastAPI and uv. It uses Cohere's Native V2 Tool-Calling API (command-r-plus) to act as a deterministic orchestrator, parsing user text intents into precise structural state modifications.

### AI Features
- Form Tracking: Log single transactions or recurring line items through explicit selectors.
- AI Financial Agent: A chat component that parses natural language instructions (e.g., "I just spent $14.50 on lunch at Tim Hortons" or "Cancel my Netflix subscription").
- Structured Tool Execution: Uses LLM function-calling to analyze user inputs against active context, dynamically generating precise JSON execution mutations (add, delete, modify) applied instantly to local state.

### Local Deployment

To run the entire system locally, run the execution environments in two separate terminal sessions from the repository root:
1. Mobile Frontend
```
npm run android
```
2. AI Agent Backend
```
cd backend-agent
# Make sure COHERE_API_KEY is defined in backend-agent/.env
uv run uvicorn main:app --reload --port 8000
```

### Screenshots:
Add a transaction

<img width="200" alt="Screenshot 2026-05-29 164151" src="https://github.com/user-attachments/assets/69f9885a-e0ef-4f45-add3-31ad5d6367b8" />
<img width="200" alt="Screenshot 2026-05-29 165515" src="https://github.com/user-attachments/assets/72903d5a-b2e9-4a61-a175-ce7d4d07f5f7" />
<img width="200" alt="Screenshot 2026-05-29 165523" src="https://github.com/user-attachments/assets/3731ecd4-a057-4cdb-b7b8-6e8924cba940" />
<img width="200" alt="Screenshot 2026-05-29 165531" src="https://github.com/user-attachments/assets/62186587-6be5-40f7-9705-8ba58685736d" />



Add a recurring item

<img width="200" alt="Screenshot 2026-05-29 164404" src="https://github.com/user-attachments/assets/158aa29c-7537-4c86-85f4-00fc3d9274f7" />
<img width="200" alt="Screenshot 2026-05-29 164414" src="https://github.com/user-attachments/assets/8b44c257-1e49-4b5e-a58d-a601a197e008" />
<img width="200" alt="Screenshot 2026-05-29 164425" src="https://github.com/user-attachments/assets/4e284bc2-317c-46be-a6ac-352bcc38b7c8" />



Change an item

<img width="200" alt="Screenshot 2026-05-29 171445" src="https://github.com/user-attachments/assets/807b91f3-c8c6-4729-80e3-d1686316df14" />
<img width="200" alt="Screenshot 2026-05-29 171454" src="https://github.com/user-attachments/assets/2566c9ba-5b67-403a-96c6-5af832b133c6" />
<img width="200" alt="Screenshot 2026-05-29 171500" src="https://github.com/user-attachments/assets/c92f323a-7ab4-4403-9f30-41f7c3d2b5de" />

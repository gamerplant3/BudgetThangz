## BudgetThangz

A budgeting app built with React Native. Track planned income and expenses, log one-off spending, and see how much you have left each month. An optional AI assistant on the Home screen understands natural language and updates your budget using Cohere tool-calling.

### Features

- **Budget tab** — Add recurring or one-time income and expenses (label, amount, frequency, date).
- **Spending tab** — Log individual purchases or income as they happen.
- **Home** — Month view, remaining balance, recent transactions, and the AI assistant bar.
- **Settings** — About the app and configuration for the AI assistant.
- **Local data** — Budget and spending lists are stored on the device with AsyncStorage.
- **AI assistant** — Calls Cohere’s API from the phone using your own API key (saved in the device keychain). No separate backend required on a physical device.

### AI assistant

The assistant runs entirely from the mobile app:

1. Create an API key at the [Cohere dashboard](https://dashboard.cohere.com/api-keys).
2. Open **Settings** and enter the key. The key is stored in the device's keychain.
3. On **Home**, use the assistant bar. It stays disabled until a key is saved.

#### Example prompts: 
* I just spent $14.50 at tims
* Add my netflix subscription of $16.45/mo 
* Cancel my gym membership
* I found $20 on the ground yesterday

Under the hood, `services/budgetAgent.js` builds context from your current budget and spending, calls Cohere (`command-r-plus-08-2024`) with tool definitions, and applies add / delete / modify actions to local state.

The agent needs an internet connection; AI usage is billed to your Cohere account.

### Data storage

| Data | Location                                              |
|------|-------------------------------------------------------|
| Budget items, ongoing spending | AsyncStorage (`user_budget_data`, `ongoing_spending`) |
| Cohere API key | Device keychain via `react-native-keychain`           |

### Project layout (mobile)

| Path | Role |
|------|------|
| `App.js` | Navigation and providers |
| `contexts/FileContext.js` | Budget/spending state and AsyncStorage |
| `contexts/AgentContext.js` | Whether a Cohere API key is configured |
| `services/budgetAgent.js` | On-device Cohere chat + tools |
| `services/cohereApiKey.js` | Keychain read/write |
| `components/AgentBar.js` | Home screen assistant UI |
| `screens/*` | Tab screens |

### Optional: `backend-agent/` (for doing desktop dev)

The `backend-agent/` folder is a **Python FastAPI** service with the same tool logic as `budgetAgent.js`. It's useful for experimenting; **the phone app does not use it**.

- Excluded from Metro release bundles (`metro.config.js`).
- Not shipped in release APKs.

To run it locally, open a second terminal window, then:

```sh
cd backend-agent
# Set COHERE_API_KEY in backend-agent/.env
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Running the app
**Development (emulator)**

```sh
npm install
npm run android
# or: npm run ios
```

After the app opens:

1. **Settings** → save your Cohere API key.
2. **Home** → use the assistant (or use Budget / Spending tabs manually).

**Build the APK (Android)**

```sh
cd android
./gradlew assembleRelease
```

APK output will be saved here: `android/app/build/outputs/apk/release/`

The release build contains only the React Native app and bundled JS; `backend-agent/` dir is not included.

### Screenshots

Change an item

<img width="200" alt="Screenshot 2026-05-29 171445" src="https://github.com/user-attachments/assets/807b91f3-c8c6-4729-80e3-d1686316df14" />
<img width="200" alt="Screenshot 2026-05-29 171454" src="https://github.com/user-attachments/assets/2566c9ba-5b67-403a-96c6-5af832b133c6" />
<img width="200" alt="Screenshot 2026-05-29 171500" src="https://github.com/user-attachments/assets/c92f323a-7ab4-4403-9f30-41f7c3d2b5de" />


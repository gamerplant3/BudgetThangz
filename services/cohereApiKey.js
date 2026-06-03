import * as Keychain from 'react-native-keychain';

export const COHERE_KEYCHAIN_SERVICE = 'com.BudgetThangz.cohere';

export async function getCohereApiKey() {
  const credentials = await Keychain.getGenericPassword({
    service: COHERE_KEYCHAIN_SERVICE,
  });
  if (credentials && credentials.password) {
    return credentials.password;
  }
  return null;
}

export async function setCohereApiKey(apiKey) {
  await Keychain.setGenericPassword('cohere', apiKey.trim(), {
    service: COHERE_KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearCohereApiKey() {
  await Keychain.resetGenericPassword({ service: COHERE_KEYCHAIN_SERVICE });
}

export async function hasCohereApiKey() {
  const key = await getCohereApiKey();
  return Boolean(key && key.trim());
}

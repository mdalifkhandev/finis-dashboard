import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  emailNotifications: {
    projectUpdates: boolean;
    safetyAlerts: boolean;
    workforceUpdates: boolean;
    financialReports: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    sound: boolean;
  };
}

const STORAGE_KEY = 'finis_dashboard_settings';

const defaultState: SettingsState = {
  language: 'en-US',
  timezone: 'PT',
  dateFormat: 'mdy',
  currency: 'usd',
  emailNotifications: {
    projectUpdates: true,
    safetyAlerts: true,
    workforceUpdates: false,
    financialReports: true,
  },
  pushNotifications: {
    enabled: true,
    sound: true,
  },
};

const loadState = (): SettingsState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...(JSON.parse(raw) as SettingsState) };
  } catch {
    // ignore storage parse failures
  }
  return defaultState;
};

const persist = (state: SettingsState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const initialState = loadState();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updatePreferences(
      state,
      action: PayloadAction<Partial<Pick<SettingsState, 'language' | 'timezone' | 'dateFormat' | 'currency'>>>,
    ) {
      Object.assign(state, action.payload);
      persist(state);
    },
    updateNotifications(
      state,
      action: PayloadAction<Partial<SettingsState['emailNotifications'] & SettingsState['pushNotifications']>>,
    ) {
      state.emailNotifications = {
        ...state.emailNotifications,
        ...(action.payload.projectUpdates !== undefined ? { projectUpdates: action.payload.projectUpdates } : {}),
        ...(action.payload.safetyAlerts !== undefined ? { safetyAlerts: action.payload.safetyAlerts } : {}),
        ...(action.payload.workforceUpdates !== undefined ? { workforceUpdates: action.payload.workforceUpdates } : {}),
        ...(action.payload.financialReports !== undefined ? { financialReports: action.payload.financialReports } : {}),
      };
      state.pushNotifications = {
        ...state.pushNotifications,
        ...(action.payload.enabled !== undefined ? { enabled: action.payload.enabled } : {}),
        ...(action.payload.sound !== undefined ? { sound: action.payload.sound } : {}),
      };
      persist(state);
    },
  },
});

export const { updatePreferences, updateNotifications } = settingsSlice.actions;
export default settingsSlice.reducer;

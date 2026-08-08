import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProjectTeamMember } from '@/store/projectApi';

export interface LiveWorker {
  workerId: string;
  workerName: string;
  avatarUrl: string | null;
  lat: number;
  lng: number;
  isInsideZone: boolean;
  zoneName: string | null;
  totalZoneHours?: number;
  status?: string;
  timestamp?: string | Date;
}

interface WorkforceState {
  selectedProjectId: string | null;
  managers: ProjectTeamMember[];
  workers: ProjectTeamMember[];
  liveWorkers: Record<string, LiveWorker>;
  connected: boolean;
}

const initialState: WorkforceState = {
  selectedProjectId: null,
  managers: [],
  workers: [],
  liveWorkers: {},
  connected: false,
};

const workforceSlice = createSlice({
  name: 'workforce',
  initialState,
  reducers: {
    setSelectedProjectId(state, action: PayloadAction<string | null>) {
      state.selectedProjectId = action.payload;
    },
    setManagers(state, action: PayloadAction<ProjectTeamMember[]>) {
      state.managers = action.payload;
    },
    setWorkers(state, action: PayloadAction<ProjectTeamMember[]>) {
      state.workers = action.payload;
    },
    setWorkforceConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setLiveWorkers(state, action: PayloadAction<Record<string, LiveWorker>>) {
      state.liveWorkers = action.payload;
    },
    updateLiveWorker(state, action: PayloadAction<LiveWorker>) {
      state.liveWorkers[action.payload.workerId] = action.payload;
    },
    clearLiveWorkers(state) {
      state.liveWorkers = {};
    },
  },
});

export const {
  setSelectedProjectId,
  setManagers,
  setWorkers,
  setWorkforceConnected,
  setLiveWorkers,
  updateLiveWorker,
  clearLiveWorkers,
} = workforceSlice.actions;

export default workforceSlice.reducer;

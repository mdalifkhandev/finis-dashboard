import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LatLng = { lat: number; lng: number };
type WorkerLocation = {
  workerId: string;
  name?: string;
  lat: number;
  lng: number;
  timestamp?: string;
  status?: string;
  isInsideZone?: boolean;
  zoneName?: string;
};

interface GeofencingState {
  geofences: Array<{ id: string; name?: string; coords: LatLng[]; isActive?: boolean }>;
  liveWorkers: Record<string, WorkerLocation>;
  logs: Array<{ id?: string; workerId: string; location: LatLng; timestamp: string; type?: string }>;
  ui: { drawing: boolean; drawPoints: LatLng[] };
}

const initialState: GeofencingState = {
  geofences: [],
  liveWorkers: {},
  logs: [],
  ui: { drawing: false, drawPoints: [] },
};

const slice = createSlice({
  name: 'geofencing',
  initialState,
  reducers: {
    setGeofences(state, action: PayloadAction<GeofencingState['geofences']>) {
      state.geofences = action.payload;
    },
    addGeofence(state, action: PayloadAction<{ id: string; coords: LatLng[]; name?: string; isActive?: boolean }>) {
      state.geofences.push(action.payload);
    },
    setLiveWorkers(state, action: PayloadAction<Record<string, WorkerLocation>>) {
      state.liveWorkers = action.payload;
    },
    updateWorkerLocation(state, action: PayloadAction<WorkerLocation>) {
      state.liveWorkers[action.payload.workerId] = action.payload;
    },
    removeWorker(state, action: PayloadAction<string>) {
      delete state.liveWorkers[action.payload];
    },
    addLog(state, action: PayloadAction<{ workerId: string; location: LatLng; timestamp: string; type?: string }>) {
      const latest = state.logs[0];
      const sameLocation =
        latest?.workerId === action.payload.workerId &&
        latest.location.lat === action.payload.location.lat &&
        latest.location.lng === action.payload.location.lng &&
        latest.type === action.payload.type;

      if (sameLocation) {
        latest.timestamp = action.payload.timestamp;
        return;
      }

      state.logs.unshift(action.payload);
      if (state.logs.length > 500) state.logs.pop();
    },
    setDrawing(state, action: PayloadAction<boolean>) {
      state.ui.drawing = action.payload;
      if (!action.payload) state.ui.drawPoints = [];
    },
    setDrawPoints(state, action: PayloadAction<LatLng[]>) {
      state.ui.drawPoints = action.payload;
    },
    clearLogs(state) {
      state.logs = [];
    },
  },
});

export const {
  setGeofences,
  addGeofence,
  setLiveWorkers,
  updateWorkerLocation,
  removeWorker,
  addLog,
  setDrawing,
  setDrawPoints,
  clearLogs,
} = slice.actions;

export default slice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { dashboardApi } from './dashboardApi';
import { companiesApi } from './companiesApi';
import { projectApi } from './projectApi';
import { teamManagementApi } from './teamManagementApi';
import { messageApi } from './messageApi';
import { inventoryApi } from './inventoryApi';
import { settingsApi } from './settingsApi';
import { publicContentApi } from './publicContentApi';
import { quotesApi } from './quotesApi';
import authReducer from './authSlice';
import geofencingReducer from '../features/geofencing/store/geofencingSlice';
import chatSocketReducer from './chatSocketSlice';
import workforceReducer from '../features/workforce/store/workforceSlice';
import settingsReducer from '../features/dashboard/store/settingsSlice';

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
        [companiesApi.reducerPath]: companiesApi.reducer,
        [projectApi.reducerPath]: projectApi.reducer,
        [teamManagementApi.reducerPath]: teamManagementApi.reducer,
        [messageApi.reducerPath]: messageApi.reducer,
        [inventoryApi.reducerPath]: inventoryApi.reducer,
        [settingsApi.reducerPath]: settingsApi.reducer,
        [publicContentApi.reducerPath]: publicContentApi.reducer,
        [quotesApi.reducerPath]: quotesApi.reducer,
        auth: authReducer,
        geofencing: geofencingReducer,
        chatSocket: chatSocketReducer,
        workforce: workforceReducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            dashboardApi.middleware,
            companiesApi.middleware,
            projectApi.middleware,
            teamManagementApi.middleware,
            messageApi.middleware,
            inventoryApi.middleware,
            settingsApi.middleware,
            publicContentApi.middleware,
            quotesApi.middleware,
        ),
    devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

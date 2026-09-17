import { configureStore, Middleware } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { dashboardApi } from './dashboardApi';
import { companiesApi } from './companiesApi';
import { payrollApi } from './payrollApi';
import { projectApi } from './projectApi';
import { teamManagementApi } from './teamManagementApi';
import { messageApi } from './messageApi';
import { inventoryApi } from './inventoryApi';
import { settingsApi } from './settingsApi';
import { publicContentApi } from './publicContentApi';
import { quotesApi } from './quotesApi';
import authReducer from './authSlice';
import geofencingReducer from '../features/geofencing/store/geofencingSlice';
import chatSocketReducer, { resetChatSocket } from './chatSocketSlice';
import workforceReducer, {
    setSelectedProjectId,
    setManagers,
    setWorkers,
    clearLiveWorkers,
} from '../features/workforce/store/workforceSlice';
import settingsReducer from '../features/dashboard/store/settingsSlice';
import { queryClient } from '@/lib/queryClient';

const authResetMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
    const prevAuth = (storeApi.getState() as RootState)?.auth;
    const result = next(action);
    const nextAuth = (storeApi.getState() as RootState)?.auth;

    if (action.type === 'auth/clearAuth') {
        storeApi.dispatch(authApi.util.resetApiState());
        storeApi.dispatch(dashboardApi.util.resetApiState());
        storeApi.dispatch(companiesApi.util.resetApiState());
        storeApi.dispatch(payrollApi.util.resetApiState());
        storeApi.dispatch(projectApi.util.resetApiState());
        storeApi.dispatch(teamManagementApi.util.resetApiState());
        storeApi.dispatch(messageApi.util.resetApiState());
        storeApi.dispatch(inventoryApi.util.resetApiState());
        storeApi.dispatch(settingsApi.util.resetApiState());
        storeApi.dispatch(publicContentApi.util.resetApiState());
        storeApi.dispatch(quotesApi.util.resetApiState());
        storeApi.dispatch(resetChatSocket());
        storeApi.dispatch(setSelectedProjectId(null));
        storeApi.dispatch(setManagers([]));
        storeApi.dispatch(setWorkers([]));
        storeApi.dispatch(clearLiveWorkers());
        queryClient.clear();
    } else if (action.type === 'auth/setAuth') {
        if (!prevAuth?.user || prevAuth.user.id !== nextAuth?.user?.id || prevAuth.user.role !== nextAuth?.user?.role) {
            storeApi.dispatch(dashboardApi.util.resetApiState());
            storeApi.dispatch(companiesApi.util.resetApiState());
            storeApi.dispatch(payrollApi.util.resetApiState());
            storeApi.dispatch(projectApi.util.resetApiState());
            storeApi.dispatch(teamManagementApi.util.resetApiState());
            storeApi.dispatch(messageApi.util.resetApiState());
            storeApi.dispatch(inventoryApi.util.resetApiState());
            storeApi.dispatch(settingsApi.util.resetApiState());
            storeApi.dispatch(publicContentApi.util.resetApiState());
            storeApi.dispatch(quotesApi.util.resetApiState());
            storeApi.dispatch(resetChatSocket());
            storeApi.dispatch(setSelectedProjectId(null));
            storeApi.dispatch(setManagers([]));
            storeApi.dispatch(setWorkers([]));
            storeApi.dispatch(clearLiveWorkers());
            queryClient.clear();
        }
    }

    return result;
};

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
        [companiesApi.reducerPath]: companiesApi.reducer,
        [payrollApi.reducerPath]: payrollApi.reducer,
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
            authResetMiddleware,
            authApi.middleware,
            dashboardApi.middleware,
            companiesApi.middleware,
            payrollApi.middleware,
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

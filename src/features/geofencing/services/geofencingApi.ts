import { config } from '@/config/env';

type LatLng = { lat: number; lng: number };

export type GeofenceRecord = {
    id: string;
    zoneName?: string;
    polygonCoords?: LatLng[] | string | null;
    isActive?: boolean;
    center?: LatLng | null;
    [key: string]: unknown;
};

function getAuthHeaders() {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('auth_token');

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

function normalizeGeofence(item: GeofenceRecord) {
    const coords = Array.isArray(item.polygonCoords)
        ? item.polygonCoords
        : typeof item.polygonCoords === 'string'
            ? (() => {
                  try {
                      return JSON.parse(item.polygonCoords) as LatLng[];
                  } catch {
                      return [] as LatLng[];
                  }
              })()
            : [];

    return {
        id: item.id,
        name: item.zoneName ?? item.id,
        coords,
        isActive: item.isActive ?? true,
        center: item.center ?? null,
    };
}

export async function fetchProjectGeofences(projectId: string): Promise<Array<ReturnType<typeof normalizeGeofence>>> {
    const response = await fetch(`${config.apiBaseUrl}/admin/projects/${projectId}/geofences`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch geofences (${response.status})`);
    }

    const payload = await response.json();
    const records = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

    return records.map((item: GeofenceRecord) => normalizeGeofence(item));
}

export async function createProjectGeofence(projectId: string, zoneName: string, coords: LatLng[]) {
    const response = await fetch(`${config.apiBaseUrl}/admin/projects/${projectId}/geofences`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            zoneName,
            polygonCoords: coords,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to create geofence (${response.status})`);
    }

    const payload = await response.json();
    const record = payload?.data ?? payload;
    return normalizeGeofence(record as GeofenceRecord);
}

export async function updateProjectGeofence(
    projectId: string,
    geofenceId: string,
    body: Partial<{ zoneName: string; polygonCoords: LatLng[]; isActive: boolean }>,
) {
    const response = await fetch(`${config.apiBaseUrl}/admin/projects/${projectId}/geofences/${geofenceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Failed to update geofence (${response.status})`);
    }

    const payload = await response.json();
    const record = payload?.data ?? payload;
    return normalizeGeofence(record as GeofenceRecord);
}

export type GeofenceViolationRecord = {
    id: string;
    geofenceName?: string | null;
    severity?: string | null;
    eventType?: string | null;
    status?: string | null;
    occurredAt?: string | null;
    lat?: number | null;
    lng?: number | null;
    worker?: {
        id: string;
        fullName: string;
    } | null;
};

export type GeofenceLocationLogRecord = {
    id: string;
    eventType?: string | null;
    loggedAt?: string | null;
    lat?: number | null;
    lng?: number | null;
    isInsideZone?: boolean;
    user?: {
        id: string;
        fullName: string;
        role?: string | null;
    } | null;
    geofence?: {
        id: string;
        zoneName?: string | null;
    } | null;
};

export async function fetchProjectViolations(projectId: string): Promise<GeofenceViolationRecord[]> {
    const response = await fetch(`${config.apiBaseUrl}/admin/projects/${projectId}/geofences/violations`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch violations (${response.status})`);
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

export async function fetchProjectLocationLogs(projectId: string): Promise<GeofenceLocationLogRecord[]> {
    const response = await fetch(`${config.apiBaseUrl}/admin/projects/${projectId}/geofences/location-logs`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch location logs (${response.status})`);
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

export async function fetchProjectTimeSummary(projectId: string, date?: string) {
    const url = new URL(`${config.apiBaseUrl}/admin/projects/${projectId}/geofences/time-summary`);
    if (date) url.searchParams.set('date', date);
    const response = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!response.ok) throw new Error(`Failed to fetch time summary (${response.status})`);
    return response.json();
}

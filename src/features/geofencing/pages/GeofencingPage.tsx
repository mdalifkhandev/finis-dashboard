import React from 'react';
import { GoogleMap, Polygon, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import {
    MapPinned,
    Plus,
    Save,
    Clock3,
    Users2,
    ShieldAlert,
    Activity,
    TriangleAlert,
    Layers3,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Crosshair,
    Search,
    Loader2,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Badge } from '@/shared/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store/store';
import { useGetAdminProjectsQuery } from '@/store/projectApi';
import { useGetCompaniesQuery, useLazyGetCompanyProjectsQuery } from '@/store/companiesApi';
import { selectAuthUser } from '@/store/authSlice';
import { addGeofence, setGeofences, setLiveWorkers } from '../store/geofencingSlice';
import { getSocket, startGeofencingSocket } from '../services/socket';
import { createProjectGeofence, fetchProjectGeofences, updateProjectGeofence } from '../services/geofencingApi';
import { config } from '@/config/env';

type LatLng = { lat: number; lng: number };
type LiveWorker = {
    workerId: string;
    name?: string;
    lat: number;
    lng: number;
    timestamp?: string;
    status?: string;
    isInsideZone?: boolean;
    zoneName?: string;
};

interface ProjectSummary {
    id: string;
    name: string;
    site: string;
    manager: string;
    workers: number;
    status: string;
    center: LatLng;
}

// Default map center (Dhaka) when no geofences/location available yet
const DEFAULT_CENTER: LatLng = { lat: 23.8103, lng: 90.4125 };

function pointInPolygon(point: LatLng, polygon: LatLng[]) {
    if (polygon.length < 3) return false;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lat;
        const yi = polygon[i].lng;
        const xj = polygon[j].lat;
        const yj = polygon[j].lng;
        const intersect =
            yi > point.lng !== yj > point.lng &&
            point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

function getPolygonCenter(coords: LatLng[]) {
    if (coords.length === 0) return null;
    const lat = coords.reduce((sum, point) => sum + point.lat, 0) / coords.length;
    const lng = coords.reduce((sum, point) => sum + point.lng, 0) / coords.length;
    return { lat, lng };
}

function toMeters(deltaLat: number, deltaLng: number, atLat: number) {
    const metersPerLat = 111_320;
    const metersPerLng = 111_320 * Math.cos((atLat * Math.PI) / 180);
    return {
        x: deltaLng * metersPerLng,
        y: deltaLat * metersPerLat,
    };
}

function distanceToSegmentMeters(point: LatLng, a: LatLng, b: LatLng) {
    const baseLat = (point.lat + a.lat + b.lat) / 3;
    const p = toMeters(point.lat - a.lat, point.lng - a.lng, baseLat);
    const ab = toMeters(b.lat - a.lat, b.lng - a.lng, baseLat);

    const abLenSq = ab.x * ab.x + ab.y * ab.y;
    if (abLenSq === 0) {
        return Math.sqrt(p.x * p.x + p.y * p.y);
    }

    const t = Math.max(0, Math.min(1, (p.x * ab.x + p.y * ab.y) / abLenSq));
    const projX = ab.x * t;
    const projY = ab.y * t;
    const dx = p.x - projX;
    const dy = p.y - projY;
    return Math.sqrt(dx * dx + dy * dy);
}

function minDistanceToPolygonMeters(point: LatLng, polygon: LatLng[]) {
    if (polygon.length < 2) return Infinity;
    let min = Infinity;
    for (let i = 0; i < polygon.length; i += 1) {
        const a = polygon[i];
        const b = polygon[(i + 1) % polygon.length];
        min = Math.min(min, distanceToSegmentMeters(point, a, b));
    }
    return min;
}

function getWorkerStyle(worker: LiveWorker, geofencesList: Array<{ coords: LatLng[] }>) {
    const point = { lat: worker.lat, lng: worker.lng };
    const validGeofences = geofencesList.filter((g) => g.coords.length >= 3);
    const hasGeo = validGeofences.length > 0;
    const matchedGeofence = validGeofences.find((g) => pointInPolygon(point, g.coords)) ?? null;
    const nearBoundary = !matchedGeofence && hasGeo
        ? validGeofences.some((g) => minDistanceToPolygonMeters(point, g.coords) <= 2)
        : false;

    if (matchedGeofence) {
        return {
            ring: '#16a34a',
            fill: '#22c55e',
            label: 'Inside zone',
            badge: 'success' as const,
        };
    }

    if (nearBoundary) {
        return {
            ring: '#f59e0b',
            fill: '#fbbf24',
            label: 'Near boundary',
            badge: 'warning' as const,
        };
    }

    if (hasGeo) {
        return {
            ring: '#dc2626',
            fill: '#f87171',
            label: 'Outside zone',
            badge: 'destructive' as const,
        };
    }

    if (worker.status === 'inside' || worker.isInsideZone) {
        return {
            ring: '#16a34a',
            fill: '#22c55e',
            label: 'Inside zone',
            badge: 'success' as const,
        };
    }

    return {
        ring: '#dc2626',
        fill: '#f87171',
        label: 'Outside zone',
        badge: 'destructive' as const,
    };
}

function isUuid(id: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// ─── Empty state placeholder ──────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Icon size={32} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function GeofencingPage() {
    const dispatch = useAppDispatch();
    const socketRef = React.useRef<ReturnType<typeof getSocket> | null>(null);
    const authUser = useAppSelector(selectAuthUser);
    const mapRef = React.useRef<google.maps.Map | null>(null);

    const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [drawPoints, setDrawPoints] = React.useState<LatLng[]>([]);
    const [editingGeofenceId, setEditingGeofenceId] = React.useState<string | null>(null);
    const [selectedGeofenceId, setSelectedGeofenceId] = React.useState<string | null>(null);
    const [draftZoneName, setDraftZoneName] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [placeQuery, setPlaceQuery] = React.useState('');
    const [focusPoint, setFocusPoint] = React.useState<LatLng | null>(null);
    const [isLoadingGeofences, setIsLoadingGeofences] = React.useState(false);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
    const { isLoaded: isGoogleMapsLoaded } = useJsApiLoader({
        googleMapsApiKey: config.maps.googleMapsApiKey,
        libraries: ['places'],
    });

    const geofences = useAppSelector((s) => s.geofencing.geofences);
    const liveWorkers = useAppSelector((s) => s.geofencing.liveWorkers);
    const logs = useAppSelector((s) => s.geofencing.logs);
    const isSuperAdmin = authUser?.role === 'super_admin';
    const hasSavedGeofence = geofences.length > 0;

    // ── Fetch projects from API ───────────────────────────────────────────────
    const { data: apiProjectsRaw, isLoading: projectsLoading } = useGetAdminProjectsQuery(undefined, {
        skip: isSuperAdmin,
    });
    const { data: companiesRaw, isLoading: companiesLoading } = useGetCompaniesQuery(undefined, {
        skip: !isSuperAdmin,
    });
    const [triggerCompanyProjects] = useLazyGetCompanyProjectsQuery();
    const [superAdminProjects, setSuperAdminProjects] = React.useState<any[]>([]);
    const [superAdminProjectsLoading, setSuperAdminProjectsLoading] = React.useState(false);

    const apiProjects: any[] = React.useMemo(() => {
        if (!apiProjectsRaw) return [];
        if (Array.isArray(apiProjectsRaw)) return apiProjectsRaw;
        const wrapped = (apiProjectsRaw as any)?.data;
        return Array.isArray(wrapped) ? wrapped : [];
    }, [apiProjectsRaw]);

    const companies = React.useMemo(() => {
        if (!companiesRaw) return [];
        if (Array.isArray(companiesRaw)) return companiesRaw;
        const wrapped = (companiesRaw as any)?.data;
        return Array.isArray(wrapped) ? wrapped : [];
    }, [companiesRaw]);

    React.useEffect(() => {
        if (!isSuperAdmin) {
            setSuperAdminProjects([]);
            setSuperAdminProjectsLoading(false);
            return;
        }

        let cancelled = false;

        const loadAllProjects = async () => {
            setSuperAdminProjectsLoading(true);
            try {
                const responses = await Promise.all(
                    companies.map(async (company: any) => {
                        const result = await triggerCompanyProjects(company.id).unwrap();
                        return Array.isArray(result) ? result : [];
                    }),
                );
                if (!cancelled) {
                    setSuperAdminProjects(responses.flat());
                }
            } catch {
                if (!cancelled) setSuperAdminProjects([]);
            } finally {
                if (!cancelled) setSuperAdminProjectsLoading(false);
            }
        };

        if (companies.length > 0) {
            void loadAllProjects();
        } else {
            setSuperAdminProjects([]);
        }

        return () => {
            cancelled = true;
        };
    }, [companies, isSuperAdmin, triggerCompanyProjects]);

    const projectsList: ProjectSummary[] = React.useMemo(() =>
        (isSuperAdmin ? superAdminProjects : apiProjects).map((p: any) => {
            const backendCenter =
                p.center && typeof p.center.lat === 'number' ? p.center : null;
            const managerMember = p.teamMembers?.find((m: any) => m.role === 'manager');
            return {
                id: p.id,
                name: p.name,
                site: p.location ?? '',
                manager: managerMember?.user?.fullName ?? '',
                workers: p._count?.teamMembers ?? p.teamMembers?.length ?? 0,
                status:
                    p.status === 'active' ? 'Active'
                    : p.status === 'paused' ? 'Paused'
                    : p.status === 'completed' ? 'Completed'
                    : 'Planning',
                center: backendCenter ?? DEFAULT_CENTER,
            };
        }),
    [apiProjects, isSuperAdmin, superAdminProjects]);

    // Auto-select first project after load
    React.useEffect(() => {
        if (projectsLoading || projectsList.length === 0) return;

        const savedProjectId = localStorage.getItem('geofencing_selected_project_id') || '';
        const savedProject = projectsList.find((p) => p.id === savedProjectId);
        if (!selectedProjectId && savedProject) {
            setSelectedProjectId(savedProject.id);
            return;
        }

        if (!selectedProjectId) {
            setSelectedProjectId(projectsList[0].id);
        }
    }, [projectsList, selectedProjectId, projectsLoading, superAdminProjectsLoading]);

    const project = projectsList.find((p) => p.id === selectedProjectId) ?? null;

    // ── Load geofences when project changes ───────────────────────────────────
    React.useEffect(() => {
        if (!selectedProjectId || !isUuid(selectedProjectId)) {
            dispatch(setGeofences([]));
            dispatch(setLiveWorkers({}));
            return;
        }
        let cancelled = false;
        setIsLoadingGeofences(true);
        setLoadError(null);
        dispatch(setGeofences([]));
        dispatch(setLiveWorkers({}));

        fetchProjectGeofences(selectedProjectId)
            .then((items) => { if (!cancelled) dispatch(setGeofences(items)); })
            .catch((err) => { if (!cancelled) setLoadError(err?.message ?? 'Failed to load geofences'); })
            .finally(() => { if (!cancelled) setIsLoadingGeofences(false); });

        return () => { cancelled = true; };
    }, [dispatch, selectedProjectId]);

    // ── Socket init ───────────────────────────────────────────────────────────
    React.useEffect(() => {
        socketRef.current = startGeofencingSocket(store as any);

        return () => {
            socketRef.current = null;
        };
    }, []);

    React.useEffect(() => {
        const token = localStorage.getItem('auth_token');
        console.log('[GeofencingPage] mount', {
            role: authUser?.role ?? null,
            userId: authUser?.id ?? null,
            hasToken: Boolean(token),
            selectedProjectId,
        });
    }, [authUser?.id, authUser?.role, selectedProjectId]);

    // ── Join selected project room ───────────────────────────────────────────
    React.useEffect(() => {
        const socket = socketRef.current ?? startGeofencingSocket(store as any);
        socketRef.current = socket;
        if (!socket || !selectedProjectId) return;

        const joinProject = () => {
            socket.emit('join_project', { projectId: selectedProjectId });
            socket.emit('get_live_workers', { projectId: selectedProjectId });
        };

        if (socket.connected) {
            joinProject();
        } else {
            socket.once('connect', joinProject);
        }

        return () => {
            socket.off('connect', joinProject);
            if (socket.connected) {
                socket.emit('leave_project', { projectId: selectedProjectId });
            }
        };
    }, [selectedProjectId]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const workerMap = React.useMemo(() =>
        Object.values(liveWorkers ?? {}).reduce<Record<string, { lat: number; lng: number }>>((acc, w: LiveWorker) => {
            if (
                w?.workerId &&
                typeof w.lat === 'number' &&
                typeof w.lng === 'number' &&
                (w.lat !== 0 || w.lng !== 0)
            ) {
                acc[w.workerId] = { lat: w.lat, lng: w.lng };
            }
            return acc;
        }, {}),
    [liveWorkers]);

    const workerEntries = React.useMemo(
        () => Object.values(liveWorkers ?? {}) as LiveWorker[],
        [liveWorkers],
    );
    const latestLogs = logs.slice(0, 5);
    const projectCenter = project?.center ?? DEFAULT_CENTER;
    const workerStyle = (w: LiveWorker) => getWorkerStyle(w, geofences);
    const workerMarkerIcon = (w: LiveWorker) => {
        const style = workerStyle(w);
        return {
            path: window.google?.maps?.SymbolPath?.CIRCLE ?? 0,
            scale: 10,
            fillColor: style.fill,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
        };
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleProjectChange = (e: { target: { value: string; name?: string } }) => {
        setSelectedProjectId(e.target.value);
        localStorage.setItem('geofencing_selected_project_id', e.target.value);
        setDrawPoints([]);
        setDraftZoneName('');
        setEditingGeofenceId(null);
        setSelectedGeofenceId(null);
        setSearchQuery('');
        setPlaceQuery('');
        setFocusPoint(null);
        setIsDrawing(false);
    };

    const handlePlaceSearch = async () => {
        if (!placeQuery.trim() || !window.google?.maps?.Geocoder) return;
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ address: placeQuery.trim() });
        const location = result.results[0]?.geometry?.location;
        if (!location) return;
        const next = { lat: location.lat(), lng: location.lng() };
        setFocusPoint(next);
        mapRef.current?.panTo(next);
        mapRef.current?.setZoom(16);
    };

    const handleCurrentLocation = () => {
        const validGeofences = geofences.filter((geo) => geo.coords.length >= 3);
        const selectedGeofence = validGeofences[0] ?? null;
        const next = selectedGeofence ? getPolygonCenter(selectedGeofence.coords) : projectCenter;
        if (!next) return;
        setSelectedGeofenceId(selectedGeofence?.id ?? null);
        setFocusPoint(next);
        mapRef.current?.panTo(next);
        mapRef.current?.setZoom(selectedGeofence ? 18 : 16);

        if (validGeofences.length > 0 && mapRef.current && window.google?.maps?.LatLngBounds) {
            const bounds = new google.maps.LatLngBounds();
            validGeofences.forEach((geo) => {
                geo.coords.forEach((point) => bounds.extend(point));
            });
            mapRef.current.fitBounds(bounds);
        }
    };

    const handleSaveGeofence = async () => {
        if (drawPoints.length < 3 || !project || !isUuid(selectedProjectId)) return;
        const zoneName = draftZoneName.trim() || `${project.name} Zone ${geofences.length + 1}`;
        try {
            if (editingGeofenceId) {
                const updated = await updateProjectGeofence(selectedProjectId, editingGeofenceId, {
                    zoneName,
                    polygonCoords: drawPoints,
                });
                dispatch(setGeofences(geofences.map((geo) => (geo.id === editingGeofenceId ? updated : geo))));
            } else if (!hasSavedGeofence) {
                const created = await createProjectGeofence(selectedProjectId, zoneName, drawPoints);
                dispatch(addGeofence(created));
            } else if (geofences[0]) {
                const updated = await updateProjectGeofence(selectedProjectId, geofences[0].id, {
                    zoneName,
                    polygonCoords: drawPoints,
                });
                dispatch(setGeofences(geofences.map((geo) => (geo.id === geofences[0].id ? updated : geo))));
            }
        } catch {
            if (editingGeofenceId) {
                dispatch(setGeofences(geofences.map((geo) => (
                    geo.id === editingGeofenceId
                        ? { ...geo, name: zoneName, coords: drawPoints, isActive: true }
                        : geo
                ))));
            } else if (!hasSavedGeofence) {
                dispatch(addGeofence({ id: `local-${Date.now()}`, name: zoneName, coords: drawPoints, isActive: true }));
            } else {
                dispatch(setGeofences(geofences.map((geo) => (
                    geo.id === geofences[0]?.id
                        ? { ...geo, name: zoneName, coords: drawPoints, isActive: true }
                        : geo
                ))));
            }
        }
        setDrawPoints([]);
        setDraftZoneName('');
        setEditingGeofenceId(null);
        setIsDrawing(false);
    };

    const handleEditGeofence = (geo: { id: string; name?: string; coords: LatLng[] }) => {
        setEditingGeofenceId(geo.id);
        setDraftZoneName(geo.name ?? '');
        setDrawPoints(geo.coords);
        setIsDrawing(true);
    };

    // ── Loading screen ────────────────────────────────────────────────────────
    if (projectsLoading || (isSuperAdmin && (companiesLoading || superAdminProjectsLoading))) {
        return (
            <div className="flex h-96 items-center justify-center gap-3 text-gray-500">
                <Loader2 size={20} className="animate-spin" />
                <span>Loading projects…</span>
            </div>
        );
    }

    // ── No projects ───────────────────────────────────────────────────────────
    if (!(projectsLoading || superAdminProjectsLoading) && projectsList.length === 0) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Geofencing & Location"
                    description="Real map view with project boundaries and live worker tracking"
                    icon={MapPinned}
                />
                <Card>
                    <CardContent className="py-16">
                        <EmptyState
                            icon={MapPinned}
                            title="No projects found"
                            description="Create a project first to start tracking geofences and worker locations."
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Geofencing & Location"
                description="Real map view with project boundaries and live worker tracking"
                icon={MapPinned}
            >
                <div className="w-64">
                    <Select
                        value={selectedProjectId}
                        onChange={handleProjectChange}
                        options={projectsList.map((p) => ({ value: p.id, label: `${p.name}${p.site ? ` · ${p.site}` : ''}` }))}
                    />
                </div>
            </PageHeader>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active geofences</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {isLoadingGeofences ? <Loader2 size={20} className="animate-spin" /> : geofences.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <Users2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Live workers</p>
                            <p className="text-2xl font-semibold text-gray-900">{workerEntries.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                            <TriangleAlert size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Recent logs</p>
                            <p className="text-2xl font-semibold text-gray-900">{latestLogs.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Map + Sidebar */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-gray-100">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <MapPinned className="h-5 w-5 text-indigo-600" />
                                Real-time project map
                            </CardTitle>
                        </div>
                        <div className="flex w-full max-w-md gap-2">
                            {isGoogleMapsLoaded ? (
                                <Autocomplete
                                    onLoad={(autocomplete) => {
                                        autocompleteRef.current = autocomplete;
                                    }}
                                    onPlaceChanged={() => {
                                        const place = autocompleteRef.current?.getPlace();
                                        const location = place?.geometry?.location;
                                        if (!location) return;
                                        const next = { lat: location.lat(), lng: location.lng() };
                                        setPlaceQuery(place?.formatted_address ?? place?.name ?? '');
                                        setFocusPoint(next);
                                        mapRef.current?.panTo(next);
                                        mapRef.current?.setZoom(16);
                                    }}
                                >
                                    <div className="relative flex-1">
                                        <Input
                                            value={placeQuery}
                                            onChange={(e) => setPlaceQuery(e.target.value)}
                                            placeholder=""
                                            aria-label="Search place on Google Maps"
                                            className="pr-10"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    void handlePlaceSearch();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => void handlePlaceSearch()}
                                            aria-label="Search place"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                                        >
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </Autocomplete>
                            ) : (
                                <div className="relative flex-1">
                                    <Input
                                        value={placeQuery}
                                        onChange={(e) => setPlaceQuery(e.target.value)}
                                        placeholder=""
                                        aria-label="Search place on Google Maps"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void handlePlaceSearch()}
                                        aria-label="Search place"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                            )}
                            <Button variant="outline" onClick={handleCurrentLocation} disabled={!isGoogleMapsLoaded}>
                                My Location
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={isDrawing ? 'secondary' : 'default'}
                                    onClick={() => setIsDrawing((v) => !v)}
                                    disabled={hasSavedGeofence && !editingGeofenceId}
                                >
                                    <Plus size={16} />
                                {editingGeofenceId
                                    ? 'Editing zone…'
                                    : hasSavedGeofence
                                        ? 'Zone already saved'
                                        : (isDrawing ? 'Drawing on…' : 'Draw geofence')}
                                </Button>
                                <Button variant="outline" onClick={() => { setDrawPoints([]); setIsDrawing(false); }}
                                disabled={!isDrawing && drawPoints.length === 0}>
                                    <RotateCcw size={16} /> Reset
                                </Button>
                                <Button onClick={handleSaveGeofence} disabled={drawPoints.length < 3 || (!editingGeofenceId && hasSavedGeofence && drawPoints.length === 0)}>
                                    <Save size={16} />
                                {editingGeofenceId || hasSavedGeofence ? 'Update' : 'Save'} {drawPoints.length >= 1 ? `(${drawPoints.length}pts)` : 'zone'}
                                </Button>
                            </div>
                        </CardHeader>

                    <CardContent className="p-0">
                        <div className="relative h-[640px] w-full">
                            {isLoadingGeofences && (
                                <div className="pointer-events-none absolute inset-0 z-[1001] flex items-center justify-center bg-white/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow text-sm text-gray-600">
                                        <Loader2 size={16} className="animate-spin" /> Loading geofences…
                                    </div>
                                </div>
                            )}

                            {isGoogleMapsLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={focusPoint ?? projectCenter}
                                    zoom={17}
                                    onLoad={(map) => {
                                        mapRef.current = map;
                                    }}
                                    onUnmount={() => {
                                        mapRef.current = null;
                                    }}
                                    onClick={(e) => {
                                        const lat = e.latLng?.lat();
                                        const lng = e.latLng?.lng();
                                        if (typeof lat !== 'number' || typeof lng !== 'number') return;
                                        if (!isDrawing) return;
                                        setDrawPoints((prev) => [...prev, { lat, lng }]);
                                    }}
                                    options={{
                                        mapTypeId: 'roadmap',
                                        fullscreenControl: true,
                                        streetViewControl: true,
                                        mapTypeControl: true,
                                        zoomControl: true,
                                        scaleControl: true,
                                        clickableIcons: true,
                                        gestureHandling: 'greedy',
                                    }}
                                >
                                    {geofences.map((geo, idx) => (
                                        <Polygon
                                            key={geo.id}
                                            paths={geo.coords.map((p) => ({ lat: p.lat, lng: p.lng }))}
                                            options={{
                                                strokeColor: idx % 2 === 0 ? '#4f46e5' : '#2563eb',
                                                strokeWeight: selectedGeofenceId === geo.id ? 4 : 3,
                                                fillOpacity: selectedGeofenceId === geo.id ? 0.22 : 0.14,
                                                fillColor: idx % 2 === 0 ? '#4f46e5' : '#2563eb',
                                            }}
                                            onClick={() => {
                                                setSelectedGeofenceId(geo.id);
                                                handleEditGeofence(geo);
                                            }}
                                        />
                                    ))}

                                    {drawPoints.length >= 2 && (
                                        <Polygon
                                            paths={drawPoints.map((p) => ({ lat: p.lat, lng: p.lng }))}
                                            options={{
                                                strokeColor: '#f97316',
                                                strokeWeight: 3,
                                                fillOpacity: 0.08,
                                                fillColor: '#f97316',
                                            }}
                                        />
                                    )}

                                    {drawPoints.map((p, i) => (
                                        <Marker
                                            key={`dp-${i}`}
                                            position={{ lat: p.lat, lng: p.lng }}
                                            label={`${i + 1}`}
                                        />
                                    ))}

                                    {workerEntries.map((w) => (
                                        <Marker
                                            key={w.workerId}
                                            position={{ lat: w.lat, lng: w.lng }}
                                            icon={workerMarkerIcon(w)}
                                            label={w.name?.slice(0, 1)?.toUpperCase() ?? 'W'}
                                        />
                                    ))}
                                </GoogleMap>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                    Google Maps loading...
                                </div>
                            )}

                            {/* Drawing hint */}
                            {isDrawing && (
                                <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-orange-500 px-4 py-2 text-xs font-medium text-white shadow-lg">
                                    Drawing mode · {drawPoints.length} point{drawPoints.length !== 1 ? 's' : ''} placed
                                </div>
                            )}

                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project snapshot */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Layers3 className="h-5 w-5 text-indigo-600" />
                                Project snapshot
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {[
                                { label: 'Project', value: project.name },
                                { label: 'Site', value: project.site || '—' },
                                { label: 'Manager', value: project.manager || '—' },
                                { label: 'Workers', value: String(project.workers) },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-gray-500">{label}</span>
                                    <span className="font-medium text-gray-900">{value}</span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Status</span>
                                <Badge variant={
                                    project.status === 'Active' ? 'success'
                                    : project.status === 'Completed' ? 'secondary'
                                    : project.status === 'Paused' ? 'warning'
                                    : 'default'
                                }>
                                    {project.status}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Geofences</span>
                                <span className="font-medium text-gray-900">
                                    {isLoadingGeofences ? '…' : geofences.length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPinned className="h-5 w-5 text-indigo-600" />
                                Geofence zones
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search zone name..."
                            />
                            {geofences.filter((geo) => (geo.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <EmptyState
                                    icon={MapPinned}
                                    title="No geofences yet"
                                    description="Draw a zone on the map and save it."
                                />
                            ) : (
                                geofences
                                    .filter((geo) => (geo.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((geo) => (
                                    <div key={geo.id} className="rounded-2xl border border-gray-100 p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{geo.name ?? 'Geofence'}</p>
                                                <p className="text-xs text-gray-500">{geo.coords.length} points</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditGeofence(geo)}
                                                className="h-8 rounded-lg"
                                            >
                                                Update
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Live workers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="h-5 w-5 text-emerald-600" />
                                Live workers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {workerEntries.length === 0 ? (
                                <EmptyState
                                    icon={Users2}
                                    title="No live workers"
                                    description="Workers will appear here once they send location updates."
                                />
                            ) : (
                                workerEntries.map((w) => (
                                    <div key={w.workerId} className="flex items-center justify-between rounded-2xl border border-gray-100 p-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>
                                                    {(w.name ?? w.workerId).slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-900">{w.name ?? w.workerId}</p>
                                                <p className="text-xs text-gray-500">
                                                    {typeof w.lat === 'number'
                                                        ? `${w.lat.toFixed(5)}, ${w.lng.toFixed(5)}`
                                                        : 'Location pending'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={workerStyle(w).badge}>
                                            {workerStyle(w).label}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock3 className="h-5 w-5 text-amber-600" />
                                Recent activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {latestLogs.length === 0 ? (
                                <EmptyState
                                    icon={Clock3}
                                    title="No activity yet"
                                    description="Worker check-ins and violations will appear here."
                                />
                            ) : (
                                latestLogs.map((entry, i) => (
                                    <div key={entry.id ?? `${entry.workerId}-${i}`}
                                        className="rounded-2xl border border-gray-100 p-3">
                                        <p className="font-medium text-gray-900">
                                            {entry.type === 'violation' ? '⚠️ Violation detected' : 'Location update'}
                                        </p>
                                        <p className="text-sm text-gray-500">{entry.workerId}</p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

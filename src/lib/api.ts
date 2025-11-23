const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export interface Network {
    id: string
    name: string
    subnet: string
    status: 'active' | 'inactive' | 'scanning'
    discovered_at: string
    last_scan: string | null
    device_count: number
    is_saved: boolean
    connected_at: string | null
}

export interface NetworkList {
    networks: Network[]
    total: number
}

export interface Service {
    port: number
    protocol: string
    service: string
    product?: string
    version?: string
    extrainfo?: string
    cpe?: string
}

export interface Device {
    id: string
    network_id: string
    ip_address: string
    mac_address: string | null
    hostname: string | null
    device_type:
        | 'medical_device'
        | 'iot_device'
        | 'network_device'
        | 'workstation'
        | 'server'
        | 'unknown'
    manufacturer: string | null
    vendor: string | null
    model: string | null
    os: string | null
    os_family: string | null
    os_version: string | null
    open_ports: number[]
    services: Service[]
    cpe: string[]
    discovered_at: string
    last_seen: string
    scan_count: number
    fingerprint_confidence: Record<string, number>
    fingerprint_metadata: Record<string, any>
    role?: string[]
    bridged_devices?: string[]
}

export interface NetworkFlow {
    source: string
    target: string
    protocol: string
    port?: number
    bandwidth?: number
}

export interface DeviceList {
    devices: Device[]
    total: number
}

export interface Vulnerability {
    cve_id: string | null
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    cvss_score: number | null
    remediation: string | null
}

export interface ScanResult {
    id: string
    device_id: string
    scan_type:
        | 'vulnerability_scan'
        | 'penetration_test'
        | 'compliance_audit'
        | 'owasp_top10'
        | 'mitre_attack'
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    started_at: string
    completed_at: string | null
    issues: Vulnerability[]
    vulnerabilities: Vulnerability[] // Alias for backward compatibility
    attack_surface: Record<string, any> | null
    report_url: string | null
    metadata: Record<string, any> | null
}

export interface ScanResultList {
    scans: ScanResult[]
    total: number
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
}

export const api = {
    networks: {
        list: (params?: { status?: string; skip?: number; limit?: number }) => {
            const queryParams = new URLSearchParams()
            if (params?.status) queryParams.append('status', params.status)
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

            const query = queryParams.toString()
            return fetchAPI<NetworkList>(`/networks${query ? `?${query}` : ''}`)
        },
        get: (id: string) => fetchAPI<Network>(`/networks/${id}`),
        scan: (id: string) => fetchAPI(`/networks/scan/${id}`, { method: 'POST' }),
        listAvailable: (params?: { skip?: number; limit?: number }) => {
            const queryParams = new URLSearchParams()
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

            const query = queryParams.toString()
            return fetchAPI<NetworkList>(`/networks/available${query ? `?${query}` : ''}`)
        },
        connect: (id: string) => fetchAPI(`/networks/connect/${id}`, { method: 'POST' }),
    },

    devices: {
        list: (params?: {
            network_id?: string
            device_type?: string
            skip?: number
            limit?: number
        }) => {
            const queryParams = new URLSearchParams()
            if (params?.network_id) queryParams.append('network_id', params.network_id)
            if (params?.device_type) queryParams.append('device_type', params.device_type)
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

            const query = queryParams.toString()
            return fetchAPI<DeviceList>(`/devices${query ? `?${query}` : ''}`)
        },
        get: (id: string) => fetchAPI<Device>(`/devices/${id}`),
        create: (data: {
            network_id: string
            ip_address: string
            hostname?: string
            mac_address?: string
            device_type?: string
            manufacturer?: string
            model?: string
            tags?: string[]
            bridged_devices?: string[]
        }) =>
            fetchAPI<Device>('/devices', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        listByNetwork: (networkId: string, params?: { skip?: number; limit?: number }) => {
            const queryParams = new URLSearchParams()
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

            const query = queryParams.toString()
            return fetchAPI<DeviceList>(`/devices/network/${networkId}${query ? `?${query}` : ''}`)
        },
        scan: (id: string, scanStandard?: string) => {
            const params = new URLSearchParams()
            if (scanStandard) {
                params.append('scan_standard', scanStandard)
            }
            return fetchAPI(`/devices/${id}/scan${params.toString() ? `?${params.toString()}` : ''}`, {
                method: 'POST',
            })
        },
        enrich: (id: string, force_rescan = false) =>
            fetchAPI(`/devices/${id}/enrich?force_rescan=${force_rescan}`, { method: 'POST' }),
        enrichNetwork: (
            networkId: string,
            params?: { force_rescan?: boolean; concurrency?: number },
        ) => {
            const queryParams = new URLSearchParams()
            if (params?.force_rescan !== undefined)
                queryParams.append('force_rescan', params.force_rescan.toString())
            if (params?.concurrency !== undefined)
                queryParams.append('concurrency', params.concurrency.toString())

            const query = queryParams.toString()
            return fetchAPI(`/devices/network/${networkId}/enrich${query ? `?${query}` : ''}`, {
                method: 'POST',
            })
        },
        update: (
            id: string,
            data: {
                hostname?: string
                manufacturer?: string
                model?: string
                device_type?: string
                mac_address?: string
                os?: string
            },
        ) =>
            fetchAPI(`/devices/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            fetchAPI(`/devices/${id}`, {
                method: 'DELETE',
            }),
        bulkDelete: (ids: string[]) =>
            fetchAPI('/devices/bulk-delete', {
                method: 'POST',
                body: JSON.stringify({ device_ids: ids }),
            }),
    },

    scans: {
        list: (params?: {
            device_id?: string
            scan_type?: string
            status?: string
            skip?: number
            limit?: number
        }) => {
            const queryParams = new URLSearchParams()
            if (params?.device_id) queryParams.append('device_id', params.device_id)
            if (params?.scan_type) queryParams.append('scan_type', params.scan_type)
            if (params?.status) queryParams.append('status', params.status)
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

            const query = queryParams.toString()
            return fetchAPI<ScanResultList>(`/scans${query ? `?${query}` : ''}`)
        },
        get: (id: string) => fetchAPI<ScanResult>(`/scans/${id}`),
        listByDevice: async (deviceId: string, params?: { skip?: number; limit?: number }) => {
            const queryParams = new URLSearchParams()
            if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString())
            if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString())

            const query = queryParams.toString()
            const scans = await fetchAPI<any[]>(`/scans/device/${deviceId}${query ? `?${query}` : ''}`)

            // Transform response to match expected format
            return {
                scans: scans.map(scan => ({
                    id: scan.id || scan.pk,
                    device_id: scan.target?.id || deviceId,
                    scan_type: scan.mode || scan.scan_type,
                    status: scan.status,
                    started_at: scan.started_at,
                    completed_at: scan.completed_at,
                    vulnerabilities: scan.issues || scan.vulnerabilities || [],
                    issues: scan.issues || [],
                    attack_surface: scan.attack_surface || null,
                    report_url: scan.report_url || null,
                    metadata: scan.metadata || null,
                })),
                total: scans.length,
            }
        },
        create: (data: { device_id: string; scan_type: string; options?: Record<string, any> }) =>
            fetchAPI<ScanResult>('/scans', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        retry: (id: string) => fetchAPI(`/scans/${id}/retry`, { method: 'POST' }),
        delete: (id: string) => fetchAPI(`/scans/${id}`, { method: 'DELETE' }),
        clearDeviceIssues: (deviceId: string) =>
            fetchAPI(`/devices/${deviceId}/clear/issues`, { method: 'POST' }),
        streamUrl: (id: string) => `${API_BASE_URL}/scans/${id}/stream`,
    },
}

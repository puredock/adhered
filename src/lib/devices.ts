import {
    HardDrive,
    type LucideIcon,
    Monitor,
    Router,
    Server,
    Shield,
    Thermometer,
    Wifi,
} from 'lucide-react'
import type { Device } from './api'

/**
 * Get the appropriate icon for a device based on its type and infrastructure role
 */
export function getDeviceIcon(device: Device): LucideIcon {
    // Check for infrastructure roles
    const isGateway = device.fingerprint_metadata?.is_gateway
    const isRouter = device.fingerprint_metadata?.is_router
    const isAccessPoint = device.fingerprint_metadata?.is_access_point
    const infrastructureRole = device.fingerprint_metadata?.infrastructure_role

    // Return infrastructure icons if applicable
    if (isGateway || infrastructureRole === 'gateway') return Shield
    if (isRouter || infrastructureRole === 'router') return Router
    if (isAccessPoint || infrastructureRole === 'access_point') return Wifi

    // Default device type icons
    const icons: Record<string, LucideIcon> = {
        medical_device: Monitor,
        iot_device: Thermometer,
        network_device: Wifi,
        workstation: HardDrive,
        server: Server,
        unknown: Monitor,
    }

    return icons[device.device_type] || Monitor
}

/**
 * Get infrastructure role information for a device
 */
export function getInfrastructureRole(device: Device): {
    isInfrastructure: boolean
    role?: 'gateway' | 'router' | 'access_point'
    label?: string
    badgeClass?: string
} {
    const isGateway = device.fingerprint_metadata?.is_gateway
    const isRouter = device.fingerprint_metadata?.is_router
    const isAccessPoint = device.fingerprint_metadata?.is_access_point
    const infrastructureRole = device.fingerprint_metadata?.infrastructure_role

    if (isGateway || infrastructureRole === 'gateway') {
        return {
            isInfrastructure: true,
            role: 'gateway',
            label: 'Gateway',
            badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-500',
        }
    }

    if (isRouter || infrastructureRole === 'router') {
        return {
            isInfrastructure: true,
            role: 'router',
            label: 'Router',
            badgeClass: 'bg-teal-500/10 text-teal-700 border-teal-500',
        }
    }

    if (isAccessPoint || infrastructureRole === 'access_point') {
        return {
            isInfrastructure: true,
            role: 'access_point',
            label: 'Access Point',
            badgeClass: 'bg-cyan-500/10 text-cyan-700 border-cyan-500',
        }
    }

    return { isInfrastructure: false }
}

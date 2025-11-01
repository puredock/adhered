import { Handle, Position } from '@xyflow/react'
import { HardDrive, Monitor, Server, Thermometer, Wifi } from 'lucide-react'
import type { Device } from '@/lib/api'
import { Badge } from './ui/badge'

interface DeviceNodeData {
    device: Device
    networkId: string
}

export default function DeviceNode({ data }: { data: DeviceNodeData }) {
    const { device } = data

    const getDeviceIcon = (type: string) => {
        const iconProps = { className: 'w-5 h-5' }
        switch (type) {
            case 'medical_device':
                return <Monitor {...iconProps} />
            case 'iot_device':
                return <Thermometer {...iconProps} />
            case 'network_device':
                return <Wifi {...iconProps} />
            case 'workstation':
                return <HardDrive {...iconProps} />
            case 'server':
                return <Server {...iconProps} />
            default:
                return <Monitor {...iconProps} />
        }
    }

    const getStatusColor = (lastSeen: string) => {
        const now = new Date()
        const lastSeenDate = new Date(lastSeen)
        const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

        if (diffInMinutes < 5) return 'bg-success/10 text-success border-success/50'
        if (diffInMinutes < 60) return 'bg-warning/10 text-warning border-warning/50'
        return 'bg-muted/50 text-muted-foreground border-muted'
    }

    const getNodeColor = (type: string) => {
        const colors = {
            medical_device: 'from-purple-500/20 to-purple-600/20 border-purple-500',
            iot_device: 'from-orange-500/20 to-orange-600/20 border-orange-500',
            network_device: 'from-blue-500/20 to-blue-600/20 border-blue-500',
            workstation: 'from-green-500/20 to-green-600/20 border-green-500',
            server: 'from-red-500/20 to-red-600/20 border-red-500',
            unknown: 'from-gray-500/20 to-gray-600/20 border-gray-500',
        }
        return colors[type as keyof typeof colors] || colors.unknown
    }

    return (
        <div
            className={`bg-gradient-to-br ${getNodeColor(device.device_type)} border-2 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[180px]`}
        >
            <Handle type="target" position={Position.Top} className="!bg-primary" />

            <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center">
                            {getDeviceIcon(device.device_type)}
                        </div>
                        <Badge variant="outline" className={getStatusColor(device.last_seen)}>
                            {new Date(device.last_seen).getTime() > Date.now() - 5 * 60 * 1000
                                ? 'Online'
                                : 'Offline'}
                        </Badge>
                    </div>
                </div>

                <div>
                    <div className="font-semibold text-sm text-foreground truncate">
                        {device.hostname || device.ip_address}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{device.ip_address}</div>
                </div>

                {device.manufacturer && (
                    <div className="text-xs text-muted-foreground truncate">{device.manufacturer}</div>
                )}

                {device.open_ports.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {device.open_ports.slice(0, 3).map(port => (
                            <Badge key={port} variant="secondary" className="text-xs px-1.5 py-0">
                                :{port}
                            </Badge>
                        ))}
                        {device.open_ports.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                +{device.open_ports.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-primary" />
        </div>
    )
}

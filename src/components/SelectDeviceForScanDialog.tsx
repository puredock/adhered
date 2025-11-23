import { useQuery } from '@tanstack/react-query'
import {
    AlertTriangle,
    ArrowRight,
    Check,
    CheckCircle2,
    Clock,
    MonitorSmartphone,
    Network,
    ScanLine,
    Search,
    Shield,
    XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { api, type Device } from '@/lib/api'
import { cn } from '@/lib/utils'

// Available alternative scans
const ALTERNATIVE_SCANS = [
    {
        id: 'bureau-veritas-iot',
        name: 'Bureau Veritas IoT',
        description: 'IoT device cybersecurity certification',
        tags: ['IoT', 'Certification'],
    },
    {
        id: 'default',
        name: 'Default Penetration Test',
        description: 'Comprehensive security testing',
        tags: ['Pentest', 'General'],
    },
]

interface SelectDeviceForScanDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    scanType: string
    scanName: string
    scanIcon?: React.ComponentType<{ className?: string }>
    scanAvailable?: boolean // Whether the scan is implemented
}

export function SelectDeviceForScanDialog({
    open,
    onOpenChange,
    scanType,
    scanName,
    scanIcon: ScanIcon = Shield,
    scanAvailable = true, // Default to true for backward compatibility
}: SelectDeviceForScanDialogProps) {
    const navigate = useNavigate()
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
    const [isInitiating, setIsInitiating] = useState(false)
    const [showAnimation, setShowAnimation] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Use the scanAvailable prop passed from parent
    const isScanSupported = scanAvailable

    const { data: devicesData, isLoading } = useQuery({
        queryKey: ['devices'],
        queryFn: () => api.devices.list({ limit: 1000 }),
        enabled: open,
    })

    const { data: networksData } = useQuery({
        queryKey: ['networks'],
        queryFn: () => api.networks.list({ limit: 100 }),
        enabled: open,
    })

    const devices = devicesData?.devices || []
    const networks = networksData?.networks || []

    // Group devices by network
    const devicesByNetwork = devices.reduce(
        (acc, device) => {
            if (!acc[device.network_id]) {
                acc[device.network_id] = []
            }
            acc[device.network_id].push(device)
            return acc
        },
        {} as Record<string, Device[]>,
    )

    // Filter devices based on search query
    const filteredDevices = devices.filter(
        device =>
            device.hostname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.ip_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.device_type.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Trigger animation when dialog opens
    useEffect(() => {
        if (open) {
            setShowAnimation(false)
            setSelectedDevice(null)
            setSearchQuery('')
            const timer = setTimeout(() => setShowAnimation(true), 50)
            return () => clearTimeout(timer)
        } else {
            setShowAnimation(false)
        }
    }, [open])

    const handleStartScan = async () => {
        if (!selectedDevice) {
            toast.error('Please select a device')
            return
        }

        setIsInitiating(true)

        try {
            // Pass the scan type to the API
            await api.devices.scan(selectedDevice.id, scanType)

            toast.success('Scan initiated', {
                description: `${scanName} started on ${selectedDevice.hostname || selectedDevice.ip_address}`,
            })

            // Navigate to device detail page to view the active scan
            navigate(`/networks/${selectedDevice.network_id}/devices/${selectedDevice.id}`)
            onOpenChange(false)
        } catch (error) {
            // Check if it's an unsupported scan error
            if (error instanceof Error) {
                try {
                    const errorData = JSON.parse(error.message.replace('API error: ', ''))
                    if (errorData.error === 'unsupported_scan') {
                        toast.error('Scan not yet supported', {
                            description: `${scanName} is not yet implemented. Please try another scan type or use the default penetration test.`,
                            duration: 6000,
                        })
                        return
                    }
                } catch {
                    // Not a JSON error, fall through to generic error
                }
            }

            toast.error('Failed to start scan', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            })
        } finally {
            setIsInitiating(false)
        }
    }

    const getDeviceTypeIcon = (type: string) => {
        if (type === 'iot_device') return '🌐'
        if (type === 'medical_device') return '⚕️'
        if (type === 'network_device') return '🔌'
        if (type === 'workstation') return '💻'
        if (type === 'server') return '🖥️'
        return '📱'
    }

    const getDeviceOnlineStatus = (lastSeen: string) => {
        const diff = Date.now() - new Date(lastSeen).getTime()
        const minutes = diff / 1000 / 60
        return minutes < 5
    }

    const handleSelectAlternative = (scanId: string) => {
        onOpenChange(false)
        if (scanId === 'default') {
            navigate('/devices')
        } else {
            navigate(`/scans/${scanId}`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
                {!isScanSupported ? (
                    /* Unsupported Scan View */
                    <>
                        {/* Animated Header - Warning Style */}
                        <div className="relative mb-6 -mt-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 rounded-lg" />

                            <div className="relative flex items-center justify-center gap-8 py-8">
                                <div
                                    className={`relative transition-all duration-700 ${
                                        showAnimation
                                            ? 'opacity-100 translate-x-0'
                                            : 'opacity-0 -translate-x-8'
                                    }`}
                                >
                                    <div className="relative">
                                        <ScanIcon className="w-12 h-12 text-amber-600" />
                                        <div className="absolute inset-0 animate-pulse opacity-30">
                                            <ScanIcon className="w-12 h-12 text-amber-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative w-24 h-1">
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-300/40 via-orange-400/40 to-amber-300/40 rounded-full" />
                                    <div
                                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 delay-300 ${
                                            showAnimation
                                                ? 'opacity-100 scale-100 rotate-0'
                                                : 'opacity-0 scale-50 rotate-180'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 border-2 border-amber-500 flex items-center justify-center">
                                            <XCircle className="w-5 h-5 text-amber-600" />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`relative transition-all duration-700 ${
                                        showAnimation
                                            ? 'opacity-100 translate-x-0 scale-100'
                                            : 'opacity-0 translate-x-8 scale-75'
                                    }`}
                                >
                                    <div className="relative">
                                        <AlertTriangle className="w-12 h-12 text-orange-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative text-center -mt-2">
                                <DialogTitle
                                    className={`text-2xl font-bold text-amber-900 dark:text-amber-100 transition-all duration-500 delay-300 ${
                                        showAnimation
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-4'
                                    }`}
                                >
                                    Scan Not Yet Available
                                </DialogTitle>
                                <DialogDescription
                                    className={`mt-2 text-amber-800 dark:text-amber-200 transition-all duration-500 delay-500 ${
                                        showAnimation
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-4'
                                    }`}
                                >
                                    <strong>{scanName}</strong> is currently under development and not
                                    yet ready for use
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Status Section */}
                        <div
                            className={`bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 transition-all duration-500 ${
                                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ transitionDelay: showAnimation ? '700ms' : '0ms' }}
                        >
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                        Coming Soon
                                    </h3>
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        This scan standard is planned for future implementation. Our team
                                        is working on adding support for additional security testing
                                        frameworks.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Alternative Options */}
                        <div
                            className={`transition-all duration-500 ${
                                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ transitionDelay: showAnimation ? '850ms' : '0ms' }}
                        >
                            <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                                Available Alternatives
                            </h3>
                            <div className="space-y-2">
                                {ALTERNATIVE_SCANS.map(alt => (
                                    <button
                                        key={alt.id}
                                        onClick={() => handleSelectAlternative(alt.id)}
                                        className="w-full p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm">
                                                        {alt.name}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                                                    >
                                                        Available
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {alt.description}
                                                </p>
                                                <div className="flex gap-1 mt-1.5">
                                                    {alt.tags.map(tag => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div
                            className={`flex gap-3 pt-4 transition-all duration-500 ${
                                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ transitionDelay: showAnimation ? '1000ms' : '0ms' }}
                        >
                            <Button
                                variant="outline"
                                onClick={() => navigate('/scans')}
                                className="flex-1"
                            >
                                Browse All Scans
                            </Button>
                            <Button onClick={() => onOpenChange(false)} className="flex-1">
                                Got It
                            </Button>
                        </div>
                    </>
                ) : (
                    /* Supported Scan - Device Selector View */
                    <>
                        {/* Animated Header */}
                        <div className="relative mb-4 -mt-2">
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-lg" />

                            {/* Animated visual */}
                            <div className="relative flex items-center justify-center gap-8 py-8">
                                {/* Scan Icon (left) */}
                                <div
                                    className={`relative transition-all duration-700 ${
                                        showAnimation
                                            ? 'opacity-100 translate-x-0'
                                            : 'opacity-0 -translate-x-8'
                                    }`}
                                >
                                    <div className="relative">
                                        <ScanIcon className="w-12 h-12 text-primary" />
                                        {/* Pulsing rings */}
                                        <div className="absolute inset-0 animate-ping opacity-20">
                                            <ScanIcon className="w-12 h-12 text-primary" />
                                        </div>
                                    </div>
                                </div>

                                {/* Connection line with animated scanning wave */}
                                <div className="relative w-24 h-1">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full" />
                                    {/* Scanning wave effect */}
                                    <div
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full transition-all duration-1000 ${
                                            showAnimation
                                                ? 'translate-x-[64px] opacity-0'
                                                : 'translate-x-0 opacity-100'
                                        }`}
                                        style={{
                                            animation: showAnimation
                                                ? 'scan-wave 2s ease-in-out infinite'
                                                : 'none',
                                        }}
                                    />
                                </div>

                                {/* Device Icon (right) */}
                                <div
                                    className={`relative transition-all duration-700 ${
                                        showAnimation
                                            ? 'opacity-100 translate-x-0 scale-100'
                                            : 'opacity-0 translate-x-8 scale-75'
                                    }`}
                                >
                                    <div className="relative">
                                        <MonitorSmartphone className="w-12 h-12 text-accent-foreground" />
                                        {/* Target circle */}
                                        <div
                                            className={`absolute inset-0 border-2 border-primary rounded-lg transition-all duration-500 delay-1000 ${
                                                showAnimation
                                                    ? 'opacity-100 scale-110'
                                                    : 'opacity-0 scale-100'
                                            }`}
                                        />
                                        <div
                                            className={`absolute inset-0 border-2 border-primary/50 rounded-lg transition-all duration-700 delay-1200 ${
                                                showAnimation
                                                    ? 'opacity-0 scale-150'
                                                    : 'opacity-100 scale-110'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Title and description */}
                            <div className="relative text-center -mt-2">
                                <DialogTitle
                                    className={`text-2xl font-bold transition-all duration-500 delay-300 ${
                                        showAnimation
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-4'
                                    }`}
                                >
                                    Select Target Device
                                </DialogTitle>
                                <DialogDescription
                                    className={`mt-2 transition-all duration-500 delay-500 ${
                                        showAnimation
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-4'
                                    }`}
                                >
                                    Choose a device to run <strong>{scanName}</strong> security
                                    assessment
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Device Search and List */}
                        <div
                            className={`flex-1 flex flex-col min-h-0 transition-all duration-500 ${
                                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ transitionDelay: showAnimation ? '700ms' : '0ms' }}
                        >
                            <Command className="border rounded-lg flex-1 flex flex-col min-h-0">
                                <div className="p-3 border-b">
                                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                                        <Search className="w-4 h-4 text-muted-foreground" />
                                        <CommandInput
                                            placeholder="Search by hostname, IP, manufacturer, or type..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                            className="border-0 p-0 focus:ring-0 focus-visible:ring-0"
                                        />
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 min-h-0">
                                    <CommandList>
                                        <CommandEmpty>
                                            {isLoading ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <ScanLine className="w-6 h-6 animate-spin text-primary" />
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <MonitorSmartphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                                    <p className="text-sm text-muted-foreground">
                                                        No devices found
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Discover devices by scanning your networks
                                                    </p>
                                                </div>
                                            )}
                                        </CommandEmpty>

                                        {/* Group devices by network */}
                                        {Object.entries(devicesByNetwork).map(
                                            ([networkId, networkDevices]) => {
                                                const network = networks.find(n => n.id === networkId)
                                                const visibleDevices = networkDevices.filter(device =>
                                                    filteredDevices.includes(device),
                                                )

                                                if (visibleDevices.length === 0) return null

                                                return (
                                                    <CommandGroup
                                                        key={networkId}
                                                        heading={
                                                            <div className="flex items-center gap-2">
                                                                <Network className="w-4 h-4" />
                                                                <span>
                                                                    {network?.name || 'Unknown Network'}{' '}
                                                                    ({network?.subnet || networkId})
                                                                </span>
                                                            </div>
                                                        }
                                                    >
                                                        {visibleDevices.map(device => {
                                                            const isOnline = getDeviceOnlineStatus(
                                                                device.last_seen,
                                                            )
                                                            const isSelected =
                                                                selectedDevice?.id === device.id

                                                            return (
                                                                <CommandItem
                                                                    key={device.id}
                                                                    value={`${device.hostname}-${device.ip_address}-${device.manufacturer}-${device.device_type}`}
                                                                    onSelect={() =>
                                                                        setSelectedDevice(device)
                                                                    }
                                                                    className={cn(
                                                                        'cursor-pointer p-3 mb-1',
                                                                        isSelected && 'bg-accent',
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-3 w-full">
                                                                        <div className="relative">
                                                                            <div className="text-2xl">
                                                                                {getDeviceTypeIcon(
                                                                                    device.device_type,
                                                                                )}
                                                                            </div>
                                                                            {/* Online indicator */}
                                                                            <div
                                                                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                                                                                    isOnline
                                                                                        ? 'bg-green-500'
                                                                                        : 'bg-gray-400'
                                                                                }`}
                                                                            />
                                                                        </div>

                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="font-medium truncate">
                                                                                    {device.hostname ||
                                                                                        'Unnamed Device'}
                                                                                </span>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs capitalize shrink-0"
                                                                                >
                                                                                    {device.device_type.replace(
                                                                                        /_/g,
                                                                                        ' ',
                                                                                    )}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                                <span className="font-mono">
                                                                                    {device.ip_address}
                                                                                </span>
                                                                                {device.manufacturer && (
                                                                                    <>
                                                                                        <span>•</span>
                                                                                        <span className="truncate">
                                                                                            {
                                                                                                device.manufacturer
                                                                                            }
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                                {device.os && (
                                                                                    <>
                                                                                        <span>•</span>
                                                                                        <span className="truncate">
                                                                                            {device.os}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {isSelected && (
                                                                            <Check className="w-5 h-5 text-primary shrink-0" />
                                                                        )}
                                                                    </div>
                                                                </CommandItem>
                                                            )
                                                        })}
                                                    </CommandGroup>
                                                )
                                            },
                                        )}
                                    </CommandList>
                                </ScrollArea>
                            </Command>
                        </div>

                        {/* Action Buttons */}
                        <div
                            className={`flex gap-3 pt-4 transition-all duration-500 ${
                                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ transitionDelay: showAnimation ? '850ms' : '0ms' }}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleStartScan}
                                disabled={!selectedDevice || isInitiating}
                                className="flex-1 bg-primary hover:bg-primary/90"
                            >
                                {isInitiating ? (
                                    <>
                                        <ScanLine className="w-4 h-4 mr-2 animate-spin" />
                                        Initiating...
                                    </>
                                ) : (
                                    <>
                                        <ScanLine className="w-4 h-4 mr-2" />
                                        Start {scanName}
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Animations */}
                        <style>{`
                    @keyframes scan-wave {
                        0%, 100% {
                            transform: translateX(0) translateY(-50%);
                            opacity: 1;
                        }
                        50% {
                            transform: translateX(64px) translateY(-50%);
                            opacity: 0.3;
                        }
                    }
                `}</style>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

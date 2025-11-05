import { useQueryClient } from '@tanstack/react-query'
import { MonitorSmartphone, Plus, Wifi, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'

interface AddDeviceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    preselectedNetworkId?: string
    networks: Array<{ id: string; name: string; subnet: string }>
}

export function AddDeviceDialog({
    open,
    onOpenChange,
    preselectedNetworkId,
    networks,
}: AddDeviceDialogProps) {
    const queryClient = useQueryClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [networkId, setNetworkId] = useState(preselectedNetworkId || '')
    const [ipAddress, setIpAddress] = useState('')
    const [hostname, setHostname] = useState('')
    const [macAddress, setMacAddress] = useState('')
    const [deviceType, setDeviceType] = useState('unknown')
    const [manufacturer, setManufacturer] = useState('')
    const [model, setModel] = useState('')
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [bridgedDeviceInput, setBridgedDeviceInput] = useState('')
    const [bridgedDevices, setBridgedDevices] = useState<string[]>([])
    const [showAnimation, setShowAnimation] = useState(false)

    const networkIdField = useId()
    const ipAddressField = useId()
    const hostnameField = useId()
    const macAddressField = useId()
    const deviceTypeField = useId()
    const manufacturerField = useId()
    const modelField = useId()
    const tagsField = useId()
    const bridgedDevicesField = useId()

    // Trigger animation when dialog opens
    useEffect(() => {
        if (open) {
            setShowAnimation(false)
            const timer = setTimeout(() => setShowAnimation(true), 50)
            return () => clearTimeout(timer)
        } else {
            // Reset animation state when dialog closes
            setShowAnimation(false)
        }
    }, [open])

    // Reset form when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            // Reset to preselected network if provided
            setNetworkId(preselectedNetworkId || '')
        } else {
            // Reset form when closing
            setNetworkId('')
            setIpAddress('')
            setHostname('')
            setMacAddress('')
            setDeviceType('unknown')
            setManufacturer('')
            setModel('')
            setTags([])
            setBridgedDevices([])
            setTagInput('')
            setBridgedDeviceInput('')
        }
        onOpenChange(newOpen)
    }

    const handleAddTag = () => {
        const tag = tagInput.trim()
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    const handleAddBridgedDevice = () => {
        const device = bridgedDeviceInput.trim()
        if (device && !bridgedDevices.includes(device)) {
            setBridgedDevices([...bridgedDevices, device])
            setBridgedDeviceInput('')
        }
    }

    const handleRemoveBridgedDevice = (deviceToRemove: string) => {
        setBridgedDevices(bridgedDevices.filter(d => d !== deviceToRemove))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!networkId || !ipAddress) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)

        try {
            await api.devices.create({
                network_id: networkId,
                ip_address: ipAddress,
                hostname: hostname || undefined,
                mac_address: macAddress || undefined,
                device_type: deviceType,
                manufacturer: manufacturer || undefined,
                model: model || undefined,
                tags: tags.length > 0 ? tags : undefined,
                bridged_devices: bridgedDevices.length > 0 ? bridgedDevices : undefined,
            })

            toast.success('Device created successfully', {
                description: `${hostname || ipAddress} has been added to your network`,
            })

            // Invalidate queries to refresh device lists
            await queryClient.invalidateQueries({ queryKey: ['devices'] })
            if (networkId) {
                await queryClient.invalidateQueries({
                    queryKey: ['devices', networkId],
                })
            }

            // Close dialog and reset form
            handleOpenChange(false)
        } catch (error) {
            console.error('Failed to create device:', error)
            toast.error('Failed to create device', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                {/* Animated Header with Device Connection Visual */}
                <div className="relative mb-6 -mt-2">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-lg" />

                    {/* Animated connecting devices */}
                    <div className="relative flex items-center justify-center gap-8 py-8">
                        {/* Network Icon (left) */}
                        <div
                            className={`relative transition-all duration-700 ${
                                showAnimation ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                            }`}
                        >
                            <div className="relative">
                                <Wifi className="w-12 h-12 text-primary" />
                                {/* Pulsing rings */}
                                <div className="absolute inset-0 animate-ping opacity-20">
                                    <Wifi className="w-12 h-12 text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Connection line with animated dots */}
                        <div className="relative w-24 h-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full" />
                            {/* Animated dots traveling along the line */}
                            <div
                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full transition-all duration-1000 ${
                                    showAnimation ? 'translate-x-[88px]' : 'translate-x-0'
                                }`}
                            />
                            <div
                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary/60 rounded-full transition-all duration-1000 delay-200 ${
                                    showAnimation ? 'translate-x-[88px]' : 'translate-x-0'
                                }`}
                            />
                            <div
                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary/30 rounded-full transition-all duration-1000 delay-500 ${
                                    showAnimation ? 'translate-x-[88px]' : 'translate-x-0'
                                }`}
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
                                {/* Success checkmark circle that appears */}
                                <div
                                    className={`absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center transition-all duration-500 delay-1000 ${
                                        showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                                    }`}
                                >
                                    <Plus className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Title and description */}
                    <div className="relative text-center -mt-2">
                        <DialogTitle
                            className={`text-2xl font-bold transition-all duration-500 delay-300 ${
                                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                        >
                            Add New Device
                        </DialogTitle>
                        <DialogDescription
                            className={`mt-2 transition-all duration-500 delay-500 ${
                                showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                        >
                            Manually add a device to your network. Fill in the details below.
                        </DialogDescription>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Network Selection */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-700 ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={networkIdField}>
                            Network <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={networkId}
                            onValueChange={setNetworkId}
                            disabled={!!preselectedNetworkId}
                        >
                            <SelectTrigger id={networkIdField}>
                                <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                            <SelectContent>
                                {networks.map(network => (
                                    <SelectItem key={network.id} value={network.id}>
                                        {network.name} ({network.subnet})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* IP Address */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-[800ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={ipAddressField}>
                            IP Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id={ipAddressField}
                            placeholder="192.168.1.100"
                            value={ipAddress}
                            onChange={e => setIpAddress(e.target.value)}
                            required
                        />
                    </div>

                    {/* Hostname */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-[900ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={hostnameField}>Device Name / Hostname</Label>
                        <Input
                            id={hostnameField}
                            placeholder="my-device"
                            value={hostname}
                            onChange={e => setHostname(e.target.value)}
                        />
                    </div>

                    {/* MAC Address */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-[1000ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={macAddressField}>MAC Address</Label>
                        <Input
                            id={macAddressField}
                            placeholder="00:1A:2B:3C:4D:5E"
                            value={macAddress}
                            onChange={e => setMacAddress(e.target.value)}
                        />
                    </div>

                    {/* Device Type */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-[1100ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={deviceTypeField}>Device Type</Label>
                        <Select value={deviceType} onValueChange={setDeviceType}>
                            <SelectTrigger id={deviceTypeField}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unknown">Unknown</SelectItem>
                                <SelectItem value="medical_device">Medical Device</SelectItem>
                                <SelectItem value="iot_device">IoT Device</SelectItem>
                                <SelectItem value="network_device">Network Device</SelectItem>
                                <SelectItem value="workstation">Workstation</SelectItem>
                                <SelectItem value="server">Server</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Manufacturer */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-[1200ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={manufacturerField}>Manufacturer</Label>
                        <Input
                            id={manufacturerField}
                            placeholder="e.g., Cisco, Dell, HP"
                            value={manufacturer}
                            onChange={e => setManufacturer(e.target.value)}
                        />
                    </div>

                    {/* Model */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-[1300ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={modelField}>Model</Label>
                        <Input
                            id={modelField}
                            placeholder="e.g., Model X1000"
                            value={model}
                            onChange={e => setModel(e.target.value)}
                        />
                    </div>

                    {/* Tags */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-[1400ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={tagsField}>Tags / Labels</Label>
                        <div className="flex gap-2">
                            <Input
                                id={tagsField}
                                placeholder="Add a tag"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddTag()
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="gap-1 animate-in fade-in slide-in-from-left-2 duration-300"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bridged Devices */}
                    <div
                        className={`space-y-2 transition-all duration-500 delay-[1500ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Label htmlFor={bridgedDevicesField}>
                            Bridged Device(s) IP
                            <span className="text-xs text-muted-foreground ml-2">
                                (for devices requiring access via another device)
                            </span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id={bridgedDevicesField}
                                placeholder="192.168.1.1"
                                value={bridgedDeviceInput}
                                onChange={e => setBridgedDeviceInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddBridgedDevice()
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleAddBridgedDevice}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {bridgedDevices.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {bridgedDevices.map(device => (
                                    <Badge
                                        key={device}
                                        variant="outline"
                                        className="gap-1 animate-in fade-in slide-in-from-left-2 duration-300"
                                    >
                                        {device}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBridgedDevice(device)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div
                        className={`flex gap-3 pt-4 transition-all duration-500 delay-[1600ms] ${
                            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !networkId || !ipAddress}
                            className="flex-1 bg-accent-foreground text-accent hover:bg-accent-foreground/90"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Device'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

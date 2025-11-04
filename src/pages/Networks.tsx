import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Activity,
    AlertTriangle,
    LayoutGrid,
    List,
    Loader2,
    Network,
    Plus,
    Search,
    Wifi,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ErrorState } from '@/components/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, type Network as NetworkType } from '@/lib/api'
import { getNetworkStatusBadge } from '@/lib/status'
import { formatTimeAgo } from '@/lib/time'
import { getCycleColor } from '@/lib/ui'

const Networks = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [connectDialogOpen, setConnectDialogOpen] = useState(false)
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null)

    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery({
        queryKey: ['networks'],
        queryFn: () => api.networks.list(),
    })

    const {
        data: availableData,
        isLoading: availableLoading,
        error: availableError,
    } = useQuery({
        queryKey: ['networks', 'available'],
        queryFn: () => api.networks.listAvailable(),
    })

    const networks = useMemo(() => data?.networks || [], [data?.networks])
    const availableNetworks = useMemo(() => availableData?.networks || [], [availableData?.networks])

    const savedNetworks = useMemo(() => {
        return networks.filter(n => n.is_saved)
    }, [networks])

    const activeNetwork = useMemo(() => {
        return savedNetworks.find(n => n.status === 'active')
    }, [savedNetworks])

    const connectMutation = useMutation({
        mutationFn: async (networkId: string) => {
            return api.networks.connect(networkId)
        },
        onSuccess: (_data, networkId) => {
            const network = availableNetworks.find(n => n.id === networkId)
            queryClient.invalidateQueries({ queryKey: ['networks'] })
            queryClient.invalidateQueries({ queryKey: ['networks', 'available'] })
            setConnectDialogOpen(false)
            setSelectedNetwork(null)

            toast.success('Connected to Network', {
                description: network
                    ? `Successfully connected to ${network.name}`
                    : 'Network connection established',
            })
        },
        onError: (error: Error) => {
            const errorMessage = error?.message || 'An unexpected error occurred'
            toast.error('Connection Failed', {
                description: errorMessage,
            })
        },
    })

    const filteredSavedNetworks = useMemo(() => {
        if (!searchQuery.trim()) return savedNetworks

        const query = searchQuery.toLowerCase()
        return savedNetworks.filter(
            network =>
                network.name.toLowerCase().includes(query) ||
                network.subnet.toLowerCase().includes(query),
        )
    }, [savedNetworks, searchQuery])

    const filteredAvailableNetworks = useMemo(() => {
        if (!searchQuery.trim()) return availableNetworks

        const query = searchQuery.toLowerCase()
        return availableNetworks.filter(
            network =>
                network.name.toLowerCase().includes(query) ||
                network.subnet.toLowerCase().includes(query),
        )
    }, [availableNetworks, searchQuery])

    const handleConnectClick = (network: NetworkType) => {
        setSelectedNetwork(network)
        setConnectDialogOpen(true)
    }

    const handleConfirmConnect = () => {
        if (selectedNetwork) {
            connectMutation.mutate(selectedNetwork.id)
        }
    }

    return (
        <div className="min-h-screen bg-background flex-1">
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                <Activity className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Networks</h1>
                                <p className="text-sm text-muted-foreground">
                                    Manage and monitor your networks
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search networks..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="space-y-8">
                    {/* Saved Networks Section */}
                    <div>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">Your Networks</h2>
                            <p className="text-sm text-muted-foreground">
                                Networks you've connected to previously
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <ErrorState
                                variant="inline"
                                title="Failed to load saved networks"
                                message="Could not retrieve your saved networks. Please try again."
                                showRetry={true}
                                showBackButton={false}
                            />
                        ) : savedNetworks.length === 0 ? (
                            <Card className="shadow-card border-border">
                                <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Network className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No Saved Networks</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Connect to a network below to start monitoring
                                    </p>
                                </CardContent>
                            </Card>
                        ) : filteredSavedNetworks.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    No saved networks found matching "{searchQuery}"
                                </p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredSavedNetworks.map((network, index) => (
                                    <Link key={network.id} to={`/networks/${network.id}`}>
                                        <Card className="shadow-card border-border hover:border-primary hover:shadow-lg transition-all group h-full">
                                            <CardHeader>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div
                                                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCycleColor(index)} group-hover:scale-110 transition-transform`}
                                                    >
                                                        <Network className="w-6 h-6" />
                                                    </div>
                                                    {activeNetwork?.id === network.id ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-success/10 text-success border-success/20"
                                                        >
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        getNetworkStatusBadge(network.status)
                                                    )}
                                                </div>
                                                <CardTitle className="group-hover:text-primary transition-colors">
                                                    {network.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <Wifi className="w-4 h-4" />
                                                    {network.subnet}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            Subnet:
                                                        </span>
                                                        <span className="font-mono font-medium">
                                                            {network.subnet}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <Activity className="w-4 h-4" />
                                                            Devices:
                                                        </span>
                                                        <span className="font-semibold text-primary">
                                                            {network.device_count}
                                                        </span>
                                                    </div>
                                                    <div className="pt-3 border-t border-border">
                                                        <p className="text-xs text-muted-foreground">
                                                            Last scan: {formatTimeAgo(network.last_scan)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-card rounded-lg border border-border shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]"></TableHead>
                                            <TableHead>Network Name</TableHead>
                                            <TableHead>Subnet</TableHead>
                                            <TableHead className="text-center">Devices</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Scan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSavedNetworks.map((network, index) => (
                                            <TableRow
                                                key={network.id}
                                                className="hover:bg-muted/50 cursor-pointer"
                                            >
                                                <TableCell>
                                                    <Link to={`/networks/${network.id}`}>
                                                        <div
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCycleColor(index)}`}
                                                        >
                                                            <Network className="w-5 h-5" />
                                                        </div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        to={`/networks/${network.id}`}
                                                        className="font-semibold hover:text-primary transition-colors"
                                                    >
                                                        {network.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm">
                                                        {network.subnet}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-semibold text-primary">
                                                        {network.device_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {activeNetwork?.id === network.id ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-success/10 text-success border-success/20"
                                                        >
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        getNetworkStatusBadge(network.status)
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatTimeAgo(network.last_scan)}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    {/* Available Networks Section */}
                    <div>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">Available Networks</h2>
                            <p className="text-sm text-muted-foreground">
                                Connect to these networks to start monitoring
                            </p>
                        </div>

                        {availableLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : availableError ? (
                            <ErrorState
                                variant="inline"
                                title="Failed to load available networks"
                                message="Could not retrieve available networks. Please try again."
                                showRetry={true}
                                showBackButton={false}
                            />
                        ) : availableNetworks.length === 0 ? (
                            <Card className="shadow-card border-border">
                                <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Wifi className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No Available Networks</h3>
                                    <p className="text-sm text-muted-foreground">
                                        All discovered networks have been connected
                                    </p>
                                </CardContent>
                            </Card>
                        ) : filteredAvailableNetworks.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    No available networks found matching "{searchQuery}"
                                </p>
                            </div>
                        ) : (
                            <div className="bg-card rounded-lg border border-border shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]"></TableHead>
                                            <TableHead>Network Name</TableHead>
                                            <TableHead>Subnet</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAvailableNetworks.map(network => (
                                            <TableRow key={network.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted">
                                                        <Wifi className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold">{network.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm">
                                                        {network.subnet}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-muted/50 text-muted-foreground border-muted"
                                                    >
                                                        Not Connected
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleConnectClick(network)}
                                                        className="gap-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Connect
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Connect Warning Dialog */}
            <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                            Connect to Network
                        </DialogTitle>
                        <DialogDescription className="space-y-3 pt-2">
                            <p>
                                You are about to connect to{' '}
                                <span className="font-semibold text-foreground">
                                    {selectedNetwork?.name}
                                </span>{' '}
                                ({selectedNetwork?.subnet}).
                            </p>
                            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 space-y-2">
                                <p className="font-medium text-warning flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Important Security Notice
                                </p>
                                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                                    <li>Your device will connect to this network</li>
                                    <li>
                                        Only connect to networks you trust and have permission to access
                                    </li>
                                    <li>
                                        Be aware of potential security risks when connecting to unknown
                                        networks
                                    </li>
                                    <li>Ensure you comply with your organization's policies</li>
                                </ul>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConnectDialogOpen(false)}
                            disabled={connectMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmConnect} disabled={connectMutation.isPending}>
                            {connectMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                'Connect'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Networks

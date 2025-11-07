import {
    addEdge,
    Background,
    BackgroundVariant,
    type Connection,
    Controls,
    type Edge,
    MarkerType,
    MiniMap,
    type Node,
    type NodeTypes,
    Panel,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from '@xyflow/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '@xyflow/react/dist/style.css'
import type { Device, NetworkFlow } from '@/lib/api'
import DeviceNode from './DeviceNode'

interface NetworkDiagramProps {
    devices: Device[]
    networkId: string
    subnet: string
}

const nodeTypes: NodeTypes = {
    deviceNode: DeviceNode,
}

// Simple layout: gateway at top center, others in a centered grid below
function layoutNodes(devices: Device[], networkId: string): Node[] {
    const gateway =
        devices.find(d => d.role?.includes('gateway') || d.role?.includes('router')) ?? undefined

    const spacingX = 240
    const spacingY = 160
    const others = gateway ? devices.filter(d => d.id !== gateway.id) : devices

    const cols = Math.max(1, Math.ceil(Math.sqrt(others.length)))
    const startX = -((cols - 1) / 2) * spacingX

    const nodes: Node[] = []

    if (gateway) {
        nodes.push({
            id: gateway.id,
            type: 'deviceNode',
            data: { device: gateway, networkId },
            position: { x: 0, y: 0 },
        })
    }

    others.forEach((device, i) => {
        const row = Math.floor(i / cols)
        const col = i % cols
        const x = startX + col * spacingX
        const y = 200 + row * spacingY

        nodes.push({
            id: device.id,
            type: 'deviceNode',
            data: { device, networkId },
            position: { x, y },
        })
    })

    return nodes
}

// Simulate network flows based on device communication patterns
function generateNetworkFlows(devices: Device[]): NetworkFlow[] {
    const flows: NetworkFlow[] = []
    const gateway = devices.find(
        d =>
            d.fingerprint_metadata?.infrastructure_role === 'gateway' ||
            d.fingerprint_metadata?.is_gateway ||
            d.role?.includes('gateway') ||
            d.role?.includes('router'),
    )

    if (!gateway) return flows

    // Create a map of IP addresses to device IDs for bridged device lookup
    const ipToDeviceMap = new Map<string, Device>()
    devices.forEach(device => {
        ipToDeviceMap.set(device.ip_address, device)
    })

    // Helper function to find bridge device by IP
    const findBridgeDevice = (bridgedIPs: string[] | undefined): Device | undefined => {
        if (!bridgedIPs || bridgedIPs.length === 0) return undefined
        // Use the first bridged IP to find the bridge device
        return ipToDeviceMap.get(bridgedIPs[0])
    }

    // Track which bridge-to-gateway flows we've already created
    const bridgeToGatewayCreated = new Set<string>()

    // All devices communicate with gateway (directly or through bridge)
    devices.forEach(device => {
        if (device.id === gateway.id) return

        const bridgeDevice = findBridgeDevice(
            device.fingerprint_metadata?.bridged_devices || device.bridged_devices,
        )

        if (bridgeDevice && bridgeDevice.id !== gateway.id) {
            // Device is bridged: create flow device -> bridge
            flows.push({
                source: device.id,
                target: bridgeDevice.id,
                protocol: 'TCP',
                bandwidth: Math.random() * 100,
            })

            // Only create bridge -> gateway flow if we haven't already
            if (!bridgeToGatewayCreated.has(bridgeDevice.id)) {
                flows.push({
                    source: bridgeDevice.id,
                    target: gateway.id,
                    protocol: 'TCP',
                    bandwidth: Math.random() * 100,
                })
                bridgeToGatewayCreated.add(bridgeDevice.id)
            }
        } else if (!bridgeToGatewayCreated.has(device.id)) {
            // Direct connection to gateway (only if this device isn't already a bridge)
            flows.push({
                source: device.id,
                target: gateway.id,
                protocol: 'TCP',
                bandwidth: Math.random() * 100,
            })
        }
    })

    // Servers and workstations might communicate with each other
    const servers = devices.filter(d => d.device_type === 'server')
    const workstations = devices.filter(d => d.device_type === 'workstation')

    servers.forEach(server => {
        workstations.slice(0, 2).forEach(ws => {
            flows.push({
                source: ws.id,
                target: server.id,
                protocol: 'HTTPS',
                port: 443,
                bandwidth: Math.random() * 50,
            })
        })
    })

    return flows
}

function makeEdges(devices: Device[], flows: NetworkFlow[], showFlows: boolean): Edge[] {
    const gateway = devices.find(
        d =>
            d.fingerprint_metadata?.infrastructure_role === 'gateway' ||
            d.fingerprint_metadata?.is_gateway ||
            d.role?.includes('gateway') ||
            d.role?.includes('router'),
    )

    if (!gateway) return []

    const edges: Edge[] = []

    // Create a map of active flows for quick lookup
    const flowMap = new Map<string, NetworkFlow>()
    flows.forEach(flow => {
        const key = `${flow.source}-${flow.target}`
        flowMap.set(key, flow)
    })

    // Create a map of IP addresses to device IDs for bridged device lookup
    const ipToDeviceMap = new Map<string, Device>()
    devices.forEach(device => {
        ipToDeviceMap.set(device.ip_address, device)
    })

    // Helper function to find bridge device by IP
    const findBridgeDevice = (bridgedIPs: string[] | undefined): Device | undefined => {
        if (!bridgedIPs || bridgedIPs.length === 0) return undefined
        return ipToDeviceMap.get(bridgedIPs[0])
    }

    // Find all devices that are being used as bridges
    const bridgeDeviceIds = new Set<string>()
    devices.forEach(device => {
        const bridgeDevice = findBridgeDevice(
            device.fingerprint_metadata?.bridged_devices || device.bridged_devices,
        )
        if (bridgeDevice && bridgeDevice.id !== gateway.id) {
            bridgeDeviceIds.add(bridgeDevice.id)
        }
    })

    // Keep track of which connections we've already drawn
    const drawnConnections = new Set<string>()

    // Base topology: gateway connections (direct or through bridge)
    devices
        .filter(d => d.id !== gateway.id)
        .forEach(d => {
            const bridgeDevice = findBridgeDevice(
                d.fingerprint_metadata?.bridged_devices || d.bridged_devices,
            )

            if (bridgeDevice && bridgeDevice.id !== gateway.id) {
                // Device is bridged: draw device -> bridge connection
                const flowToBridge = flowMap.get(`${d.id}-${bridgeDevice.id}`)
                const flowFromBridge = flowMap.get(`${bridgeDevice.id}-${d.id}`)
                const activeFlowToBridge = flowToBridge || flowFromBridge

                if (showFlows && activeFlowToBridge) {
                    const bandwidth = activeFlowToBridge.bandwidth || 0
                    const strokeWidth = Math.max(2, Math.min(5, bandwidth / 20))
                    const isHighTraffic = bandwidth > 60

                    edges.push({
                        id: `bridged-${d.id}-${bridgeDevice.id}`,
                        source: d.id,
                        target: bridgeDevice.id,
                        type: 'default',
                        animated: true,
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: isHighTraffic ? '#f59e0b' : '#8b5cf6',
                        },
                        style: {
                            stroke: isHighTraffic ? '#f59e0b' : '#8b5cf6',
                            strokeWidth,
                        },
                        label: activeFlowToBridge.protocol,
                        labelStyle: {
                            fontSize: 10,
                            fill: isHighTraffic ? '#f59e0b' : '#8b5cf6',
                            fontWeight: 600,
                        },
                        labelBgStyle: {
                            fill: '#ffffff',
                            fillOpacity: 0.8,
                        },
                    })
                } else {
                    // Show as purple dashed line for bridged topology
                    edges.push({
                        id: `bridged-${d.id}-${bridgeDevice.id}`,
                        source: d.id,
                        target: bridgeDevice.id,
                        type: 'default',
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
                        style: {
                            stroke: '#8b5cf6',
                            strokeWidth: 2,
                            strokeDasharray: '5,5',
                        },
                        animated: true,
                    })
                }

                drawnConnections.add(`${d.id}-${bridgeDevice.id}`)

                // Draw bridge -> gateway connection (if not already drawn)
                const bridgeToGatewayKey = `${bridgeDevice.id}-${gateway.id}`
                if (!drawnConnections.has(bridgeToGatewayKey)) {
                    const flowBridgeToGateway = flowMap.get(bridgeToGatewayKey)
                    const flowGatewayToBridge = flowMap.get(`${gateway.id}-${bridgeDevice.id}`)
                    const activeFlowBridgeGateway = flowBridgeToGateway || flowGatewayToBridge

                    if (showFlows && activeFlowBridgeGateway) {
                        const bandwidth = activeFlowBridgeGateway.bandwidth || 0
                        const strokeWidth = Math.max(2, Math.min(5, bandwidth / 20))
                        const isHighTraffic = bandwidth > 60

                        edges.push({
                            id: `topology-${bridgeDevice.id}-${gateway.id}`,
                            source: bridgeDevice.id,
                            target: gateway.id,
                            type: 'default',
                            animated: true,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: isHighTraffic ? '#f59e0b' : '#6366f1',
                            },
                            style: {
                                stroke: isHighTraffic ? '#f59e0b' : '#6366f1',
                                strokeWidth,
                            },
                            label: activeFlowBridgeGateway.protocol,
                            labelStyle: {
                                fontSize: 10,
                                fill: isHighTraffic ? '#f59e0b' : '#6366f1',
                                fontWeight: 600,
                            },
                            labelBgStyle: {
                                fill: '#ffffff',
                                fillOpacity: 0.8,
                            },
                        })
                    } else {
                        edges.push({
                            id: `topology-${bridgeDevice.id}-${gateway.id}`,
                            source: bridgeDevice.id,
                            target: gateway.id,
                            type: 'default',
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
                            style: {
                                stroke: '#94a3b8',
                                strokeWidth: 2,
                                strokeDasharray: '5,5',
                            },
                            animated: true,
                        })
                    }

                    drawnConnections.add(bridgeToGatewayKey)
                }
            } else if (!bridgeDeviceIds.has(d.id)) {
                // Direct connection to gateway (only if this device is not a bridge for others)
                const flowToGateway = flowMap.get(`${d.id}-${gateway.id}`)
                const flowFromGateway = flowMap.get(`${gateway.id}-${d.id}`)
                const activeFlow = flowToGateway || flowFromGateway

                if (showFlows && activeFlow) {
                    const bandwidth = activeFlow.bandwidth || 0
                    const strokeWidth = Math.max(2, Math.min(5, bandwidth / 20))
                    const isHighTraffic = bandwidth > 60

                    edges.push({
                        id: `topology-${gateway.id}-${d.id}`,
                        source: gateway.id,
                        target: d.id,
                        type: 'default',
                        animated: true,
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: isHighTraffic ? '#f59e0b' : '#6366f1',
                        },
                        style: {
                            stroke: isHighTraffic ? '#f59e0b' : '#6366f1',
                            strokeWidth,
                        },
                        label: activeFlow.protocol,
                        labelStyle: {
                            fontSize: 10,
                            fill: isHighTraffic ? '#f59e0b' : '#6366f1',
                            fontWeight: 600,
                        },
                        labelBgStyle: {
                            fill: '#ffffff',
                            fillOpacity: 0.8,
                        },
                    })
                } else {
                    edges.push({
                        id: `topology-${gateway.id}-${d.id}`,
                        source: gateway.id,
                        target: d.id,
                        type: 'default',
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
                        style: {
                            stroke: '#94a3b8',
                            strokeWidth: 2,
                            strokeDasharray: '5,5',
                        },
                        animated: true,
                    })
                }
            }
        })

    // Peer-to-peer flows (device to device, excluding bridge connections already drawn)
    if (showFlows) {
        flows
            .filter(
                flow =>
                    flow.source !== gateway.id &&
                    flow.target !== gateway.id &&
                    !drawnConnections.has(`${flow.source}-${flow.target}`),
            )
            .forEach((flow, idx) => {
                const bandwidth = flow.bandwidth || 0
                const strokeWidth = Math.max(2, Math.min(5, bandwidth / 20))
                const isHighTraffic = bandwidth > 60

                edges.push({
                    id: `p2p-flow-${idx}-${flow.source}-${flow.target}`,
                    source: flow.source,
                    target: flow.target,
                    type: 'default',
                    animated: true,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: isHighTraffic ? '#f59e0b' : '#10b981',
                    },
                    style: {
                        stroke: isHighTraffic ? '#f59e0b' : '#10b981',
                        strokeWidth,
                    },
                    label: flow.protocol,
                    labelStyle: {
                        fontSize: 10,
                        fill: isHighTraffic ? '#f59e0b' : '#10b981',
                        fontWeight: 600,
                    },
                    labelBgStyle: {
                        fill: '#ffffff',
                        fillOpacity: 0.8,
                    },
                })
            })
    }

    return edges
}

export function NetworkDiagram({ devices, networkId, subnet }: NetworkDiagramProps) {
    const navigate = useNavigate()
    const [showFlows, setShowFlows] = useState(true)

    const initialNodes = useMemo(() => layoutNodes(devices, networkId), [devices, networkId])

    const networkFlows = useMemo(() => generateNetworkFlows(devices), [devices])

    const initialEdges = useMemo(
        () => makeEdges(devices, networkFlows, showFlows),
        [devices, networkFlows, showFlows],
    )

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    // Rebuild nodes/edges if devices or flow visibility changes
    useEffect(() => {
        setNodes(layoutNodes(devices, networkId))
        setEdges(makeEdges(devices, networkFlows, showFlows))
    }, [devices, networkId, networkFlows, showFlows, setNodes, setEdges])

    const onConnect = useCallback(
        (connection: Connection) => setEdges(eds => addEdge({ ...connection, type: 'default' }, eds)),
        [setEdges],
    )

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            const device = (node.data as any)?.device
            if (device?.id) {
                navigate(`/networks/${networkId}/devices/${device.id}`)
            }
        },
        [navigate, networkId],
    )

    const defaultEdgeOptions = useMemo(
        () => ({
            type: 'default' as const,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
            style: { stroke: '#94a3b8', strokeWidth: 2 },
        }),
        [],
    )

    return (
        <div className="w-full h-[600px] bg-background border border-border rounded-lg overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                snapToGrid
                snapGrid={[16, 16]}
                attributionPosition="bottom-left"
            >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
                <Controls />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                    className="bg-background border border-border"
                />
                <Panel
                    position="top-right"
                    className="bg-card border border-border rounded-lg p-3 space-y-2"
                >
                    <div className="text-sm space-y-1">
                        <div className="font-semibold text-foreground">Subnet: {subnet}</div>
                        <div className="text-muted-foreground">{devices.length} device(s)</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFlows(!showFlows)}
                        className="w-full text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        {showFlows ? 'Hide Flows' : 'Show Flows'}
                    </button>
                </Panel>
                <Panel position="bottom-left" className="bg-card border border-border rounded-lg p-3">
                    <div className="text-xs space-y-2">
                        <div className="font-semibold text-foreground mb-2">Legends</div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-0.5 bg-slate-400 border-t-2 border-dashed" />
                            <span className="text-muted-foreground">Network Connections</span>
                        </div>
                        {showFlows && (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-0.5 bg-indigo-500" style={{ height: '2px' }} />
                                    <span className="text-muted-foreground">Regular Traffic</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-0.5 bg-orange-500" style={{ height: '3px' }} />
                                    <span className="text-muted-foreground">High Bandwidth</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-0.5 bg-emerald-500"
                                        style={{ height: '2px' }}
                                    />
                                    <span className="text-muted-foreground">Peer-to-Peer</span>
                                </div>
                            </>
                        )}
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}

export default NetworkDiagram

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

    // All devices communicate with gateway
    devices.forEach(device => {
        if (device.id === gateway.id) return

        // Bidirectional flows to gateway
        flows.push({
            source: device.id,
            target: gateway.id,
            protocol: 'TCP',
            bandwidth: Math.random() * 100,
        })
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

    // Base topology: gateway connections
    // When flows are enabled, these get highlighted if they have active traffic
    devices
        .filter(d => d.id !== gateway.id)
        .forEach(d => {
            // Check if there's an active flow on this connection
            const flowToGateway = flowMap.get(`${d.id}-${gateway.id}`)
            const flowFromGateway = flowMap.get(`${gateway.id}-${d.id}`)
            const activeFlow = flowToGateway || flowFromGateway

            if (showFlows && activeFlow) {
                // Highlight this connection with active flow styling
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
                // Show as subtle base topology with animated dashes
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
        })

    // Peer-to-peer flows (device to device, not through gateway)
    if (showFlows) {
        flows
            .filter(flow => flow.source !== gateway.id && flow.target !== gateway.id)
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
                        onClick={() => setShowFlows(!showFlows)}
                        className="w-full text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        {showFlows ? 'Hide Flows' : 'Show Flows'}
                    </button>
                </Panel>
                <Panel position="bottom-left" className="bg-card border border-border rounded-lg p-3">
                    <div className="text-xs space-y-2">
                        <div className="font-semibold text-foreground mb-2">Legend</div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-0.5 bg-slate-400 border-t-2 border-dashed" />
                            <span className="text-muted-foreground">Base Topology</span>
                        </div>
                        {showFlows && (
                            <>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-0.5 bg-indigo-500" style={{ height: '2px' }} />
                                    <span className="text-muted-foreground">Normal Traffic</span>
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

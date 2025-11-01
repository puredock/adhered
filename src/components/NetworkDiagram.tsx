import {
    addEdge,
    Background,
    BackgroundVariant,
    type Connection,
    Controls,
    type Edge,
    MiniMap,
    type Node,
    type NodeTypes,
    Panel,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from '@xyflow/react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '@xyflow/react/dist/style.css'
import type { Device } from '@/lib/api'
import DeviceNode from './DeviceNode'

interface NetworkDiagramProps {
    devices: Device[]
    networkId: string
    subnet: string
}

const nodeTypes: NodeTypes = {
    deviceNode: DeviceNode,
}

export function NetworkDiagram({ devices, networkId, subnet }: NetworkDiagramProps) {
    const navigate = useNavigate()

    // Convert devices to nodes
    const initialNodes: Node[] = useMemo(() => {
        const centerX = 500
        const centerY = 350

        const gatewayNode: Node = {
            id: 'gateway',
            type: 'input',
            data: { label: `Gateway\n${subnet}` },
            position: { x: centerX - 80, y: 80 },
            style: {
                background: '#10b981',
                color: 'white',
                border: '2px solid #059669',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
            },
        }

        const deviceNodes: Node[] = devices.map((device, index) => {
            // Start from top and distribute evenly, offset by -90 degrees to start at top
            const angle = (index / devices.length) * 2 * Math.PI - Math.PI / 2
            const radius = 280
            const x = centerX + radius * Math.cos(angle) - 90
            const y = centerY + radius * Math.sin(angle)

            return {
                id: device.id,
                type: 'deviceNode',
                data: { device, networkId },
                position: { x, y },
            }
        })

        return [gatewayNode, ...deviceNodes]
    }, [devices, networkId, subnet])

    // Create edges from gateway to each device
    const initialEdges: Edge[] = useMemo(() => {
        return devices.map(device => ({
            id: `gateway-${device.id}`,
            source: 'gateway',
            target: device.id,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
        }))
    }, [devices])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback(
        (connection: Connection) => setEdges(eds => addEdge(connection, eds)),
        [setEdges],
    )

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            if (node.id !== 'gateway' && node.data.device) {
                navigate(`/networks/${networkId}/devices/${node.id}`)
            }
        },
        [navigate, networkId],
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
                fitView
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
                <Panel position="top-right" className="bg-card border border-border rounded-lg p-3">
                    <div className="text-sm space-y-1">
                        <div className="font-semibold text-foreground">Network: {subnet}</div>
                        <div className="text-muted-foreground">{devices.length} device(s)</div>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}

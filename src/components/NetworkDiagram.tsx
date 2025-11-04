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
import dagre from 'dagre'
import { useCallback, useEffect, useMemo } from 'react'
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

// Dagre layout helper
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    // Configure layout
    dagreGraph.setGraph({
        rankdir: 'TB', // Top to Bottom
        ranksep: 120, // Vertical separation between ranks
        nodesep: 80, // Horizontal separation between nodes
        marginx: 50,
        marginy: 50,
    })

    nodes.forEach(node => {
        dagreGraph.setNode(node.id, {
            width: node.id === 'network' ? 160 : 180,
            height: node.id === 'network' ? 48 : 100,
        })
    })

    edges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id)
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - (node.id === 'network' ? 80 : 90),
                y: nodeWithPosition.y - (node.id === 'network' ? 24 : 50),
            },
        }
    })

    return { nodes: layoutedNodes, edges }
}

export function NetworkDiagram({ devices, networkId, subnet }: NetworkDiagramProps) {
    const navigate = useNavigate()

    // Create initial nodes and edges
    const { initialNodes: rawNodes, initialEdges: rawEdges } = useMemo(() => {
        const networkNode: Node = {
            id: 'network',
            type: 'input',
            data: { label: `Network\n${subnet}` },
            position: { x: 0, y: 0 }, // Will be positioned by Dagre
            style: {
                background: '#6366f1',
                color: 'white',
                border: '2px solid #4f46e5',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
            },
        }

        const deviceNodes: Node[] = devices.map(device => ({
            id: device.id,
            type: 'deviceNode',
            data: { device, networkId },
            position: { x: 0, y: 0 }, // Will be positioned by Dagre
        }))

        const edges: Edge[] = devices.map(device => ({
            id: `network-${device.id}`,
            source: 'network',
            target: device.id,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
        }))

        return { initialNodes: [networkNode, ...deviceNodes], initialEdges: edges }
    }, [devices, networkId, subnet])

    // Apply Dagre layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        return getLayoutedElements(rawNodes, rawEdges)
    }, [rawNodes, rawEdges])

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

    // Update layout when devices change
    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = getLayoutedElements(rawNodes, rawEdges)
        setNodes(newNodes)
        setEdges(newEdges)
    }, [rawNodes, rawEdges, setNodes, setEdges])

    const onConnect = useCallback(
        (connection: Connection) => setEdges(eds => addEdge(connection, eds)),
        [setEdges],
    )

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            if (node.id !== 'network' && node.data.device) {
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

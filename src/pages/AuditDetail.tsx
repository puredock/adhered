import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CheckCircle2,
    Clock,
    FileCheck,
    Hospital,
    Plane,
    Play,
    Shield,
    Ship,
    Train,
    Truck,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const AuditDetail = () => {
    const { id } = useParams()
    const { toast } = useToast()
    const [isRunning, setIsRunning] = useState(false)

    // Mock data - in a real app, this would come from an API
    const frameworkData: Record<string, any> = {
        hipaa: {
            name: 'HIPAA Compliance',
            category: 'Medical',
            icon: Hospital,
            iconColor: 'text-red-600 bg-red-50',
            tags: ['Medical', 'Healthcare', 'Privacy'],
            description:
                'The Health Insurance Portability and Accountability Act (HIPAA) sets the standard for protecting sensitive patient health information. Companies that deal with protected health information (PHI) must have physical, network, and process security measures in place and follow them to ensure HIPAA compliance.',
            requirements: [
                'Ensure the confidentiality, integrity, and availability of all e-PHI',
                'Detect and safeguard against anticipated threats to the security of the information',
                'Protect against anticipated impermissible uses or disclosures',
                'Certify compliance by your workforce',
            ],
            checkpoints: [
                {
                    id: 1,
                    name: 'Access Control',
                    status: 'passed',
                    severity: 'critical',
                },
                { id: 2, name: 'Audit Controls', status: 'passed', severity: 'high' },
                {
                    id: 3,
                    name: 'Integrity Controls',
                    status: 'warning',
                    severity: 'medium',
                },
                {
                    id: 4,
                    name: 'Transmission Security',
                    status: 'passed',
                    severity: 'high',
                },
                {
                    id: 5,
                    name: 'Device & Media Controls',
                    status: 'failed',
                    severity: 'critical',
                },
            ],
            complianceScore: 78,
        },
        'iec-62443': {
            name: 'IEC 62443',
            category: 'Industrial',
            icon: Building2,
            iconColor: 'text-blue-600 bg-blue-50',
            tags: ['Industrial', 'Manufacturing', 'OT'],
            description:
                'IEC 62443 is a series of standards for industrial automation and control systems (IACS) security. It provides a flexible framework to address and mitigate current and future security vulnerabilities in industrial automation and control systems.',
            requirements: [
                'Implement defense-in-depth security architecture',
                'Establish security levels for zones and conduits',
                'Deploy intrusion detection and prevention systems',
                'Maintain comprehensive security policies and procedures',
            ],
            checkpoints: [
                {
                    id: 1,
                    name: 'Identification & Authentication',
                    status: 'passed',
                    severity: 'critical',
                },
                { id: 2, name: 'Use Control', status: 'passed', severity: 'high' },
                {
                    id: 3,
                    name: 'System Integrity',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 4,
                    name: 'Data Confidentiality',
                    status: 'warning',
                    severity: 'medium',
                },
                {
                    id: 5,
                    name: 'Restricted Data Flow',
                    status: 'passed',
                    severity: 'high',
                },
            ],
            complianceScore: 85,
        },
        'do-178c': {
            name: 'DO-178C',
            category: 'Aviation',
            icon: Plane,
            iconColor: 'text-sky-600 bg-sky-50',
            tags: ['Aviation', 'Safety', 'Critical Systems'],
            description:
                'DO-178C is the primary standard for commercial avionics software development. It provides guidelines for the production of airborne systems and equipment software that performs its intended function with a level of confidence in safety.',
            requirements: [
                'Software planning process compliance',
                'Software development process verification',
                'Software verification process compliance',
                'Configuration management process verification',
            ],
            checkpoints: [
                {
                    id: 1,
                    name: 'Software Planning',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 2,
                    name: 'Development Standards',
                    status: 'warning',
                    severity: 'high',
                },
                {
                    id: 3,
                    name: 'Requirements Traceability',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 4,
                    name: 'Verification Coverage',
                    status: 'failed',
                    severity: 'critical',
                },
                {
                    id: 5,
                    name: 'Configuration Management',
                    status: 'passed',
                    severity: 'high',
                },
            ],
            complianceScore: 72,
        },
        'nist-csf': {
            name: 'NIST Cybersecurity Framework',
            category: 'Public',
            icon: Shield,
            iconColor: 'text-purple-600 bg-purple-50',
            tags: ['Public', 'Government', 'Infrastructure'],
            description:
                'The NIST Cybersecurity Framework provides a policy framework of computer security guidance for how organizations can assess and improve their ability to prevent, detect, and respond to cyber attacks.',
            requirements: [
                'Identify critical assets and business functions',
                'Protect systems and data through appropriate safeguards',
                'Detect cybersecurity events in a timely manner',
                'Respond to and recover from cybersecurity incidents',
            ],
            checkpoints: [
                { id: 1, name: 'Asset Management', status: 'passed', severity: 'high' },
                {
                    id: 2,
                    name: 'Risk Assessment',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 3,
                    name: 'Access Control',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 4,
                    name: 'Anomaly Detection',
                    status: 'warning',
                    severity: 'medium',
                },
                {
                    id: 5,
                    name: 'Incident Response',
                    status: 'passed',
                    severity: 'high',
                },
            ],
            complianceScore: 88,
        },
        'imo-msc': {
            name: 'IMO MSC-FAL.1/Circ.3',
            category: 'Maritime',
            icon: Ship,
            iconColor: 'text-cyan-600 bg-cyan-50',
            tags: ['Maritime', 'Shipping', 'Naval'],
            description:
                'IMO guidelines on maritime cyber risk management address cyber security in the context of safety management systems. It provides high-level recommendations for maritime cyber risk management.',
            requirements: [
                'Identify risks to operational technology and systems',
                'Establish safeguards and procedures',
                'Detect security threats and vulnerabilities',
                'Respond to and recover from cyber incidents',
            ],
            checkpoints: [
                {
                    id: 1,
                    name: 'OT Risk Assessment',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 2,
                    name: 'Network Segmentation',
                    status: 'passed',
                    severity: 'high',
                },
                {
                    id: 3,
                    name: 'Remote Access Control',
                    status: 'warning',
                    severity: 'high',
                },
                {
                    id: 4,
                    name: 'Software Updates',
                    status: 'passed',
                    severity: 'medium',
                },
                {
                    id: 5,
                    name: 'Incident Procedures',
                    status: 'passed',
                    severity: 'high',
                },
            ],
            complianceScore: 82,
        },
        'en-50159': {
            name: 'EN 50159',
            category: 'Railway',
            icon: Train,
            iconColor: 'text-orange-600 bg-orange-50',
            tags: ['Railway', 'Transport', 'Signaling'],
            description:
                'EN 50159 specifies requirements for communication, signalling and processing systems in railway applications. It addresses security aspects for transmission systems used in railway control and protection applications.',
            requirements: [
                'Ensure secure data transmission',
                'Implement authentication mechanisms',
                'Protect against replay attacks',
                'Maintain data integrity',
            ],
            checkpoints: [
                {
                    id: 1,
                    name: 'Message Authentication',
                    status: 'warning',
                    severity: 'critical',
                },
                { id: 2, name: 'Sequence Control', status: 'passed', severity: 'high' },
                {
                    id: 3,
                    name: 'Timestamp Validation',
                    status: 'passed',
                    severity: 'high',
                },
                {
                    id: 4,
                    name: 'Data Integrity',
                    status: 'failed',
                    severity: 'critical',
                },
                { id: 5, name: 'Key Management', status: 'passed', severity: 'high' },
            ],
            complianceScore: 68,
        },
        'tapa-fsr': {
            name: 'TAPA FSR',
            category: 'Logistics',
            icon: Truck,
            iconColor: 'text-green-600 bg-green-50',
            tags: ['Logistics', 'Supply Chain', 'Security'],
            description:
                'TAPA Facility Security Requirements establish minimum acceptable security standards for warehouses and distribution centers. It helps secure the supply chain by defining security standards for facilities.',
            requirements: [
                'Physical security controls and access management',
                'Surveillance and monitoring systems',
                'Personnel security and training',
                'Cargo and inventory management',
            ],
            checkpoints: [
                {
                    id: 1,
                    name: 'Perimeter Security',
                    status: 'passed',
                    severity: 'high',
                },
                {
                    id: 2,
                    name: 'Access Control',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 3,
                    name: 'Surveillance Systems',
                    status: 'passed',
                    severity: 'high',
                },
                { id: 4, name: 'Alarm Systems', status: 'warning', severity: 'medium' },
                {
                    id: 5,
                    name: 'Personnel Vetting',
                    status: 'passed',
                    severity: 'high',
                },
            ],
            complianceScore: 90,
        },
        'nerc-cip': {
            name: 'NERC CIP',
            category: 'Public',
            icon: Shield,
            iconColor: 'text-yellow-600 bg-yellow-50',
            tags: ['Public', 'Energy', 'Critical Infrastructure'],
            description:
                "NERC CIP (Critical Infrastructure Protection) standards are designed to secure the assets required for operating North America's bulk electric system. These standards define a comprehensive set of requirements.",
            requirements: [
                'Identify and categorize critical cyber assets',
                'Implement electronic security perimeters',
                'Maintain physical security of critical assets',
                'Ensure personnel and training compliance',
            ],
            checkpoints: [
                {
                    id: 1,
                    name: 'Critical Asset Identification',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 2,
                    name: 'Electronic Security',
                    status: 'passed',
                    severity: 'critical',
                },
                {
                    id: 3,
                    name: 'Physical Security',
                    status: 'passed',
                    severity: 'high',
                },
                {
                    id: 4,
                    name: 'Personnel Training',
                    status: 'warning',
                    severity: 'medium',
                },
                {
                    id: 5,
                    name: 'Incident Reporting',
                    status: 'passed',
                    severity: 'high',
                },
            ],
            complianceScore: 86,
        },
    }

    const framework = frameworkData[id || ''] || frameworkData['hipaa']

    const getCheckpointIcon = (status: string) => {
        switch (status) {
            case 'passed':
                return <CheckCircle2 className="w-5 h-5 text-success" />
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-warning" />
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-destructive" />
            default:
                return <Clock className="w-5 h-5 text-muted-foreground" />
        }
    }

    const getSeverityBadge = (severity: string) => {
        const variants = {
            critical: 'bg-destructive/10 text-destructive border-destructive/20',
            high: 'bg-warning/10 text-warning border-warning/20',
            medium: 'bg-primary/10 text-primary border-primary/20',
        }
        return (
            <Badge variant="outline" className={variants[severity as keyof typeof variants]}>
                {severity}
            </Badge>
        )
    }

    const handleRunAudit = () => {
        setIsRunning(true)
        toast({
            title: 'Audit Started',
            description: `Running ${framework.name} compliance audit workflow...`,
        })

        // Simulate audit running
        setTimeout(() => {
            setIsRunning(false)
            toast({
                title: 'Audit Complete',
                description: 'Compliance audit has been completed successfully.',
            })
        }, 3000)
    }

    return (
        <div className="min-h-screen bg-background flex-1">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/audits">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${framework.iconColor}`}
                            >
                                <framework.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{framework.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    {framework.tags.map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Button onClick={handleRunAudit} disabled={isRunning} size="lg">
                            <Play className="w-4 h-4 mr-2" />
                            {isRunning ? 'Running Audit...' : 'Run Audit Workflow'}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Overview */}
                        <Card className="shadow-card border-border">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>Framework description and requirements</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{framework.description}</p>

                                <div>
                                    <h4 className="font-semibold mb-3">Key Requirements</h4>
                                    <ul className="space-y-2">
                                        {framework.requirements.map((req: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    {req}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Checkpoints */}
                        <Card className="shadow-card border-border">
                            <CardHeader>
                                <CardTitle>Audit Checkpoints</CardTitle>
                                <CardDescription>
                                    Compliance verification points and current status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {framework.checkpoints.map((checkpoint: any) => (
                                        <div
                                            key={checkpoint.id}
                                            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getCheckpointIcon(checkpoint.status)}
                                                <div>
                                                    <h4 className="font-semibold">{checkpoint.name}</h4>
                                                    <p className="text-sm text-muted-foreground capitalize">
                                                        {checkpoint.status}
                                                    </p>
                                                </div>
                                            </div>
                                            {getSeverityBadge(checkpoint.severity)}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Compliance Score */}
                        <Card className="shadow-card border-border">
                            <CardHeader>
                                <CardTitle>Compliance Score</CardTitle>
                                <CardDescription>Current compliance level</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center mb-4">
                                    <div className="text-4xl font-bold mb-2">
                                        {framework.complianceScore}%
                                    </div>
                                    <Progress value={framework.complianceScore} className="h-2" />
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Passed:</span>
                                        <span className="font-semibold text-success">
                                            {
                                                framework.checkpoints.filter(
                                                    (c: any) => c.status === 'passed',
                                                ).length
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Warnings:</span>
                                        <span className="font-semibold text-warning">
                                            {
                                                framework.checkpoints.filter(
                                                    (c: any) => c.status === 'warning',
                                                ).length
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Failed:</span>
                                        <span className="font-semibold text-destructive">
                                            {
                                                framework.checkpoints.filter(
                                                    (c: any) => c.status === 'failed',
                                                ).length
                                            }
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="shadow-card border-border">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <FileCheck className="w-4 h-4 mr-2" />
                                    View Audit History
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Generate Report
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AuditDetail

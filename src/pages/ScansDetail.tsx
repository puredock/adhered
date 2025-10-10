import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Shield, Lock, Bug, FileSearch, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ScansDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const standardsData: Record<string, any> = {
    ptes: {
      name: "PTES",
      fullName: "Penetration Testing Execution Standard",
      description: "A comprehensive standard covering all phases of penetration testing from pre-engagement to reporting",
      icon: Shield,
      iconColor: "text-blue-600 bg-blue-50",
      tags: ["Methodology", "Full Coverage", "Documentation"],
      status: "active",
      lastScan: "1 day ago",
      severity: "info",
      completionRate: 85,
      overview: "PTES provides a comprehensive methodology for conducting penetration tests. It covers seven main phases including pre-engagement interactions, intelligence gathering, threat modeling, vulnerability analysis, exploitation, post-exploitation, and reporting.",
      phases: [
        { name: "Pre-engagement", status: "completed", progress: 100 },
        { name: "Intelligence Gathering", status: "completed", progress: 100 },
        { name: "Threat Modeling", status: "in-progress", progress: 65 },
        { name: "Vulnerability Analysis", status: "pending", progress: 0 },
        { name: "Exploitation", status: "pending", progress: 0 },
        { name: "Post-exploitation", status: "pending", progress: 0 },
        { name: "Reporting", status: "pending", progress: 0 }
      ],
      findings: {
        critical: 0,
        high: 2,
        medium: 5,
        low: 8,
        info: 12
      }
    },
    "owasp-wstg": {
      name: "OWASP WSTG",
      fullName: "OWASP Web Security Testing Guide",
      description: "Comprehensive testing guide for web application security vulnerabilities and attack vectors",
      icon: Bug,
      iconColor: "text-red-600 bg-red-50",
      tags: ["Web Security", "Application", "OWASP"],
      status: "active",
      lastScan: "3 hours ago",
      severity: "high",
      completionRate: 92,
      overview: "The OWASP Web Security Testing Guide provides a comprehensive framework for testing web application security. It includes testing for authentication, authorization, session management, input validation, and many other security controls.",
      phases: [
        { name: "Information Gathering", status: "completed", progress: 100 },
        { name: "Configuration Testing", status: "completed", progress: 100 },
        { name: "Authentication Testing", status: "completed", progress: 100 },
        { name: "Authorization Testing", status: "completed", progress: 100 },
        { name: "Session Management", status: "in-progress", progress: 80 },
        { name: "Input Validation", status: "pending", progress: 0 },
        { name: "Business Logic", status: "pending", progress: 0 }
      ],
      findings: {
        critical: 1,
        high: 4,
        medium: 7,
        low: 6,
        info: 9
      }
    },
    "owasp-fstg": {
      name: "OWASP FSTG",
      fullName: "OWASP Firmware Security Testing Guide",
      description: "Security testing methodology for firmware and embedded systems vulnerabilities",
      icon: Lock,
      iconColor: "text-purple-600 bg-purple-50",
      tags: ["Firmware", "Embedded", "IoT"],
      status: "pending",
      lastScan: "2 days ago",
      severity: "medium",
      completionRate: 45,
      overview: "The OWASP Firmware Security Testing Guide focuses on security testing of firmware in embedded devices and IoT systems. It covers firmware extraction, analysis, reverse engineering, and vulnerability identification.",
      phases: [
        { name: "Firmware Acquisition", status: "completed", progress: 100 },
        { name: "Firmware Extraction", status: "completed", progress: 100 },
        { name: "Static Analysis", status: "in-progress", progress: 55 },
        { name: "Dynamic Analysis", status: "pending", progress: 0 },
        { name: "Runtime Testing", status: "pending", progress: 0 }
      ],
      findings: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 5,
        info: 7
      }
    },
    "nist-800-115": {
      name: "NIST SP 800-115",
      fullName: "NIST Technical Guide to Information Security Testing",
      description: "Technical guide to information security testing and assessment methodologies",
      icon: FileSearch,
      iconColor: "text-indigo-600 bg-indigo-50",
      tags: ["Government", "Assessment", "Compliance"],
      status: "active",
      lastScan: "12 hours ago",
      severity: "info",
      completionRate: 78,
      overview: "NIST SP 800-115 provides technical guidance for conducting security assessments. It covers review techniques, target identification and analysis techniques, and attack techniques for security testing and examinations.",
      phases: [
        { name: "Planning", status: "completed", progress: 100 },
        { name: "Discovery", status: "completed", progress: 100 },
        { name: "Vulnerability Scanning", status: "completed", progress: 100 },
        { name: "Assessment Analysis", status: "in-progress", progress: 70 },
        { name: "Reporting", status: "pending", progress: 0 }
      ],
      findings: {
        critical: 0,
        high: 2,
        medium: 6,
        low: 9,
        info: 15
      }
    },
    osstmm: {
      name: "OSSTMM",
      fullName: "Open Source Security Testing Methodology Manual",
      description: "Peer-reviewed methodology for security testing across networks, applications, and physical security",
      icon: Shield,
      iconColor: "text-green-600 bg-green-50",
      tags: ["Open Source", "Comprehensive", "Network"],
      status: "active",
      lastScan: "6 hours ago",
      severity: "low",
      completionRate: 88,
      overview: "OSSTMM is a peer-reviewed methodology for thorough security testing. It focuses on operational security metrics and provides a scientific methodology for accurately characterizing operational security.",
      phases: [
        { name: "Information Security", status: "completed", progress: 100 },
        { name: "Process Security", status: "completed", progress: 100 },
        { name: "Internet Technology", status: "completed", progress: 100 },
        { name: "Communications", status: "in-progress", progress: 75 },
        { name: "Wireless Security", status: "pending", progress: 0 },
        { name: "Physical Security", status: "pending", progress: 0 }
      ],
      findings: {
        critical: 0,
        high: 1,
        medium: 4,
        low: 11,
        info: 18
      }
    },
    "pci-dss": {
      name: "PCI DSS Guidance",
      fullName: "Payment Card Industry Data Security Standard",
      description: "Security standards for organizations handling credit card information with penetration testing requirements",
      icon: Lock,
      iconColor: "text-yellow-600 bg-yellow-50",
      tags: ["Payment", "Compliance", "Financial"],
      status: "active",
      lastScan: "8 hours ago",
      severity: "high",
      completionRate: 95,
      overview: "PCI DSS penetration testing requirements ensure that organizations handling cardholder data maintain a secure environment. This includes network-layer and application-layer penetration testing at least annually.",
      phases: [
        { name: "Scope Definition", status: "completed", progress: 100 },
        { name: "Network Segmentation", status: "completed", progress: 100 },
        { name: "External Testing", status: "completed", progress: 100 },
        { name: "Internal Testing", status: "completed", progress: 100 },
        { name: "Application Testing", status: "in-progress", progress: 90 },
        { name: "Remediation Validation", status: "pending", progress: 0 }
      ],
      findings: {
        critical: 0,
        high: 3,
        medium: 5,
        low: 4,
        info: 8
      }
    }
  };

  const standard = standardsData[id || ""];

  if (!standard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Standard Not Found</CardTitle>
            <CardDescription>The requested penetration testing standard could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/scans")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartScan = () => {
    toast({
      title: "Scan Initiated",
      description: `Starting ${standard.name} security scan workflow...`,
    });
  };

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-warning" />;
      case "pending":
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: { text: "High Priority", className: "bg-destructive/10 text-destructive border-destructive/20" },
      medium: { text: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
      low: { text: "Low", className: "bg-success/10 text-success border-success/20" },
      info: { text: "Info", className: "bg-primary/10 text-primary border-primary/20" }
    };
    const config = variants[severity as keyof typeof variants];
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex-1">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/scans")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scans
            </Button>
            <Button onClick={handleStartScan} size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Scan Workflow
            </Button>
          </div>
          
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${standard.iconColor}`}>
              <standard.icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{standard.name}</h1>
                {getSeverityBadge(standard.severity)}
                <Badge variant={standard.status === "active" ? "default" : "secondary"}>
                  {standard.status === "active" ? "Active" : "Pending"}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-3">{standard.fullName}</p>
              <div className="flex flex-wrap gap-2">
                {standard.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{standard.overview}</p>
              </CardContent>
            </Card>

            {/* Testing Phases */}
            <Card>
              <CardHeader>
                <CardTitle>Testing Phases</CardTitle>
                <CardDescription>Current progress across all testing phases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {standard.phases.map((phase: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getPhaseIcon(phase.status)}
                        <span className="font-medium">{phase.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{phase.progress}%</span>
                    </div>
                    <Progress value={phase.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Findings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Findings Summary</CardTitle>
                <CardDescription>Security issues identified during testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="text-3xl font-bold text-destructive mb-1">{standard.findings.critical}</div>
                    <div className="text-xs text-muted-foreground uppercase">Critical</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="text-3xl font-bold text-destructive mb-1">{standard.findings.high}</div>
                    <div className="text-xs text-muted-foreground uppercase">High</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <div className="text-3xl font-bold text-warning mb-1">{standard.findings.medium}</div>
                    <div className="text-xs text-muted-foreground uppercase">Medium</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
                    <div className="text-3xl font-bold text-success mb-1">{standard.findings.low}</div>
                    <div className="text-xs text-muted-foreground uppercase">Low</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-1">{standard.findings.info}</div>
                    <div className="text-xs text-muted-foreground uppercase">Info</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scan Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{standard.completionRate}%</span>
                  </div>
                  <Progress value={standard.completionRate} className="h-3" />
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Scan</span>
                    <span className="font-medium">{standard.lastScan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Findings</span>
                    <span className="font-medium">
                      {(Object.values(standard.findings) as number[]).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phases</span>
                    <span className="font-medium">{standard.phases.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default" onClick={handleStartScan}>
                  <Play className="w-4 h-4 mr-2" />
                  Start New Scan
                </Button>
                <Button className="w-full" variant="outline">
                  View Full Report
                </Button>
                <Button className="w-full" variant="outline">
                  Export Results
                </Button>
                <Button className="w-full" variant="outline">
                  Configure Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScansDetail;
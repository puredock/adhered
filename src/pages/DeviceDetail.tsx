import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Monitor, Shield, Activity, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const DeviceDetail = () => {
  const { networkId, deviceId } = useParams();
  
  const [device] = useState({
    id: 1,
    name: "MacBook Pro",
    type: "computer",
    ip: "192.168.1.101",
    mac: "A4:83:E7:5F:2B:1C",
    status: "online",
    manufacturer: "Apple Inc.",
    model: "MacBook Pro (16-inch, 2023)",
    os: "macOS Sonoma 14.2",
    lastSeen: "Active now",
    openPorts: [22, 80, 443, 5000],
    vulnerabilities: 2,
    complianceStatus: "passed",
  });

  const [testResults] = useState([
    { id: 1, name: "Port Scan", status: "completed", result: "4 open ports detected", severity: "info" },
    { id: 2, name: "Vulnerability Scan", status: "completed", result: "2 medium-risk vulnerabilities", severity: "warning" },
    { id: 3, name: "Compliance Check", status: "completed", result: "Meets security standards", severity: "success" },
  ]);

  const handlePenTest = () => {
    toast.success("Penetration test initiated", {
      description: "Comprehensive security testing in progress...",
    });
  };

  const handleRiskAssessment = () => {
    toast.success("Risk assessment started", {
      description: "Analyzing security posture and vulnerabilities...",
    });
  };

  const handleComplianceAudit = () => {
    toast.success("Compliance audit launched", {
      description: "Checking against industry standards...",
    });
  };

  const handleRegulatoryAdvisory = () => {
    toast.info("Regulatory advisory report", {
      description: "Generating compliance recommendations...",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: { text: "Online", className: "bg-success/10 text-success border-success/20" },
      warning: { text: "Warning", className: "bg-warning/10 text-warning border-warning/20" },
      critical: { text: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "success") return <CheckCircle2 className="w-4 h-4 text-success" />;
    if (severity === "warning") return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <Activity className="w-4 h-4 text-info" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to={`/networks/${networkId}`}>
              <Button variant="ghost" size="icon" className="hover:bg-secondary">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{device.name}</h1>
              <p className="text-sm text-muted-foreground">{device.ip} • {device.mac}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle>Device Information</CardTitle>
                      <CardDescription>Hardware and network details</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(device.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Manufacturer</p>
                    <p className="font-medium">{device.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Model</p>
                    <p className="font-medium">{device.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Operating System</p>
                    <p className="font-medium">{device.os}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Seen</p>
                    <p className="font-medium">{device.lastSeen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">IP Address</p>
                    <p className="font-mono font-medium">{device.ip}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">MAC Address</p>
                    <p className="font-mono font-medium">{device.mac}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Open Ports</p>
                  <div className="flex flex-wrap gap-2">
                    {device.openPorts.map((port) => (
                      <Badge key={port} variant="outline" className="font-mono">
                        {port}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
                <CardDescription>Latest security assessments and scans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(test.severity)}
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-muted-foreground">{test.result}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{test.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security Actions
                </CardTitle>
                <CardDescription>Run security tests and assessments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handlePenTest} 
                  className="w-full bg-primary hover:bg-primary/90 justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Penetration Test
                </Button>
                <Button 
                  onClick={handleRiskAssessment} 
                  variant="outline" 
                  className="w-full justify-start hover:bg-secondary"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Risk Assessment
                </Button>
                <Button 
                  onClick={handleComplianceAudit} 
                  variant="outline" 
                  className="w-full justify-start hover:bg-secondary"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Compliance Audit
                </Button>
                <Button 
                  onClick={handleRegulatoryAdvisory} 
                  variant="outline" 
                  className="w-full justify-start hover:bg-secondary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Regulatory Advisory
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Vulnerabilities</span>
                    <span className="font-bold text-warning">{device.vulnerabilities}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-warning" style={{ width: "30%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Compliance Status</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">Passed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeviceDetail;

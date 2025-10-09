import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Shield, AlertTriangle, Activity } from "lucide-react";

const Index = () => {
  const stats = [
    { label: "Active Networks", value: "3", icon: Network, color: "text-primary" },
    { label: "Total Devices", value: "47", icon: Activity, color: "text-success" },
    { label: "Security Issues", value: "12", icon: AlertTriangle, color: "text-warning" },
    { label: "Compliant Devices", value: "35", icon: Shield, color: "text-accent" },
  ];

  const recentScans = [
    { id: 1, network: "Office Network", devices: 18, status: "secure", lastScan: "2 hours ago" },
    { id: 2, network: "Guest Network", devices: 9, status: "warning", lastScan: "5 hours ago" },
    { id: 3, network: "IoT Network", devices: 20, status: "critical", lastScan: "1 day ago" },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      secure: { variant: "default" as const, text: "Secure", className: "bg-success" },
      warning: { variant: "default" as const, text: "Warning", className: "bg-warning text-warning-foreground" },
      critical: { variant: "destructive" as const, text: "Critical", className: "" },
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">IoT Security Hub</h1>
                <p className="text-sm text-muted-foreground">Network Security & Compliance Dashboard</p>
              </div>
            </div>
            <Link to="/networks">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium">
                View All Networks
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-card flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Scans */}
        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Recent Network Scans</CardTitle>
            <CardDescription>Overview of your monitored networks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScans.map((scan) => (
                <Link key={scan.id} to="/networks">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Network className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{scan.network}</h3>
                        <p className="text-sm text-muted-foreground">{scan.devices} devices • Last scan {scan.lastScan}</p>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(scan.status)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;

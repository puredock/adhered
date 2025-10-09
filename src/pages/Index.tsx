import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Shield, AlertTriangle, Activity } from "lucide-react";
const Index = () => {
  const stats = [{
    label: "Active Networks",
    value: "3",
    icon: Network,
    color: "text-blue-600"
  }, {
    label: "Total Devices",
    value: "47",
    icon: Activity,
    color: "text-teal-600"
  }, {
    label: "Security Issues",
    value: "12",
    icon: AlertTriangle,
    color: "text-orange-600"
  }, {
    label: "Compliant Devices",
    value: "35",
    icon: Shield,
    color: "text-green-600"
  }];
  const recentScans = [{
    id: 1,
    network: "Office Network",
    devices: 18,
    status: "secure",
    lastScan: "2 hours ago",
    iconColor: "text-purple-600 bg-purple-50"
  }, {
    id: 2,
    network: "Guest Network",
    devices: 9,
    status: "warning",
    lastScan: "5 hours ago",
    iconColor: "text-orange-600 bg-orange-50"
  }, {
    id: 3,
    network: "IoT Network",
    devices: 20,
    status: "critical",
    lastScan: "1 day ago",
    iconColor: "text-pink-600 bg-pink-50"
  }];
  const getStatusBadge = (status: string) => {
    const variants = {
      secure: {
        text: "Secure",
        className: "bg-success/10 text-success border-success/20"
      },
      warning: {
        text: "Warning",
        className: "bg-warning/10 text-warning border-warning/20"
      },
      critical: {
        text: "Critical",
        className: "bg-destructive/10 text-destructive border-destructive/20"
      }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };
  return <div className="min-h-screen bg-background flex-1">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">adhere</h1>
                
              </div>
            </div>
            <Link to="/networks">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                View All Networks
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map(stat => <Card key={stat.label} className="shadow-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Recent Scans */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Recent Network Scans</CardTitle>
            <CardDescription>Overview of your monitored networks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScans.map(scan => <Link key={scan.id} to="/networks">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${scan.iconColor} group-hover:scale-110 transition-transform`}>
                        <Network className="w-5 h-5" />
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
                </Link>)}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>;
};
export default Index;
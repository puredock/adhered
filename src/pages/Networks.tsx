import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, ArrowLeft, Wifi, Shield, Activity } from "lucide-react";

const Networks = () => {
  const [networks] = useState([
    {
      id: 1,
      name: "Office Network",
      ssid: "CORP-MAIN-5G",
      ipRange: "192.168.1.0/24",
      devices: 18,
      status: "secure",
      lastScan: "2 hours ago",
      gateway: "192.168.1.1",
    },
    {
      id: 2,
      name: "Guest Network",
      ssid: "GUEST-WIFI",
      ipRange: "192.168.2.0/24",
      devices: 9,
      status: "warning",
      lastScan: "5 hours ago",
      gateway: "192.168.2.1",
    },
    {
      id: 3,
      name: "IoT Network",
      ssid: "IOT-SECURE",
      ipRange: "192.168.3.0/24",
      devices: 20,
      status: "critical",
      lastScan: "1 day ago",
      gateway: "192.168.3.1",
    },
  ]);

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
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Networks</h1>
                <p className="text-sm text-muted-foreground">Manage and monitor your networks</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {networks.map((network) => (
            <Link key={network.id} to={`/networks/${network.id}`}>
              <Card className="bg-gradient-card shadow-card border-border/50 hover:border-primary/50 transition-all hover:shadow-glow group h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Network className="w-6 h-6 text-primary" />
                    </div>
                    {getStatusBadge(network.status)}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{network.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    {network.ssid}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">IP Range:</span>
                      <span className="font-mono font-medium">{network.ipRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gateway:</span>
                      <span className="font-mono font-medium">{network.gateway}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Devices:
                      </span>
                      <span className="font-semibold text-primary">{network.devices}</span>
                    </div>
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">Last scan: {network.lastScan}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Networks;

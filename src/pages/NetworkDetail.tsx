import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Monitor, Smartphone, Wifi, Printer, Camera, Thermometer } from "lucide-react";

const NetworkDetail = () => {
  const { id } = useParams();
  
  const [network] = useState({
    id: 1,
    name: "Office Network",
    ssid: "CORP-MAIN-5G",
    ipRange: "192.168.1.0/24",
    gateway: "192.168.1.1",
  });

  const [devices] = useState([
    {
      id: 1,
      name: "MacBook Pro",
      type: "computer",
      ip: "192.168.1.101",
      mac: "A4:83:E7:5F:2B:1C",
      status: "online",
      manufacturer: "Apple Inc.",
      lastSeen: "Active now",
    },
    {
      id: 2,
      name: "iPhone 14",
      type: "mobile",
      ip: "192.168.1.102",
      mac: "C8:89:F3:1D:4E:6A",
      status: "online",
      manufacturer: "Apple Inc.",
      lastSeen: "Active now",
    },
    {
      id: 3,
      name: "Smart Thermostat",
      type: "iot",
      ip: "192.168.1.115",
      mac: "B4:E6:2D:8A:3F:91",
      status: "online",
      manufacturer: "Nest Labs",
      lastSeen: "2 min ago",
    },
    {
      id: 4,
      name: "HP LaserJet",
      type: "printer",
      ip: "192.168.1.120",
      mac: "F0:1F:AF:2C:7D:5B",
      status: "warning",
      manufacturer: "HP Inc.",
      lastSeen: "15 min ago",
    },
    {
      id: 5,
      name: "Security Camera",
      type: "camera",
      ip: "192.168.1.130",
      mac: "D8:0D:17:5E:9A:3C",
      status: "critical",
      manufacturer: "Hikvision",
      lastSeen: "1 hour ago",
    },
    {
      id: 6,
      name: "WiFi Router",
      type: "network",
      ip: "192.168.1.1",
      mac: "E4:8D:8C:A2:F1:7B",
      status: "online",
      manufacturer: "Cisco Systems",
      lastSeen: "Active now",
    },
  ]);

  const getDeviceIcon = (type: string) => {
    const icons = {
      computer: Monitor,
      mobile: Smartphone,
      iot: Thermometer,
      printer: Printer,
      camera: Camera,
      network: Wifi,
    };
    return icons[type as keyof typeof icons] || Monitor;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: { variant: "default" as const, text: "Online", className: "bg-success" },
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
              <Link to="/networks">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{network.name}</h1>
                <p className="text-sm text-muted-foreground">{network.ssid} • {network.ipRange}</p>
              </div>
            </div>
            <Button className="bg-primary hover:opacity-90">
              Scan Network
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="bg-gradient-card shadow-card border-border/50 mb-8">
          <CardHeader>
            <CardTitle>Detected Devices</CardTitle>
            <CardDescription>Click on any device to view details and run security tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => {
                const Icon = getDeviceIcon(device.type);
                return (
                  <Link key={device.id} to={`/networks/${id}/devices/${device.id}`}>
                    <div className="p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow group cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        {getStatusBadge(device.status)}
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{device.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground font-mono">{device.ip}</p>
                        <p className="text-muted-foreground font-mono text-xs">{device.mac}</p>
                        <p className="text-xs text-muted-foreground pt-2">{device.lastSeen}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NetworkDetail;

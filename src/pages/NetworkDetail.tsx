import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Monitor, Smartphone, Wifi, Printer, Camera, Thermometer, Search, ChevronDown } from "lucide-react";

const NetworkDetail = () => {
  const { id } = useParams();
  
  const [network] = useState({
    id: 1,
    name: "Office Network",
    ssid: "CORP-MAIN-5G",
    ipRange: "192.168.1.0/24",
    gateway: "192.168.1.1",
    status: "online",
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
      iconColor: "text-purple-600 bg-purple-50",
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
      iconColor: "text-blue-600 bg-blue-50",
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
      iconColor: "text-teal-600 bg-teal-50",
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
      iconColor: "text-orange-600 bg-orange-50",
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
      iconColor: "text-pink-600 bg-pink-50",
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
      iconColor: "text-indigo-600 bg-indigo-50",
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
      online: { text: "Online", className: "bg-success/10 text-success border-success/20" },
      warning: { text: "Warning", className: "bg-warning/10 text-warning border-warning/20" },
      critical: { text: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50 w-full">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/networks">
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{network.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getStatusBadge(network.status)}
                  <span>•</span>
                  <span>{network.ssid}</span>
                </div>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Scan Network
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-6 py-8">
        {/* Banner */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-accent border border-accent/20">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-accent-foreground mb-2">
                Monitor your IoT devices in real-time
              </h2>
              <p className="text-sm text-accent-foreground/80">
                Run security tests and compliance audits on each device to ensure network safety
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-lg bg-white/60 flex items-center justify-center">
                <Monitor className="w-8 h-8 text-accent-foreground/60" />
              </div>
              <div className="w-16 h-16 rounded-lg bg-white/60 flex items-center justify-center">
                <Camera className="w-8 h-8 text-accent-foreground/60" />
              </div>
              <div className="w-16 h-16 rounded-lg bg-white/60 flex items-center justify-center">
                <Wifi className="w-8 h-8 text-accent-foreground/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <ChevronDown className="w-4 h-4" />
            All device types
          </Button>
          <Button variant="outline" className="gap-2">
            <ChevronDown className="w-4 h-4" />
            All statuses
          </Button>
          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search devices..." 
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Devices Catalog Table */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Your Devices</CardTitle>
            <CardDescription>{devices.length} devices detected on this network</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">IP Address</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Last Seen</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {devices.map((device) => {
                  const Icon = getDeviceIcon(device.type);
                  return (
                    <Link key={device.id} to={`/networks/${id}/devices/${device.id}`}>
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-colors cursor-pointer group">
                        <div className="col-span-3 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${device.iconColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium group-hover:text-primary transition-colors">{device.name}</span>
                        </div>
                        <div className="col-span-3 flex items-center text-muted-foreground text-sm">
                          {device.manufacturer}
                        </div>
                        <div className="col-span-2 flex items-center font-mono text-sm">
                          {device.ip}
                        </div>
                        <div className="col-span-2 flex items-center">
                          {getStatusBadge(device.status)}
                        </div>
                        <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                          {device.lastSeen}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NetworkDetail;

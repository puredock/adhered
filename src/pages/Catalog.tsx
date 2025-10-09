import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Monitor, Smartphone, Wifi, Printer, Camera, Thermometer, Search, ChevronDown, Plus } from "lucide-react";

const Catalog = () => {
  const [devices] = useState([
    {
      id: 1,
      name: "MacBook Pro",
      type: "computer",
      description: "Apple Inc. • macOS Sonoma",
      ip: "192.168.1.101",
      entries: "3 tests",
      source: "Network Scan",
      iconColor: "text-purple-600 bg-purple-50",
    },
    {
      id: 2,
      name: "iPhone 14",
      type: "mobile",
      description: "Apple mobile device",
      ip: "192.168.1.102",
      entries: "2 tests",
      source: "Network Scan",
      iconColor: "text-blue-600 bg-blue-50",
    },
    {
      id: 3,
      name: "Smart Thermostat",
      type: "iot",
      description: "Nest Labs IoT device",
      ip: "192.168.1.115",
      entries: "5 tests",
      source: "Network Scan",
      iconColor: "text-teal-600 bg-teal-50",
    },
    {
      id: 4,
      name: "HP LaserJet",
      type: "printer",
      description: "Network printer device",
      ip: "192.168.1.120",
      entries: "1 test",
      source: "Network Scan",
      iconColor: "text-orange-600 bg-orange-50",
    },
    {
      id: 5,
      name: "Security Camera",
      type: "camera",
      description: "Hikvision surveillance",
      ip: "192.168.1.130",
      entries: "4 tests",
      source: "Network Scan",
      iconColor: "text-pink-600 bg-pink-50",
    },
    {
      id: 6,
      name: "WiFi Router",
      type: "network",
      description: "Cisco Systems gateway",
      ip: "192.168.1.1",
      entries: "6 tests",
      source: "Network Scan",
      iconColor: "text-indigo-600 bg-indigo-50",
    },
    {
      id: 7,
      name: "Smart TV",
      type: "iot",
      description: "Samsung smart television",
      ip: "192.168.1.145",
      entries: "2 tests",
      source: "Network Scan",
      iconColor: "text-cyan-600 bg-cyan-50",
    },
    {
      id: 8,
      name: "Laptop Dell",
      type: "computer",
      description: "Dell Inc. • Windows 11",
      ip: "192.168.1.150",
      entries: "3 tests",
      source: "Network Scan",
      iconColor: "text-emerald-600 bg-emerald-50",
    },
  ]);

  const systemTypes = [
    {
      id: 1,
      name: "Port Scanning",
      description: "Automated port scanning across all devices",
      entries: "18 devices",
      source: "Auto-scan",
      iconColor: "text-yellow-600 bg-yellow-50",
      icon: Activity,
    },
    {
      id: 2,
      name: "Vulnerability Assessment",
      description: "CVE database matching and risk scoring",
      entries: "12 issues",
      source: "Security DB",
      iconColor: "text-red-600 bg-red-50",
      icon: AlertTriangle,
    },
    {
      id: 3,
      name: "Compliance Check",
      description: "Industry standard compliance validation",
      entries: "35 passed",
      source: "Compliance",
      iconColor: "text-green-600 bg-green-50",
      icon: CheckCircle2,
    },
    {
      id: 4,
      name: "Network Monitoring",
      description: "Real-time network traffic analysis",
      entries: "3 networks",
      source: "Monitor",
      iconColor: "text-blue-600 bg-blue-50",
      icon: Activity,
    },
  ];

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

  return (
    <div className="flex-1 min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Manage in GitHub
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1" />
                Add a device type
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-6 space-y-6">
        {/* Info Banner - Mint Green */}
        <div className="p-6 rounded-lg bg-gradient-accent border border-accent/20 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
                  <span className="text-sm">👋</span>
                </div>
                <span className="font-medium text-accent-foreground">System recommends</span>
              </div>
              <h2 className="text-lg font-semibold text-accent-foreground mb-2">
                Set up your device monitoring to track security across your network
              </h2>
              <Button size="sm" className="bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                Set up monitoring
              </Button>
            </div>
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-lg bg-white/60 flex items-center justify-center hover-scale">
                <Monitor className="w-10 h-10 text-accent-foreground/60" />
              </div>
              <div className="w-20 h-20 rounded-lg bg-white/60 flex items-center justify-center hover-scale">
                <Camera className="w-10 h-10 text-accent-foreground/60" />
              </div>
              <div className="w-20 h-20 rounded-lg bg-white/60 flex items-center justify-center hover-scale">
                <Wifi className="w-10 h-10 text-accent-foreground/60" />
              </div>
              <div className="w-20 h-20 rounded-lg bg-white/60 flex items-center justify-center hover-scale">
                <Thermometer className="w-10 h-10 text-accent-foreground/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button variant="outline" className="gap-2">
            <ChevronDown className="w-4 h-4" />
            All categories
          </Button>
          <Button variant="outline" className="gap-2">
            <ChevronDown className="w-4 h-4" />
            All sources
          </Button>
          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search catalog types..." 
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Your Devices Section - Purple Gradient */}
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold mb-4">Your Devices</h2>
          <Card className="shadow-card border-border overflow-hidden">
            <div className="bg-gradient-purple p-6 border-b border-border">
              <CardTitle className="text-base">Network Devices</CardTitle>
              <CardDescription>All IoT and computing devices detected on your networks</CardDescription>
            </div>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Entries</div>
                  <div className="col-span-3">Source</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {devices.map((device, index) => {
                    const Icon = getDeviceIcon(device.type);
                    return (
                      <Link 
                        key={device.id} 
                        to={`/networks/1/devices/${device.id}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="animate-fade-in"
                      >
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-all cursor-pointer group">
                          <div className="col-span-3 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${device.iconColor} group-hover:scale-110 transition-transform`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium group-hover:text-primary transition-colors">{device.name}</span>
                          </div>
                          <div className="col-span-4 flex items-center text-muted-foreground text-sm">
                            {device.description}
                          </div>
                          <div className="col-span-2 flex items-center text-sm">
                            <Badge variant="outline">{device.entries}</Badge>
                          </div>
                          <div className="col-span-3 flex items-center text-sm text-muted-foreground">
                            {device.source}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Types Section - Blue Gradient */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold mb-4">System Types</h2>
          <Card className="shadow-card border-border overflow-hidden">
            <div className="bg-gradient-blue p-6 border-b border-border">
              <CardTitle className="text-base">Security Assessment Types</CardTitle>
              <CardDescription>Automated security testing and compliance validation</CardDescription>
            </div>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Entries</div>
                  <div className="col-span-3">Source</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {systemTypes.map((type, index) => (
                    <div 
                      key={type.id}
                      style={{ animationDelay: `${(index + 8) * 50}ms` }}
                      className="animate-fade-in"
                    >
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-all cursor-pointer group">
                        <div className="col-span-3 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.iconColor} group-hover:scale-110 transition-transform`}>
                            <type.icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium group-hover:text-primary transition-colors">{type.name}</span>
                        </div>
                        <div className="col-span-4 flex items-center text-muted-foreground text-sm">
                          {type.description}
                        </div>
                        <div className="col-span-2 flex items-center text-sm">
                          <Badge variant="outline">{type.entries}</Badge>
                        </div>
                        <div className="col-span-3 flex items-center text-sm text-muted-foreground">
                          {type.source}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Missing imports
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

export default Catalog;

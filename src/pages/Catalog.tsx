import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Camera, ChevronDown, HardDrive, Loader2, Monitor, Plus, Search, Server, Smartphone, Thermometer, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorState } from "@/components/ErrorState";

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.devices.list(),
  });

  const devices = data?.devices || [];

  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devices;

    const query = searchQuery.toLowerCase();
    return devices.filter(device =>
      device.hostname?.toLowerCase().includes(query) ||
      device.ip_address.toLowerCase().includes(query) ||
      device.manufacturer?.toLowerCase().includes(query) ||
      device.model?.toLowerCase().includes(query)
    );
  }, [devices, searchQuery]);
  const systemTypes = [{
    id: 1,
    name: "Port Scanning",
    description: "Automated port scanning across all devices",
    entries: "18 devices",
    source: "Auto-scan",
    iconColor: "text-yellow-600 bg-yellow-50",
    icon: Activity
  }, {
    id: 2,
    name: "Vulnerability Assessment",
    description: "CVE database matching and risk scoring",
    entries: "12 issues",
    source: "Security DB",
    iconColor: "text-red-600 bg-red-50",
    icon: AlertTriangle
  }, {
    id: 3,
    name: "Compliance Check",
    description: "Industry standard compliance validation",
    entries: "35 passed",
    source: "Compliance",
    iconColor: "text-green-600 bg-green-50",
    icon: CheckCircle2
  }, {
    id: 4,
    name: "Network Monitoring",
    description: "Real-time network traffic analysis",
    entries: "3 networks",
    source: "Monitor",
    iconColor: "text-blue-600 bg-blue-50",
    icon: Activity
  }];
  const getDeviceIcon = (type: string) => {
    const icons = {
      medical_device: Monitor,
      iot_device: Thermometer,
      network_device: Wifi,
      workstation: HardDrive,
      server: Server,
      unknown: Monitor
    };
    return icons[type as keyof typeof icons] || Monitor;
  };

  const getIconColor = (index: number) => {
    const colors = [
      "text-purple-600 bg-purple-50",
      "text-blue-600 bg-blue-50",
      "text-teal-600 bg-teal-50",
      "text-orange-600 bg-orange-50",
      "text-pink-600 bg-pink-50",
      "text-indigo-600 bg-indigo-50",
      "text-cyan-600 bg-cyan-50",
      "text-emerald-600 bg-emerald-50"
    ];
    return colors[index % colors.length];
  };
  return <div className="flex-1 min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Devices</h1>
                <p className="text-sm text-muted-foreground">Device types and security assessment categories</p>
              </div>
            </div>
            <div className="flex items-center gap-3">

              <Button size="sm" className="bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                <Plus className="w-4 h-4 mr-1" />
                Add new device
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
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
                placeholder="Search devices..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <div className="col-span-3">Device Name</div>
                  <div className="col-span-4">Details</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-3">IP Address</div>
                </div>

                {/* Table Rows */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <ErrorState 
                    variant="inline" 
                    title="Failed to load devices" 
                    message="Please check your connection and try again"
                    showRetry={false}
                    showBackButton={false}
                  />
                ) : filteredDevices.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No devices found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredDevices.map((device, index) => {
                      const Icon = getDeviceIcon(device.device_type);
                      return <Link key={device.id} to={`/networks/${device.network_id}/devices/${device.id}`} style={{
                        animationDelay: `${index * 50}ms`
                      }} className="animate-fade-in">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 transition-all cursor-pointer group">
                          <div className="col-span-3 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(index)} group-hover:scale-110 transition-transform`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium group-hover:text-primary transition-colors">
                              {device.hostname || device.ip_address}
                            </span>
                          </div>
                          <div className="col-span-4 flex items-center text-muted-foreground text-sm">
                            {device.manufacturer} {device.model && `• ${device.model}`}
                            {device.os && ` • ${device.os}`}
                          </div>
                          <div className="col-span-2 flex items-center text-sm">
                            <Badge variant="outline" className="capitalize">
                              {device.device_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="col-span-3 flex items-center text-sm font-mono text-muted-foreground">
                            {device.ip_address}
                          </div>
                        </div>
                      </Link>;
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Types Section - Blue Gradient */}
        <div className="animate-fade-in" style={{
        animationDelay: "200ms"
      }}>
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
                  {systemTypes.map((type, index) => <div key={type.id} style={{
                  animationDelay: `${(index + 8) * 50}ms`
                }} className="animate-fade-in">
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
                    </div>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
};

// Missing imports
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
export default Catalog;
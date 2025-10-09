import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Network, ArrowLeft, Wifi, Activity, LayoutGrid, List, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Networks = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
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
      iconColor: "text-purple-600 bg-purple-50",
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
      iconColor: "text-orange-600 bg-orange-50",
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
      iconColor: "text-pink-600 bg-pink-50",
    },
  ]);

  const filteredNetworks = useMemo(() => {
    if (!searchQuery.trim()) return networks;
    
    const query = searchQuery.toLowerCase();
    return networks.filter(network => 
      network.name.toLowerCase().includes(query) ||
      network.ssid.toLowerCase().includes(query) ||
      network.ipRange.toLowerCase().includes(query) ||
      network.gateway.toLowerCase().includes(query)
    );
  }, [networks, searchQuery]);

  const getStatusBadge = (status: string) => {
    const variants = {
      secure: { text: "Secure", className: "bg-success/10 text-success border-success/20" },
      warning: { text: "Warning", className: "bg-warning/10 text-warning border-warning/20" },
      critical: { text: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex-1">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Networks</h1>
                <p className="text-sm text-muted-foreground">Manage and monitor your networks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search networks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {filteredNetworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No networks found matching "{searchQuery}"</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNetworks.map((network) => (
              <Link key={network.id} to={`/networks/${network.id}`}>
                <Card className="shadow-card border-border hover:border-primary hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${network.iconColor} group-hover:scale-110 transition-transform`}>
                        <Network className="w-6 h-6" />
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
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">Last scan: {network.lastScan}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Network Name</TableHead>
                  <TableHead>SSID</TableHead>
                  <TableHead>IP Range</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead className="text-center">Devices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Scan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNetworks.map((network) => (
                  <TableRow key={network.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell>
                      <Link to={`/networks/${network.id}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${network.iconColor}`}>
                          <Network className="w-5 h-5" />
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/networks/${network.id}`} className="font-semibold hover:text-primary transition-colors">
                        {network.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Wifi className="w-4 h-4" />
                        <span className="font-mono text-sm">{network.ssid}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{network.ipRange}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{network.gateway}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-primary">{network.devices}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(network.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{network.lastScan}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Networks;

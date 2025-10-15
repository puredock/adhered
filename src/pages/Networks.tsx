import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Activity, LayoutGrid, List, Loader2, Network, Search, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Networks = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["networks"],
    queryFn: () => api.networks.list(),
  });

  const networks = data?.networks || [];

  const filteredNetworks = useMemo(() => {
    if (!searchQuery.trim()) return networks;

    const query = searchQuery.toLowerCase();
    return networks.filter(network =>
      network.name.toLowerCase().includes(query) ||
      network.subnet.toLowerCase().includes(query)
    );
  }, [networks, searchQuery]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { text: "Active", className: "bg-success/10 text-success border-success/20" },
      inactive: { text: "Inactive", className: "bg-warning/10 text-warning border-warning/20" },
      scanning: { text: "Scanning", className: "bg-primary/10 text-primary border-primary/20" },
    };
    const config = variants[status as keyof typeof variants] || variants.active;
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  const getIconColor = (index: number) => {
    const colors = [
      "text-purple-600 bg-purple-50",
      "text-orange-600 bg-orange-50",
      "text-pink-600 bg-pink-50",
      "text-blue-600 bg-blue-50",
      "text-green-600 bg-green-50",
    ];
    return colors[index % colors.length];
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-background flex-1">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <ErrorState
            variant="fullpage"
            title="Failed to load Networks"
            message="Please check your connection and try again."
            backUrl="/"
            backLabel="Go Home"
          />
        ) : filteredNetworks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No networks found matching "{searchQuery}"</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNetworks.map((network, index) => (
              <Link key={network.id} to={`/networks/${network.id}`}>
                <Card className="shadow-card border-border hover:border-primary hover:shadow-lg transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor(index)} group-hover:scale-110 transition-transform`}>
                        <Network className="w-6 h-6" />
                      </div>
                      {getStatusBadge(network.status)}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{network.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      {network.subnet}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subnet:</span>
                        <span className="font-mono font-medium">{network.subnet}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          Devices:
                        </span>
                        <span className="font-semibold text-primary">{network.device_count}</span>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">Last scan: {formatTimeAgo(network.last_scan)}</p>
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
                  <TableHead>Subnet</TableHead>
                  <TableHead className="text-center">Devices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Scan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNetworks.map((network, index) => (
                  <TableRow key={network.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell>
                      <Link to={`/networks/${network.id}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(index)}`}>
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
                      <span className="font-mono text-sm">{network.subnet}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-primary">{network.device_count}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(network.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatTimeAgo(network.last_scan)}</span>
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

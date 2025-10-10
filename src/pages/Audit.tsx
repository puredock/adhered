import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Search, FileCheck, Shield, Building2, Plane, Ship, Train, Truck, Hospital, LayoutGrid, List, Filter } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Audit = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const regulatoryFrameworks = [
    {
      id: "hipaa",
      name: "HIPAA Compliance",
      description: "Health Insurance Portability and Accountability Act - ensures protection of sensitive patient health information",
      category: "Medical",
      icon: Hospital,
      iconColor: "text-red-600 bg-red-50",
      tags: ["Medical", "Healthcare", "Privacy"],
      status: "active",
      lastAudit: "2 days ago"
    },
    {
      id: "iec-62443",
      name: "IEC 62443",
      description: "Industrial automation and control systems security standards for operational technology environments",
      category: "Industrial",
      icon: Building2,
      iconColor: "text-blue-600 bg-blue-50",
      tags: ["Industrial", "Manufacturing", "OT"],
      status: "active",
      lastAudit: "5 days ago"
    },
    {
      id: "do-178c",
      name: "DO-178C",
      description: "Software considerations in airborne systems and equipment certification for aviation safety",
      category: "Aviation",
      icon: Plane,
      iconColor: "text-sky-600 bg-sky-50",
      tags: ["Aviation", "Safety", "Critical Systems"],
      status: "pending",
      lastAudit: "1 week ago"
    },
    {
      id: "nist-csf",
      name: "NIST Cybersecurity Framework",
      description: "Framework for improving critical infrastructure cybersecurity across public and private sectors",
      category: "Public",
      icon: Shield,
      iconColor: "text-purple-600 bg-purple-50",
      tags: ["Public", "Government", "Infrastructure"],
      status: "active",
      lastAudit: "3 days ago"
    },
    {
      id: "imo-msc",
      name: "IMO MSC-FAL.1/Circ.3",
      description: "International Maritime Organization guidelines on maritime cyber risk management",
      category: "Maritime",
      icon: Ship,
      iconColor: "text-cyan-600 bg-cyan-50",
      tags: ["Maritime", "Shipping", "Naval"],
      status: "active",
      lastAudit: "4 days ago"
    },
    {
      id: "en-50159",
      name: "EN 50159",
      description: "Railway applications - Communication, signaling and processing systems security standards",
      category: "Railway",
      icon: Train,
      iconColor: "text-orange-600 bg-orange-50",
      tags: ["Railway", "Transport", "Signaling"],
      status: "pending",
      lastAudit: "6 days ago"
    },
    {
      id: "tapa-fsr",
      name: "TAPA FSR",
      description: "Transported Asset Protection Association Facility Security Requirements for logistics and supply chain",
      category: "Logistics",
      icon: Truck,
      iconColor: "text-green-600 bg-green-50",
      tags: ["Logistics", "Supply Chain", "Security"],
      status: "active",
      lastAudit: "1 day ago"
    },
    {
      id: "nerc-cip",
      name: "NERC CIP",
      description: "North American Electric Reliability Corporation Critical Infrastructure Protection standards",
      category: "Public",
      icon: Shield,
      iconColor: "text-yellow-600 bg-yellow-50",
      tags: ["Public", "Energy", "Critical Infrastructure"],
      status: "active",
      lastAudit: "2 days ago"
    }
  ];

  const allTags = Array.from(new Set(regulatoryFrameworks.flatMap(f => f.tags)));
  const allStatuses = Array.from(new Set(regulatoryFrameworks.map(f => f.status)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredFrameworks = regulatoryFrameworks.filter(framework => {
    const matchesSearch = framework.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      framework.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || framework.tags.some(tag => selectedTags.includes(tag));
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(framework.status);
    return matchesSearch && matchesTags && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: {
        text: "Active",
        className: "bg-success/10 text-success border-success/20"
      },
      pending: {
        text: "Pending Review",
        className: "bg-warning/10 text-warning border-warning/20"
      }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex-1">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Audit & Compliance</h1>
                <p className="text-sm text-muted-foreground">Regulatory frameworks and compliance workflows</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search frameworks..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allStatuses.map(status => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    >
                      {status === "active" ? "Active" : "Pending Review"}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <LayoutGrid className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Frameworks</p>
                  <p className="text-3xl font-bold">{regulatoryFrameworks.filter(f => f.status === "active").length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-primary">
                  <FileCheck className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold">{regulatoryFrameworks.filter(f => f.status === "pending").length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-warning">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Frameworks</p>
                  <p className="text-3xl font-bold">{regulatoryFrameworks.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-accent-foreground">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regulatory Frameworks Grid/List */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Regulatory Frameworks</CardTitle>
            <CardDescription>
              {filteredFrameworks.length} framework{filteredFrameworks.length !== 1 ? 's' : ''} found
              {(selectedTags.length > 0 || selectedStatuses.length > 0) && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSelectedTags([]);
                    setSelectedStatuses([]);
                  }}
                  className="ml-2 h-auto p-0"
                >
                  Clear filters
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFrameworks.map((framework) => (
                  <Link key={framework.id} to={`/audits/${framework.id}`}>
                    <div className="p-5 rounded-lg bg-card border border-border hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${framework.iconColor} group-hover:scale-110 transition-transform`}>
                          <framework.icon className="w-6 h-6" />
                        </div>
                        {getStatusBadge(framework.status)}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {framework.name}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {framework.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {framework.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Last audit: {framework.lastAudit}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFrameworks.map((framework) => (
                  <Link key={framework.id} to={`/audits/${framework.id}`}>
                    <div className="p-4 rounded-lg bg-card border border-border hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${framework.iconColor} group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <framework.icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {framework.name}
                            </h3>
                            {getStatusBadge(framework.status)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {framework.description}
                          </p>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex flex-wrap gap-2">
                              {framework.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                              Last audit: {framework.lastAudit}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Audit;

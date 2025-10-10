import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { ScanLine, Search, Shield, Lock, Bug, FileSearch, LayoutGrid, List, Filter } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Scans = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const pentestingStandards = [
    {
      id: "ptes",
      name: "PTES",
      fullName: "Penetration Testing Execution Standard",
      description: "A comprehensive standard covering all phases of penetration testing from pre-engagement to reporting",
      icon: Shield,
      iconColor: "text-blue-600 bg-blue-50",
      tags: ["Methodology", "Full Coverage", "Documentation"],
      status: "active",
      lastScan: "1 day ago",
      severity: "info"
    },
    {
      id: "owasp-wstg",
      name: "OWASP WSTG",
      fullName: "OWASP Web Security Testing Guide",
      description: "Comprehensive testing guide for web application security vulnerabilities and attack vectors",
      icon: Bug,
      iconColor: "text-red-600 bg-red-50",
      tags: ["Web Security", "Application", "OWASP"],
      status: "active",
      lastScan: "3 hours ago",
      severity: "high"
    },
    {
      id: "owasp-fstg",
      name: "OWASP FSTG",
      fullName: "OWASP Firmware Security Testing Guide",
      description: "Security testing methodology for firmware and embedded systems vulnerabilities",
      icon: Lock,
      iconColor: "text-purple-600 bg-purple-50",
      tags: ["Firmware", "Embedded", "IoT"],
      status: "pending",
      lastScan: "2 days ago",
      severity: "medium"
    },
    {
      id: "nist-800-115",
      name: "NIST SP 800-115",
      fullName: "NIST Technical Guide to Information Security Testing",
      description: "Technical guide to information security testing and assessment methodologies",
      icon: FileSearch,
      iconColor: "text-indigo-600 bg-indigo-50",
      tags: ["Government", "Assessment", "Compliance"],
      status: "active",
      lastScan: "12 hours ago",
      severity: "info"
    },
    {
      id: "osstmm",
      name: "OSSTMM",
      fullName: "Open Source Security Testing Methodology Manual",
      description: "Peer-reviewed methodology for security testing across networks, applications, and physical security",
      icon: Shield,
      iconColor: "text-green-600 bg-green-50",
      tags: ["Open Source", "Comprehensive", "Network"],
      status: "active",
      lastScan: "6 hours ago",
      severity: "low"
    },
    {
      id: "pci-dss",
      name: "PCI DSS Guidance",
      fullName: "Payment Card Industry Data Security Standard",
      description: "Security standards for organizations handling credit card information with penetration testing requirements",
      icon: Lock,
      iconColor: "text-yellow-600 bg-yellow-50",
      tags: ["Payment", "Compliance", "Financial"],
      status: "active",
      lastScan: "8 hours ago",
      severity: "high"
    }
  ];

  const allTags = Array.from(new Set(pentestingStandards.flatMap(s => s.tags)));
  const allStatuses = Array.from(new Set(pentestingStandards.map(s => s.status)));

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

  const filteredStandards = pentestingStandards.filter(standard => {
    const matchesSearch = standard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      standard.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      standard.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || standard.tags.some(tag => selectedTags.includes(tag));
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(standard.status);
    return matchesSearch && matchesTags && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: {
        text: "Active",
        className: "bg-success/10 text-success border-success/20"
      },
      pending: {
        text: "Pending",
        className: "bg-warning/10 text-warning border-warning/20"
      }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: {
        text: "High Priority",
        className: "bg-destructive/10 text-destructive border-destructive/20"
      },
      medium: {
        text: "Medium",
        className: "bg-warning/10 text-warning border-warning/20"
      },
      low: {
        text: "Low",
        className: "bg-success/10 text-success border-success/20"
      },
      info: {
        text: "Info",
        className: "bg-primary/10 text-primary border-primary/20"
      }
    };
    const config = variants[severity as keyof typeof variants];
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
                <ScanLine className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Scans</h1>
                <p className="text-sm text-muted-foreground">Penetration testing standards and security assessments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search standards..."
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
                      {status === "active" ? "Active" : "Pending"}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Scans</p>
                  <p className="text-3xl font-bold">{pentestingStandards.filter(s => s.status === "active").length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-success">
                  <ScanLine className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">High Priority</p>
                  <p className="text-3xl font-bold">{pentestingStandards.filter(s => s.severity === "high").length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-destructive">
                  <Bug className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-3xl font-bold">{pentestingStandards.filter(s => s.status === "pending").length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-warning">
                  <FileSearch className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Standards</p>
                  <p className="text-3xl font-bold">{pentestingStandards.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-primary">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pentesting Standards Grid/List */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Penetration Testing Standards</CardTitle>
            <CardDescription>
              {filteredStandards.length} standard{filteredStandards.length !== 1 ? 's' : ''} found
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
                {filteredStandards.map((standard) => (
                  <Link key={standard.id} to={`/scans/${standard.id}`}>
                    <div className="p-5 rounded-lg bg-card border border-border hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${standard.iconColor} group-hover:scale-110 transition-transform`}>
                          <standard.icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {getStatusBadge(standard.status)}
                          {getSeverityBadge(standard.severity)}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {standard.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">
                        {standard.fullName}
                      </p>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {standard.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {standard.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Last scan: {standard.lastScan}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStandards.map((standard) => (
                  <Link key={standard.id} to={`/scans/${standard.id}`}>
                    <div className="p-4 rounded-lg bg-card border border-border hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${standard.iconColor} group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <standard.icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {standard.name}
                              </h3>
                              <p className="text-xs text-muted-foreground font-medium">
                                {standard.fullName}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-auto">
                              {getStatusBadge(standard.status)}
                              {getSeverityBadge(standard.severity)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {standard.description}
                          </p>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex flex-wrap gap-2">
                              {standard.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                              Last scan: {standard.lastScan}
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

export default Scans;
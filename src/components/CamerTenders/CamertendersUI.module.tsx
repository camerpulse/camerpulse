import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Background,
  Controls,
  MiniMap,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Clock,
  Eye,
  Bookmark,
  Users,
  DollarSign,
  Award,
  TrendingUp,
  Download,
  Share2,
  Bell,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Upload,
  CheckCircle,
  AlertTriangle,
  Star,
  Target,
  Briefcase,
  Settings,
  BarChart3,
  Shield,
  Zap,
  Home,
  Phone,
  Mail,
  Globe,
  Hammer,
  Monitor,
  Stethoscope,
  GraduationCap,
  Wheat,
  Truck,
  Lightbulb,
  Factory
} from 'lucide-react';

// Types
interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'public' | 'private' | 'ngo' | 'international';
  budget: { min: number; max: number; currency: string };
  deadline: string;
  region: string;
  issuer: string;
  status: 'open' | 'evaluation' | 'awarded' | 'closed';
  bidsCount: number;
  viewsCount: number;
  isFeatured: boolean;
  documents: string[];
  eligibility: string;
  evaluation: string;
}

interface TenderNode extends Node {
  data: {
    tender: Tender;
    isSelected?: boolean;
  };
}

// Sample Data
const sampleTenders: Tender[] = [
  {
    id: '1',
    title: 'Construction of Douala Port Extension',
    description: 'Major infrastructure project to expand port capacity and modernize facilities',
    category: 'Construction',
    type: 'public',
    budget: { min: 50000000000, max: 75000000000, currency: 'FCFA' },
    deadline: '2024-03-15',
    region: 'Littoral',
    issuer: 'Douala Port Authority',
    status: 'open',
    bidsCount: 12,
    viewsCount: 458,
    isFeatured: true,
    documents: ['tender_doc.pdf', 'technical_specs.pdf'],
    eligibility: 'Companies with minimum 10 years experience in port construction',
    evaluation: 'Technical capability (40%), Financial proposal (35%), Experience (25%)'
  },
  {
    id: '2',
    title: 'Healthcare Management System',
    description: 'Digital transformation of regional hospital management systems',
    category: 'ICT',
    type: 'public',
    budget: { min: 2500000000, max: 3500000000, currency: 'FCFA' },
    deadline: '2024-02-28',
    region: 'Centre',
    issuer: 'Ministry of Health',
    status: 'open',
    bidsCount: 8,
    viewsCount: 234,
    isFeatured: false,
    documents: ['requirements.pdf'],
    eligibility: 'Certified software development companies',
    evaluation: 'Technical solution (50%), Cost (30%), Timeline (20%)'
  },
  {
    id: '3',
    title: 'Rural Education Infrastructure',
    description: 'Construction and equipment of primary schools in rural areas',
    category: 'Education',
    type: 'ngo',
    budget: { min: 800000000, max: 1200000000, currency: 'FCFA' },
    deadline: '2024-04-10',
    region: 'North',
    issuer: 'UNESCO Cameroon',
    status: 'open',
    bidsCount: 5,
    viewsCount: 167,
    isFeatured: false,
    documents: ['project_brief.pdf', 'site_plans.pdf'],
    eligibility: 'Local construction companies with education sector experience',
    evaluation: 'Experience (40%), Local presence (30%), Cost (30%)'
  }
];

const categories = [
  { name: 'Construction', icon: Hammer, color: 'text-orange-600', count: 45 },
  { name: 'ICT', icon: Monitor, color: 'text-blue-600', count: 28 },
  { name: 'Healthcare', icon: Stethoscope, color: 'text-red-600', count: 19 },
  { name: 'Education', icon: GraduationCap, color: 'text-green-600', count: 15 },
  { name: 'Agriculture', icon: Wheat, color: 'text-yellow-600', count: 22 },
  { name: 'Transport', icon: Truck, color: 'text-purple-600', count: 18 },
  { name: 'Energy', icon: Lightbulb, color: 'text-amber-600', count: 12 },
  { name: 'Manufacturing', icon: Factory, color: 'text-gray-600', count: 8 }
];

// Custom Node Component for Tender Flow
const TenderNode = ({ data }: { data: { tender: Tender; isSelected?: boolean } }) => {
  const { tender, isSelected } = data;
  
  const formatBudget = (budget: Tender['budget']) => {
    const amount = budget.max / 1000000;
    return `${amount.toFixed(0)}M ${budget.currency}`;
  };

  const daysLeft = Math.ceil((new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className={`bg-white rounded-lg border-2 p-4 min-w-[280px] shadow-lg ${
      isSelected ? 'border-primary' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-tight mb-1">{tender.title}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="outline" className="text-xs">{tender.category}</Badge>
            <Badge variant={tender.type === 'public' ? 'default' : 'secondary'} className="text-xs">
              {tender.type.toUpperCase()}
            </Badge>
            {tender.isFeatured && <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>}
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Bookmark className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{tender.region}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span>{formatBudget(tender.budget)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className={daysLeft <= 7 ? 'text-red-600 font-medium' : ''}>
            {daysLeft} days left
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span>{tender.viewsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>{tender.bidsCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      <Button size="sm" className="w-full mt-3 text-xs">
        View Details
      </Button>
    </div>
  );
};

const nodeTypes = {
  tender: TenderNode,
};

// Main CamerTenders UI Component
export const CamertendersUI = () => {
  const [activeView, setActiveView] = useState<'homepage' | 'detail' | 'create'>('homepage');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'flow'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [budgetRange, setBudgetRange] = useState([0, 100000000000]);
  const [createStep, setCreateStep] = useState(1);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Initialize flow nodes
  useEffect(() => {
    if (viewMode === 'flow') {
      const flowNodes: TenderNode[] = sampleTenders.map((tender, index) => ({
        id: tender.id,
        type: 'tender',
        position: { 
          x: (index % 3) * 320 + 50, 
          y: Math.floor(index / 3) * 200 + 50 
        },
        data: { tender, isSelected: selectedTender?.id === tender.id },
        draggable: true,
      }));
      setNodes(flowNodes);
    }
  }, [viewMode, selectedTender, setNodes]);

  const filteredTenders = sampleTenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tender.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || tender.region === selectedRegion;
    const matchesBudget = tender.budget.max >= budgetRange[0] && tender.budget.min <= budgetRange[1];
    
    return matchesSearch && matchesCategory && matchesRegion && matchesBudget;
  });

  const formatBudget = (budget: Tender['budget']) => {
    const formatAmount = (amount: number) => {
      if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
      return amount.toString();
    };

    if (budget.min && budget.max) {
      return `${formatAmount(budget.min)} - ${formatAmount(budget.max)} ${budget.currency}`;
    }
    return `${formatAmount(budget.max)} ${budget.currency}`;
  };

  // CamerTenders Homepage
  const renderHomepage = () => (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">CamerTenders</h1>
            <p className="text-lg mb-6 opacity-90">
              Cameroon's premier tender and bidding platform connecting businesses with opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="secondary" onClick={() => setActiveView('create')}>
                <Plus className="h-4 w-4 mr-2" />
                Post a Tender
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Building2 className="h-4 w-4 mr-2" />
                Register Business
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{sampleTenders.length}</div>
              <div className="text-sm text-muted-foreground">Active Tenders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">1,200+</div>
              <div className="text-sm text-muted-foreground">Businesses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">850+</div>
              <div className="text-sm text-muted-foreground">Awarded</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">45B+</div>
              <div className="text-sm text-muted-foreground">FCFA Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tenders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="Centre">Centre</SelectItem>
                    <SelectItem value="Littoral">Littoral</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Budget Range:</span>
                <div className="w-48">
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    max={100000000000}
                    min={0}
                    step={1000000000}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {(budgetRange[0] / 1000000000).toFixed(0)}B - {(budgetRange[1] / 1000000000).toFixed(0)}B FCFA
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'flow' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('flow')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tender Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                  <div className="text-center">
                    <div className="font-medium text-xs">{category.name}</div>
                    <div className="text-xs text-muted-foreground">{category.count}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tender Listings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Available Tenders</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Set Alerts
              </Button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTenders.map((tender) => (
                <Card key={tender.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                      onClick={() => { setSelectedTender(tender); setActiveView('detail'); }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">{tender.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{tender.category}</Badge>
                          <Badge variant={tender.type === 'public' ? 'default' : 'secondary'}>
                            {tender.type.toUpperCase()}
                          </Badge>
                          {tender.isFeatured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2">
                      {tender.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{tender.region} Region</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatBudget(tender.budget)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{tender.viewsCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{tender.bidsCount} bids</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="h-[600px] border rounded-lg">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50"
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Tender Detail Page
  const renderDetailPage = () => {
    if (!selectedTender) return null;
    
    const daysLeft = Math.ceil((new Date(selectedTender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => setActiveView('homepage')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Tenders
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Summary Banner */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{selectedTender.category}</Badge>
                    <Badge variant={selectedTender.type === 'public' ? 'default' : 'secondary'}>
                      {selectedTender.type.toUpperCase()}
                    </Badge>
                    {selectedTender.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{selectedTender.title}</CardTitle>
                  <CardDescription className="text-base">
                    {selectedTender.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{selectedTender.issuer}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedTender.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatBudget(selectedTender.budget)}</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                  <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedTender.description}
                      </p>
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Timeline</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Submission Deadline:</span>
                              <span className="font-medium">{new Date(selectedTender.deadline).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <Badge variant="outline">{selectedTender.status}</Badge>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Statistics</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Views:</span>
                              <span className="font-medium">{selectedTender.viewsCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bids Submitted:</span>
                              <span className="font-medium">{selectedTender.bidsCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tender Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedTender.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">{doc}</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="eligibility" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Eligibility Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedTender.eligibility}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="evaluation" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Evaluation Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedTender.evaluation}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-6">
                {/* Deadline Alert */}
                <Card>
                  <CardContent className="p-4">
                    <div className={`flex items-center gap-2 ${daysLeft <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                      {daysLeft <= 7 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                      <div>
                        <p className="font-semibold">{daysLeft} days left</p>
                        <p className="text-sm">
                          {daysLeft <= 7 ? 'Deadline approaching!' : 'Still time to prepare'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Button className="w-full">Submit Bid</Button>
                    <Button variant="outline" className="w-full">
                      Contact Publisher
                    </Button>
                    <Button variant="outline" className="w-full">
                      Download All Documents
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tender Creation Wizard
  const renderCreatePage = () => {
    const totalSteps = 6;
    const progressPercentage = (createStep / totalSteps) * 100;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => setActiveView('homepage')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Tenders
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Create New Tender</h1>
              <p className="text-muted-foreground">Step {createStep} of {totalSteps}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </CardContent>
          </Card>

          {/* Step Content */}
          <div className="max-w-2xl mx-auto">
            {createStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tender Basics</CardTitle>
                  <CardDescription>Provide basic information about your tender</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tender Title</label>
                    <Input placeholder="Enter tender title" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Describe your tender project" className="mt-1" />
                  </div>
                </CardContent>
              </Card>
            )}

            {createStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Budget & Timeline</CardTitle>
                  <CardDescription>Set your budget and important dates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Minimum Budget</label>
                      <Input type="number" placeholder="0" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Maximum Budget</label>
                      <Input type="number" placeholder="0" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Submission Deadline</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Region</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="centre">Centre</SelectItem>
                        <SelectItem value="littoral">Littoral</SelectItem>
                        <SelectItem value="north">North</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => setCreateStep(Math.max(1, createStep - 1))}
                disabled={createStep === 1}
              >
                Previous
              </Button>
              <Button 
                onClick={() => {
                  if (createStep === totalSteps) {
                    setActiveView('homepage');
                    setCreateStep(1);
                  } else {
                    setCreateStep(Math.min(totalSteps, createStep + 1));
                  }
                }}
              >
                {createStep === totalSteps ? 'Submit Tender' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  switch (activeView) {
    case 'detail':
      return renderDetailPage();
    case 'create':
      return renderCreatePage();
    default:
      return renderHomepage();
  }
};

export default CamertendersUI;
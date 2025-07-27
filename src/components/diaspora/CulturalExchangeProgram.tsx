import React, { useState } from 'react';
import { Calendar, Globe, Users, Video, MessageCircle, Heart, BookOpen, Music, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface CulturalProgram {
  id: string;
  title: string;
  description: string;
  type: 'virtual' | 'in-person' | 'hybrid';
  category: 'language' | 'cooking' | 'music' | 'storytelling' | 'crafts' | 'festivals';
  startDate: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  instructor: string;
  instructorLocation: string;
  requirements: string[];
  language: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationFee: number;
  imageUrl: string;
}

interface ExchangePartnership {
  id: string;
  partnerName: string;
  partnerLocation: string;
  partnerType: 'school' | 'cultural_center' | 'community_group' | 'university';
  exchangeType: 'student' | 'professional' | 'cultural' | 'mentorship';
  duration: string;
  participants: number;
  status: 'active' | 'planning' | 'completed';
  nextEvent: string;
  established: string;
  description: string;
  achievements: string[];
}

const SAMPLE_PROGRAMS: CulturalProgram[] = [
  {
    id: '1',
    title: 'Traditional Bamileke Cooking Masterclass',
    description: 'Learn to cook authentic Cameroonian dishes from grandmothers in the village, connected via video call',
    type: 'virtual',
    category: 'cooking',
    startDate: '2025-02-15',
    duration: '2 hours',
    participants: 24,
    maxParticipants: 30,
    instructor: 'Mama Rose Fotso',
    instructorLocation: 'Bafoussam, Cameroon',
    requirements: ['Basic cooking skills', 'Kitchen access', 'Ingredient list provided'],
    language: 'French/English',
    skillLevel: 'beginner',
    status: 'upcoming',
    registrationFee: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1556909114-3a5c82c2a0b2?w=800'
  },
  {
    id: '2',
    title: 'Duala Language Exchange Sessions',
    description: 'Weekly conversation practice with native speakers from Douala and diaspora learners',
    type: 'virtual',
    category: 'language',
    startDate: '2025-01-20',
    duration: '1.5 hours weekly',
    participants: 45,
    maxParticipants: 50,
    instructor: 'Prof. Jean-Claude Mbarga',
    instructorLocation: 'University of Douala',
    requirements: ['Zoom access', 'Basic French knowledge helpful'],
    language: 'Duala/French',
    skillLevel: 'beginner',
    status: 'ongoing',
    registrationFee: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'
  },
  {
    id: '3',
    title: 'Village Storytelling & Oral History',
    description: 'Elders share traditional stories while diaspora youth help preserve them digitally',
    type: 'hybrid',
    category: 'storytelling',
    startDate: '2025-03-01',
    duration: '3 hours monthly',
    participants: 18,
    maxParticipants: 25,
    instructor: 'Chief Samuel Nkomo',
    instructorLocation: 'Yaoundé',
    requirements: ['Recording device', 'Cultural respect', 'Patience'],
    language: 'Multiple local languages',
    skillLevel: 'beginner',
    status: 'upcoming',
    registrationFee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800'
  }
];

const SAMPLE_PARTNERSHIPS: ExchangePartnership[] = [
  {
    id: '1',
    partnerName: 'Sorbonne University African Studies Dept.',
    partnerLocation: 'Paris, France',
    partnerType: 'university',
    exchangeType: 'student',
    duration: '6 months',
    participants: 12,
    status: 'active',
    nextEvent: '2025-02-10',
    established: '2023',
    description: 'Student exchange program focusing on African linguistics and cultural preservation',
    achievements: ['25 students exchanged', '3 research papers published', 'Digital archive created']
  },
  {
    id: '2',
    partnerName: 'Montreal Cameroon Cultural Association',
    partnerLocation: 'Montreal, Canada',
    partnerType: 'cultural_center',
    exchangeType: 'cultural',
    duration: 'Ongoing',
    participants: 35,
    status: 'active',
    nextEvent: '2025-01-25',
    established: '2022',
    description: 'Regular cultural events, festivals, and youth mentorship programs',
    achievements: ['Monthly festivals', '50+ youth mentored', 'Community garden established']
  },
  {
    id: '3',
    partnerName: 'Howard University African Diaspora Center',
    partnerLocation: 'Washington D.C., USA',
    partnerType: 'university',
    exchangeType: 'professional',
    duration: '2 years',
    participants: 8,
    status: 'planning',
    nextEvent: '2025-03-15',
    established: '2024',
    description: 'Professional development and entrepreneurship mentorship program',
    achievements: ['Program launch preparation', 'Mentorship guidelines established']
  }
];

export const CulturalExchangeProgram: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [newProgramForm, setNewProgramForm] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    duration: '',
    maxParticipants: '',
    requirements: '',
    skillLevel: ''
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cooking': return <Utensils className="h-4 w-4" />;
      case 'language': return <MessageCircle className="h-4 w-4" />;
      case 'music': return <Music className="h-4 w-4" />;
      case 'storytelling': return <BookOpen className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6" />
            Cultural Exchange Program
          </CardTitle>
          <p className="text-muted-foreground">
            Bridge cultures, share traditions, and strengthen connections between villages and diaspora communities worldwide
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">47</div>
              <div className="text-sm text-muted-foreground">Active Programs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">312</div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">23</div>
              <div className="text-sm text-muted-foreground">Partner Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="programs">Cultural Programs</TabsTrigger>
          <TabsTrigger value="partnerships">Exchange Partnerships</TabsTrigger>
          <TabsTrigger value="calendar">Event Calendar</TabsTrigger>
          <TabsTrigger value="create">Create Program</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-6">
          {/* Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cooking">Cooking</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="crafts">Crafts</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Skill Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="w-full">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SAMPLE_PROGRAMS.map((program) => (
              <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className={getStatusColor(program.status)}>
                      {program.status.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {program.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    {getCategoryIcon(program.category)}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{program.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {program.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(program.startDate).toLocaleDateString()} • {program.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{program.instructor} • {program.instructorLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{program.language} • {program.skillLevel}</span>
                      </div>
                    </div>

                    {/* Participation Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participants</span>
                        <span>{program.participants}/{program.maxParticipants}</span>
                      </div>
                      <Progress 
                        value={(program.participants / program.maxParticipants) * 100} 
                        className="h-2"
                      />
                    </div>

                    <Separator />

                    {/* Pricing and Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        {program.registrationFee > 0 ? (
                          <div className="text-lg font-bold text-green-600">
                            {new Intl.NumberFormat('fr-CM', {
                              style: 'currency',
                              currency: 'XAF',
                              minimumFractionDigits: 0
                            }).format(program.registrationFee)}
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-green-600">FREE</div>
                        )}
                        <div className="text-xs text-muted-foreground">Registration Fee</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedProgram(program.id);
                            setShowRegistrationForm(true);
                          }}
                          disabled={program.participants >= program.maxParticipants}
                        >
                          Register
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SAMPLE_PARTNERSHIPS.map((partnership) => (
              <Card key={partnership.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{partnership.partnerName}</CardTitle>
                      <p className="text-muted-foreground text-sm">{partnership.partnerLocation}</p>
                    </div>
                    <Badge variant={partnership.status === 'active' ? 'default' : 'secondary'}>
                      {partnership.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{partnership.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">{partnership.exchangeType}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">{partnership.duration}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Participants:</span>
                      <div className="font-medium">{partnership.participants}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Established:</span>
                      <div className="font-medium">{partnership.established}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Key Achievements:</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {partnership.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Next Event: </span>
                      <span className="font-medium">{new Date(partnership.nextEvent).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Join Exchange</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Cultural Events</CardTitle>
              <p className="text-muted-foreground">View and join scheduled cultural exchange activities</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SAMPLE_PROGRAMS.slice(0, 3).map((program) => (
                  <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{new Date(program.startDate).getDate()}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(program.startDate).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{program.title}</h4>
                        <p className="text-sm text-muted-foreground">{program.duration} • {program.instructor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{program.participants} joined</Badge>
                      <Button size="sm">Join</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Cultural Program</CardTitle>
              <p className="text-muted-foreground">Share your cultural knowledge with the community</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Program Title</Label>
                  <Input 
                    id="title" 
                    value={newProgramForm.title}
                    onChange={(e) => setNewProgramForm({...newProgramForm, title: e.target.value})}
                    placeholder="e.g., Traditional Dance Workshop"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newProgramForm.category}
                    onValueChange={(value) => setNewProgramForm({...newProgramForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cooking">Cooking</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                      <SelectItem value="crafts">Crafts</SelectItem>
                      <SelectItem value="festivals">Festivals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={newProgramForm.description}
                  onChange={(e) => setNewProgramForm({...newProgramForm, description: e.target.value})}
                  placeholder="Describe what participants will learn and experience"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Program Type</Label>
                  <Select 
                    value={newProgramForm.type}
                    onValueChange={(value) => setNewProgramForm({...newProgramForm, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration"
                    value={newProgramForm.duration}
                    onChange={(e) => setNewProgramForm({...newProgramForm, duration: e.target.value})}
                    placeholder="e.g., 2 hours, 4 weeks"
                  />
                </div>
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input 
                    id="maxParticipants"
                    type="number"
                    value={newProgramForm.maxParticipants}
                    onChange={(e) => setNewProgramForm({...newProgramForm, maxParticipants: e.target.value})}
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea 
                  id="requirements"
                  value={newProgramForm.requirements}
                  onChange={(e) => setNewProgramForm({...newProgramForm, requirements: e.target.value})}
                  placeholder="List any materials, skills, or equipment needed"
                  rows={2}
                />
              </div>

              <div className="flex justify-end">
                <Button className="px-8">Create Program</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
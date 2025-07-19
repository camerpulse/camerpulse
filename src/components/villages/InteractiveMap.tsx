import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Layers, ZoomIn } from 'lucide-react';
import cameroonMapIllustration from '../../assets/cameroon-map-illustration.jpg';

export const InteractiveMap: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null);

  const regions = [
    { name: 'Adamawa', villageCount: 45, color: 'bg-red-200' },
    { name: 'Centre', villageCount: 78, color: 'bg-blue-200' },
    { name: 'East', villageCount: 32, color: 'bg-green-200' },
    { name: 'Far North', villageCount: 89, color: 'bg-yellow-200' },
    { name: 'Littoral', villageCount: 56, color: 'bg-cyan-200' },
    { name: 'North', villageCount: 67, color: 'bg-orange-200' },
    { name: 'Northwest', villageCount: 123, color: 'bg-purple-200' },
    { name: 'South', villageCount: 43, color: 'bg-pink-200' },
    { name: 'Southwest', villageCount: 87, color: 'bg-indigo-200' },
    { name: 'West', villageCount: 98, color: 'bg-emerald-200' },
  ];

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🗺️ Interactive Map of Cameroon</h2>
        <p className="text-muted-foreground">
          Explore villages by region, division, and subdivision
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search villages, regions, or divisions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Display */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 min-h-[400px]">
            <img 
              src={cameroonMapIllustration} 
              alt="Interactive map of Cameroon" 
              className="w-full h-full object-contain rounded-lg"
            />
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" variant="outline" className="bg-white">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="bg-white">
                <Layers className="w-4 h-4" />
              </Button>
            </div>

            {/* Region Highlights */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Click on regions to explore villages</div>
                <div className="flex flex-wrap gap-1">
                  {regions.slice(0, 5).map((region) => (
                    <button
                      key={region.name}
                      onClick={() => setSelectedRegion(region.name)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedRegion === region.name
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {region.name} ({region.villageCount})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Region List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Regions & Villages</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {regions.map((region) => (
              <div
                key={region.name}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRegion === region.name
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedRegion(region.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${region.color.replace('200', '400')}`}></div>
                    <span className="font-medium">{region.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {region.villageCount} villages
                  </div>
                </div>
                
                {selectedRegion === region.name && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• View all villages in {region.name}</div>
                      <div>• Active petitions: 12</div>
                      <div>• Development projects: 45</div>
                    </div>
                    <Button size="sm" className="mt-2 w-full">
                      <MapPin className="w-3 h-3 mr-1" />
                      Explore {region.name}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Verified Villages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span>Active Petitions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Development Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Conflict Areas</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
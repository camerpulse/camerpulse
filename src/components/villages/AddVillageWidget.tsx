import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Camera, Upload, Clock } from 'lucide-react';

export const AddVillageWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Plus className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Add Your Village
          </h3>
          <p className="text-gray-600 mb-6">
            Is your village not listed yet? Add it now and preserve its legacy forever.
          </p>
        </div>

        {!isExpanded ? (
          <Button 
            onClick={() => setIsExpanded(true)}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Adding My Village
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Quick Form */}
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Village Name *
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter village name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region *
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                  <option value="">Select Region</option>
                  <option value="Adamawa">Adamawa</option>
                  <option value="Centre">Centre</option>
                  <option value="East">East</option>
                  <option value="Far North">Far North</option>
                  <option value="Littoral">Littoral</option>
                  <option value="North">North</option>
                  <option value="Northwest">Northwest</option>
                  <option value="South">South</option>
                  <option value="Southwest">Southwest</option>
                  <option value="West">West</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division *
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter division"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subdivision
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter subdivision"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description (Optional)
              </label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows={3}
                placeholder="Brief description of your village's history, culture, or significance..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chief/Traditional Leader Name (Optional)
              </label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Name of current chief, fon, or traditional leader"
              />
            </div>

            {/* Photo Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Add a photo of your village (Optional)
              </p>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Choose Photo
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                Submit for Review
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsExpanded(false)}
                size="lg"
              >
                Cancel
              </Button>
            </div>

            {/* Status Note */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Submitted entries go to moderation and are typically reviewed within 24-48 hours.</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
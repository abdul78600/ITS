import React, { useState, useRef } from 'react';
import { Save, AlertCircle, X, Package, Box, Info, Hash, PenTool as Tool, User, Building2, Calendar, MapPin, Camera, Video, Upload, Image, ClipboardCheck, Tag, FileText, Cpu, Store, DollarSign, CalendarCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Asset } from '../types';

interface AssetFormProps {
  onClose: () => void;
  onSubmit: (asset: Asset) => void;
}

interface AssigneeInfo {
  name: string;
  department: string;
  assignedAt: string;
}

interface Specifications {
  [key: string]: string;
}

export function AssetForm({ onClose, onSubmit }: AssetFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Asset>>({
    category: '',
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    status: 'active',
    condition: 'new',
    location: '',
    department: user?.department || '',
    specifications: {},
    notes: '',
    vendor: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiration: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [typeOptions, setTypeOptions] = useState<{ name: string; attributes: string[] }[]>([]);
  const [assignee, setAssignee] = useState<AssigneeInfo>({
    name: '',
    department: '',
    assignedAt: new Date().toISOString().split('T')[0]
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const getTypeOptions = (category: string) => {
    switch (category.toLowerCase()) {
      case 'laptop':
        return [
          { name: 'Business', attributes: ['Processor', 'RAM', 'Storage'] },
          { name: 'Gaming', attributes: ['GPU', 'Processor', 'RAM', 'Storage'] },
          { name: 'Ultrabook', attributes: ['Processor', 'RAM', 'Storage', 'Weight'] },
          { name: 'Workstation', attributes: ['Processor', 'RAM', 'Storage', 'GPU'] },
          { name: 'Convertible', attributes: ['Processor', 'RAM', 'Storage', 'Touchscreen'] }
        ];
      case 'desktop':
        return [
          { name: 'Workstation', attributes: ['Processor', 'RAM', 'Storage', 'GPU'] },
          { name: 'Gaming PC', attributes: ['GPU', 'Processor', 'RAM', 'Storage'] },
          { name: 'All-in-One', attributes: ['Processor', 'RAM', 'Storage', 'Screen Size'] },
          { name: 'Mini PC', attributes: ['Processor', 'RAM', 'Storage', 'Size'] },
          { name: 'Tower', attributes: ['Processor', 'RAM', 'Storage', 'Expandability'] }
        ];
      case 'mobile':
        return [
          { name: 'Smartphone', attributes: ['OS', 'Screen Size', 'Storage', 'RAM'] },
          { name: 'Tablet', attributes: ['OS', 'Screen Size', 'Storage', 'RAM'] },
          { name: 'Rugged Device', attributes: ['OS', 'Screen Size', 'Storage', 'Protection Rating'] }
        ];
      case 'printer':
        return [
          { name: 'Laser', attributes: ['Print Speed', 'Resolution', 'Network Connectivity', 'Paper Size'] },
          { name: 'InkJet', attributes: ['Print Speed', 'Resolution', 'Network Connectivity', 'Paper Size'] },
          { name: 'Multifunction', attributes: ['Print Speed', 'Scan Resolution', 'Network Connectivity', 'Features'] },
          { name: 'Label Printer', attributes: ['Print Speed', 'Resolution', 'Label Size', 'Connectivity'] }
        ];
      case 'network':
        return [
          { name: 'Switch', attributes: ['Ports', 'Speed', 'Management', 'PoE Support'] },
          { name: 'Router', attributes: ['Ports', 'Wireless Standards', 'Throughput', 'Features'] },
          { name: 'Access Point', attributes: ['Wi-Fi Standard', 'Frequency Bands', 'Max Clients', 'Features'] },
          { name: 'Firewall', attributes: ['Throughput', 'Ports', 'VPN Support', 'Features'] }
        ];
      case 'server':
        return [
          { name: 'Rack Server', attributes: ['Processors', 'RAM', 'Storage', 'Form Factor'] },
          { name: 'Tower Server', attributes: ['Processors', 'RAM', 'Storage', 'Expansion Slots'] },
          { name: 'Blade Server', attributes: ['Processors', 'RAM', 'Storage', 'Power Consumption'] },
          { name: 'Virtual Server', attributes: ['vCPUs', 'RAM', 'Storage', 'Host System'] }
        ];
      case 'storage':
        return [
          { name: 'NAS', attributes: ['Capacity', 'Drive Bays', 'RAID Support', 'Network Speed'] },
          { name: 'SAN', attributes: ['Capacity', 'IOPS', 'Connectivity', 'RAID Level'] },
          { name: 'External Drive', attributes: ['Capacity', 'Interface', 'Speed', 'Form Factor'] },
          { name: 'Tape Drive', attributes: ['Capacity', 'Transfer Speed', 'Media Type', 'Interface'] }
        ];
      case 'camera':
        return [
          { name: 'IP Camera', attributes: ['Resolution', 'Field of View', 'Night Vision', 'Weather Rating'] },
          { name: 'PTZ Camera', attributes: ['Resolution', 'Zoom', 'Pan/Tilt Range', 'Weather Rating'] },
          { name: 'Dome Camera', attributes: ['Resolution', 'Field of View', 'Night Vision', 'Vandal Proof'] },
          { name: 'Bullet Camera', attributes: ['Resolution', 'Range', 'Night Vision', 'Weather Rating'] }
        ];
      case 'nvr':
        return [
          { name: 'Standard NVR', attributes: ['Channel Count', 'Storage Capacity', 'Resolution Support', 'Network Interface'] },
          { name: 'Enterprise NVR', attributes: ['Channel Count', 'Storage Capacity', 'RAID Support', 'Redundancy'] },
          { name: 'Embedded NVR', attributes: ['Channel Count', 'Storage Capacity', 'PoE Ports', 'Features'] }
        ];
      case 'dvr':
        return [
          { name: 'Standard DVR', attributes: ['Channel Count', 'Storage Capacity', 'Resolution Support', 'Audio Channels'] },
          { name: 'Hybrid DVR', attributes: ['Analog Channels', 'IP Channels', 'Storage Capacity', 'Features'] },
          { name: 'Mobile DVR', attributes: ['Channel Count', 'Storage Capacity', 'GPS Support', 'Vehicle Integration'] }
        ];
      case 'security':
        return [
          { name: 'Access Control', attributes: ['Reader Type', 'User Capacity', 'Interface', 'Features'] },
          { name: 'Alarm System', attributes: ['Zones', 'Sensor Types', 'Communication', 'Battery Backup'] },
          { name: 'Intercom', attributes: ['Type', 'Display', 'Audio Quality', 'Integration'] },
          { name: 'Motion Sensor', attributes: ['Range', 'Detection Type', 'False Alarm Prevention', 'Weather Rating'] }
        ];
      case 'ipphone':
        return [
          { name: 'Executive Phone', attributes: ['Display Type', 'Lines Supported', 'PoE Support', 'Conference Features'] },
          { name: 'Standard Desk Phone', attributes: ['Display Type', 'Lines Supported', 'PoE Support', 'Basic Features'] },
          { name: 'Conference Phone', attributes: ['Microphone Range', 'Speaker Quality', 'Connectivity', 'Conference Features'] },
          { name: 'Receptionist Phone', attributes: ['Display Type', 'Extension Support', 'BLF Keys', 'Console Support'] },
          { name: 'Wireless IP Phone', attributes: ['Battery Life', 'Range', 'Display Type', 'DECT/WiFi'] }
        ];
      case 'gateway':
        return [
          { name: 'VoIP Gateway', attributes: ['FXS Ports', 'FXO Ports', 'Protocols Supported', 'Concurrent Calls'] },
          { name: 'Media Gateway', attributes: ['Channel Capacity', 'Transcoding Support', 'Protocol Support', 'Redundancy'] },
          { name: 'Access Gateway', attributes: ['Port Types', 'Throughput', 'Protocol Support', 'Security Features'] },
          { name: 'Enterprise Gateway', attributes: ['Capacity', 'Interfaces', 'Redundancy', 'Management Features'] }
        ];
      default:
        return [];
    }
  };

  const generateAssetName = (category: string, type: string) => {
    if (!category) return '';
    const prefix = category.toUpperCase().slice(0, 3);
    const typeCode = type ? `-${type.replace(/\s+/g, '').slice(0, 3).toUpperCase()}` : '';
    return `${prefix}${typeCode}`;
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    const types = getTypeOptions(category);
    setTypeOptions(types);
    
    setFormData(prev => ({
      ...prev,
      category,
      type: '',
      name: generateAssetName(category, ''),
      specifications: {}
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    const selectedType = typeOptions.find(option => option.name === type);
    const specifications = selectedType?.attributes.reduce((acc, attr) => ({ ...acc, [attr]: '' }), {});
    
    setFormData(prev => ({
      ...prev,
      type,
      name: generateAssetName(prev.category || '', type),
      specifications: specifications || {}
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.category || !formData.type) {
        setError('Please fill in all required fields');
        return;
      }

      // Add any additional validation here

      // Call the onSubmit prop with the form data
      onSubmit(formData as Asset);
      
      // Close the form
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the asset');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Package className="h-5 w-5 text-gray-700" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Box className="h-4 w-4" />
                Category *
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile Device</option>
                <option value="printer">Printer</option>
                <option value="network">Network Equipment</option>
                <option value="server">Server</option>
                <option value="storage">Storage Device</option>
                <option value="camera">Camera</option>
                <option value="nvr">NVR</option>
                <option value="dvr">DVR</option>
                <option value="security">Security Equipment</option>
                <option value="ipphone">IP Phone</option>
                <option value="gateway">Gateway</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Info className="h-4 w-4" />
                Type *
              </label>
              <select
                value={formData.type}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-blue-500"
                required
                disabled={!formData.category}
              >
                <option value="">Select Type</option>
                {typeOptions.map(type => (
                  <option key={type.name} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Tool className="h-4 w-4" />
                Brand *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-blue-500"
                placeholder="Enter brand name"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Info className="h-4 w-4" />
                Model *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-blue-500"
                placeholder="Enter model number"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Hash className="h-4 w-4" />
                Serial Number *
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-blue-500"
                placeholder="Enter serial number"
                required
              />
            </div>

            {formData.category && formData.type && (
              <div className="col-span-2 space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="flex items-center gap-2 font-medium text-gray-900">
                  <Cpu className="h-4 w-4" />
                  Specifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(formData.specifications || {}).map(attr => (
                    <div key={attr}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{attr}</label>
                      <input
                        type="text"
                        placeholder={`Enter ${attr}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={formData.specifications?.[attr] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          specifications: {
                            ...prev.specifications,
                            [attr]: e.target.value
                          }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}



            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200"
          >
            <Save className="h-5 w-5" />
            Save Asset
          </button>
        </div>
      </form>
    </div>
  );
}
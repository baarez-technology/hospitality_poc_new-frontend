import { useState, useEffect } from 'react';
import {
  Wrench,
  Zap,
  Droplets,
  Wind,
  Hammer,
  Flame,
  MonitorSmartphone,
  Waves,
  Settings,
  Wifi,
  Search,
  Save,
  X,
  Check,
  ChevronDown,
  Users,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui2/Button';
import { Badge } from '../../components/ui2/Badge';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../lib/api';

interface Technician {
  id: number;
  name: string;
  specialty: string;
  secondary_specialties?: string;
  active_tasks: number;
  is_available: boolean;
  phone?: string;
}

interface SpecializationInfo {
  key: string;
  label: string;
  description: string;
  icon: any;
  color: string;
}

const SPECIALIZATIONS: SpecializationInfo[] = [
  { key: 'electrical', label: 'Electrical', description: 'Electrical systems, wiring, lighting', icon: Zap, color: 'gold' },
  { key: 'plumbing', label: 'Plumbing', description: 'Plumbing, pipes, water systems', icon: Droplets, color: 'ocean' },
  { key: 'hvac', label: 'HVAC', description: 'Heating, ventilation, air conditioning', icon: Wind, color: 'sage' },
  { key: 'carpentry', label: 'Carpentry', description: 'Woodwork, furniture, doors', icon: Hammer, color: 'copper' },
  { key: 'appliance', label: 'Appliance', description: 'Appliance repair and maintenance', icon: Settings, color: 'neutral' },
  { key: 'fire_safety', label: 'Fire Safety', description: 'Fire alarms, sprinklers, extinguishers', icon: Flame, color: 'rose' },
  { key: 'elevator', label: 'Elevator', description: 'Elevator maintenance and repair', icon: MonitorSmartphone, color: 'terra' },
  { key: 'pool', label: 'Pool & Spa', description: 'Pool and spa equipment', icon: Waves, color: 'ocean' },
  { key: 'general', label: 'General', description: 'General maintenance tasks', icon: Wrench, color: 'neutral' },
  { key: 'it_network', label: 'IT/Network', description: 'IT, WiFi, network equipment', icon: Wifi, color: 'terra' }
];

const getSpecInfo = (key: string): SpecializationInfo => {
  return SPECIALIZATIONS.find(s => s.key === key) || SPECIALIZATIONS.find(s => s.key === 'general')!;
};

const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    gold: 'bg-gold-100 text-gold-700 border-gold-200',
    ocean: 'bg-ocean-100 text-ocean-700 border-ocean-200',
    sage: 'bg-sage-100 text-sage-700 border-sage-200',
    copper: 'bg-copper-100 text-copper-700 border-copper-200',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    terra: 'bg-terra-100 text-terra-700 border-terra-200'
  };
  return colors[color] || colors.neutral;
};

export default function TechnicianSpecializations() {
  const { showToast } = useToast();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [editingTech, setEditingTech] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ specialty: '', secondary: [] as string[] });

  const fetchTechnicians = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/maintenance/technicians/availability-status');
      const allTechs = [...(res.data.available_technicians || []), ...(res.data.busy_technicians || [])];

      // Get full details for each technician
      const techDetails = await Promise.all(
        allTechs.map(async (t: any) => {
          try {
            const detailRes = await api.get(`/staff/${t.id}`);
            return {
              id: t.id,
              name: t.name,
              specialty: t.specialty || detailRes.data.specialty || 'general',
              secondary_specialties: detailRes.data.secondary_specialties,
              active_tasks: t.active_tasks || 0,
              is_available: res.data.available_technicians?.some((at: any) => at.id === t.id) || false,
              phone: detailRes.data.phone
            };
          } catch {
            return {
              id: t.id,
              name: t.name,
              specialty: t.specialty || 'general',
              secondary_specialties: '',
              active_tasks: t.active_tasks || 0,
              is_available: res.data.available_technicians?.some((at: any) => at.id === t.id) || false
            };
          }
        })
      );

      setTechnicians(techDetails);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
      showToast('Failed to load technicians', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleEditStart = (tech: Technician) => {
    setEditingTech(tech.id);
    setEditForm({
      specialty: tech.specialty,
      secondary: tech.secondary_specialties?.split(',').filter(s => s) || []
    });
  };

  const handleEditSave = async (techId: number) => {
    try {
      await api.put(`/maintenance/technicians/${techId}/specialization`, {
        specialty: editForm.specialty,
        secondary_specialties: editForm.secondary
      });
      showToast('Specialization updated successfully', 'success');
      setEditingTech(null);
      fetchTechnicians();
    } catch (err) {
      console.error('Failed to update specialization:', err);
      showToast('Failed to update specialization', 'error');
    }
  };

  const handleEditCancel = () => {
    setEditingTech(null);
    setEditForm({ specialty: '', secondary: [] });
  };

  const toggleSecondary = (spec: string) => {
    if (spec === editForm.specialty) return; // Can't be both primary and secondary
    setEditForm(prev => ({
      ...prev,
      secondary: prev.secondary.includes(spec)
        ? prev.secondary.filter(s => s !== spec)
        : [...prev.secondary, spec]
    }));
  };

  // Filter technicians
  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterSpecialty === 'all' || tech.specialty === filterSpecialty;
    return matchesSearch && matchesFilter;
  });

  // Group by specialty for overview
  const specialtyCounts = SPECIALIZATIONS.map(spec => ({
    ...spec,
    count: technicians.filter(t => t.specialty === spec.key).length,
    available: technicians.filter(t => t.specialty === spec.key && t.is_available).length
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Technician Specializations</h1>
          <p className="text-neutral-600 mt-1">
            Manage maintenance technician skills and specialties
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={fetchTechnicians}>
          Refresh
        </Button>
      </div>

      {/* Specialty Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {specialtyCounts.map(spec => {
          const Icon = spec.icon;
          return (
            <button
              key={spec.key}
              onClick={() => setFilterSpecialty(filterSpecialty === spec.key ? 'all' : spec.key)}
              className={`p-4 rounded-xl border transition-all ${
                filterSpecialty === spec.key
                  ? 'border-terra-400 bg-terra-50 ring-2 ring-terra-200'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${getColorClasses(spec.color)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-medium text-neutral-900 text-sm">{spec.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-neutral-900">{spec.count}</span>
                <span className="text-xs text-neutral-500">
                  ({spec.available} free)
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technicians..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
          />
        </div>

        {filterSpecialty !== 'all' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterSpecialty('all')}
          >
            Clear Filter
          </Button>
        )}

        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Users className="w-4 h-4" />
          {filteredTechnicians.length} technician{filteredTechnicians.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Technicians List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No technicians found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredTechnicians.map(tech => {
              const specInfo = getSpecInfo(tech.specialty);
              const Icon = specInfo.icon;
              const isEditing = editingTech === tech.id;

              return (
                <div key={tech.id} className="p-4 hover:bg-neutral-50/50 transition-colors">
                  {isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-700">
                            {tech.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">{tech.name}</p>
                            <p className="text-xs text-neutral-500">Editing specialization</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={X}
                            onClick={handleEditCancel}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Save}
                            onClick={() => handleEditSave(tech.id)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>

                      {/* Primary Specialty Selection */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Primary Specialty
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SPECIALIZATIONS.map(spec => {
                            const SpecIcon = spec.icon;
                            const isSelected = editForm.specialty === spec.key;
                            return (
                              <button
                                key={spec.key}
                                onClick={() => setEditForm(prev => ({
                                  ...prev,
                                  specialty: spec.key,
                                  secondary: prev.secondary.filter(s => s !== spec.key)
                                }))}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                  isSelected
                                    ? 'bg-terra-50 border-terra-400 text-terra-700'
                                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                                }`}
                              >
                                <SpecIcon className="w-4 h-4" />
                                <span className="text-sm">{spec.label}</span>
                                {isSelected && <Check className="w-4 h-4" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Secondary Specialties */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Secondary Specialties (optional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SPECIALIZATIONS.filter(s => s.key !== editForm.specialty).map(spec => {
                            const SpecIcon = spec.icon;
                            const isSelected = editForm.secondary.includes(spec.key);
                            return (
                              <button
                                key={spec.key}
                                onClick={() => toggleSecondary(spec.key)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                  isSelected
                                    ? 'bg-ocean-50 border-ocean-300 text-ocean-700'
                                    : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                                }`}
                              >
                                <SpecIcon className="w-4 h-4" />
                                <span className="text-sm">{spec.label}</span>
                                {isSelected && <Check className="w-4 h-4" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(specInfo.color)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-neutral-900">{tech.name}</p>
                            <Badge
                              variant={tech.is_available ? 'success' : 'warning'}
                              size="sm"
                            >
                              {tech.is_available ? 'Available' : `${tech.active_tasks} tasks`}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" size="sm">{specInfo.label}</Badge>
                            {tech.secondary_specialties && tech.secondary_specialties.split(',').filter(s => s).map(sec => {
                              const secInfo = getSpecInfo(sec.trim());
                              return (
                                <Badge key={sec} variant="outline" size="sm">
                                  {secInfo.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(tech)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <h3 className="font-medium text-neutral-900 mb-3">Specialization Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SPECIALIZATIONS.map(spec => {
            const Icon = spec.icon;
            return (
              <div key={spec.key} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getColorClasses(spec.color)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">{spec.label}</p>
                  <p className="text-xs text-neutral-500">{spec.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

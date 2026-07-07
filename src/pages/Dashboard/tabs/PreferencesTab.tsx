import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bed, Thermometer, Coffee, UtensilsCrossed, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '@/api/services/user.service';

export function PreferencesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    floor: 'high',
    view: 'ocean',
    bedType: 'king',
    quietness: 'quiet',
    temperature: 72,
    pillowType: ['firm'],
    minibar: ['water', 'soft-drinks'],
    dietary: ['vegetarian'],
  });

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await userService.getPreferences();
        if (saved && Object.keys(saved).length > 0) {
          setPreferences({
            floor: saved.floor || 'high',
            view: saved.view || 'ocean',
            bedType: saved.bedType || 'king',
            quietness: saved.quietness || 'quiet',
            temperature: saved.temperature || 72,
            pillowType: saved.pillowType || ['firm'],
            minibar: saved.minibar || ['water', 'soft-drinks'],
            dietary: saved.dietary || ['vegetarian'],
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.savePreferences(preferences);
      toast.success('Preferences saved successfully!');
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading preferences...</div>
      </div>
    );
  }

  const toggleArrayItem = (key: 'pillowType' | 'minibar' | 'dietary', value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Room Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-neutral-200 rounded-xl p-6 bg-white"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Room Setup</h3>

        <div className="space-y-5">
          {/* Floor Preference */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Floor Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'mid', 'high'].map((floor) => (
                <button
                  key={floor}
                  onClick={() => setPreferences({ ...preferences, floor })}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                    preferences.floor === floor
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {floor.charAt(0).toUpperCase() + floor.slice(1)} Floor
                </button>
              ))}
            </div>
          </div>

          {/* View Preference */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              View Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['ocean', 'city', 'garden'].map((view) => (
                <button
                  key={view}
                  onClick={() => setPreferences({ ...preferences, view })}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                    preferences.view === view
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)} View
                </button>
              ))}
            </div>
          </div>

          {/* Bed Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Bed Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['king', 'queen', 'twin'].map((bed) => (
                <button
                  key={bed}
                  onClick={() => setPreferences({ ...preferences, bedType: bed })}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                    preferences.bedType === bed
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {bed.charAt(0).toUpperCase() + bed.slice(1)} Bed
                </button>
              ))}
            </div>
          </div>

          {/* Quietness */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Room Location
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['quiet', 'lively'].map((location) => (
                <button
                  key={location}
                  onClick={() => setPreferences({ ...preferences, quietness: location })}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                    preferences.quietness === location
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {location.charAt(0).toUpperCase() + location.slice(1)} Area
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Room Temperature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-neutral-200 rounded-xl p-6 bg-white"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Room Temperature</h3>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-700">Preferred Temperature</span>
            <span className="text-2xl font-bold text-neutral-900">{preferences.temperature}°F</span>
          </div>
          <input
            type="range"
            min="65"
            max="78"
            value={preferences.temperature}
            onChange={(e) => setPreferences({ ...preferences, temperature: parseInt(e.target.value) })}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>Cool (65°F)</span>
            <span>Warm (78°F)</span>
          </div>
        </div>
      </motion.div>

      {/* Pillow Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="border border-neutral-200 rounded-xl p-6 bg-white"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pillow Type</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['firm', 'soft', 'memory-foam', 'feather'].map((pillow) => (
            <button
              key={pillow}
              onClick={() => toggleArrayItem('pillowType', pillow)}
              className={`py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                preferences.pillowType.includes(pillow)
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              {pillow.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Minibar Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-neutral-200 rounded-xl p-6 bg-white"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Minibar Preferences</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['water', 'soft-drinks', 'energy-drinks', 'snacks', 'beer', 'wine'].map((item) => (
            <button
              key={item}
              onClick={() => toggleArrayItem('minibar', item)}
              className={`py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                preferences.minibar.includes(item)
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              {item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Dietary Restrictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="border border-neutral-200 rounded-xl p-6 bg-white"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Dietary Restrictions</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal'].map((diet) => (
            <button
              key={diet}
              onClick={() => toggleArrayItem('dietary', diet)}
              className={`py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                preferences.dietary.includes(diet)
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              {diet.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </motion.div>
    </div>
  );
}
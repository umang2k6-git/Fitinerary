import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface InterestTag {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface InterestTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function InterestTagSelector({ selectedTags, onChange }: InterestTagSelectorProps) {
  const [tags, setTags] = useState<InterestTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('interests_tags')
      .select('*')
      .order('category, name');

    if (error) {
      console.error('Error fetching tags:', error);
    } else {
      setTags(data || []);
    }
    setLoading(false);
  };

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter(t => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const getIcon = (iconName: string): LucideIcon => {
    return (Icons as any)[iconName] || Icons.Tag;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-luxury-teal border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tags.map(tag => {
          const IconComponent = getIcon(tag.icon);
          const isSelected = selectedTags.includes(tag.name);

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.name)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                isSelected
                  ? 'border-luxury-teal bg-luxury-teal/10 text-luxury-teal'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconComponent className={`w-6 h-6 ${isSelected ? 'text-luxury-teal' : 'text-gray-600'}`} />
              <span className="text-sm font-medium text-center">{tag.name}</span>
            </button>
          );
        })}
      </div>

      {selectedTags.length > 0 && (
        <div className="pt-2">
          <p className="text-sm text-gray-600 mb-2">Selected interests ({selectedTags.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagName => {
              const tag = tags.find(t => t.name === tagName);
              if (!tag) return null;
              const IconComponent = getIcon(tag.icon);

              return (
                <div
                  key={tagName}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-luxury-teal/10 text-luxury-teal rounded-full text-sm"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tagName}</span>
                  <button
                    type="button"
                    onClick={() => toggleTag(tagName)}
                    className="ml-1 hover:bg-luxury-teal/20 rounded-full p-0.5"
                  >
                    <Icons.X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown, ChevronRight, Type, List, Plus, Trash2, GripVertical } from 'lucide-react';
import { SLOT_TYPES } from '../../data/templates/contentMaps/schema';

const SECTION_LABELS = {
  navigation: 'Navigation',
  hero: 'Hero Section',
  tech_stack: 'Tech Stack',
  features: 'Features',
  roadmap: 'Roadmap',
  footer: 'Footer',
  other: 'Other',
};

export default function ContentSlotEditor({
  slots,
  filledContent,
  onUpdate,
  sections,
}) {
  const [expandedSections, setExpandedSections] = useState(['hero', 'features']);
  const [expandedLists, setExpandedLists] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleList = (slotId) => {
    setExpandedLists((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  };

  // Group slots by section
  const getSlotsBySection = () => {
    const result = {};
    const groupedIds = new Set();

    if (sections) {
      Object.entries(sections).forEach(([sectionName, slotIds]) => {
        result[sectionName] = slotIds
          .map((id) => slots.find((s) => s.id === id))
          .filter(Boolean);
        slotIds.forEach((id) => groupedIds.add(id));
      });
    }

    // Add ungrouped slots
    const ungrouped = slots.filter((s) => !groupedIds.has(s.id));
    if (ungrouped.length > 0) {
      result.other = ungrouped;
    }

    return result;
  };

  const handleTextChange = (slotId, value) => {
    onUpdate(slotId, value);
  };

  const handleListItemChange = (slotId, index, field, value) => {
    const currentList = filledContent[slotId] || [];
    const updatedList = [...currentList];
    updatedList[index] = { ...updatedList[index], [field]: value };
    onUpdate(slotId, updatedList);
  };

  const handleAddListItem = (slotId, slot) => {
    const currentList = filledContent[slotId] || [];
    const newItem = {};

    // Create empty item based on schema
    slot.itemSchema?.fields?.forEach((field) => {
      newItem[field.id] = field.fallback || '';
    });

    onUpdate(slotId, [...currentList, newItem]);
  };

  const handleRemoveListItem = (slotId, index) => {
    const currentList = filledContent[slotId] || [];
    onUpdate(slotId, currentList.filter((_, i) => i !== index));
  };

  const slotsBySection = getSlotsBySection();

  return (
    <div className="content-slot-editor p-4 space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white mb-1">Content Editor</h3>
        <p className="text-xs text-zinc-500">Edit content slots for your template</p>
      </div>

      {Object.entries(slotsBySection).map(([sectionName, sectionSlots]) => (
        <div key={sectionName} className="border border-zinc-800 rounded-lg overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => toggleSection(sectionName)}
            className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm font-medium text-white">
              {SECTION_LABELS[sectionName] || sectionName}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{sectionSlots.length} slots</span>
              {expandedSections.includes(sectionName) ? (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </button>

          {/* Section Content */}
          {expandedSections.includes(sectionName) && (
            <div className="p-3 space-y-3 bg-zinc-950/50">
              {sectionSlots.map((slot) => (
                <SlotEditor
                  key={slot.id}
                  slot={slot}
                  value={filledContent[slot.id]}
                  onChange={(value) => handleTextChange(slot.id, value)}
                  onListItemChange={(index, field, value) =>
                    handleListItemChange(slot.id, index, field, value)
                  }
                  onAddListItem={() => handleAddListItem(slot.id, slot)}
                  onRemoveListItem={(index) => handleRemoveListItem(slot.id, index)}
                  isExpanded={expandedLists[slot.id]}
                  onToggle={() => toggleList(slot.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SlotEditor({
  slot,
  value,
  onChange,
  onListItemChange,
  onAddListItem,
  onRemoveListItem,
  isExpanded,
  onToggle,
}) {
  const isListType = slot.type === SLOT_TYPES.LIST;
  const items = Array.isArray(value) ? value : [];

  if (isListType) {
    return (
      <div className="space-y-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-white">{slot.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{items.length} items</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="pl-4 space-y-2">
            {items.map((item, index) => (
              <ListItemEditor
                key={index}
                item={item}
                index={index}
                schema={slot.itemSchema}
                onChange={(field, value) => onListItemChange(index, field, value)}
                onRemove={() => onRemoveListItem(index)}
              />
            ))}

            <button
              onClick={onAddListItem}
              className="w-full flex items-center justify-center gap-1 p-2 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors text-xs"
            >
              <Plus className="w-3 h-3" />
              Add Item
            </button>
          </div>
        )}
      </div>
    );
  }

  // Text/Rich Text slot
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-emerald-400" />
        <label className="text-sm text-white">{slot.label}</label>
        {slot.validation?.required && (
          <span className="text-[10px] text-amber-400">Required</span>
        )}
      </div>

      {slot.description && (
        <p className="text-xs text-zinc-500 mb-1">{slot.description}</p>
      )}

      {slot.type === SLOT_TYPES.RICH_TEXT ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none resize-none"
          rows={3}
          placeholder={slot.fallback}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          placeholder={slot.fallback}
          maxLength={slot.validation?.maxLength}
        />
      )}

      {slot.validation?.maxLength && (
        <div className="text-right text-xs text-zinc-500">
          {(value || '').length}/{slot.validation.maxLength}
        </div>
      )}
    </div>
  );
}

function ListItemEditor({ item, index, schema, onChange, onRemove }) {
  const fields = schema?.fields || [];

  return (
    <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3 h-3 text-zinc-600" />
          <span className="text-xs text-zinc-400">Item {index + 1}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label className="text-xs text-zinc-400">{field.label}</label>
          {field.type === 'list' ? (
            <input
              type="text"
              value={(item[field.id] || []).join(', ')}
              onChange={(e) =>
                onChange(
                  field.id,
                  e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                )
              }
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              placeholder="Comma-separated values"
            />
          ) : (
            <input
              type="text"
              value={item[field.id] || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              placeholder={field.fallback || ''}
            />
          )}
        </div>
      ))}
    </div>
  );
}

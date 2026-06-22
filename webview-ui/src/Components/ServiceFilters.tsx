import React from 'react';
import { VscClose } from "react-icons/vsc";

interface ServiceFiltersProps {
  services: string[];
  selected: string[];
  onToggle: (service: string) => void;
  onClear: () => void;
}

const ServiceFilters = ({ services, selected, onToggle, onClear }: ServiceFiltersProps) => {
  if (services.length === 0) {
    return null;
  }

  return (
    <div className='flex flex-wrap items-center gap-1.5 px-3 pt-2'>
      {services.map((service) => {
        const isActive = selected.includes(service);
        return (
          <button
            key={service}
            onClick={() => onToggle(service)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors duration-200 cursor-pointer ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-[#252836] text-slate-400 border-[rgba(255,255,255,0.06)] hover:text-slate-200 hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            {service}
          </button>
        );
      })}

      {selected.length > 0 && (
        <button
          onClick={onClear}
          className='flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-slate-500 hover:text-slate-300 transition-colors duration-200 cursor-pointer'
        >
          <VscClose className='text-sm' />
          Clear
        </button>
      )}
    </div>
  );
};

export default ServiceFilters;

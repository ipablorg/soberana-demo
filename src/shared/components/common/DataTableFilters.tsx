/**
 * DataTable Filters Component
 * 
 * Reusable filters for data tables
 */

import { useState } from "react";
import { Filter, X } from "@/shared/components/animated-icons";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { useLingui } from '@lingui/react/macro';

export interface FilterConfig {
  id: string;
  label: string;
  type: "select" | "date-range" | "text" | "number-range";
  options?: { label: string; value: string }[];
}

interface DataTableFiltersProps {
  filters: FilterConfig[];
  onFiltersChange: (filters: Record<string, any>) => void;
  activeFilters?: Record<string, any>;
}

export function DataTableFilters({
  filters,
  onFiltersChange,
  activeFilters = {},
}: DataTableFiltersProps) {
  const { t } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(activeFilters);

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...localFilters, [filterId]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
    setIsOpen(false);
  };

  const activeFilterCount = Object.keys(localFilters).filter(
    (key) => localFilters[key] !== undefined && localFilters[key] !== ""
  ).length;

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            {t`Filtros`}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{t`Filtros`}</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs"
                >
                  <X className="mr-1 h-3 w-3" />
                  {t`Limpiar`}
                </Button>
              )}
            </div>

            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                {filter.type === "select" && (
                  <Select
                    value={localFilters[filter.id] || ""}
                    onValueChange={(value) => handleFilterChange(filter.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t`Seleccionar ${filter.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {filter.type === "text" && (
                  <Input
                    placeholder={t`Buscar por ${filter.label.toLowerCase()}`}
                    value={localFilters[filter.id] || ""}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  />
                )}
                {filter.type === "number-range" && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={t`Mínimo`}
                      value={localFilters[`${filter.id}_min`] || ""}
                      onChange={(e) =>
                        handleFilterChange(`${filter.id}_min`, e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t`Máximo`}
                      value={localFilters[`${filter.id}_max`] || ""}
                      onChange={(e) =>
                        handleFilterChange(`${filter.id}_max`, e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={applyFilters}>
                {t`Aplicar Filtros`}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                {t`Cancelar`}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}


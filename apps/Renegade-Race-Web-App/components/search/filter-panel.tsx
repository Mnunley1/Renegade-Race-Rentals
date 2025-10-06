"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export function FilterPanel({ isOpen, onClose, onApplyFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    make: "",
    minPrice: "",
    maxPrice: "",
    transmission: "",
    drivetrain: "",
  });

  const makes = ["Porsche", "Ferrari", "Lamborghini", "McLaren", "BMW", "Mercedes", "Audi"];
  const transmissions = ["Manual", "Automatic", "PDK", "DCT"];
  const drivetrains = ["RWD", "AWD", "FWD"];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      make: "",
      minPrice: "",
      maxPrice: "",
      transmission: "",
      drivetrain: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Make</label>
            <div className="flex flex-wrap gap-2">
              {makes.map(make => (
                <Badge
                  key={make}
                  variant={filters.make === make ? "default" : "outline"}
                  className="cursor-pointer hover:bg-[#FF5A5F] hover:text-white"
                  onClick={() => handleFilterChange("make", filters.make === make ? "" : make)}
                >
                  {make}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Price Range</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Min price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              />
              <Input
                placeholder="Max price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Transmission</label>
            <div className="flex flex-wrap gap-2">
              {transmissions.map(trans => (
                <Badge
                  key={trans}
                  variant={filters.transmission === trans ? "default" : "outline"}
                  className="cursor-pointer hover:bg-[#FF5A5F] hover:text-white"
                  onClick={() => handleFilterChange("transmission", filters.transmission === trans ? "" : trans)}
                >
                  {trans}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Drivetrain</label>
            <div className="flex flex-wrap gap-2">
              {drivetrains.map(drive => (
                <Badge
                  key={drive}
                  variant={filters.drivetrain === drive ? "default" : "outline"}
                  className="cursor-pointer hover:bg-[#FF5A5F] hover:text-white"
                  onClick={() => handleFilterChange("drivetrain", filters.drivetrain === drive ? "" : drive)}
                >
                  {drive}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
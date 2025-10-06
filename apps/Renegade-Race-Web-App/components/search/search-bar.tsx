"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
}

export function SearchBar({ onSearch, onFilterToggle }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3 w-full max-w-2xl mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search by make, model, or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 h-12 text-base bg-white border-gray-200 focus:border-[#FF5A5F]"
        />
      </div>
      
      <Button type="submit" size="lg" className="h-12 px-6">
        Search
      </Button>
      
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onFilterToggle}
        className="h-12 px-4 border-gray-200"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
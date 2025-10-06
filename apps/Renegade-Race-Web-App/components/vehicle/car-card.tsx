import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Heart, Star, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CarCardProps {
  vehicle: {
    _id: string;
    make: string;
    model: string;
    year: number;
    dailyRate: number;
    description: string;
    horsepower: number;
    images: string[];
    color: string;
    transmission: string;
  };
}

export function CarCard({ vehicle }: CarCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const navigate: useNavigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.location.href = `/vehicles/${vehicle._id}`;
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={
            vehicle.images[0] ||
            "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800"
          }
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${isFavorited ? "fill-[#FF5A5F] text-[#FF5A5F]" : "text-gray-600"}`}
          />
        </button>
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/80 text-white border-0">
            {vehicle.horsepower} HP
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#FF5A5F] transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">4.9</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>{vehicle.transmission}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Available</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {vehicle.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(vehicle.dailyRate)}
              </span>
              <span className="text-sm text-gray-600 ml-1">per day</span>
            </div>

            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                console.log(
                  "Manual navigation to:",
                  `/vehicles/${vehicle._id}`
                );
                window.location.href = `/vehicles/${vehicle._id}`;
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

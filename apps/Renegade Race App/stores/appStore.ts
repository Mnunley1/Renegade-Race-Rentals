import { create } from 'zustand';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  track: string;
  owner: string;
  description: string;
  horsepower: number;
  transmission: string;
  drivetrain: string;
  amenities: string[];
  available: boolean;
}

interface Track {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
}

interface AppState {
  cars: Car[];
  tracks: Track[];
  favorites: string[];
  searchQuery: string;
  selectedTrack: string | null;

  // Actions
  setCars: (cars: Car[]) => void;
  setTracks: (tracks: Track[]) => void;
  toggleFavorite: (carId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTrack: (trackId: string | null) => void;

  // Getters
  getFeaturedCars: () => Car[];
  getFavoritesCars: () => Car[];
  getFilteredCars: () => Car[];
}

export const useAppStore = create<AppState>((set, get) => ({
  cars: [],
  tracks: [],
  favorites: [],
  searchQuery: '',
  selectedTrack: null,

  setCars: (cars) => set({ cars }),
  setTracks: (tracks) => set({ tracks }),

  toggleFavorite: (carId) =>
    set((state) => ({
      favorites: state.favorites.includes(carId)
        ? state.favorites.filter((id) => id !== carId)
        : [...state.favorites, carId],
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTrack: (trackId) => set({ selectedTrack: trackId }),

  getFeaturedCars: () => {
    const { cars } = get();
    return cars.filter((car) => car.rating >= 4.8).slice(0, 10);
  },

  getFavoritesCars: () => {
    const { cars, favorites } = get();
    return cars.filter((car) => favorites.includes(car.id));
  },

  getFilteredCars: () => {
    const { cars, searchQuery, selectedTrack } = get();
    let filtered = cars;

    if (selectedTrack) {
      filtered = filtered.filter((car) => car.track === selectedTrack);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.make?.toLowerCase().includes(query) ||
          car.model?.toLowerCase().includes(query) ||
          car.track?.toLowerCase().includes(query),
      );
    }

    return filtered;
  },
}));

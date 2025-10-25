import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import { Car, Edit, MapPin, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@renegade/convex/_generated/api";

interface Track {
  _id: string;
  name: string;
  location: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  vehicleCount?: number;
}

export function TracksPage() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  const tracks = useQuery(api.tracks.getAllForAdmin, { includeInactive: true });
  const trackStats = useQuery(api.tracks.getTrackStats, {});
  const createTrack = useMutation(api.tracks.createTrack);
  const updateTrack = useMutation(api.tracks.updateTrack);
  const deleteTrack = useMutation(api.tracks.deleteTrack);

  const handleCreateTrack = async () => {
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createTrack({
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
      });
      toast.success("Track created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to create track");
      console.error(error);
    }
  };

  const handleUpdateTrack = async () => {
    if (!selectedTrack || !formData.name.trim() || !formData.location.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await updateTrack({
        id: selectedTrack._id as any,
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        isActive: formData.isActive,
      });
      toast.success("Track updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedTrack(null);
    } catch (error) {
      toast.error("Failed to update track");
      console.error(error);
    }
  };

  const handleDeleteTrack = async (track: Track) => {
    if (!confirm(`Are you sure you want to delete ${track.name}?`)) {
      return;
    }

    try {
      await deleteTrack({ id: track._id as any });
      toast.success("Track deleted successfully");
    } catch (error) {
      toast.error("Failed to delete track");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      description: "",
      imageUrl: "",
      isActive: true,
    });
  };

  const openEditDialog = (track: Track) => {
    setSelectedTrack(track);
    setFormData({
      name: track.name,
      location: track.location,
      description: track.description || "",
      imageUrl: track.imageUrl || "",
      isActive: track.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const columns: ColumnDef<Track>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const track = row.original;
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{track.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "vehicleCount",
      header: "Vehicles",
      cell: ({ row }) => {
        const count = row.getValue("vehicleCount") as number;
        return (
          <div className="flex items-center gap-1">
            <Car className="h-4 w-4 text-gray-500" />
            <span>{count || 0}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const track = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditDialog(track)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteTrack(track)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (tracks === undefined || trackStats === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tracks</h1>
          <p className="text-gray-600">Manage racing tracks and locations</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Track
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackStats?.totalTracks || 0}
            </div>
            <p className="text-xs text-muted-foreground">All tracks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tracks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackStats?.activeTracks || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackStats?.trackStats?.reduce(
                (sum, stat) => sum + stat.vehicleCount,
                0
              ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all tracks</p>
          </CardContent>
        </Card>
      </div>

      {/* Tracks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tracks</CardTitle>
          <CardDescription>
            Manage racing tracks and their availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tracks || []}
            searchKey="name"
            searchPlaceholder="Search tracks..."
          />
        </CardContent>
      </Card>

      {/* Create Track Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Track</DialogTitle>
            <DialogDescription>
              Add a new racing track to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Track Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Laguna Seca"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Monterey, CA"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Track description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTrack}>Create Track</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Track Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
            <DialogDescription>Update track information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Track Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Laguna Seca"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                placeholder="e.g., Monterey, CA"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Track description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTrack}>Update Track</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@renegade/convex/_generated/api";

interface Dispute {
  _id: string;
  reservationId: string;
  vehicleId: string;
  renterId: string;
  ownerId: string;
  status: string;
  createdAt: number;
  reservation?: any;
  vehicle?: any;
  renter?: any;
  owner?: any;
}

export function DisputesPage() {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);

  const disputes = useQuery(api.disputes.getAllDisputes, {});
  const disputeStats = useQuery(api.disputes.getDisputeStats, {});
  const resolveDispute = useMutation(api.disputes.resolveDispute);
  const escalateDispute = useMutation(api.disputes.escalateDispute);

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolution.trim()) {
      toast.error("Please provide a resolution");
      return;
    }

    try {
      await resolveDispute({
        completionId: selectedDispute._id as any,
        resolution: resolution.trim(),
      });
      toast.success("Dispute resolved successfully");
      setIsResolveDialogOpen(false);
      setResolution("");
      setSelectedDispute(null);
    } catch (error) {
      toast.error("Failed to resolve dispute");
      console.error(error);
    }
  };

  const handleEscalateDispute = async (dispute: Dispute) => {
    try {
      await escalateDispute({
        completionId: dispute._id as any,
        escalationReason: "Escalated by admin for further review",
      });
      toast.success("Dispute escalated successfully");
    } catch (error) {
      toast.error("Failed to escalate dispute");
      console.error(error);
    }
  };

  const columns: ColumnDef<Dispute>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "renter",
      header: "Renter",
      cell: ({ row }) => {
        const renter = row.original.renter;
        return renter ? renter.name : "Unknown";
      },
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const owner = row.original.owner;
        return owner ? owner.name : "Unknown";
      },
    },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => {
        const vehicle = row.original.vehicle;
        return vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "disputed" ? "destructive" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const dispute = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedDispute(dispute);
                setIsResolveDialogOpen(true);
              }}
            >
              Resolve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleEscalateDispute(dispute)}
            >
              Escalate
            </Button>
          </div>
        );
      },
    },
  ];

  if (disputes === undefined || disputeStats === undefined) {
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
          <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
          <p className="text-gray-600">
            Manage rental disputes and resolutions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Disputes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {disputeStats?.totalDisputes || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time disputes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Disputes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {disputeStats?.recentDisputes || 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Resolution
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {disputeStats?.averageResolutionTime || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              Average resolution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
          <CardDescription>Review and resolve rental disputes</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={disputes || []}
            searchKey="renter"
            searchPlaceholder="Search by renter name..."
          />
        </CardContent>
      </Card>

      {/* Resolve Dispute Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Provide a resolution for this dispute. This will mark the rental
              as completed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDispute && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Dispute Details:</div>
                <div className="text-sm text-gray-600">
                  <p>Renter: {selectedDispute.renter?.name}</p>
                  <p>Owner: {selectedDispute.owner?.name}</p>
                  <p>
                    Vehicle: {selectedDispute.vehicle?.make}{" "}
                    {selectedDispute.vehicle?.model}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Textarea
                id="resolution"
                placeholder="Describe the resolution..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResolveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResolveDispute}>Resolve Dispute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { DatabaseUser } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "convex/react";
import {
  Calendar,
  Car,
  Mail,
  Phone,
  Plus,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { api } from "@renegade/convex/_generated/api";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getUserTypeColor = (userType?: string) => {
  switch (userType) {
    case "driver":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "team":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "both":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const columns: ColumnDef<DatabaseUser>[] = [
  {
    accessorKey: "externalId",
    header: "User ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm text-gray-600">
        {(row.getValue("externalId") as string).slice(0, 8)}...
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return email ? (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{email}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No email</span>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return phone ? (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{phone}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No phone</span>
      );
    },
  },
  {
    accessorKey: "userType",
    header: "Type",
    cell: ({ row }) => {
      const userType = row.getValue("userType") as string;
      return (
        <Badge className={getUserTypeColor(userType)} variant="secondary">
          {userType || "Unknown"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "rentalCount",
    header: "Rentals",
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("rentalCount")}
      </div>
    ),
  },
  {
    accessorKey: "vehicleCount",
    header: "Vehicles",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-center font-medium">
        <Car className="h-4 w-4 text-gray-500" />
        {row.getValue("vehicleCount")}
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return rating ? (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No rating</span>
      );
    },
  },
  {
    accessorKey: "memberSince",
    header: "Member Since",
    cell: ({ row }) => {
      const memberSince = row.getValue("memberSince") as string;
      return memberSince ? (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{formatDate(memberSince)}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">Unknown</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          View
        </Button>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>
    ),
  },
];

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users from the database using authenticated query
  const users = useQuery(api.users.getAllUsers, {
    limit: 100,
    search: searchTerm || undefined,
  });

  // Fetch user statistics (optional - may fail if not authenticated with Convex)
  // const userStats = useQuery(api.users.getUserStats);

  // Calculate additional stats from the users data
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((user) => user.userType)?.length || 0;
  const driversCount =
    users?.filter(
      (user) => user.userType === "driver" || user.userType === "both"
    )?.length || 0;
  const teamsCount =
    users?.filter(
      (user) => user.userType === "team" || user.userType === "both"
    )?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-600 mt-1">
            Manage user accounts and information
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
            <p className="text-xs text-gray-500">All registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Users
            </CardTitle>
            <div className="h-3 w-3 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeUsers}
            </div>
            <p className="text-xs text-gray-500">With profiles</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Drivers
            </CardTitle>
            <Car className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {driversCount}
            </div>
            <p className="text-xs text-gray-500">Driver accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Teams
            </CardTitle>
            <Users className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {teamsCount}
            </div>
            <p className="text-xs text-gray-500">Team accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
            {searchTerm && (
              <Badge variant="secondary" className="ml-2">
                {users?.length || 0} results
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No users found matching your search."
                : "No users found."}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              searchKey="name"
              searchPlaceholder="Search by user name..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

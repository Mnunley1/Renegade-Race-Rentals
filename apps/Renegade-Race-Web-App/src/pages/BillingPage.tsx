import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Filter,
  Plus,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function BillingPage() {
  const { user, isSignedIn } = useUser();
  const [filterPeriod, setFilterPeriod] = useState("all");

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access your billing information.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/sign-up">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Mock billing data
  const billingStats = {
    totalEarnings: 12450,
    totalSpent: 8560,
    totalRentals: 23,
    averageTransaction: 3890,
  };

  const transactions = [
    {
      id: "TX_001",
      type: "earning",
      description: "Porsche 911 GT3 rental income",
      amount: 899,
      date: "2024-01-15",
      status: "completed",
      renter: "John Smith",
    },
    {
      id: "TX_002",
      type: "earning",
      description: "McLaren 720S rental income",
      amount: 1299,
      date: "2024-01-12",
      status: "completed",
      renter: "Sarah Johnson",
    },
    {
      id: "TX_003",
      type: "earning",
      description: "Ferrari 488 GTB rental income",
      amount: 1599,
      date: "2024-01-08",
      status: "completed",
      renter: "Mike Chen",
    },
    {
      id: "TX_004",
      type: "spending",
      description: "Renegade Race service fee",
      amount: -179.8,
      date: "2024-01-15",
      status: "completed",
      renter: null,
    },
    {
      id: "TX_005",
      type: "spending",
      description: "Renegade Race service fee",
      amount: -259.8,
      date: "2024-01-12",
      status: "completed",
      renter: null,
    },
    {
      id: "TX_006",
      type: "earning",
      description: "BMW M3 rental income",
      amount: 599,
      date: "2024-01-05",
      status: "completed",
      renter: "Alex Rodriguez",
    },
  ];

  const invoices = [
    {
      id: "INV-2024-001",
      amount: 899,
      dueDate: "2024-01-15",
      status: "paid",
      description: "Porsche 911 GT3 rental invoice",
    },
    {
      id: "INV-2024-002",
      amount: 1299,
      dueDate: "2024-01-12",
      status: "paid",
      description: "McLaren 720S rental invoice",
    },
    {
      id: "INV-2024-003",
      amount: 599,
      dueDate: "2024-01-05",
      status: "pending",
      description: "BMW M3 rental invoice",
    },
  ];

  const filteredTransactions =
    filterPeriod === "all"
      ? transactions
      : transactions.filter((tx) => {
          const txDate = new Date(tx.date);
          const now = new Date();

          switch (filterPeriod) {
            case "this-month":
              return (
                txDate.getMonth() === now.getMonth() &&
                txDate.getFullYear() === now.getFullYear()
              );
            case "last-month":
              const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
              return (
                txDate.getMonth() === lastMonth.getMonth() &&
                txDate.getFullYear() === lastMonth.getFullYear()
              );
            case "this-year":
              return txDate.getFullYear() === now.getFullYear();
            default:
              return true;
          }
        });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-[#EF1C25]" />
            <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Manage your earnings, payments, and financial transactions.
          </p>
        </div>

        {/* Billing Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(billingStats.totalEarnings)}
              </div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Receipt className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(billingStats.totalSpent)}
              </div>
              <div className="text-sm text-gray-600">Total Fees Paid</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {billingStats.totalRentals}
              </div>
              <div className="text-sm text-gray-600">Total Rentals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(billingStats.averageTransaction)}
              </div>
              <div className="text-sm text-gray-600">Avg Transaction</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterPeriod === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPeriod("all")}
                >
                  All Time
                </Button>
                <Button
                  variant={
                    filterPeriod === "this-month" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setFilterPeriod("this-month")}
                >
                  This Month
                </Button>
                <Button
                  variant={
                    filterPeriod === "last-month" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setFilterPeriod("last-month")}
                >
                  Last Month
                </Button>
                <Button
                  variant={filterPeriod === "this-year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPeriod("this-year")}
                >
                  This Year
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Transaction History
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === "earning"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          <CreditCard
                            className={`h-4 w-4 ${
                              transaction.type === "earning"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(transaction.date)}</span>
                            {transaction.renter && (
                              <>
                                <span>•</span>
                                <span>{transaction.renter}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "earning"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "spending" ? "" : "+"}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === "completed"
                              ? "text-green-600 border-green-200"
                              : "text-yellow-600 border-yellow-200"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices & Documents */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Invoices & Documents
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Request Invoice
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {invoice.description}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>Due {formatDate(invoice.dueDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(invoice.amount)}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              invoice.status === "paid"
                                ? "text-green-600 border-green-200"
                                : "text-yellow-600 border-yellow-200"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tax Documents */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Tax Documents
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            1099-K (2023)
                          </p>
                          <p className="text-sm text-gray-600">
                            Income summary
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            1099-K (2024)
                          </p>
                          <p className="text-sm text-gray-600">
                            Available Jan 2025
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Methods Summary */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Methods
                </div>
                <Button variant="outline" size="sm">
                  Manage Payment Methods
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Visa ending in 4242
                    </p>
                    <p className="text-sm text-gray-600">
                      Primary • Expires 12/26
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Mastercard ending in 8080
                    </p>
                    <p className="text-sm text-gray-600">Expires 08/25</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">P</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">PayPal</p>
                    <p className="text-sm text-gray-600">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

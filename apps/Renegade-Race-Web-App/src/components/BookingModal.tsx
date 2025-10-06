import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, calculateDays } from '@/lib/utils';
import { useAvailability } from '@/hooks/useAvailability';
import { Calendar, Check, Clock, DollarSign, MessageSquare, X } from 'lucide-react';
import { useState, useMemo } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any;
  onBook: (
    startDate: string,
    endDate: string,
    message?: string,
    selectedAddOns?: Set<string>,
  ) => void;
}

export function BookingModal({
  isOpen,
  onClose,
  vehicle,
  onBook,
}: BookingModalProps) {
  const [selectedDates, setSelectedDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const { availability, calendarData } = useAvailability(vehicle?._id || null);

  const totalDays = useMemo(() => {
    if (!selectedDates.start || !selectedDates.end) return 0;
    return calculateDays(
      selectedDates.start.toISOString().split('T')[0],
      selectedDates.end.toISOString().split('T')[0],
    ) + 1;
  }, [selectedDates]);

  const totalAmount = useMemo(() => {
    const baseAmount = totalDays * (vehicle?.dailyRate || 0);
    const addOnAmount = Array.from(selectedAddOns).reduce(
      (total, addOnName) => {
        const addOn = vehicle?.addOns?.find((a: any) => a.name === addOnName);
        return total + (addOn?.price || 0) * totalDays;
      },
      0,
    );
    return baseAmount + addOnAmount;
  }, [totalDays, vehicle?.dailyRate, selectedAddOns, vehicle?.addOns]);

  const handleDateSelect = (date: Date) => {
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      setSelectedDates({ start: date, end: null });
    } else {
      if (date < selectedDates.start) {
        setSelectedDates({ start: date, end: selectedDates.start });
      } else {
        setSelectedDates({ start: selectedDates.start, end: date });
      }
    }
  };

  const handleBook = async () => {
    if (!selectedDates.start || !selectedDates.end) {
      return;
    }

    setLoading(true);
    try {
      await onBook(
        selectedDates.start.toISOString().split('T')[0],
        selectedDates.end.toISOString().split('T')[0],
        message.trim() || undefined,
        selectedAddOns,
      );
      onClose();
      setSelectedDates({ start: null, end: null });
      setMessage('');
      setSelectedAddOns(new Set());
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedDates({ start: null, end: null });
    setMessage('');
    setSelectedAddOns(new Set());
  };

  const toggleAddOn = (addOnName: string) => {
    const newSelectedAddOns = new Set(selectedAddOns);
    if (newSelectedAddOns.has(addOnName)) {
      newSelectedAddOns.delete(addOnName);
    } else {
      newSelectedAddOns.add(addOnName);
    }
    setSelectedAddOns(newSelectedAddOns);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Book Vehicle</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Calendar and Add-ons */}
            <div className="space-y-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Select Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="p-2 font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Simple calendar implementation */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - date.getDay() + i);
                        const dateStr = date.toISOString().split('T')[0];
                        const isSelected = 
                          selectedDates.start?.toISOString().split('T')[0] === dateStr ||
                          selectedDates.end?.toISOString().split('T')[0] === dateStr;
                        const isInRange = selectedDates.start && selectedDates.end &&
                          date >= selectedDates.start && date <= selectedDates.end;
                        const isPast = date < new Date();
                        
                        return (
                          <button
                            key={i}
                            onClick={() => !isPast && handleDateSelect(date)}
                            disabled={isPast}
                            className={`
                              p-2 text-sm rounded-md transition-colors
                              ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                              ${isSelected ? 'bg-blue-500 text-white' : ''}
                              ${isInRange && !isSelected ? 'bg-blue-100' : ''}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                    
                    {selectedDates.start && selectedDates.end && (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {totalDays} {totalDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons */}
              {vehicle?.addOns && vehicle.addOns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add-ons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vehicle.addOns.map((addOn: any) => (
                        <div
                          key={addOn.name}
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleAddOn(addOn.name)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`
                              w-4 h-4 border-2 rounded flex items-center justify-center
                              ${selectedAddOns.has(addOn.name) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                            `}>
                              {selectedAddOns.has(addOn.name) && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{addOn.name}</p>
                              <p className="text-sm text-gray-600">{addOn.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(addOn.price)}</p>
                            <p className="text-sm text-gray-600">per day</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Message to Host
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the host about your plans, any special requests, or questions..."
                    className="w-full p-3 border rounded-lg resize-none h-24"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{formatCurrency(vehicle?.dailyRate || 0)} × {totalDays} days</span>
                      <span>{formatCurrency((vehicle?.dailyRate || 0) * totalDays)}</span>
                    </div>
                    
                    {selectedAddOns.size > 0 && (
                      <>
                        {Array.from(selectedAddOns).map((addOnName) => {
                          const addOn = vehicle?.addOns?.find((a: any) => a.name === addOnName);
                          return (
                            <div key={addOnName} className="flex justify-between text-sm text-gray-600">
                              <span>{addOnName} × {totalDays} days</span>
                              <span>{formatCurrency((addOn?.price || 0) * totalDays)}</span>
                            </div>
                          );
                        })}
                      </>
                    )}
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleBook}
                      disabled={!selectedDates.start || !selectedDates.end || loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Continue to Payment
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={resetSelection}
                      className="w-full"
                    >
                      Reset Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

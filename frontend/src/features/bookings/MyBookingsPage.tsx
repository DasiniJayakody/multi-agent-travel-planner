import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Plane,
  Hotel,
  Search,
  Mail,
  RotateCcw,
  User,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";
import { bookingsApi } from "./bookingsApi";
import type {
  UserBookings,
  FlightBooking,
  HotelBooking,
  AllBookingsResponse,
  AllFlightBooking,
  AllHotelBooking,
  User as UserType,
} from "@/lib/types";

export function MyBookingsPage() {
  const [email, setEmail] = useState("");
  const [allBookings, setAllBookings] = useState<AllBookingsResponse | null>(
    null
  );
  const [userBookings, setUserBookings] = useState<UserBookings | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const { toast } = useToast();

  // Load all bookings on component mount
  useEffect(() => {
    const loadAllBookings = async () => {
      try {
        const response = await bookingsApi.getAllBookings();
        setAllBookings(response);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bookings. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadAllBookings();
  }, [toast]);

  const handleSearch = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to view bookings.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await bookingsApi.getUserBookings(email.trim());
      setUserBookings(response);
      setSearchMode(true);

      if (
        response.flightBookings.length === 0 &&
        response.hotelBookings.length === 0
      ) {
        toast({
          title: "No Bookings Found",
          description: "No bookings found for this email address.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to load bookings. Please check your email and try again.",
        variant: "destructive",
      });
      setUserBookings(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setUserBookings(null);
    setSearchMode(false);
  };

  // Helper functions
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount}`;
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "confirmed" ? "default" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  // Group bookings by user for card view
  const getUserBookingsMap = () => {
    if (!allBookings) return new Map();

    const userMap = new Map<
      string,
      {
        user: UserType;
        flights: AllFlightBooking[];
        hotels: AllHotelBooking[];
      }
    >();

    // Process flight bookings
    allBookings.flights.forEach((booking) => {
      if (booking.user) {
        const userId = booking.user._id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user: booking.user,
            flights: [],
            hotels: [],
          });
        }
        userMap.get(userId)!.flights.push(booking);
      }
    });

    // Process hotel bookings
    allBookings.hotels.forEach((booking) => {
      if (booking.user) {
        const userId = booking.user._id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user: booking.user,
            flights: [],
            hotels: [],
          });
        }
        userMap.get(userId)!.hotels.push(booking);
      }
    });

    return userMap;
  };

  const renderUserCard = (userData: {
    user: UserType;
    flights: AllFlightBooking[];
    hotels: AllHotelBooking[];
  }) => {
    const { user, flights, hotels } = userData;
    const totalBookings = flights.length + hotels.length;
    const totalValue =
      flights.reduce((sum, f) => sum + f.totalPrice, 0) +
      hotels.reduce((sum, h) => sum + h.totalPrice, 0);

    return (
      <Card key={user._id} className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <div>
              <div className="text-lg">{user.name}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {user.email}
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            {totalBookings} booking{totalBookings !== 1 ? "s" : ""} • Total
            value: ${totalValue.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Flight Bookings */}
          {flights.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium text-sm">
                <Plane className="h-4 w-4" />
                Flight Bookings ({flights.length})
              </h4>
              <div className="space-y-2">
                {flights.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-muted/50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          Flight Booking
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Passenger: {booking.passengerName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Seat {booking.seatNumber}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <CreditCard className="h-3 w-3" />
                          {formatCurrency(booking.totalPrice, booking.currency)}
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ref: <code>{booking.bookingReference}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotel Bookings */}
          {hotels.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium text-sm">
                <Hotel className="h-4 w-4" />
                Hotel Bookings ({hotels.length})
              </h4>
              <div className="space-y-2">
                {hotels.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-muted/50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">Hotel Booking</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Guest: {booking.guestName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {booking.checkInDate} → {booking.checkOutDate} •{" "}
                          {booking.numberOfNights} nights
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <CreditCard className="h-3 w-3" />
                          {formatCurrency(booking.totalPrice, booking.currency)}
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Room: {booking.roomType} • Ref:{" "}
                      <code>{booking.bookingReference}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">User Bookings</h1>
        <p className="text-muted-foreground mb-6">
          {searchMode
            ? "Showing detailed bookings for a specific user. Clear the search to view all users."
            : "View all user bookings organized by user, or search for specific user bookings."}
        </p>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {searchMode ? "Search Results" : "Find User Bookings"}
            </CardTitle>
            <CardDescription>
              {searchMode
                ? "Enter a different email address or clear to view all users"
                : "Enter an email address to view detailed bookings for a specific user"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1"
              >
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Searching..." : "Search Bookings"}
              </Button>
              {searchMode && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {initialLoading ? (
        <div className="text-center py-12">
          <div className="text-lg mb-2">Loading bookings...</div>
          <div className="text-muted-foreground">
            Please wait while we fetch all bookings.
          </div>
        </div>
      ) : searchMode && userBookings ? (
        // User-specific detailed view (table format)
        <div className="space-y-8">
          <div className="text-sm text-muted-foreground">
            Showing detailed bookings for:{" "}
            <strong>{userBookings.user?.email || email}</strong>
          </div>

          {/* Flight Bookings Table */}
          {userBookings.flightBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flight Bookings ({userBookings.flightBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flight</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Seat</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userBookings.flightBookings.map(
                      (booking: FlightBooking) => (
                        <TableRow key={booking._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {booking.flight.airline}{" "}
                                {booking.flight.flightNumber}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.flight.aircraft}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {typeof booking.flight.origin === "string"
                                ? booking.flight.origin
                                : booking.flight.origin.city}{" "}
                              →{" "}
                              {typeof booking.flight.destination === "string"
                                ? booking.flight.destination
                                : booking.flight.destination.city}
                            </div>
                          </TableCell>
                          <TableCell>{booking.flight.flightDate}</TableCell>
                          <TableCell>{booking.seatNumber}</TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(
                              booking.totalPrice,
                              booking.currency
                            )}
                          </TableCell>
                          <TableCell>
                            <code className="text-sm">
                              {booking.bookingReference}
                            </code>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Hotel Bookings Table */}
          {userBookings.hotelBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Hotel Bookings ({userBookings.hotelBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Nights</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userBookings.hotelBookings.map((booking: HotelBooking) => (
                      <TableRow key={booking._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {booking.hotel.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.hotel.starRating} star
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {booking.hotel.city}, {booking.hotel.country}
                          </div>
                        </TableCell>
                        <TableCell>{booking.checkInDate}</TableCell>
                        <TableCell>{booking.checkOutDate}</TableCell>
                        <TableCell>{booking.roomType}</TableCell>
                        <TableCell>{booking.numberOfNights}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          {formatCurrency(booking.totalPrice, booking.currency)}
                        </TableCell>
                        <TableCell>
                          <code className="text-sm">
                            {booking.bookingReference}
                          </code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {userBookings.flightBookings.length === 0 &&
            userBookings.hotelBookings.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-lg mb-2">No bookings found</div>
                  <div className="text-muted-foreground">
                    This user doesn't have any bookings yet.
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      ) : (
        // All users card view (default)
        allBookings && (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Showing all users with bookings ({getUserBookingsMap().size}{" "}
              users, {allBookings.flights.length} flights,{" "}
              {allBookings.hotels.length} hotels)
            </div>

            {getUserBookingsMap().size === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-lg mb-2">No bookings found</div>
                  <div className="text-muted-foreground">
                    No bookings are available in the system yet.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {Array.from(getUserBookingsMap().values()).map((userData) =>
                  renderUserCard(userData)
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

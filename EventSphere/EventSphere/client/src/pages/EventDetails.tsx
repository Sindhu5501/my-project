import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { queryClient } from "@/lib/queryClient";

const EventDetails = () => {
  const [match, params] = useRoute("/events/:id");
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { showNotificationToast } = useNotifications();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  
  const eventId = match ? parseInt(params.id) : null;

  // Fetch event details
  const { data: event, isLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: eventId !== null,
  });

  // Fetch registration status
  const { data: registrations } = useQuery({
    queryKey: ["/api/registrations/user"],
    enabled: !!user,
  });

  // Check if user is registered for this event
  const isRegistered = registrations?.some(reg => reg.eventId === eventId);

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/registrations", {
        eventId: eventId,
        hasPaid: event.type === "free" ? true : false, // In a real app, would handle payment flow
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations/user"] });
      showNotificationToast({
        id: Date.now(),
        userId: user?.id || 0,
        message: `You have successfully registered for ${event.title}`,
        isRead: false,
        createdAt: new Date(),
        eventId: eventId || 0,
      });
      setRegisterDialogOpen(false);
    },
  });

  const handleRegister = () => {
    if (!user) {
      navigate("/login?redirect=/events/" + eventId);
      return;
    }

    if (event.type === "free") {
      registerMutation.mutate();
    } else {
      setRegisterDialogOpen(true);
    }
  };

  const confirmRegistration = () => {
    registerMutation.mutate();
  };

  if (!match) {
    navigate("/404");
    return null;
  }

  const renderEventHeader = () => (
    <div className="relative mb-8">
      <div className="h-64 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg overflow-hidden">
        {event?.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-calendar-event-line text-8xl text-white opacity-20"></i>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
            {event?.category === "technical" ? "Technical" : "Non-Technical"}
          </Badge>
          <Badge variant="outline" className={`${
            event?.type === "free" 
              ? "bg-green-100 text-green-800 hover:bg-green-200" 
              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            } border-none`}
          >
            {event?.type === "free" ? "Free" : "Paid"}
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{event?.title}</h1>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-64 w-full rounded-lg mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          
          <Skeleton className="h-8 w-1/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
        </div>
        <div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );

  const formatEventDate = (date: Date | string) => {
    const eventDate = new Date(date);
    return format(eventDate, "MMMM d, yyyy 'at' h:mm a");
  };

  if (isLoading || !event) {
    return renderLoading();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderEventHeader()}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Event details */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
                <CardDescription>
                  Organized by <span className="font-medium">{event.organizerId}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                
                <h3 className="text-lg font-semibold mt-8 mb-3">Event Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <i className="ri-calendar-line text-primary-500 mt-1 mr-3 text-lg"></i>
                    <div>
                      <p className="font-medium">Date and Time</p>
                      <p className="text-gray-600">{formatEventDate(event.eventDate)}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-map-pin-line text-primary-500 mt-1 mr-3 text-lg"></i>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-user-line text-primary-500 mt-1 mr-3 text-lg"></i>
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-gray-600">{event.capacity} attendees</p>
                    </div>
                  </li>
                  {event.type === "paid" && (
                    <li className="flex items-start">
                      <i className="ri-money-dollar-circle-line text-primary-500 mt-1 mr-3 text-lg"></i>
                      <div>
                        <p className="font-medium">Price</p>
                        <p className="text-gray-600">${event.price || 0}</p>
                      </div>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Who's Attending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Avatar key={i}>
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-500 text-sm">
                    +{event.capacity - 5}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Registration card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${isRegistered ? "text-green-600" : "text-blue-600"}`}>
                      {isRegistered ? "Registered" : "Open"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{event.type === "free" ? "Free" : "Paid"}</span>
                  </div>
                  {event.type === "paid" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${event.price}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Spots:</span>
                    <span className="font-medium">{event.capacity - (event._count?.registrations || 0)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={isRegistered || registerMutation.isPending || (authLoading && !user)}
                  onClick={handleRegister}
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i> Processing
                    </span>
                  ) : isRegistered ? (
                    <span className="flex items-center">
                      <i className="ri-check-line mr-2"></i> Registered
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <i className="ri-user-add-line mr-2"></i> Register Now
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Share This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button variant="outline" size="icon">
                    <i className="ri-facebook-fill text-blue-600"></i>
                  </Button>
                  <Button variant="outline" size="icon">
                    <i className="ri-twitter-fill text-sky-500"></i>
                  </Button>
                  <Button variant="outline" size="icon">
                    <i className="ri-linkedin-fill text-blue-700"></i>
                  </Button>
                  <Button variant="outline" size="icon">
                    <i className="ri-mail-line text-gray-600"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Payment confirmation dialog */}
      <AlertDialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
            <AlertDialogDescription>
              This is a paid event with a fee of ${event.price}. Would you like to proceed with payment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRegistration}>
              Proceed to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDetails;

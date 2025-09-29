import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertEventSchema } from "@shared/schema";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Create a more relaxed validation schema for the form
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  eventDate: z.date({
    required_error: "Event date is required",
    invalid_type_error: "Event date must be a valid date",
  }),
  capacity: z.number().min(1, "Capacity must be at least 1").default(50),
  price: z.number().min(0).nullable().optional(),
  bannerImage: z.string().nullable().optional(),
  category: z.enum(["technical", "non_technical"], {
    required_error: "Please select a category",
  }),
  type: z.enum(["free", "paid"], {
    required_error: "Please select an event type",
  }).default("free"),
  organizerId: z.number().optional(),
});

// Define the form values type with Date type for eventDate
type CreateEventFormValues = z.infer<typeof createEventSchema>;

const CreateEvent = () => {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      eventDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      category: "technical",
      type: "free",
      price: 0,
      capacity: 50,
      bannerImage: "",
      organizerId: user?.id || 0,
    },
  });

  // Watch for type changes to handle price
  const eventType = form.watch("type");

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateEventFormValues) => {
      // Ensure we have a complete data object with all required fields properly set
      const apiData = {
        // Required fields with validation
        title: eventData.title?.trim(),
        description: eventData.description?.trim(),
        location: eventData.location?.trim(),
        // Ensure eventDate is properly formatted
        eventDate: eventData.eventDate instanceof Date 
          ? eventData.eventDate.toISOString() 
          : new Date().toISOString(),
        category: eventData.category || "technical",
        type: eventData.type || "free",
        // Handle optional fields with defaults
        price: eventData.type === "free" ? 0 : (eventData.price || 0),
        capacity: eventData.capacity || 50,
        bannerImage: eventData.bannerImage || null,
        // Always set the organizerId from the current user
        organizerId: user?.id || 0
      };
      
      console.log("Sending event data:", apiData);
      return apiRequest("POST", "/api/events", apiData);
    },
    onSuccess: async (response) => {
      const eventData = await response.json();
      toast({
        title: "Event Created",
        description: "Your event has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/organizer/${user?.id}`] });
      navigate(`/events/${eventData.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Event",
        description: (error as Error).message || "There was an error creating your event.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: CreateEventFormValues) => {
    createEventMutation.mutate(values);
  };

  // Handle banner image change
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files[0]) {
      // This would normally upload to a server and get a URL back
      // For now, just set a placeholder URL
      const imageUrl = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80";
      form.setValue("bannerImage", imageUrl);
      setBannerPreview(imageUrl);
      toast({
        title: "Image Upload",
        description: "For this demo, a placeholder image URL is used instead of actual upload.",
      });
    }
  };

  // Redirect if not an event manager
  if (!authLoading && user && user.role !== "event_manager") {
    navigate("/dashboard");
    return null;
  }

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in as an event manager to create events.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center space-x-4">
            <Button asChild>
              <a href="/login">Log In</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/register?role=event_manager">Sign Up as Event Manager</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create a New Event</h1>
              <p className="text-gray-600">Fill in the details to create your educational event</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>
                Provide details about your event to attract attendees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Web Development Workshop" 
                            {...field} 
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Choose a clear, descriptive title for your event
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={createEventMutation.isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="non_technical">Non-Technical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Categorize your event to help attendees find it
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={createEventMutation.isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Is this a free or paid event?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {eventType === "paid" && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              placeholder="0.00" 
                              value={field.value?.toString() || ''} 
                              onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                              disabled={createEventMutation.isPending}
                            />
                          </FormControl>
                          <FormDescription>
                            Set the registration fee for your event
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of your event..." 
                            className="min-h-32" 
                            {...field} 
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Include important details like agenda, speakers, and what attendees will learn
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Computer Science Building, Room 101" 
                              {...field} 
                              disabled={createEventMutation.isPending}
                            />
                          </FormControl>
                          <FormDescription>
                            Specify where the event will take place
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="50" 
                              value={field.value?.toString() || '50'} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 50)}
                              disabled={createEventMutation.isPending}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of attendees
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Date and Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={createEventMutation.isPending}
                              >
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date and time</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  // Preserve the time when changing date
                                  const currentDate = field.value || new Date();
                                  date.setHours(currentDate.getHours());
                                  date.setMinutes(currentDate.getMinutes());
                                  field.onChange(date);
                                }
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                            <div className="p-3 border-t border-border">
                              <Input
                                type="time"
                                value={format(field.value || new Date(), "HH:mm")}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(":");
                                  const newDate = new Date(field.value || new Date());
                                  newDate.setHours(parseInt(hours, 10));
                                  newDate.setMinutes(parseInt(minutes, 10));
                                  field.onChange(newDate);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select when your event will take place
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bannerImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {bannerPreview && (
                              <div className="mt-2 relative rounded-lg overflow-hidden h-48">
                                <img 
                                  src={bannerPreview} 
                                  alt="Event banner preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleBannerChange}
                              disabled={createEventMutation.isPending}
                              className="cursor-pointer"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload an image to make your event stand out (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <i className="ri-loader-4-line animate-spin mr-2"></i> Creating Event...
                        </span>
                      ) : (
                        "Create Event"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-gray-500">
              Make sure all information is accurate before creating your event
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateEvent;

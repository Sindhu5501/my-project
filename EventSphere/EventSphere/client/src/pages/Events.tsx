import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import EventCard from "@/components/EventCard";
import { Event } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const Events = () => {
  // Get search params
  const [search] = useSearch();
  const params = new URLSearchParams(search);
  const categoryParam = params.get("category");
  
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  // Fetch all events
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Filter events based on search and filters
  useEffect(() => {
    if (!events) return;
    
    let filtered = [...events] as Event[];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => 
        event.category === selectedCategory
      );
    }
    
    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(event => 
        event.type === selectedType
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory, selectedType]);
  
  // Update filters when URL params change
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const handleSaveEvent = (id: number) => {
    console.log("Saved event", id);
    // In a real app, would call API to save this event for the user
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
          <p className="mt-2 text-gray-600">Find and register for educational events that match your interests</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input 
                type="text" 
                placeholder="Search by title, description or location" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="non_technical">Non-Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={selectedType} 
                onValueChange={(value) => setSelectedType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        
        <Tabs defaultValue="upcoming" className="mb-8">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-5">
                      <Skeleton className="h-6 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-5/6 mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-8 w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredEvents.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredEvents.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event}
                        onBookmark={handleSaveEvent} 
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-16">
                    <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search term</p>
                    <Button 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedType('all');
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            <div className="text-center py-16">
              <i className="ri-time-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900">Past Events</h3>
              <p className="text-gray-500 mt-1">View events that have already taken place</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;

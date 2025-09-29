import { useQuery } from "@tanstack/react-query";
import { useEventsStore } from "@/lib/store";
import { Event } from "@shared/schema";

export const useEvents = () => {
  const { 
    featuredEvents, 
    categories, 
    setFeaturedEvents, 
    setCategories 
  } = useEventsStore();

  // Fetch all events
  const { 
    data: events, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch events by category
  const getEventsByCategory = (category: string) => {
    return useQuery<Event[]>({
      queryKey: [`/api/events/category/${category}`],
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Fetch events by organizer
  const getEventsByOrganizer = (organizerId: number) => {
    return useQuery<Event[]>({
      queryKey: [`/api/events/organizer/${organizerId}`],
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: organizerId !== undefined && organizerId > 0,
    });
  };

  // Get a single event
  const getEvent = (eventId: number) => {
    return useQuery<Event>({
      queryKey: [`/api/events/${eventId}`],
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: eventId !== undefined && eventId > 0,
    });
  };

  // Filter events by search term
  const filterEventsBySearchTerm = (searchTerm: string, eventsList: Event[] = []) => {
    if (!searchTerm) return eventsList;
    
    const term = searchTerm.toLowerCase();
    return eventsList.filter(
      event => 
        event.title.toLowerCase().includes(term) || 
        event.description.toLowerCase().includes(term) || 
        event.location.toLowerCase().includes(term)
    );
  };

  // Filter events by category
  const filterEventsByCategory = (category: string, eventsList: Event[] = []) => {
    if (!category || category === 'all') return eventsList;
    
    return eventsList.filter(event => event.category === category);
  };

  // Filter events by type (free/paid)
  const filterEventsByType = (type: string, eventsList: Event[] = []) => {
    if (!type || type === 'all') return eventsList;
    
    return eventsList.filter(event => event.type === type);
  };

  // Filter events by date (upcoming/past)
  const filterEventsByDate = (filter: 'upcoming' | 'past', eventsList: Event[] = []) => {
    const now = new Date();
    
    if (filter === 'upcoming') {
      return eventsList.filter(event => new Date(event.eventDate) >= now);
    } else {
      return eventsList.filter(event => new Date(event.eventDate) < now);
    }
  };

  return {
    events,
    isLoading,
    isError,
    refetch,
    featuredEvents,
    categories,
    setFeaturedEvents,
    setCategories,
    getEventsByCategory,
    getEventsByOrganizer,
    getEvent,
    filterEventsBySearchTerm,
    filterEventsByCategory,
    filterEventsByType,
    filterEventsByDate
  };
};

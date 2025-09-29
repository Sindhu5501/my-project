import { Link } from "wouter";
import { Event } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EventCardProps {
  event: Event;
  onBookmark?: (id: number) => void;
  isBookmarked?: boolean;
}

const EventCard = ({ event, onBookmark, isBookmarked = false }: EventCardProps) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const { user } = useAuth();
  
  const categoryLabel = event.category === "technical" ? "Technical" : "Non-Technical";
  const categoryClass = event.category === "technical" ? "bg-blue-100 text-blue-800" : "bg-indigo-100 text-indigo-800";
  
  const typeLabel = event.type === "free" ? "Free" : "Paid";
  const typeClass = event.type === "free" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800";
  
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (onBookmark) {
      onBookmark(event.id);
    }
  };
  
  // Mock attendees for now - would come from event data in a real app
  const attendees = [
    { initials: "P", backgroundColor: "bg-primary-200", textColor: "text-primary-700" },
    { initials: "L", backgroundColor: "bg-accent-200", textColor: "text-accent-700" },
    { initials: "K", backgroundColor: "bg-secondary-200", textColor: "text-secondary-700" },
  ];
  
  const formatEventDate = (date: Date | string) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) + " • " + eventDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all">
      <div className="relative h-48 w-full">
        {event.bannerImage ? (
          <img 
            src={event.bannerImage} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
            <i className="ri-calendar-event-line text-5xl text-primary-500"></i>
          </div>
        )}
        <div className="absolute top-0 left-0 mt-4 ml-4">
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${categoryClass}`}>
            {categoryLabel}
          </span>
        </div>
        <div className="absolute top-0 right-0 mt-4 mr-4">
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${typeClass}`}>
            {typeLabel}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <Link href={`/events/${event.id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors cursor-pointer">{event.title}</h3>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={bookmarked ? "text-primary-500" : "text-gray-400 hover:text-primary-500"}
                  onClick={handleBookmark}
                >
                  <i className={`${bookmarked ? "ri-bookmark-fill" : "ri-bookmark-line"} text-xl`}></i>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{bookmarked ? "Remove from saved" : "Save for later"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="mt-2 text-gray-600 line-clamp-2">{event.description}</p>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <i className="ri-calendar-line mr-1"></i>
          <span>{formatEventDate(event.eventDate)}</span>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <i className="ri-map-pin-line mr-1"></i>
          <span>{event.location}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {attendees.map((attendee, index) => (
                <div 
                  key={index}
                  className={`w-7 h-7 rounded-full ${attendee.backgroundColor} flex items-center justify-center text-xs ${attendee.textColor}`}
                >
                  {attendee.initials}
                </div>
              ))}
            </div>
            <span className="ml-2 text-xs text-gray-500">42 attending</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/events/${event.id}`}>
              Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

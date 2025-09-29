import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import CategoryCard from "@/components/CategoryCard";
import EventCard from "@/components/EventCard";
import RoleCard from "@/components/RoleCard";
import TestimonialCard from "@/components/TestimonialCard";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";

const Home = () => {
  const { user } = useAuth();
  const { featuredEvents, categories, setFeaturedEvents } = useEvents();
  
  // Fetch featured events
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (events && events.length > 0) {
      setFeaturedEvents(events.slice(0, 3) as Event[]);
    }
  }, [events, setFeaturedEvents]);

  const studentFeatures = [
    { text: "Discover events aligned with your interests" },
    { text: "Register for events with a single click" },
    { text: "Receive notifications about upcoming events" },
    { text: "Track your event participation history" },
    { text: "Connect with other attendees" },
  ];

  const managerFeatures = [
    { text: "Create and publish educational events" },
    { text: "Manage event registrations and attendees" },
    { text: "Access analytics and attendance reports" },
    { text: "Send notifications to registered attendees" },
    { text: "Collect feedback and improve future events" },
  ];

  const testimonials = [
    {
      name: "Alex Mitchell",
      role: "Computer Science Student",
      initials: "AM",
      testimonal: "The platform made it super easy to find tech workshops and hackathons. I've attended 5 events so far and each one has been valuable for my learning journey.",
      rating: 5,
      bgColor: "bg-primary-200",
      textColor: "text-primary-700",
    },
    {
      name: "Sarah Johnson",
      role: "Business Administration",
      initials: "SJ",
      testimonal: "I love how easy it is to register for events. The notification system ensures I never miss important leadership seminars that complement my studies.",
      rating: 4.5,
      bgColor: "bg-accent-200",
      textColor: "text-accent-700",
    },
    {
      name: "Dr. Rebecca Lee",
      role: "Event Manager, Engineering Dept",
      initials: "DR",
      testimonal: "As an event organizer, this platform has streamlined our workshop management process. The analytics help us understand student interests and improve our offerings.",
      rating: 5,
      bgColor: "bg-secondary-200",
      textColor: "text-secondary-700",
    },
  ];

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Welcome to EventSphere
              </h1>
              <h2 className="text-2xl md:text-3xl mt-3 font-semibold text-primary-100">
                The Ultimate Campus Event Platform
              </h2>
              <p className="mt-4 text-lg md:text-xl text-primary-100">
                Join thousands of students in expanding your knowledge, networking, and growing professionally through our diverse range of educational events.
              </p>
              <p className="mt-3 text-lg text-primary-200">
                EventSphere connects students with industry experts, thought leaders, and professionals through workshops, seminars, hackathons, and networking events. Never miss an opportunity to enhance your skills and build meaningful connections.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/events">
                    <i className="ri-search-line mr-2"></i> Browse Events
                  </Link>
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="bg-accent-500 text-white hover:bg-accent-600"
                  asChild
                >
                  <Link href={user ? "/dashboard" : "/register"}>
                    <i className="ri-user-add-line mr-2"></i> {user ? "Dashboard" : "Sign Up"}
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src="https://images.unsplash.com/photo-1558008258-3256797b43f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80"
                alt="College seminar with students and professor"
                className="rounded-xl shadow-xl w-full object-cover h-80 md:h-96"
              />
              <div className="mt-4 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <p className="text-sm text-white">
                  "EventSphere has transformed how our institution connects students with educational opportunities, fostering a more engaged and collaborative campus community."
                </p>
                <p className="text-xs text-white/80 mt-2 font-semibold">— Dr. Amanda Chen, Director of Student Engagement</p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Featured Events Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mb-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Events</h2>
              <p className="text-gray-600 mt-2 max-w-3xl mx-auto">
                Explore our most popular upcoming events curated by leading academic institutions and industry partners
              </p>
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-lg border border-primary-100">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="bg-white p-3 rounded-full">
                  <i className="ri-calendar-event-fill text-3xl text-primary-600"></i>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-semibold">Why attend EventSphere events?</h3>
                  <p className="text-gray-600 mt-1">
                    Our events are carefully selected to provide maximum educational value, networking opportunities, 
                    and skill development for students across all disciplines. 
                    From technical workshops to career fairs, we've got your academic journey covered.
                  </p>
                </div>
                <Link href="/events" className="text-primary-600 hover:text-primary-800 font-medium flex items-center whitespace-nowrap">
                  View all events <i className="ri-arrow-right-line ml-1"></i>
                </Link>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm h-96 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerAnimation}
              initial="hidden"
              animate="show"
            >
              {featuredEvents.length > 0 ? (
                featuredEvents.map((event) => (
                  <motion.div key={event.id} variants={itemAnimation}>
                    <EventCard event={event} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 bg-white rounded-xl shadow-sm p-8">
                  <div className="flex flex-col items-center">
                    <i className="ri-calendar-line text-5xl text-gray-300 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-700">No Events Yet</h3>
                    <p className="text-gray-500 mt-2 max-w-md">
                      We're currently working on bringing you amazing educational events. 
                      Check back soon or sign up for notifications when new events are added.
                    </p>
                    <Button className="mt-6" asChild>
                      <Link href="/register">
                        <i className="ri-notification-line mr-2"></i>
                        Get Notified
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-600 mt-2 max-w-3xl mx-auto">
              Find events that match your interests and academic goals. EventSphere offers a diverse range of categories to help you discover exactly what you're looking for.
            </p>
          </div>
          
          <div className="mb-10 bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="bg-primary-100 p-3 rounded-full mr-4">
                  <i className="ri-filter-line text-xl text-primary-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Refined Filtering</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Filter events by category, date, or format to find the perfect match for your schedule and interests.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-accent-100 p-3 rounded-full mr-4">
                  <i className="ri-notification-line text-xl text-accent-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Personalized Alerts</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Subscribe to category alerts and never miss events in your preferred areas of interest.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-secondary-100 p-3 rounded-full mr-4">
                  <i className="ri-award-line text-xl text-secondary-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Curated Collections</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Discover curated event series and specialized tracks to build complementary skills in your field.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            variants={containerAnimation}
            initial="hidden"
            animate="show"
          >
            {categories.map((category, index) => (
              <motion.div key={index} variants={itemAnimation}>
                <CategoryCard
                  name={category.name}
                  count={category.count}
                  icon={category.icon}
                  href={`/events?category=${category.name.toLowerCase()}`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role-Based Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Platform for Everyone</h2>
            <p className="text-gray-600 mt-2">Tailored features for different roles</p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerAnimation}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemAnimation}>
              <RoleCard
                title="For Students"
                icon="ri-user-line"
                iconBg="bg-primary-100"
                iconColor="text-primary-600"
                features={studentFeatures}
                ctaText="Sign Up as Student"
                ctaHref="/register?role=student"
                ctaBg="primary-600"
                ctaHoverBg="primary-700"
              />
            </motion.div>
            
            <motion.div variants={itemAnimation}>
              <RoleCard
                title="For Event Managers"
                icon="ri-calendar-check-line"
                iconBg="bg-accent-100"
                iconColor="text-accent-600"
                features={managerFeatures}
                ctaText="Sign Up as Event Manager"
                ctaHref="/register?role=event_manager"
                ctaBg="accent-600"
                ctaHoverBg="accent-700"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="text-gray-600 mt-2">Hear from students and event managers about their experience</p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerAnimation}
            initial="hidden"
            animate="show"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={itemAnimation}>
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-accent-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Enhance Your Educational Experience?</h2>
            <p className="mt-4 text-accent-100 text-lg">Join EventSphere today and never miss out on valuable educational opportunities.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                variant="default"
                className="bg-white text-accent-700 hover:bg-gray-100"
                asChild
              >
                <Link href="/register">
                  <i className="ri-user-add-line mr-2"></i> Create Account
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-accent-700 text-white border border-accent-400 hover:bg-accent-800"
                asChild
              >
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;

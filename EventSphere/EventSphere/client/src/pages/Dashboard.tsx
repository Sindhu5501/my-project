import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user's registered events
  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["/api/registrations/user"],
    enabled: !!user,
  });

  // Fetch user analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/user"],
    enabled: !!user,
  });

  // For event managers, fetch their created events
  const { data: managedEvents, isLoading: managedEventsLoading } = useQuery({
    queryKey: [`/api/events/organizer/${user?.id}`],
    enabled: !!user && user.role === "event_manager",
  });

  // Mock data for analytics visualizations
  const eventTypeData = [
    { name: "Technical", value: registrations?.filter(r => r.event?.category === "technical").length || 0 },
    { name: "Non-Technical", value: registrations?.filter(r => r.event?.category === "non_technical").length || 0 },
  ];

  const eventAttendanceData = [
    { name: "Registered", value: analytics?.registeredEvents || 0 },
    { name: "Attended", value: analytics?.attendedEvents || 0 },
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"];

  // Format date for display
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-6">
            <Skeleton className="h-12 w-1/4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to view your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center space-x-4">
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user.firstName} {user.lastName}!
            </p>
          </div>
          
          {user.role === "event_manager" && (
            <Button asChild className="mt-4 md:mt-0">
              <Link href="/create-event">
                <i className="ri-add-line mr-2"></i> Create New Event
              </Link>
            </Button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Registered Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      analytics?.registeredEvents || 0
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total events you've registered for
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Attended Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      analytics?.attendedEvents || 0
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Events you've participated in
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {registrationsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      registrations?.filter(r => new Date(r.event?.eventDate) > new Date()).length || 0
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Events you'll be attending soon
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Categories</CardTitle>
                  <CardDescription>
                    Distribution of your registered events by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-64 h-64">
                    {registrationsLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-32 h-32 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={eventTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {eventTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Event Participation</CardTitle>
                  <CardDescription>
                    Your event registration and attendance stats
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-full h-64">
                    {analyticsLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-32 h-32 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={eventAttendanceData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {user.role === "event_manager" && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>
                    Stats for events you've organized
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {managedEventsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : managedEvents && managedEvents.length > 0 ? (
                    <div className="space-y-4">
                      <p>Total Events Created: <span className="font-bold">{managedEvents.length}</span></p>
                      <p>Total Registrations: <span className="font-bold">
                        {managedEvents.reduce((sum, event) => sum + (event._count?.registrations || 0), 0)}
                      </span></p>
                      <p>Average Fill Rate: <span className="font-bold">
                        {Math.round(managedEvents.reduce((sum, event) => 
                          sum + ((event._count?.registrations || 0) / event.capacity) * 100, 0) / managedEvents.length)}%
                      </span></p>
                    </div>
                  ) : (
                    <p className="text-gray-500">You haven't created any events yet.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {user.role === "event_manager" && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Created Events</CardTitle>
                  <CardDescription>
                    Events you've organized
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {managedEventsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : managedEvents && managedEvents.length > 0 ? (
                    <div className="space-y-4">
                      {managedEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-gray-500">{formatDate(event.eventDate)}</p>
                            <div className="flex items-center mt-1 space-x-2">
                              <Badge variant="outline" className={event.category === "technical" ? "bg-blue-100 text-blue-800" : "bg-indigo-100 text-indigo-800"}>
                                {event.category === "technical" ? "Technical" : "Non-Technical"}
                              </Badge>
                              <Badge variant="outline" className={event.type === "free" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                                {event.type === "free" ? "Free" : "Paid"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Registrations</p>
                              <p className="font-medium">{event._count?.registrations || 0} / {event.capacity}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/events/${event.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <i className="ri-calendar-2-line text-4xl text-gray-300 mb-3"></i>
                      <h3 className="text-lg font-medium">No events created yet</h3>
                      <p className="text-gray-500 mb-4">Start organizing educational events for your institution</p>
                      <Button asChild>
                        <Link href="/create-event">Create Your First Event</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Your Registered Events</CardTitle>
                <CardDescription>
                  Events you've signed up for
                </CardDescription>
              </CardHeader>
              <CardContent>
                {registrationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : registrations && registrations.length > 0 ? (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div>
                          <h3 className="font-medium">{registration.event?.title}</h3>
                          <p className="text-sm text-gray-500">{formatDate(registration.event?.eventDate)}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            <Badge variant="outline" className={registration.event?.category === "technical" ? "bg-blue-100 text-blue-800" : "bg-indigo-100 text-indigo-800"}>
                              {registration.event?.category === "technical" ? "Technical" : "Non-Technical"}
                            </Badge>
                            <Badge variant="outline" className={registration.hasAttended ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {registration.hasAttended ? "Attended" : "Not Attended"}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/events/${registration.eventId}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <i className="ri-calendar-line text-4xl text-gray-300 mb-3"></i>
                    <h3 className="text-lg font-medium">No events registered</h3>
                    <p className="text-gray-500 mb-4">Browse and register for educational events</p>
                    <Button asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Stay updated with event announcements and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border rounded-lg ${notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}
                      >
                        <div className="flex justify-between">
                          <div className="flex space-x-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                              <i className={`ri-notification-2-line ${notification.isRead ? 'text-gray-500' : 'text-blue-500'}`}></i>
                            </div>
                            <div>
                              <p className={`${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                        {notification.eventId && (
                          <div className="mt-2 ml-13">
                            <Button variant="link" size="sm" className="px-0" asChild>
                              <Link href={`/events/${notification.eventId}`}>
                                View Event
                              </Link>
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <i className="ri-notification-line text-4xl text-gray-300 mb-3"></i>
                    <h3 className="text-lg font-medium">No notifications</h3>
                    <p className="text-gray-500">You're all caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  View and manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24">
                      {user.profileImage ? (
                        <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                      ) : (
                        <AvatarFallback className="text-lg bg-primary-100 text-primary-800">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="mt-4 text-lg font-medium">{user.firstName} {user.lastName}</h3>
                    <p className="text-gray-500">{user.role === "student" ? "Student" : "Event Manager"}</p>
                    <Badge className="mt-2" variant="outline">
                      {user.department || "No Department"}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Username</h4>
                      <p>{user.username}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                      <p className="text-sm">{user.bio || "No bio provided"}</p>
                    </div>
                    <div className="pt-4">
                      <Button variant="outline">Edit Profile</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-500">Update your password</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Notification Preferences</h4>
                      <p className="text-sm text-gray-500">Manage your notification settings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-red-600">Delete Account</h4>
                      <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

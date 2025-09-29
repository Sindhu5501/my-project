import { 
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  registrations, type Registration, type InsertRegistration,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getEventsByCategory(category: string): Promise<Event[]>;
  getEventsByOrganizer(organizerId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Registration operations
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationByUserAndEvent(userId: number, eventId: number): Promise<Registration | undefined>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  getRegistrationsByEvent(eventId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: number, registrationData: Partial<InsertRegistration>): Promise<Registration | undefined>;
  deleteRegistration(id: number): Promise<boolean>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Analytics operations
  getEventAttendanceCount(eventId: number): Promise<number>;
  getUserAttendanceCount(userId: number): Promise<number>;
  getUpcomingEventsCount(): Promise<number>;
  getRegisteredEventsCount(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private registrations: Map<number, Registration>;
  private notifications: Map<number, Notification>;
  private userCurrentId: number;
  private eventCurrentId: number;
  private registrationCurrentId: number;
  private notificationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.registrations = new Map();
    this.notifications = new Map();
    this.userCurrentId = 1;
    this.eventCurrentId = 1;
    this.registrationCurrentId = 1;
    this.notificationCurrentId = 1;
    
    // Add some sample data for testing
    this.initializeSampleData();
  }

  // Initialize sample data for development
  private initializeSampleData() {
    // Sample event manager
    const eventManager = this.createUser({
      username: "manager",
      password: "password",
      email: "manager@example.com",
      firstName: "Event",
      lastName: "Manager",
      role: "event_manager",
      department: "Computer Science",
      bio: "I organize tech events",
      profileImage: "",
      company: "TechEvents Inc.",
      yearsOfExperience: 5
    });
    
    // Sample student
    const student = this.createUser({
      username: "student",
      password: "password",
      email: "student@example.com",
      firstName: "Student",
      lastName: "User",
      role: "student",
      department: "Engineering",
      bio: "I love attending events",
      profileImage: ""
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    // Ensure all required fields are set with proper defaults
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'student',
      department: insertUser.department || null,
      bio: insertUser.bio || null,
      profileImage: insertUser.profileImage || null,
      company: insertUser.company || null,
      yearsOfExperience: insertUser.yearsOfExperience || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEventsByCategory(category: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.category === category
    );
  }
  
  async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.organizerId === organizerId
    );
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    // Ensure all required fields are set with proper defaults
    const event: Event = { 
      ...insertEvent, 
      id,
      type: insertEvent.type || 'free',
      price: insertEvent.price || 0,
      bannerImage: insertEvent.bannerImage || null
    };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Registration operations
  async getRegistration(id: number): Promise<Registration | undefined> {
    return this.registrations.get(id);
  }
  
  async getRegistrationByUserAndEvent(userId: number, eventId: number): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (reg) => reg.userId === userId && reg.eventId === eventId
    );
  }
  
  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (reg) => reg.userId === userId
    );
  }
  
  async getRegistrationsByEvent(eventId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (reg) => reg.eventId === eventId
    );
  }
  
  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.registrationCurrentId++;
    const registration: Registration = { 
      ...insertRegistration, 
      id, 
      registrationDate: new Date(),
      hasPaid: insertRegistration.hasPaid === undefined ? false : insertRegistration.hasPaid,
      hasAttended: insertRegistration.hasAttended === undefined ? false : insertRegistration.hasAttended
    };
    this.registrations.set(id, registration);
    return registration;
  }
  
  async updateRegistration(id: number, registrationData: Partial<InsertRegistration>): Promise<Registration | undefined> {
    const registration = await this.getRegistration(id);
    if (!registration) return undefined;
    
    const updatedRegistration = { ...registration, ...registrationData };
    this.registrations.set(id, updatedRegistration);
    return updatedRegistration;
  }
  
  async deleteRegistration(id: number): Promise<boolean> {
    return this.registrations.delete(id);
  }
  
  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      isRead: false,
      createdAt: new Date(),
      eventId: insertNotification.eventId || null
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  // Analytics operations
  async getEventAttendanceCount(eventId: number): Promise<number> {
    const registrations = await this.getRegistrationsByEvent(eventId);
    return registrations.filter(reg => reg.hasAttended).length;
  }
  
  async getUserAttendanceCount(userId: number): Promise<number> {
    const registrations = await this.getRegistrationsByUser(userId);
    return registrations.filter(reg => reg.hasAttended).length;
  }
  
  async getUpcomingEventsCount(): Promise<number> {
    const now = new Date();
    return Array.from(this.events.values()).filter(
      (event) => new Date(event.eventDate) > now
    ).length;
  }
  
  async getRegisteredEventsCount(userId: number): Promise<number> {
    const registrations = await this.getRegistrationsByUser(userId);
    return registrations.length;
  }
}

export const storage = new MemStorage();

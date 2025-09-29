import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { 
  insertUserSchema, 
  insertEventSchema, 
  insertRegistrationSchema, 
  insertNotificationSchema 
} from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: randomUUID(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Passport.js setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isEventManager = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === 'event_manager') {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Requires event manager role" });
  };

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.post("/api/events", isEventManager, async (req, res) => {
    try {
      console.log("Received event data:", req.body);
      
      // Parse date manually to ensure proper format
      const eventData = {
        ...req.body,
        // Ensure all required fields have proper values
        organizerId: (req.user as any).id,
        type: req.body.type || 'free',
        price: req.body.type === 'free' ? 0 : (req.body.price || 0),
        bannerImage: req.body.bannerImage || null,
        // Parse date if it's a string, otherwise use it as is
        eventDate: typeof req.body.eventDate === 'string' 
          ? new Date(req.body.eventDate) 
          : req.body.eventDate
      };
      
      // Validate with schema
      const validatedData = insertEventSchema.parse(eventData);
      console.log("Validated event data:", validatedData);
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/api/events/:id", isEventManager, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      
      // Check if event exists
      const existingEvent = await storage.getEvent(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is the organizer
      if (existingEvent.organizerId !== (req.user as any).id) {
        return res.status(403).json({ message: "You don't have permission to update this event" });
      }
      
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      res.json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/events/:id", isEventManager, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Check if event exists
      const existingEvent = await storage.getEvent(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is the organizer
      if (existingEvent.organizerId !== (req.user as any).id) {
        return res.status(403).json({ message: "You don't have permission to delete this event" });
      }
      
      const deleted = await storage.deleteEvent(eventId);
      if (deleted) {
        res.json({ message: "Event deleted successfully" });
      } else {
        res.status(400).json({ message: "Failed to delete event" });
      }
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/events/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const events = await storage.getEventsByCategory(category);
      res.json(events);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/events/organizer/:id", async (req, res) => {
    try {
      const organizerId = parseInt(req.params.id);
      const events = await storage.getEventsByOrganizer(organizerId);
      res.json(events);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Registration routes
  app.post("/api/registrations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { eventId, hasPaid } = insertRegistrationSchema.parse({
        ...req.body,
        userId,
      });
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if already registered
      const existingRegistration = await storage.getRegistrationByUserAndEvent(userId, eventId);
      if (existingRegistration) {
        return res.status(400).json({ message: "Already registered for this event" });
      }
      
      // Check if event capacity is reached
      const registrations = await storage.getRegistrationsByEvent(eventId);
      if (registrations.length >= event.capacity) {
        return res.status(400).json({ message: "Event capacity reached" });
      }
      
      // For paid events, check payment status
      if (event.type === 'paid' && !hasPaid) {
        return res.status(400).json({ message: "Payment required for this event" });
      }
      
      const registration = await storage.createRegistration({
        userId,
        eventId,
        hasPaid: event.type === 'free' ? true : Boolean(hasPaid),
        hasAttended: false,
      });
      
      // Create notification for user
      await storage.createNotification({
        userId,
        message: `You have successfully registered for ${event.title}`,
        eventId,
      });
      
      res.status(201).json(registration);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/registrations/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const registrations = await storage.getRegistrationsByUser(userId);
      res.json(registrations);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/registrations/event/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      // Check if user is the organizer or admin
      if (event?.organizerId !== (req.user as any).id && (req.user as any).role !== 'event_manager') {
        return res.status(403).json({ message: "You don't have permission to view these registrations" });
      }
      
      const registrations = await storage.getRegistrationsByEvent(eventId);
      res.json(registrations);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotification(notificationId);
      
      // Check if notification exists and belongs to user
      if (!notification || notification.userId !== (req.user as any).id) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Analytics routes
  app.get("/api/analytics/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const registeredCount = await storage.getRegisteredEventsCount(userId);
      const attendedCount = await storage.getUserAttendanceCount(userId);
      
      res.json({
        registeredEvents: registeredCount,
        attendedEvents: attendedCount,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/analytics/event/:id", isEventManager, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      // Check if event exists and user is organizer
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.organizerId !== (req.user as any).id) {
        return res.status(403).json({ message: "You don't have permission to view these analytics" });
      }
      
      const registrations = await storage.getRegistrationsByEvent(eventId);
      const attendees = await storage.getEventAttendanceCount(eventId);
      
      res.json({
        totalRegistrations: registrations.length,
        attendees,
        capacity: event.capacity,
        fillRate: event.capacity > 0 ? (registrations.length / event.capacity) * 100 : 0,
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

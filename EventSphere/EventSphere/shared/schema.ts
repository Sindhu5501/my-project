import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'event_manager']);
export const eventCategoryEnum = pgEnum('event_category', ['technical', 'non_technical']);
export const eventTypeEnum = pgEnum('event_type', ['free', 'paid']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRoleEnum("role").notNull().default('student'),
  department: text("department"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  company: text("company"),
  yearsOfExperience: integer("years_of_experience"),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  eventDate: timestamp("event_date").notNull(),
  category: eventCategoryEnum("category").notNull(),
  type: eventTypeEnum("type").notNull().default('free'),
  price: integer("price"),
  capacity: integer("capacity").notNull(),
  bannerImage: text("banner_image"),
  organizerId: integer("organizer_id").notNull(),
});

// Registrations table
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  hasPaid: boolean("has_paid").notNull().default(false),
  hasAttended: boolean("has_attended").notNull().default(false),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  eventId: integer("event_id"),
});

// Schema for user insertion
export const insertUserSchema = createInsertSchema(users).extend({
  company: z.string().optional(),
  yearsOfExperience: z.number().optional(),
}).omit({ id: true });

// Schema for event insertion
export const insertEventSchema = createInsertSchema(events)
  .extend({
    // Make sure price is properly handled for free events
    price: z.number().nullable().optional().default(0),
    // Make banner image optional
    bannerImage: z.string().nullable().optional(),
    // Handle date correctly
    eventDate: z.date().or(z.string().transform(val => new Date(val)))
  })
  .omit({ id: true });

// Schema for registration insertion
export const insertRegistrationSchema = createInsertSchema(registrations).omit({ 
  id: true, 
  registrationDate: true 
});

// Schema for notification insertion
export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  isRead: true, 
  createdAt: true 
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

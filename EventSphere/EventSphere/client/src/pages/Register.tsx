import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["student", "event_manager"]),
  department: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  company: z.string().optional(),
  yearsOfExperience: z.coerce.number().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [, navigate] = useLocation();
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Get role from query parameters (if any)
  const searchParams = new URLSearchParams(window.location.search);
  const roleParam = searchParams.get("role") || "student";
  
  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      role: roleParam as "student" | "event_manager",
      department: "",
      bio: "",
      profileImage: "",
      company: "",
      yearsOfExperience: 0,
    },
  });

  // Form submission handler
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setError(null);
      await register(values);
      // Registration successful - navigation is handled in the auth hook
    } catch (err) {
      setError((err as Error).message || "Registration failed. Please check your information.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2">
                <i className="ri-calendar-event-fill text-primary-600 text-3xl"></i>
                <span className="font-bold text-2xl text-primary-600">EventSphere</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Register to discover and participate in educational events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 rounded bg-red-50 text-red-600 text-sm mb-4">
                {error}
              </div>
            )}
            
            <Tabs defaultValue={roleParam} onValueChange={(value) => form.setValue("role", value as "student" | "event_manager")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="event_manager">Event Manager</TabsTrigger>
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Smith" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john.smith@example.com" 
                            {...field} 
                            disabled={isLoading} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johnsmith" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a secure password" 
                            {...field} 
                            disabled={isLoading} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Arts">Arts</SelectItem>
                            <SelectItem value="Sciences">Sciences</SelectItem>
                            <SelectItem value="Health Sciences">Health Sciences</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a little about yourself" 
                            {...field} 
                            disabled={isLoading} 
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed on your profile (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <TabsContent value="student">
                    <div className="p-4 mt-2 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-700 flex items-center">
                        <i className="ri-user-line mr-2"></i> Student Benefits
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-blue-600">
                        <li className="flex items-start">
                          <i className="ri-check-line mt-1 mr-2"></i>
                          <span>Discover events aligned with your interests</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line mt-1 mr-2"></i>
                          <span>Register for events with a single click</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line mt-1 mr-2"></i>
                          <span>Track your event participation history</span>
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="event_manager">
                    <div className="p-4 mt-2 bg-purple-50 rounded-lg mb-4">
                      <h3 className="font-medium text-purple-700 flex items-center">
                        <i className="ri-calendar-check-line mr-2"></i> Event Manager Capabilities
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-purple-600">
                        <li className="flex items-start">
                          <i className="ri-check-line mt-1 mr-2"></i>
                          <span>Create and publish educational events</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line mt-1 mr-2"></i>
                          <span>Manage event registrations and attendees</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line mt-1 mr-2"></i>
                          <span>Access analytics and attendance reports</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company/Organization</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your company or organization name" 
                                {...field} 
                                disabled={isLoading} 
                              />
                            </FormControl>
                            <FormDescription>
                              The organization you represent
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="How many years of event management experience?" 
                                {...field} 
                                disabled={isLoading} 
                              />
                            </FormControl>
                            <FormDescription>
                              Your experience in event management
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <i className="ri-loader-4-line animate-spin mr-2"></i> Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-600 hover:text-primary-800 font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;

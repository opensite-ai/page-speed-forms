"use client";

// use our own svg icons instead
import { Calendar as CalendarIcon, Clock, Phone } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// For example only
import { Card, CardContent } from "@/components/ui/card";

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const TOPICS = [
  "Product Demo",
  "Sales Inquiry",
  "Technical Support",
  "Partnership",
  "General Question",
];

export const title = "React Contact Block Callback";

export default function ContactCallback() {
  return (
    <section className="pb-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Request a Callback
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Schedule a time that works for you and we'll call you to discuss
            your needs.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 lg:p-8">
            <form action="#" className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">Your Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Acme Inc." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Preferred Callback Time
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date</Label>
                    <div className="relative">
                      <Input id="date" type="date" className="pl-10" />
                      <CalendarIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time</Label>
                    <Select>
                      <SelectTrigger id="time">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="est">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Topic */}
              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  What would you like to discuss?
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Select>
                      <SelectTrigger id="topic">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((topic) => (
                          <SelectItem key={topic} value={topic.toLowerCase()}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">
                      Additional Details (Optional)
                    </Label>
                    <Textarea
                      id="details"
                      placeholder="Help us prepare for the call by sharing any specific questions or topics you'd like to cover..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Callback Process</p>
                    <p className="mt-1 text-muted-foreground leading-relaxed">
                      We'll call you at the scheduled time at the phone number
                      you provided. Please ensure you're available to answer. If
                      you miss the call, we'll send you a follow-up email.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full gap-2" size="lg">
                <Phone className="h-4 w-4" />
                Schedule Callback
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need immediate assistance?{" "}
          <a href="#" className="text-primary hover:underline">
            Start a live chat
          </a>{" "}
          or call us at{" "}
          <a href="tel:+15551234567" className="text-primary hover:underline">
            +1 (555) 123-4567
          </a>
        </p>
      </div>
    </section>
  );
}

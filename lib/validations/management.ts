import { z } from "zod";

export const categorySchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters long."),
  slug: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  imageUrl: z.url("Enter a valid image URL.").optional().or(z.literal("")),
});

export const eventSchema = z.object({
  eventId: z.string().optional(),
  title: z.string().min(4, "Event title must be at least 4 characters long."),
  slug: z.string().trim().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Select an event category."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters long."),
  startDatetime: z.string().min(1, "Select a start date and time."),
  endDatetime: z.string().min(1, "Select an end date and time."),
  locationName: z.string().min(2, "Location name is required."),
  locationAddress: z.string().trim().optional().or(z.literal("")),
  city: z.string().min(2, "City is required."),
  imageUrl: z.url("Enter a valid image URL.").optional().or(z.literal("")),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});

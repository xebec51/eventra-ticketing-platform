import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  phone: z.string().trim().optional().or(z.literal("")),
  avatarUrl: z.url("Enter a valid avatar URL.").optional().or(z.literal("")),
});

export const organizerProfileSchema = z.object({
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters long."),
  description: z.string().trim().optional().or(z.literal("")),
  contactPerson: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  websiteUrl: z.url("Enter a valid website URL.").optional().or(z.literal("")),
  logoUrl: z.url("Enter a valid logo URL.").optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
});

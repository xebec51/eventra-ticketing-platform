import { z } from "zod";

export const ticketTypeSchema = z.object({
  eventId: z.string().min(1),
  ticketTypeId: z.string().optional(),
  name: z.string().min(2, "Ticket type name must be at least 2 characters long."),
  description: z.string().trim().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be 0 or greater."),
  quota: z.coerce.number().int().min(0, "Quota must be 0 or greater."),
  maxPerBooking: z.coerce
    .number()
    .int()
    .min(1, "Max per booking must be at least 1."),
  salesStartAt: z.string().optional().or(z.literal("")),
  salesEndAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

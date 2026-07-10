import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import {
  PrismaClient,
  UserRole,
  UserStatus,
  EventStatus,
  EventVisibility,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  TicketStatus,
} from "../app/generated/prisma/client";
import { getDatabaseUrl } from "../lib/database-url";
import { buildQrPayload } from "../lib/qr";

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash("Password123!", 10);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const users = [
    {
      id: "user_admin",
      name: "Eventra Admin",
      email: "admin@eventra.demo",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: "+65 8000 1000",
    },
    {
      id: "user_org_alpha",
      name: "Organizer Alpha",
      email: "organizer.alpha@eventra.demo",
      role: UserRole.ORGANIZER,
      status: UserStatus.ACTIVE,
      phone: "+65 8000 2001",
    },
    {
      id: "user_org_beta",
      name: "Organizer Beta",
      email: "organizer.beta@eventra.demo",
      role: UserRole.ORGANIZER,
      status: UserStatus.ACTIVE,
      phone: "+65 8000 2002",
    },
    {
      id: "user_org_pending",
      name: "Organizer Pending",
      email: "organizer.pending@eventra.demo",
      role: UserRole.ORGANIZER,
      status: UserStatus.PENDING,
      phone: "+65 8000 2003",
    },
    {
      id: "user_org_rejected",
      name: "Organizer Rejected",
      email: "organizer.rejected@eventra.demo",
      role: UserRole.ORGANIZER,
      status: UserStatus.REJECTED,
      phone: "+65 8000 2004",
    },
    {
      id: "user_one",
      name: "User One",
      email: "user.one@eventra.demo",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      phone: "+65 8000 3001",
    },
    {
      id: "user_two",
      name: "User Two",
      email: "user.two@eventra.demo",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      phone: "+65 8000 3002",
    },
  ] as const;

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        status: user.status,
        phone: user.phone,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        status: user.status,
        phone: user.phone,
      },
    });
  }

  const organizerProfiles = [
    {
      id: "org_alpha",
      userId: "user_org_alpha",
      organizationName: "Alpha Student Builders",
      description:
        "A student-led event team focused on product, startup, and operator communities.",
      contactPerson: "Organizer Alpha",
      phone: "+65 8000 2001",
      websiteUrl: "https://alpha.eventra.demo",
      address: "12 Riverfront Avenue, Singapore",
      approvedAt: new Date("2026-06-10T09:00:00.000Z"),
      approvedBy: "user_admin",
      rejectionReason: null,
    },
    {
      id: "org_beta",
      userId: "user_org_beta",
      organizationName: "Beta Community Labs",
      description:
        "A collaborative community organizer for makers, civic-tech, and meetup programs.",
      contactPerson: "Organizer Beta",
      phone: "+65 8000 2002",
      websiteUrl: "https://beta.eventra.demo",
      address: "87 Orchard Link, Singapore",
      approvedAt: new Date("2026-06-12T09:00:00.000Z"),
      approvedBy: "user_admin",
      rejectionReason: null,
    },
    {
      id: "org_pending",
      userId: "user_org_pending",
      organizationName: "Pending Campus Circle",
      description: "Awaiting admin verification and document review.",
      contactPerson: "Pending Lead",
      phone: "+65 8000 2003",
      websiteUrl: "https://pending.eventra.demo",
      address: "41 Review Street, Singapore",
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
    },
    {
      id: "org_rejected",
      userId: "user_org_rejected",
      organizationName: "Rejected Network Chapter",
      description: "Application retained for audit history.",
      contactPerson: "Rejected Lead",
      phone: "+65 8000 2004",
      websiteUrl: "https://rejected.eventra.demo",
      address: "404 Missing Docs Lane, Singapore",
      approvedAt: null,
      approvedBy: null,
      rejectionReason: "Insufficient organizer documentation.",
    },
  ] as const;

  for (const profile of organizerProfiles) {
    await prisma.organizerProfile.upsert({
      where: { id: profile.id },
      update: profile,
      create: profile,
    });
  }

  const categories = [
    {
      id: "cat_seminars",
      name: "Seminars",
      slug: "seminars",
      description: "Professional talks, expert sessions, and symposiums.",
    },
    {
      id: "cat_competitions",
      name: "Competitions",
      slug: "competitions",
      description: "Hackathons, case competitions, and challenge-based events.",
    },
    {
      id: "cat_workshops",
      name: "Workshops",
      slug: "workshops",
      description: "Hands-on classes with limited quota and guided practice.",
    },
    {
      id: "cat_communities",
      name: "Communities",
      slug: "communities",
      description: "Networking, member circles, and community meetups.",
    },
  ] as const;

  for (const category of categories) {
    await prisma.eventCategory.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
  }

  const events = [
    {
      id: "event_future_builders",
      organizerProfileId: "org_alpha",
      categoryId: "cat_seminars",
      title: "Future Builders Summit 2026",
      slug: "future-builders-summit-2026",
      description:
        "A flagship summit for product builders, community leaders, and startup operators.",
      startDatetime: new Date("2026-08-14T09:00:00.000Z"),
      endDatetime: new Date("2026-08-14T18:00:00.000Z"),
      locationName: "Nexus Convention Hall",
      locationAddress: "80 Downtown Loop, Singapore",
      city: "Singapore",
      imageUrl: null,
      status: EventStatus.PUBLISHED,
      visibility: EventVisibility.PUBLIC,
      publishedAt: new Date("2026-06-20T09:00:00.000Z"),
    },
    {
      id: "event_hack_city",
      organizerProfileId: "org_beta",
      categoryId: "cat_competitions",
      title: "Hack The City: Night Build Sprint",
      slug: "hack-the-city-night",
      description:
        "An overnight civic-tech sprint with free reservation and organizer-controlled approvals.",
      startDatetime: new Date("2026-08-22T15:00:00.000Z"),
      endDatetime: new Date("2026-08-23T07:00:00.000Z"),
      locationName: "Arcade Labs",
      locationAddress: "21 Innovation Drive, Singapore",
      city: "Singapore",
      imageUrl: null,
      status: EventStatus.PUBLISHED,
      visibility: EventVisibility.PUBLIC,
      publishedAt: new Date("2026-06-22T09:00:00.000Z"),
    },
    {
      id: "event_creative_lab",
      organizerProfileId: "org_alpha",
      categoryId: "cat_workshops",
      title: "Creative Leadership Lab",
      slug: "creative-leadership-lab",
      description:
        "A focused workshop for student leaders on facilitation and storytelling.",
      startDatetime: new Date("2026-09-03T10:00:00.000Z"),
      endDatetime: new Date("2026-09-03T16:30:00.000Z"),
      locationName: "Atelier 87",
      locationAddress: "87 Studio Walk, Bandung",
      city: "Bandung",
      imageUrl: null,
      status: EventStatus.PUBLISHED,
      visibility: EventVisibility.PUBLIC,
      publishedAt: new Date("2026-06-25T09:00:00.000Z"),
    },
    {
      id: "event_makers_market",
      organizerProfileId: "org_beta",
      categoryId: "cat_communities",
      title: "Makers Market Community Day",
      slug: "makers-market-community-day",
      description:
        "A community market blending creator booths, talks, and local networking.",
      startDatetime: new Date("2026-09-12T12:00:00.000Z"),
      endDatetime: new Date("2026-09-12T20:00:00.000Z"),
      locationName: "Common Ground Square",
      locationAddress: "3 Foundry Road, Kuala Lumpur",
      city: "Kuala Lumpur",
      imageUrl: null,
      status: EventStatus.PUBLISHED,
      visibility: EventVisibility.PUBLIC,
      publishedAt: new Date("2026-06-28T09:00:00.000Z"),
    },
    {
      id: "event_product_ops_bootcamp",
      organizerProfileId: "org_alpha",
      categoryId: "cat_workshops",
      title: "Product Ops Bootcamp Live",
      slug: "product-ops-bootcamp-live",
      description:
        "A completed workshop seeded with checked-in attendees and reviews.",
      startDatetime: new Date("2026-06-20T09:00:00.000Z"),
      endDatetime: new Date("2026-06-20T17:00:00.000Z"),
      locationName: "Launchpad Hall",
      locationAddress: "51 Harbour View, Singapore",
      city: "Singapore",
      imageUrl: null,
      status: EventStatus.COMPLETED,
      visibility: EventVisibility.PUBLIC,
      publishedAt: new Date("2026-05-10T09:00:00.000Z"),
    },
    {
      id: "event_design_private",
      organizerProfileId: "org_beta",
      categoryId: "cat_workshops",
      title: "Design Systems Intensive",
      slug: "design-systems-intensive",
      description:
        "A private draft program retained to exercise non-public event states.",
      startDatetime: new Date("2026-10-05T09:00:00.000Z"),
      endDatetime: new Date("2026-10-05T16:00:00.000Z"),
      locationName: "Beta Studio Room",
      locationAddress: "22 Blueprint Street, Singapore",
      city: "Singapore",
      imageUrl: null,
      status: EventStatus.DRAFT,
      visibility: EventVisibility.PRIVATE,
      publishedAt: null,
    },
  ] as const;

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: event,
      create: event,
    });
  }

  const ticketTypes = [
    {
      id: "tt_fb_early",
      eventId: "event_future_builders",
      name: "Early Bird",
      description: "Discounted access for early confirmations.",
      price: "24.00",
      quota: 200,
      maxPerBooking: 4,
      salesStartAt: new Date("2026-06-20T00:00:00.000Z"),
      salesEndAt: new Date("2026-07-31T23:59:59.000Z"),
      isActive: true,
    },
    {
      id: "tt_fb_vip",
      eventId: "event_future_builders",
      name: "VIP Circle",
      description: "Priority seating and networking office hours.",
      price: "48.00",
      quota: 60,
      maxPerBooking: 2,
      salesStartAt: new Date("2026-06-20T00:00:00.000Z"),
      salesEndAt: new Date("2026-08-10T23:59:59.000Z"),
      isActive: true,
    },
    {
      id: "tt_hack_free",
      eventId: "event_hack_city",
      name: "Builder Pass",
      description: "Free reservation for the overnight build sprint.",
      price: "0.00",
      quota: 500,
      maxPerBooking: 1,
      salesStartAt: new Date("2026-06-22T00:00:00.000Z"),
      salesEndAt: new Date("2026-08-20T23:59:59.000Z"),
      isActive: true,
    },
    {
      id: "tt_creative_regular",
      eventId: "event_creative_lab",
      name: "Regular Pass",
      description: "Hands-on workshop access.",
      price: "12.00",
      quota: 120,
      maxPerBooking: 2,
      salesStartAt: new Date("2026-06-25T00:00:00.000Z"),
      salesEndAt: new Date("2026-09-01T23:59:59.000Z"),
      isActive: true,
    },
    {
      id: "tt_market_general",
      eventId: "event_makers_market",
      name: "General Entry",
      description: "Public access ticket for community day.",
      price: "8.00",
      quota: 400,
      maxPerBooking: 4,
      salesStartAt: new Date("2026-06-28T00:00:00.000Z"),
      salesEndAt: new Date("2026-09-10T23:59:59.000Z"),
      isActive: true,
    },
    {
      id: "tt_bootcamp_standard",
      eventId: "event_product_ops_bootcamp",
      name: "Standard Pass",
      description: "Completed workshop ticket with seeded check-ins.",
      price: "30.00",
      quota: 100,
      maxPerBooking: 3,
      salesStartAt: new Date("2026-05-10T00:00:00.000Z"),
      salesEndAt: new Date("2026-06-18T23:59:59.000Z"),
      isActive: true,
    },
    {
      id: "tt_design_invite",
      eventId: "event_design_private",
      name: "Invite Seat",
      description: "Private draft inventory slot.",
      price: "16.00",
      quota: 30,
      maxPerBooking: 1,
      salesStartAt: null,
      salesEndAt: null,
      isActive: false,
    },
  ] as const;

  for (const ticketType of ticketTypes) {
    await prisma.ticketType.upsert({
      where: { id: ticketType.id },
      update: ticketType,
      create: ticketType,
    });
  }

  const bookings = [
    {
      id: "booking_pending_unpaid",
      bookingCode: "BKG-82AJQ7",
      userId: "user_one",
      eventId: "event_future_builders",
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentProofUrl: null,
      paymentNotes: null,
      paymentVerifiedAt: null,
      paymentVerifiedBy: null,
      totalAmount: "72.00",
      notes: "Wants student team seating together.",
      expiresAt: new Date("2026-07-11T12:00:00.000Z"),
      approvedAt: null,
      approvedBy: null,
      rejectedReason: null,
      rejectedAt: null,
      cancelledReason: null,
      cancelledAt: null,
    },
    {
      id: "booking_pending_waiting",
      bookingCode: "BKG-1N7WFC",
      userId: "user_two",
      eventId: "event_future_builders",
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.WAITING_CONFIRMATION,
      paymentMethod: PaymentMethod.E_WALLET,
      paymentProofUrl: "https://proofs.eventra.demo/waiting-confirmation.png",
      paymentNotes: null,
      paymentVerifiedAt: null,
      paymentVerifiedBy: null,
      totalAmount: "48.00",
      notes: "Needs invoice note for club finance.",
      expiresAt: new Date("2026-07-11T14:00:00.000Z"),
      approvedAt: null,
      approvedBy: null,
      rejectedReason: null,
      rejectedAt: null,
      cancelledReason: null,
      cancelledAt: null,
    },
    {
      id: "booking_pending_failed",
      bookingCode: "BKG-3P9KRM",
      userId: "user_one",
      eventId: "event_future_builders",
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.FAILED,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentProofUrl: "https://proofs.eventra.demo/failed-proof.png",
      paymentNotes: "Uploaded proof does not match booking amount.",
      paymentVerifiedAt: null,
      paymentVerifiedBy: null,
      totalAmount: "24.00",
      notes: null,
      expiresAt: new Date("2026-07-12T09:00:00.000Z"),
      approvedAt: null,
      approvedBy: null,
      rejectedReason: null,
      rejectedAt: null,
      cancelledReason: null,
      cancelledAt: null,
    },
    {
      id: "booking_approved_paid",
      bookingCode: "BKG-PAID001",
      userId: "user_one",
      eventId: "event_product_ops_bootcamp",
      status: BookingStatus.APPROVED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.E_WALLET,
      paymentProofUrl: "https://proofs.eventra.demo/paid-bootcamp.png",
      paymentNotes: "Verified by admin.",
      paymentVerifiedAt: new Date("2026-06-15T08:30:00.000Z"),
      paymentVerifiedBy: "user_admin",
      totalAmount: "60.00",
      notes: "Attended with product team.",
      expiresAt: null,
      approvedAt: new Date("2026-06-15T08:45:00.000Z"),
      approvedBy: "user_admin",
      rejectedReason: null,
      rejectedAt: null,
      cancelledReason: null,
      cancelledAt: null,
    },
    {
      id: "booking_approved_free",
      bookingCode: "BKG-FREE01",
      userId: "user_two",
      eventId: "event_hack_city",
      status: BookingStatus.APPROVED,
      paymentStatus: PaymentStatus.NOT_REQUIRED,
      paymentMethod: PaymentMethod.FREE,
      paymentProofUrl: null,
      paymentNotes: null,
      paymentVerifiedAt: null,
      paymentVerifiedBy: null,
      totalAmount: "0.00",
      notes: "Free community-access booking.",
      expiresAt: null,
      approvedAt: new Date("2026-06-25T10:00:00.000Z"),
      approvedBy: "user_org_beta",
      rejectedReason: null,
      rejectedAt: null,
      cancelledReason: null,
      cancelledAt: null,
    },
    {
      id: "booking_approved_cov",
      bookingCode: "BKG-COV001",
      userId: "user_two",
      eventId: "event_product_ops_bootcamp",
      status: BookingStatus.APPROVED,
      paymentStatus: PaymentStatus.NOT_REQUIRED,
      paymentMethod: PaymentMethod.CASH_ON_VENUE,
      paymentProofUrl: null,
      paymentNotes: "Cash settled at venue.",
      paymentVerifiedAt: null,
      paymentVerifiedBy: null,
      totalAmount: "30.00",
      notes: "Reserved offline and settled during check-in.",
      expiresAt: null,
      approvedAt: new Date("2026-06-16T11:30:00.000Z"),
      approvedBy: "user_org_alpha",
      rejectedReason: null,
      rejectedAt: null,
      cancelledReason: null,
      cancelledAt: null,
    },
    {
      id: "booking_cancelled_expired",
      bookingCode: "BKG-EXP001",
      userId: "user_one",
      eventId: "event_creative_lab",
      status: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.UNPAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentProofUrl: null,
      paymentNotes: null,
      paymentVerifiedAt: null,
      paymentVerifiedBy: null,
      totalAmount: "12.00",
      notes: null,
      expiresAt: new Date("2026-07-01T10:00:00.000Z"),
      approvedAt: null,
      approvedBy: null,
      rejectedReason: null,
      rejectedAt: null,
      cancelledReason: "Payment deadline expired",
      cancelledAt: new Date("2026-07-01T10:05:00.000Z"),
    },
    {
      id: "booking_rejected_invalid",
      bookingCode: "BKG-REJ001",
      userId: "user_two",
      eventId: "event_creative_lab",
      status: BookingStatus.REJECTED,
      paymentStatus: PaymentStatus.FAILED,
      paymentMethod: PaymentMethod.E_WALLET,
      paymentProofUrl: "https://proofs.eventra.demo/rejected-proof.png",
      paymentNotes: "Invalid payment proof.",
      paymentVerifiedAt: null,
      paymentVerifiedBy: null,
      totalAmount: "12.00",
      notes: "User can rebook with new proof later.",
      expiresAt: null,
      approvedAt: null,
      approvedBy: null,
      rejectedReason: "Invalid payment proof.",
      rejectedAt: new Date("2026-07-02T08:30:00.000Z"),
      cancelledReason: null,
      cancelledAt: null,
    },
  ] as const;

  for (const booking of bookings) {
    await prisma.booking.upsert({
      where: { id: booking.id },
      update: booking,
      create: booking,
    });
  }

  const bookingItems = [
    {
      id: "booking_item_pending_unpaid",
      bookingId: "booking_pending_unpaid",
      ticketTypeId: "tt_fb_early",
      quantity: 3,
      unitPrice: "24.00",
      subtotal: "72.00",
    },
    {
      id: "booking_item_pending_waiting",
      bookingId: "booking_pending_waiting",
      ticketTypeId: "tt_fb_early",
      quantity: 2,
      unitPrice: "24.00",
      subtotal: "48.00",
    },
    {
      id: "booking_item_pending_failed",
      bookingId: "booking_pending_failed",
      ticketTypeId: "tt_fb_early",
      quantity: 1,
      unitPrice: "24.00",
      subtotal: "24.00",
    },
    {
      id: "booking_item_approved_paid",
      bookingId: "booking_approved_paid",
      ticketTypeId: "tt_bootcamp_standard",
      quantity: 2,
      unitPrice: "30.00",
      subtotal: "60.00",
    },
    {
      id: "booking_item_approved_free",
      bookingId: "booking_approved_free",
      ticketTypeId: "tt_hack_free",
      quantity: 1,
      unitPrice: "0.00",
      subtotal: "0.00",
    },
    {
      id: "booking_item_approved_cov",
      bookingId: "booking_approved_cov",
      ticketTypeId: "tt_bootcamp_standard",
      quantity: 1,
      unitPrice: "30.00",
      subtotal: "30.00",
    },
    {
      id: "booking_item_cancelled_expired",
      bookingId: "booking_cancelled_expired",
      ticketTypeId: "tt_creative_regular",
      quantity: 1,
      unitPrice: "12.00",
      subtotal: "12.00",
    },
    {
      id: "booking_item_rejected_invalid",
      bookingId: "booking_rejected_invalid",
      ticketTypeId: "tt_creative_regular",
      quantity: 1,
      unitPrice: "12.00",
      subtotal: "12.00",
    },
  ] as const;

  for (const bookingItem of bookingItems) {
    await prisma.bookingItem.upsert({
      where: { id: bookingItem.id },
      update: bookingItem,
      create: bookingItem,
    });
  }

  const tickets = [
    {
      id: "ticket_bootcamp_paid_1",
      ticketCode: "TKT-DEMO2026",
      bookingId: "booking_approved_paid",
      bookingItemId: "booking_item_approved_paid",
      eventId: "event_product_ops_bootcamp",
      userId: "user_one",
      ticketTypeId: "tt_bootcamp_standard",
      qrPayload: buildQrPayload("TKT-DEMO2026", appUrl),
      status: TicketStatus.USED,
      checkedInAt: new Date("2026-06-20T08:55:00.000Z"),
      checkedInBy: "user_org_alpha",
    },
    {
      id: "ticket_bootcamp_paid_2",
      ticketCode: "TKT-DEMO2027",
      bookingId: "booking_approved_paid",
      bookingItemId: "booking_item_approved_paid",
      eventId: "event_product_ops_bootcamp",
      userId: "user_one",
      ticketTypeId: "tt_bootcamp_standard",
      qrPayload: buildQrPayload("TKT-DEMO2027", appUrl),
      status: TicketStatus.VALID,
      checkedInAt: null,
      checkedInBy: null,
    },
    {
      id: "ticket_hack_free_1",
      ticketCode: "TKT-HACK2026",
      bookingId: "booking_approved_free",
      bookingItemId: "booking_item_approved_free",
      eventId: "event_hack_city",
      userId: "user_two",
      ticketTypeId: "tt_hack_free",
      qrPayload: buildQrPayload("TKT-HACK2026", appUrl),
      status: TicketStatus.VALID,
      checkedInAt: null,
      checkedInBy: null,
    },
    {
      id: "ticket_bootcamp_cov_1",
      ticketCode: "TKT-COV2026",
      bookingId: "booking_approved_cov",
      bookingItemId: "booking_item_approved_cov",
      eventId: "event_product_ops_bootcamp",
      userId: "user_two",
      ticketTypeId: "tt_bootcamp_standard",
      qrPayload: buildQrPayload("TKT-COV2026", appUrl),
      status: TicketStatus.USED,
      checkedInAt: new Date("2026-06-20T08:58:00.000Z"),
      checkedInBy: "user_org_alpha",
    },
  ] as const;

  for (const ticket of tickets) {
    await prisma.ticket.upsert({
      where: { id: ticket.id },
      update: ticket,
      create: ticket,
    });
  }

  const favoriteEvents = [
    {
      id: "favorite_user_one_future_builders",
      userId: "user_one",
      eventId: "event_future_builders",
    },
    {
      id: "favorite_user_one_makers_market",
      userId: "user_one",
      eventId: "event_makers_market",
    },
    {
      id: "favorite_user_two_hack_city",
      userId: "user_two",
      eventId: "event_hack_city",
    },
    {
      id: "favorite_user_two_creative_lab",
      userId: "user_two",
      eventId: "event_creative_lab",
    },
  ] as const;

  for (const favoriteEvent of favoriteEvents) {
    await prisma.favoriteEvent.upsert({
      where: { id: favoriteEvent.id },
      update: favoriteEvent,
      create: favoriteEvent,
    });
  }

  const reviews = [
    {
      id: "review_user_one_bootcamp",
      userId: "user_one",
      eventId: "event_product_ops_bootcamp",
      bookingId: "booking_approved_paid",
      rating: 5,
      comment: "Excellent operator-level detail and smooth venue flow.",
      isVisible: true,
    },
    {
      id: "review_user_two_bootcamp",
      userId: "user_two",
      eventId: "event_product_ops_bootcamp",
      bookingId: "booking_approved_cov",
      rating: 4,
      comment: "Strong workshop content, but check-in queue could be faster.",
      isVisible: false,
    },
  ] as const;

  for (const review of reviews) {
    await prisma.eventReview.upsert({
      where: { id: review.id },
      update: review,
      create: review,
    });
  }

  const activityLogs = [
    {
      id: "log_organizer_alpha_approved",
      userId: "user_admin",
      action: "APPROVE",
      module: "organizers",
      description: "Approved organizer profile for Alpha Student Builders.",
      ipAddress: "127.0.0.1",
    },
    {
      id: "log_future_builders_published",
      userId: "user_org_alpha",
      action: "PUBLISH",
      module: "events",
      description: "Published Future Builders Summit 2026.",
      ipAddress: "127.0.0.1",
    },
    {
      id: "log_bootcamp_payment_verified",
      userId: "user_admin",
      action: "VERIFY_PAYMENT",
      module: "payments",
      description: "Verified payment for booking BKG-PAID001.",
      ipAddress: "127.0.0.1",
    },
    {
      id: "log_bootcamp_booking_approved",
      userId: "user_admin",
      action: "APPROVE_BOOKING",
      module: "bookings",
      description: "Approved booking BKG-PAID001 and issued tickets.",
      ipAddress: "127.0.0.1",
    },
    {
      id: "log_ticket_checked_in",
      userId: "user_org_alpha",
      action: "CHECK_IN",
      module: "tickets",
      description: "Checked in ticket TKT-DEMO2026.",
      ipAddress: "127.0.0.1",
    },
    {
      id: "log_review_hidden",
      userId: "user_admin",
      action: "HIDE_REVIEW",
      module: "reviews",
      description: "Set review visibility to hidden for review_user_two_bootcamp.",
      ipAddress: "127.0.0.1",
    },
  ] as const;

  for (const activityLog of activityLogs) {
    await prisma.activityLog.upsert({
      where: { id: activityLog.id },
      update: activityLog,
      create: activityLog,
    });
  }

  console.log(
    `Seed complete: ${users.length} users, ${events.length} events, ${bookings.length} bookings, ${tickets.length} tickets.`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

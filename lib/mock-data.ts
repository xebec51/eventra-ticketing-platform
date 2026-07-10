import {
  type DashboardStat,
  type DashboardTableRow,
  type EventCategorySummary,
  type EventSummary,
} from "@/lib/types";

export const eventCategories: EventCategorySummary[] = [
  {
    id: "cat-1",
    name: "Seminars",
    slug: "seminars",
    description: "Professional talks, expert sessions, and campus symposiums.",
    eventCount: 18,
  },
  {
    id: "cat-2",
    name: "Competitions",
    slug: "competitions",
    description: "Hackathons, business case challenges, and esports ladders.",
    eventCount: 12,
  },
  {
    id: "cat-3",
    name: "Workshops",
    slug: "workshops",
    description: "Hands-on classes with tight quotas and guided practice.",
    eventCount: 24,
  },
  {
    id: "cat-4",
    name: "Communities",
    slug: "communities",
    description: "Member meetups, chapter events, and networking circles.",
    eventCount: 15,
  },
];

export const featuredEvents: EventSummary[] = [
  {
    id: "evt-1",
    slug: "future-builders-summit-2026",
    title: "Future Builders Summit 2026",
    category: "Seminars",
    city: "Singapore",
    locationName: "Nexus Convention Hall",
    startDate: "2026-08-14T09:00:00.000Z",
    endDate: "2026-08-14T18:00:00.000Z",
    priceLabel: "From $24",
    priceValue: 24,
    attendees: 1240,
    favorites: 384,
    rating: 4.9,
    status: "PUBLISHED",
    imageAccent: "from-[#ff8a5b] via-[#ffcb69] to-[#fff6d1]",
    excerpt:
      "A flagship product, startup, and creator summit with investor office hours and operator-led masterclasses.",
    featured: true,
  },
  {
    id: "evt-2",
    slug: "hack-the-city-night",
    title: "Hack The City: Night Build Sprint",
    category: "Competitions",
    city: "Jakarta",
    locationName: "Arcade Labs",
    startDate: "2026-08-22T15:00:00.000Z",
    endDate: "2026-08-23T07:00:00.000Z",
    priceLabel: "Free",
    priceValue: 0,
    attendees: 480,
    favorites: 291,
    rating: 4.7,
    status: "PUBLISHED",
    imageAccent: "from-[#14213d] via-[#1d3557] to-[#457b9d]",
    excerpt:
      "An overnight civic-tech sprint for student teams shipping public service prototypes with live mentor support.",
  },
  {
    id: "evt-3",
    slug: "creative-leadership-lab",
    title: "Creative Leadership Lab",
    category: "Workshops",
    city: "Bandung",
    locationName: "Atelier 87",
    startDate: "2026-09-03T10:00:00.000Z",
    endDate: "2026-09-03T16:30:00.000Z",
    priceLabel: "From $12",
    priceValue: 12,
    attendees: 210,
    favorites: 118,
    rating: 4.8,
    status: "PUBLISHED",
    imageAccent: "from-[#3c1642] via-[#086375] to-[#1dd3b0]",
    excerpt:
      "A compact workshop for student leaders on facilitation, storytelling, and building memorable community programs.",
  },
  {
    id: "evt-4",
    slug: "makers-market-community-day",
    title: "Makers Market Community Day",
    category: "Communities",
    city: "Kuala Lumpur",
    locationName: "Common Ground Square",
    startDate: "2026-09-12T12:00:00.000Z",
    endDate: "2026-09-12T20:00:00.000Z",
    priceLabel: "From $8",
    priceValue: 8,
    attendees: 690,
    favorites: 205,
    rating: 4.6,
    status: "PUBLISHED",
    imageAccent: "from-[#0d1b2a] via-[#415a77] to-[#e0e1dd]",
    excerpt:
      "A lively community market with local creators, demo booths, lightning talks, and curated food stalls.",
  },
];

export const adminStats: DashboardStat[] = [
  { label: "Total revenue", value: "$48.2K", change: "+18.4%", tone: "success" },
  { label: "Organizer approvals", value: "19", change: "6 pending", tone: "warning" },
  { label: "Paid bookings", value: "1,284", change: "+9.1%", tone: "success" },
  { label: "Moderation queue", value: "12", change: "3 urgent", tone: "danger" },
];

export const organizerStats: DashboardStat[] = [
  { label: "Published events", value: "14", change: "+2 this month", tone: "success" },
  { label: "Pending bookings", value: "37", change: "12 need review", tone: "warning" },
  { label: "Tickets sold", value: "942", change: "+14.2%", tone: "success" },
  { label: "Check-in rate", value: "81%", change: "Above benchmark", tone: "default" },
];

export const userStats: DashboardStat[] = [
  { label: "Upcoming tickets", value: "5", change: "2 this week", tone: "default" },
  { label: "Pending payments", value: "2", change: "1 expires soon", tone: "warning" },
  { label: "Favorites saved", value: "11", change: "3 new", tone: "success" },
  { label: "Reviews posted", value: "8", change: "4.9 avg rating", tone: "success" },
];

export const bookingRows: DashboardTableRow[] = [
  {
    booking: "BKG-82AJQ7",
    event: "Future Builders Summit 2026",
    buyer: "user.one@eventra.demo",
    payment: "WAITING_CONFIRMATION",
    status: "PENDING",
    amount: "$72.00",
  },
  {
    booking: "BKG-1Q4KSM",
    event: "Creative Leadership Lab",
    buyer: "user.two@eventra.demo",
    payment: "PAID",
    status: "APPROVED",
    amount: "$24.00",
  },
  {
    booking: "BKG-3N8VLD",
    event: "Hack The City: Night Build Sprint",
    buyer: "user.one@eventra.demo",
    payment: "NOT_REQUIRED",
    status: "APPROVED",
    amount: "$0.00",
  },
];

export const organizerRows: DashboardTableRow[] = [
  {
    event: "Future Builders Summit 2026",
    status: "PUBLISHED",
    schedule: "14 Aug 2026",
    tickets: "420 / 600",
    revenue: "$14,380",
  },
  {
    event: "Creative Leadership Lab",
    status: "DRAFT",
    schedule: "03 Sep 2026",
    tickets: "0 / 120",
    revenue: "$0",
  },
  {
    event: "Makers Market Community Day",
    status: "PUBLISHED",
    schedule: "12 Sep 2026",
    tickets: "188 / 400",
    revenue: "$1,504",
  },
];

export const reviewRows: DashboardTableRow[] = [
  {
    reviewer: "Alya Setiawan",
    event: "Future Builders Summit 2026",
    rating: "5/5",
    visibility: "VISIBLE",
    note: "Loved the speaker lineup and venue flow.",
  },
  {
    reviewer: "Kevin Lim",
    event: "Hack The City: Night Build Sprint",
    rating: "4/5",
    visibility: "HIDDEN",
    note: "Great format, but the wifi queue needs work.",
  },
];

import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import {
  buildWorkbookBuffer,
  getAttendeeExportRows,
} from "@/lib/export-reports";

export async function GET(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (user.role !== "ADMIN" && user.role !== "ORGANIZER") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const eventId = new URL(request.url).searchParams.get("eventId") || undefined;
  const rows = await getAttendeeExportRows(
    { id: user.id, role: user.role },
    eventId
  );

  if (!rows) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const buffer = buildWorkbookBuffer("Attendees", rows);
  const filename =
    user.role === "ADMIN"
      ? "eventra-attendee-report.xlsx"
      : "eventra-organizer-attendees.xlsx";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

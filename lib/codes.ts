import { randomBytes } from "node:crypto";

function createCode(prefix: string, size = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(size);
  let body = "";

  for (let index = 0; index < size; index += 1) {
    body += alphabet[bytes[index] % alphabet.length];
  }

  return `${prefix}-${body}`;
}

export function generateBookingCode() {
  return createCode("BKG", 6);
}

export function generateTicketCode() {
  return createCode("TKT", 8);
}

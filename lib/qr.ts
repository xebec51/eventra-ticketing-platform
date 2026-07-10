export function getTicketVerificationPath(ticketCode: string) {
  return `/verify/${ticketCode}`;
}

export function buildQrPayload(ticketCode: string, appUrl?: string) {
  const path = getTicketVerificationPath(ticketCode);

  if (!appUrl) {
    return path;
  }

  return new URL(path, appUrl).toString();
}

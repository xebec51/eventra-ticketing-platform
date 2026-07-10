declare module "qrcode" {
  type QRCodeOptions = {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  };

  export function toDataURL(
    text: string,
    options?: QRCodeOptions
  ): Promise<string>;

  const QRCode: {
    toDataURL: typeof toDataURL;
  };

  export default QRCode;
}

import Image from "next/image";
import QRCode from "qrcode";

export async function QRCodeDisplay({
  value,
  size = 220,
}: {
  value: string;
  size?: number;
}) {
  const dataUrl = await QRCode.toDataURL(value, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return (
    <Image
      src={dataUrl}
      alt="QR code"
      width={size}
      height={size}
      className="rounded-2xl border border-black/5 bg-white p-3"
    />
  );
}

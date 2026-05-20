import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export async function generatePromptPayQr(promptpayId: string, amount: number) {
  const payload = generatePayload(promptpayId, { amount });
  const dataUrl = await QRCode.toDataURL(payload, {
    width: 420,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  return { payload, dataUrl };
}

import { clearMerchantSession } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api";

export async function POST() {
  try {
    await clearMerchantSession();
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

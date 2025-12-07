// Admin endpoint for API key statistics
import { NextResponse } from "next/server";
import {
  verifyAuth,
  authErrorResponse,
  getApiKeyStats,
} from "../../middleware/auth";

export async function GET(request: Request) {
  // 🔐 Authentication check
  const authResult = await verifyAuth(request);
  if (!authResult.allowed) {
    return authErrorResponse(authResult.reason || "Unauthorized", 401);
  }

  // Only allow 'primary' key to access stats
  if (authResult.keyConfig?.name !== "primary") {
    return authErrorResponse("Forbidden: Admin access required", 403);
  }

  const stats = await getApiKeyStats();

  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    apiKeys: stats,
  });
}

import { NextRequest, NextResponse } from "next/server";

const BAGS_BASE = "https://public-api-v2.bags.fm/api/v1";
const API_KEY = process.env.BAGS_API_KEY || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");
  const wallet = searchParams.get("wallet");

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  // Build the Bags.fm URL based on what we need
  let bagsUrl = "";

  if (endpoint === "creators" && wallet) {
    // Get tokens created by this wallet
    bagsUrl = `${BAGS_BASE}/analytics/token-launch-creators?publicKey=${wallet}`;
  } else if (endpoint === "pools" && wallet) {
    // Get Bags pools for this wallet's tokens
    bagsUrl = `${BAGS_BASE}/state/bags-pools`;
  } else if (endpoint === "fees" && wallet) {
    // Get claimable fee positions
    bagsUrl = `${BAGS_BASE}/fee-claiming/claimable-positions?publicKey=${wallet}`;
  } else if (endpoint === "ping") {
    bagsUrl = `${BAGS_BASE}/ping`;
  } else {
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
  }

  try {
    const res = await fetch(bagsUrl, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      // Cache for 60 seconds so we don't hammer the API
      next: { revalidate: 60 },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch from Bags API" },
      { status: 500 }
    );
  }
}

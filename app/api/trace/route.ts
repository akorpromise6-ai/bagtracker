import { traceFlow } from "@/lib/flow/engine";
import { SAMPLE_SOLANA_EVENTS } from "@/lib/flow/sample";
import type { TraceRequest } from "@/lib/flow/contracts";

export const dynamic = "force-dynamic";

function toTraceRequest(input: Partial<TraceRequest>): TraceRequest {
  return {
    wallet: input.wallet || "WalletA111",
    signature: input.signature || "sig-1-seed",
    token: input.token || "SOL",
    amountThreshold: Math.max(0, Number(input.amountThreshold ?? 1)),
    hopLimit: Math.max(1, Number(input.hopLimit ?? 6)),
    chain: "solana",
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<TraceRequest>;
  const traceRequest = toTraceRequest(body);
  const flow = traceFlow(traceRequest, SAMPLE_SOLANA_EVENTS);
  return Response.json(flow);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const traceRequest = toTraceRequest({
    wallet: searchParams.get("wallet") ?? undefined,
    signature: searchParams.get("signature") ?? undefined,
    token: searchParams.get("token") ?? undefined,
    amountThreshold: searchParams.get("amountThreshold") ? Number(searchParams.get("amountThreshold")) : undefined,
    hopLimit: searchParams.get("hopLimit") ? Number(searchParams.get("hopLimit")) : undefined,
    chain: "solana",
  });

  const flow = traceFlow(traceRequest, SAMPLE_SOLANA_EVENTS);
  return Response.json(flow);
}

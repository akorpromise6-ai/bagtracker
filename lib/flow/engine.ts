import type { FlowEdge, FlowGraph, FlowNode, TraceRequest, TransferEvent } from "./contracts";

const EXCHANGE_LABELS = new Set(["binance", "bybit", "okx", "coinbase", "kraken", "mexc"]);
const BRIDGE_LABELS = new Set(["wormhole", "layerzero"]);

function flowId(signature: string) {
  return `FLOW-${signature.slice(0, 8).toUpperCase()}`;
}

function classifyNode(address: string, labels: string[] = []): Pick<FlowNode, "entityType" | "labels" | "terminalReason"> {
  const normalized = labels.map((l) => l.toLowerCase());
  const exchange = normalized.find((l) => EXCHANGE_LABELS.has(l));
  if (exchange) {
    return { entityType: "exchange", labels: [exchange], terminalReason: "exchange" };
  }

  const bridge = normalized.find((l) => BRIDGE_LABELS.has(l));
  if (bridge) {
    return { entityType: "bridge", labels: [bridge], terminalReason: "bridge" };
  }

  return { entityType: "wallet", labels: normalized };
}

export function traceFlow(request: TraceRequest, events: TransferEvent[]): FlowGraph {
  const bySender = new Map<string, TransferEvent[]>();
  for (const event of events) {
    if (event.token !== request.token || event.amount < request.amountThreshold) continue;
    const current = bySender.get(event.from) ?? [];
    current.push(event);
    bySender.set(event.from, current);
  }

  const nodes = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];
  const visitedPath = new Set<string>();
  const inboundCount = new Map<string, number>();
  let cyclesDetected = 0;

  const ensureNode = (address: string, labels: string[] = []) => {
    if (nodes.has(address)) return;
    const classification = classifyNode(address, labels);
    nodes.set(address, {
      id: address,
      address,
      entityType: classification.entityType,
      labels: classification.labels,
      terminalReason: classification.terminalReason,
    });
  };

  const walk = (address: string, hop: number) => {
    const pathKey = `${address}:${hop}`;
    if (visitedPath.has(pathKey)) {
      cyclesDetected += 1;
      const node = nodes.get(address);
      if (node && !node.terminalReason) node.terminalReason = "cycle";
      return;
    }

    visitedPath.add(pathKey);
    if (hop >= request.hopLimit) {
      const node = nodes.get(address);
      if (node && !node.terminalReason) node.terminalReason = "hop_limit";
      return;
    }

    const outgoing = bySender.get(address) ?? [];
    if (!outgoing.length) {
      const node = nodes.get(address);
      if (node && !node.terminalReason) node.terminalReason = "stopped";
      return;
    }

    for (const event of outgoing) {
      ensureNode(event.to, event.labels ?? []);
      edges.push({
        id: event.id,
        from: event.from,
        to: event.to,
        amount: event.amount,
        token: event.token,
        signature: event.signature,
        hop: hop + 1,
      });
      inboundCount.set(event.to, (inboundCount.get(event.to) ?? 0) + 1);
      walk(event.to, hop + 1);
    }
  };

  ensureNode(request.wallet);
  walk(request.wallet, 0);

  const mergesDetected = Array.from(inboundCount.values()).filter((value) => value > 1).length;

  return {
    flowId: flowId(request.signature),
    request,
    nodes: Array.from(nodes.values()),
    edges,
    cyclesDetected,
    mergesDetected,
    generatedAt: new Date().toISOString(),
  };
}

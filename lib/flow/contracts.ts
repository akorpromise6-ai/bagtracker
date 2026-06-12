export type Chain = "solana";

export type EntityType = "wallet" | "exchange" | "bridge" | "contract" | "token" | "unknown";

export type WalletType = "whale" | "sniper" | "market_maker" | "arbitrage_bot" | "liquidity_provider" | "unknown";

export interface TraceRequest {
  wallet: string;
  signature: string;
  token: string;
  amountThreshold: number;
  hopLimit: number;
  chain: Chain;
}

export interface TransferEvent {
  id: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  signature: string;
  slot: number;
  timestamp: string;
  labels?: string[];
}

export interface FlowNode {
  id: string;
  address: string;
  entityType: EntityType;
  walletType?: WalletType;
  labels: string[];
  terminalReason?: "stopped" | "exchange" | "bridge" | "mixed" | "hop_limit" | "cycle";
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  signature: string;
  hop: number;
}

export interface FlowGraph {
  flowId: string;
  request: TraceRequest;
  nodes: FlowNode[];
  edges: FlowEdge[];
  cyclesDetected: number;
  mergesDetected: number;
  generatedAt: string;
}

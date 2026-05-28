/**
 * Client-side reader for the on-chain crit-bit slab orderbook.
 *
 * Mirrors the Rust layout in `programs/perp-dex/src/state/slab.rs`:
 *   SlabHeader (40 bytes): bump_index u64, free_head u64, root u64,
 *                          leaf_count u64, _pad u64
 *   SlabNode  (80 bytes):  tag u32, prefix_len u32, key u128,
 *                          owner [u8;32], quantity u64, ...
 *
 * Leaf nodes (tag === 2) carry a resting order. The price is the high 64 bits
 * of the u128 key; quantity is the remaining base size.
 */

const DISCRIMINATOR = 8;
const HEADER_SIZE = 40;
const NODE_SIZE = 80;

const LEAF_TAG = 2;

// Field offsets within a node
const OFF_TAG = 0;
const OFF_KEY = 8; // u128 (16 bytes)
const OFF_QTY = 72; // u64 after [u8;32] owner at 40..72

export interface SlabLevel {
  price: bigint;
  quantity: bigint;
}

export interface OrderbookSide {
  levels: SlabLevel[];
  leafCount: number;
}

function readU64(view: DataView, offset: number): bigint {
  return view.getBigUint64(offset, true);
}

function readU128(view: DataView, offset: number): bigint {
  const lo = view.getBigUint64(offset, true);
  const hi = view.getBigUint64(offset + 8, true);
  return (hi << 64n) | lo;
}

/**
 * Parse a raw slab account into aggregated price levels.
 *
 * @param data full account data (including the 8-byte Anchor discriminator)
 * @param descending sort high→low (bids) when true, low→high (asks) when false
 */
export function readSlab(data: Uint8Array, descending: boolean): OrderbookSide {
  if (data.length < DISCRIMINATOR + HEADER_SIZE) {
    return { levels: [], leafCount: 0 };
  }

  const buf = data.subarray(DISCRIMINATOR);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  const bumpIndex = Number(readU64(view, 0)); // nodes ever allocated
  const leafCount = Number(readU64(view, 24));

  const byPrice = new Map<bigint, bigint>();

  const nodeCount = Math.min(
    bumpIndex,
    Math.floor((buf.byteLength - HEADER_SIZE) / NODE_SIZE)
  );

  for (let i = 0; i < nodeCount; i++) {
    const nodeBase = HEADER_SIZE + i * NODE_SIZE;
    const tag = view.getUint32(nodeBase + OFF_TAG, true);
    if (tag !== LEAF_TAG) continue;

    const key = readU128(view, nodeBase + OFF_KEY);
    const lvlPrice = key >> 64n;
    const qty = readU64(view, nodeBase + OFF_QTY);
    if (qty === 0n) continue;

    byPrice.set(lvlPrice, (byPrice.get(lvlPrice) ?? 0n) + qty);
  }

  const levels: SlabLevel[] = Array.from(byPrice.entries()).map(
    ([price, quantity]) => ({ price, quantity })
  );
  levels.sort((a, b) =>
    descending ? Number(b.price - a.price) : Number(a.price - b.price)
  );

  return { levels, leafCount };
}

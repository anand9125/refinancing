/**
 * Client-side reader for the on-chain crit-bit slab orderbook.
 *
 * Layout from `programs/perp-dex/src/state/slab.rs` (+ constants.rs):
 *   SlabHeader (32 bytes): leaf_count u64, bump_index u64,
 *                          free_list_head u64, root u64
 *   Node (88 bytes, repr C union). LeafNode variant:
 *     tag u32 @0, fee_tier u8 + reserved[11] @4, key u128 @16,
 *     owner [u8;32] @32, quantity u64 @64, timestamp i64 @72
 *
 * The price is the high 64 bits of the u128 key. Nodes are allocated from a
 * free list (bump_index can stay 0), so we scan every slot and filter on the
 * LEAF tag rather than trusting a node count.
 */

const DISCRIMINATOR = 8;
const HEADER_SIZE = 32;
// LeafNode is repr(C, align(16)); its 88 logical bytes round up to a 96-byte
// stride in the slab's node array.
const NODE_SIZE = 96;

const LEAF_TAG = 2; // INNER=1, LEAF=2, FREE=3

// LeafNode field offsets within a node
const OFF_TAG = 0; // u32
const OFF_KEY_HI = 24; // high 64 bits of key u128 (key @16, +8)
const OFF_QTY = 64; // u64

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

  const leafCount = Number(readU64(view, 0));
  const slots = Math.floor((buf.byteLength - HEADER_SIZE) / NODE_SIZE);

  const byPrice = new Map<bigint, bigint>();

  for (let i = 0; i < slots; i++) {
    const base = HEADER_SIZE + i * NODE_SIZE;
    if (view.getUint32(base + OFF_TAG, true) !== LEAF_TAG) continue;

    const price = readU64(view, base + OFF_KEY_HI);
    const qty = readU64(view, base + OFF_QTY);
    if (qty === 0n) continue;

    byPrice.set(price, (byPrice.get(price) ?? 0n) + qty);
  }

  const levels: SlabLevel[] = Array.from(byPrice.entries()).map(
    ([price, quantity]) => ({ price, quantity })
  );
  levels.sort((a, b) =>
    descending ? Number(b.price - a.price) : Number(a.price - b.price)
  );

  return { levels, leafCount };
}

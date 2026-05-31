/**
 * Localnet seed: global config + SOL-PERP market, deposit, resting orders.
 * Run: ANCHOR_PROVIDER_URL=http://localhost:8899 \
 *      ANCHOR_WALLET=~/.config/solana/id.json node seed.mjs
 */
import anchor from "@coral-xyz/anchor";
import * as pkg from "@solana/spl-token";
import { readFileSync } from "node:fs";

const { BN, AnchorProvider, Program, web3, setProvider } = anchor;
const {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} = pkg;

const idl = JSON.parse(readFileSync("./target/idl/perp_dex.json", "utf8"));

const SYMBOL = "SOL-PERP";
const USDC_MINT = new web3.PublicKey(
  "FyFVbnBaxMgRULwznf38DiWvQYdZxJ46NP8evkRiEw2P"
);

const enc = (s) => Buffer.from(new TextEncoder().encode(s));
const pda = (seeds, pid) =>
  web3.PublicKey.findProgramAddressSync(seeds, pid)[0];

async function main() {
  const provider = AnchorProvider.env();
  setProvider(provider);
  const program = new Program(idl, provider);
  const authority = provider.wallet.publicKey;
  const pid = program.programId;
  const sym = enc(SYMBOL);

  const globalConfig = pda([enc("global_config")], pid);
  const market = pda([enc("market"), sym], pid);
  const bids = pda([enc("bids"), sym], pid);
  const asks = pda([enc("asks"), sym], pid);
  const requestQueue = pda([enc("request_queue")], pid);
  const eventQueue = pda([enc("event_queue")], pid);
  const vaultQuote = pda([enc("vault_quote"), globalConfig.toBuffer()], pid);
  const insuranceFund = pda(
    [enc("insurance_fund"), globalConfig.toBuffer()],
    pid
  );
  const feePool = getAssociatedTokenAddressSync(USDC_MINT, authority);
  const userColletral = pda([enc("user_colletral"), authority.toBuffer()], pid);
  const position = pda([enc("position"), sym, authority.toBuffer()], pid);
  const userAta = getAssociatedTokenAddressSync(USDC_MINT, authority);

  const common = {
    systemProgram: web3.SystemProgram.programId,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
  };

  try {
    await program.methods
      .initaliseGlobalConfig(false, 3600)
      .accountsPartial({
        authority,
        globalConfig,
        usdcMint: USDC_MINT,
        vaultQuote,
        insuranceFund,
        feePool,
        requestQueue,
        eventQueues: eventQueue,
        ...common,
      })
      .rpc();
    console.log("OK global config");
  } catch (e) {
    console.log("SKIP global config:", e.message.slice(0, 300));
  }

  const params = {
    oraclePubkey: authority,
    lastOraclePrice: new BN(150),
    lastOracleTs: new BN(0),
    imBps: 1000,
    mmBps: 500,
    oracleBandBps: 0,
    takerFeeBps: 10,
    makerRebateBps: 0,
    liqPenaltyBps: 100,
    liquidatorShareBps: 5000,
    maxFundingRate: new BN(1_000_000),
    cumFunding: new BN(0),
    lastFundingTs: new BN(Math.floor(Date.now() / 1000)),
    fundingIntervalSecs: 3600,
    tickSize: 1,
    stepSize: 1,
    minOrderNotional: new BN(1),
  };
  try {
    await program.methods
      .initializeMarket(Buffer.from(sym), params)
      .accountsPartial({ authority, market, bids, asks, ...common })
      .rpc();
    console.log("OK market");
  } catch (e) {
    console.log("SKIP market:", e.message.slice(0, 300));
  }

  try {
    await program.methods
      .depositColletral(new BN(10_000_000_000))
      .accountsPartial({
        user: authority,
        usdcMint: USDC_MINT,
        userWalletAccount: userAta,
        globalConfig,
        vaultQuote,
        userColletral,
        ...common,
      })
      .rpc();
    console.log("OK deposited 10,000 USDC");
  } catch (e) {
    console.log("SKIP deposit:", e.message.slice(0, 300));
  }

  const orders = [
    { side: "buy", price: 148, qty: 5 },
    { side: "buy", price: 147, qty: 8 },
    { side: "buy", price: 145, qty: 12 },
    { side: "sell", price: 152, qty: 6 },
    { side: "sell", price: 153, qty: 9 },
    { side: "sell", price: 155, qty: 14 },
  ];

  for (const o of orders) {
    const order = {
      user: Array.from(authority.toBytes()),
      orderId: new BN(0),
      side: o.side === "buy" ? { buy: {} } : { sell: {} },
      qty: new BN(o.qty),
      orderType: { limit: {} },
      limitPrice: new BN(o.price),
      initialMargin: new BN(Math.ceil(o.price * o.qty * 0.1)),
      leverage: 5,
      market,
    };
    try {
      await program.methods
        .placeOrder(order)
        .accountsPartial({
          user: authority,
          globalConfig,
          market,
          userColletral,
          positionPerMarket: position,
          requestQueue,
          ...common,
        })
        .rpc();
      await program.methods
        .processPlaceOrder()
        .accountsPartial({
          authority,
          market,
          bids,
          asks,
          requestQueue,
          eventQueue,
          ...common,
        })
        .rpc();
      console.log(`OK ${o.side} ${o.qty} @ ${o.price}`);
    } catch (e) {
      console.log(`SKIP ${o.side}@${o.price}:`, e.message.slice(0, 300));
    }
  }

  console.log("\nSeed complete. Market:", market.toBase58());
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

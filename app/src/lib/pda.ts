import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

const enc = (s: string) => Buffer.from(s, "utf8");

/** Global config singleton PDA — seeds: ["global_config"] */
export function globalConfigPda(): PublicKey {
  return PublicKey.findProgramAddressSync([enc("global_config")], PROGRAM_ID)[0];
}

/** Market PDA — seeds: ["market", symbol] */
export function marketPda(symbol: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("market"), enc(symbol)],
    PROGRAM_ID
  )[0];
}

/** Bid slab PDA — seeds: ["bids", symbol] */
export function bidsPda(symbol: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("bids"), enc(symbol)],
    PROGRAM_ID
  )[0];
}

/** Ask slab PDA — seeds: ["asks", symbol] */
export function asksPda(symbol: string): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("asks"), enc(symbol)],
    PROGRAM_ID
  )[0];
}

/**
 * User collateral PDA — seeds: ["user_colletral", user].
 * NOTE: the on-chain seed preserves the program's original spelling.
 */
export function userCollateralPda(user: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("user_colletral"), user.toBuffer()],
    PROGRAM_ID
  )[0];
}

/** Per-market position PDA — seeds: ["position", symbol, user] */
export function positionPda(symbol: string, user: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("position"), enc(symbol), user.toBuffer()],
    PROGRAM_ID
  )[0];
}

/** Request queue singleton PDA — seeds: ["request_queue"] */
export function requestQueuePda(): PublicKey {
  return PublicKey.findProgramAddressSync([enc("request_queue")], PROGRAM_ID)[0];
}

/** Event queue singleton PDA — seeds: ["event_queue"] */
export function eventQueuePda(): PublicKey {
  return PublicKey.findProgramAddressSync([enc("event_queue")], PROGRAM_ID)[0];
}

/** Vault (quote) token account PDA — seeds: ["vault_quote", global_config] */
export function vaultQuotePda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("vault_quote"), globalConfigPda().toBuffer()],
    PROGRAM_ID
  )[0];
}

/** Insurance fund token account PDA — seeds: ["insurance_fund", global_config] */
export function insuranceFundPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [enc("insurance_fund"), globalConfigPda().toBuffer()],
    PROGRAM_ID
  )[0];
}

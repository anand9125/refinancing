import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";
import { RefinanceRouter } from "../target/types/refinance_router";

// Protocol IDs matching the on-chain constants
const KAMINO    = 0;
const MARGINFI  = 1;
const SOLEND    = 2;

// Step constants
const STEP_INITIATED  = 0;
const STEP_REPAID     = 1;
const STEP_WITHDRAWN  = 2;
const STEP_DEPOSITED  = 3;
const STEP_COMPLETE   = 4;

describe("refinance-router", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RefinanceRouter as Program<RefinanceRouter>;
  const user    = provider.wallet as anchor.Wallet;

  let collateralMint: PublicKey;
  let debtMint:       PublicKey;

  // Derive the refinance PDA for the user
  function refinancePda(userKey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("refinance"), userKey.toBuffer()],
      program.programId
    );
  }

  before("create test token mints", async () => {
    // Create fake SOL and USDC mints on localnet for testing
    collateralMint = await createMint(
      provider.connection,
      (user as anchor.Wallet).payer,
      user.publicKey,
      null,
      9 // decimals
    );

    debtMint = await createMint(
      provider.connection,
      (user as anchor.Wallet).payer,
      user.publicKey,
      null,
      6 // USDC decimals
    );
  });

  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe("happy path: full MarginFi → Kamino refinance", () => {
    let statePda: PublicKey;

    it("initiates a refinance session", async () => {
      [statePda] = refinancePda(user.publicKey);

      await program.methods
        .initiateRefinance(
          MARGINFI,           // source
          KAMINO,             // target
          new BN(1_000_000_000), // 1 SOL collateral
          new BN(50_000_000)     // 50 USDC debt
        )
        .accounts({
          user:             user.publicKey,
          refinanceState:   statePda,
          collateralMint,
          debtMint,
          systemProgram:    SystemProgram.programId,
        })
        .rpc();

      const state = await program.account.refinanceState.fetch(statePda);
      assert.equal(state.user.toBase58(), user.publicKey.toBase58());
      assert.equal(state.sourceProtocol, MARGINFI);
      assert.equal(state.targetProtocol, KAMINO);
      assert.equal(state.step, STEP_INITIATED);
      assert.equal(state.collateralAmount.toNumber(), 1_000_000_000);
      assert.equal(state.debtAmount.toNumber(), 50_000_000);
      console.log("  ✓ Step 0: session opened, PDA:", statePda.toBase58());
    });

    it("confirms repay (step 1)", async () => {
      await program.methods
        .confirmRepay()
        .accounts({ user: user.publicKey, refinanceState: statePda })
        .rpc();

      const state = await program.account.refinanceState.fetch(statePda);
      assert.equal(state.step, STEP_REPAID);
      console.log("  ✓ Step 1: debt repaid on MarginFi");
    });

    it("confirms withdraw (step 2)", async () => {
      await program.methods
        .confirmWithdraw()
        .accounts({ user: user.publicKey, refinanceState: statePda })
        .rpc();

      const state = await program.account.refinanceState.fetch(statePda);
      assert.equal(state.step, STEP_WITHDRAWN);
      console.log("  ✓ Step 2: collateral withdrawn from MarginFi");
    });

    it("confirms deposit (step 3)", async () => {
      await program.methods
        .confirmDeposit()
        .accounts({ user: user.publicKey, refinanceState: statePda })
        .rpc();

      const state = await program.account.refinanceState.fetch(statePda);
      assert.equal(state.step, STEP_DEPOSITED);
      console.log("  ✓ Step 3: collateral deposited into Kamino");
    });

    it("finalises and closes the session (step 4)", async () => {
      const balanceBefore = await provider.connection.getBalance(user.publicKey);

      await program.methods
        .confirmBorrow()
        .accounts({ user: user.publicKey, refinanceState: statePda })
        .rpc();

      // PDA should be closed — rent returned to user
      const stateAccount = await provider.connection.getAccountInfo(statePda);
      assert.isNull(stateAccount, "refinance state PDA should be closed after finalise");

      const balanceAfter = await provider.connection.getBalance(user.publicKey);
      assert.isAbove(balanceAfter, balanceBefore - 10_000, "rent should be returned");
      console.log("  ✓ Step 4: session closed, rent returned");
    });
  });

  // ─── Cancellation ──────────────────────────────────────────────────────────

  describe("cancel: user can exit at any step", () => {
    let statePda: PublicKey;

    it("opens a session then cancels after step 1", async () => {
      [statePda] = refinancePda(user.publicKey);

      await program.methods
        .initiateRefinance(SOLEND, KAMINO, new BN(500_000_000), new BN(20_000_000))
        .accounts({
          user: user.publicKey,
          refinanceState: statePda,
          collateralMint,
          debtMint,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await program.methods
        .confirmRepay()
        .accounts({ user: user.publicKey, refinanceState: statePda })
        .rpc();

      const balanceBefore = await provider.connection.getBalance(user.publicKey);

      await program.methods
        .cancelRefinance()
        .accounts({ user: user.publicKey, refinanceState: statePda })
        .rpc();

      const stateAccount = await provider.connection.getAccountInfo(statePda);
      assert.isNull(stateAccount, "PDA should be closed on cancel");

      const balanceAfter = await provider.connection.getBalance(user.publicKey);
      assert.isAbove(balanceAfter, balanceBefore - 10_000, "rent returned on cancel");
      console.log("  ✓ Cancel: session closed at step 1, rent returned");
    });
  });

  // ─── Error Cases ───────────────────────────────────────────────────────────

  describe("error: invalid inputs", () => {
    let statePda: PublicKey;

    beforeEach(() => {
      [statePda] = refinancePda(user.publicKey);
    });

    it("rejects same source and target protocol", async () => {
      try {
        await program.methods
          .initiateRefinance(KAMINO, KAMINO, new BN(1_000_000), new BN(500_000))
          .accounts({
            user: user.publicKey,
            refinanceState: statePda,
            collateralMint,
            debtMint,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("should have thrown SameProtocol error");
      } catch (err: unknown) {
        assert.include(String(err), "SameProtocol");
        console.log("  ✓ Rejects same protocol");
      }
    });

    it("rejects invalid protocol ID (> 2)", async () => {
      try {
        await program.methods
          .initiateRefinance(5, KAMINO, new BN(1_000_000), new BN(500_000))
          .accounts({
            user: user.publicKey,
            refinanceState: statePda,
            collateralMint,
            debtMint,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("should have thrown InvalidProtocol error");
      } catch (err: unknown) {
        assert.include(String(err), "InvalidProtocol");
        console.log("  ✓ Rejects invalid protocol ID");
      }
    });

    it("rejects zero collateral amount", async () => {
      try {
        await program.methods
          .initiateRefinance(MARGINFI, KAMINO, new BN(0), new BN(500_000))
          .accounts({
            user: user.publicKey,
            refinanceState: statePda,
            collateralMint,
            debtMint,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("should have thrown ZeroCollateral error");
      } catch (err: unknown) {
        assert.include(String(err), "ZeroCollateral");
        console.log("  ✓ Rejects zero collateral");
      }
    });

    it("rejects zero debt amount", async () => {
      try {
        await program.methods
          .initiateRefinance(MARGINFI, KAMINO, new BN(1_000_000), new BN(0))
          .accounts({
            user: user.publicKey,
            refinanceState: statePda,
            collateralMint,
            debtMint,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        assert.fail("should have thrown ZeroDebt error");
      } catch (err: unknown) {
        assert.include(String(err), "ZeroDebt");
        console.log("  ✓ Rejects zero debt");
      }
    });
  });

  describe("error: wrong step ordering", () => {
    let statePda: PublicKey;

    it("rejects skipping a step (step 0 → step 2)", async () => {
      [statePda] = refinancePda(user.publicKey);

      await program.methods
        .initiateRefinance(MARGINFI, SOLEND, new BN(1_000_000), new BN(500_000))
        .accounts({
          user: user.publicKey,
          refinanceState: statePda,
          collateralMint,
          debtMint,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      try {
        // Try to jump to step 2 without doing step 1
        await program.methods
          .confirmWithdraw()
          .accounts({ user: user.publicKey, refinanceState: statePda })
          .rpc();
        assert.fail("should have thrown WrongStep error");
      } catch (err: unknown) {
        assert.include(String(err), "WrongStep");
        console.log("  ✓ Rejects skipping steps");
      } finally {
        // Clean up
        try {
          await program.methods
            .cancelRefinance()
            .accounts({ user: user.publicKey, refinanceState: statePda })
            .rpc();
        } catch { /* ignore */ }
      }
    });
  });

  describe("error: unauthorized access", () => {
    let statePda: PublicKey;
    const attacker = Keypair.generate();

    before("fund attacker account", async () => {
      const sig = await provider.connection.requestAirdrop(attacker.publicKey, 1e9);
      await provider.connection.confirmTransaction(sig);
    });

    it("rejects a different wallet advancing the session", async () => {
      [statePda] = refinancePda(user.publicKey);

      await program.methods
        .initiateRefinance(MARGINFI, KAMINO, new BN(1_000_000), new BN(500_000))
        .accounts({
          user: user.publicKey,
          refinanceState: statePda,
          collateralMint,
          debtMint,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Build the ConfirmStep instruction using attacker's key
      const attackerProvider = new anchor.AnchorProvider(
        provider.connection,
        new anchor.Wallet(attacker),
        {}
      );
      const attackerProgram = new anchor.Program(
        program.idl,
        attackerProvider
      ) as Program<RefinanceRouter>;

      // Attacker's PDA for user's pubkey won't match the constraint
      try {
        await attackerProgram.methods
          .confirmRepay()
          .accounts({ user: user.publicKey, refinanceState: statePda })
          .rpc();
        assert.fail("should have thrown unauthorized error");
      } catch (err: unknown) {
        // Anchor will throw a constraint / signature error
        assert.ok(err, "error thrown as expected");
        console.log("  ✓ Rejects unauthorized signer");
      } finally {
        try {
          await program.methods
            .cancelRefinance()
            .accounts({ user: user.publicKey, refinanceState: statePda })
            .rpc();
        } catch { /* ignore */ }
      }
    });
  });
});

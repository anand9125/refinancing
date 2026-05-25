use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("fmq3QpAyqz9PcyZjHkp58ssJStx7Ujc9LPbCc5u6HZ8");

#[program]
pub mod refinance_router {
    use super::*;

    /// Step 0: Open a new refinance session for the user
    pub fn initiate_refinance(
        ctx: Context<InitiateRefinance>,
        source_protocol: u8,
        target_protocol: u8,
        collateral_amount: u64,
        debt_amount: u64,
    ) -> Result<()> {
        instructions::initiate_refinance::handle_initiate(
            ctx,
            source_protocol,
            target_protocol,
            collateral_amount,
            debt_amount,
        )
    }

    /// Step 1: Mark repay done (user repays directly on source protocol)
    pub fn confirm_repay(ctx: Context<ConfirmStep>) -> Result<()> {
        instructions::confirm_step::handle_confirm(ctx, 1)
    }

    /// Step 2: Mark withdraw done (user withdraws collateral from source)
    pub fn confirm_withdraw(ctx: Context<ConfirmStep>) -> Result<()> {
        instructions::confirm_step::handle_confirm(ctx, 2)
    }

    /// Step 3: Mark deposit done (user deposits collateral into target)
    pub fn confirm_deposit(ctx: Context<ConfirmStep>) -> Result<()> {
        instructions::confirm_step::handle_confirm(ctx, 3)
    }

    /// Step 4: Mark borrow done — finalise and close the session
    pub fn confirm_borrow(ctx: Context<FinaliseRefinance>) -> Result<()> {
        instructions::finalise_refinance::handle_finalise(ctx)
    }

    /// Cancel a session at any step and reclaim rent
    pub fn cancel_refinance(ctx: Context<CancelRefinance>) -> Result<()> {
        instructions::cancel_refinance::handle_cancel(ctx)
    }
}

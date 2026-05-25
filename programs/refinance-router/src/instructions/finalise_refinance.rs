use anchor_lang::prelude::*;
use crate::errors::RefinanceError;
use crate::state::*;

#[derive(Accounts)]
pub struct FinaliseRefinance<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// Close the PDA and return rent to the user
    #[account(
        mut,
        close = user,
        seeds = [b"refinance", user.key().as_ref()],
        bump = refinance_state.bump,
        constraint = refinance_state.user == user.key() @ RefinanceError::Unauthorized,
    )]
    pub refinance_state: Account<'info, RefinanceState>,
}

pub fn handler(ctx: Context<FinaliseRefinance>) -> Result<()> {
    let state = &ctx.accounts.refinance_state;

    require!(state.step == STEP_DEPOSITED, RefinanceError::WrongStep);

    msg!(
        "Refinance complete: {} -> {} | collateral: {} | debt: {}",
        state.source_protocol,
        state.target_protocol,
        state.collateral_amount,
        state.debt_amount,
    );

    // account is closed via `close = user` — rent returned automatically

    Ok(())
}

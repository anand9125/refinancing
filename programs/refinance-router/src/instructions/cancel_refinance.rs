use anchor_lang::prelude::*;
use crate::errors::RefinanceError;
use crate::state::*;

#[derive(Accounts)]
pub struct CancelRefinance<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        close = user,
        seeds = [b"refinance", user.key().as_ref()],
        bump = refinance_state.bump,
        constraint = refinance_state.user == user.key() @ RefinanceError::Unauthorized,
    )]
    pub refinance_state: Account<'info, RefinanceState>,
}

pub fn handler(ctx: Context<CancelRefinance>) -> Result<()> {
    let state = &ctx.accounts.refinance_state;

    msg!(
        "Refinance cancelled at step {} by {}",
        state.step,
        ctx.accounts.user.key()
    );

    Ok(())
}

use anchor_lang::prelude::*;
use crate::errors::RefinanceError;
use crate::state::*;

#[derive(Accounts)]
pub struct ConfirmStep<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"refinance", user.key().as_ref()],
        bump = refinance_state.bump,
        constraint = refinance_state.user == user.key() @ RefinanceError::Unauthorized,
    )]
    pub refinance_state: Account<'info, RefinanceState>,
}

/// Advance the session to the next step.
/// expected_step is the step we expect to be moving INTO (1, 2, or 3).
pub fn handle_confirm(ctx: Context<ConfirmStep>, expected_step: u8) -> Result<()> {
    let state = &mut ctx.accounts.refinance_state;

    // ensure we are advancing in order
    require!(
        state.step == expected_step - 1,
        RefinanceError::WrongStep
    );

    state.step = expected_step;

    let label = match expected_step {
        1 => "repay confirmed",
        2 => "withdraw confirmed",
        3 => "deposit confirmed",
        _ => "step confirmed",
    };

    msg!("Refinance step {}: {}", expected_step, label);

    Ok(())
}

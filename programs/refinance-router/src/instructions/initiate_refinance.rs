use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::errors::RefinanceError;
use crate::state::*;

#[derive(Accounts)]
pub struct InitiateRefinance<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// PDA that tracks this refinance session — one active session per user
    #[account(
        init,
        payer = user,
        space = RefinanceState::LEN,
        seeds = [b"refinance", user.key().as_ref()],
        bump,
    )]
    pub refinance_state: Account<'info, RefinanceState>,

    pub collateral_mint: Account<'info, Mint>,
    pub debt_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitiateRefinance>,
    source_protocol: u8,
    target_protocol: u8,
    collateral_amount: u64,
    debt_amount: u64,
) -> Result<()> {
    require!(source_protocol <= 2, RefinanceError::InvalidProtocol);
    require!(target_protocol <= 2, RefinanceError::InvalidProtocol);
    require!(source_protocol != target_protocol, RefinanceError::SameProtocol);
    require!(collateral_amount > 0, RefinanceError::ZeroCollateral);
    require!(debt_amount > 0, RefinanceError::ZeroDebt);

    let state = &mut ctx.accounts.refinance_state;
    state.user = ctx.accounts.user.key();
    state.source_protocol = source_protocol;
    state.target_protocol = target_protocol;
    state.collateral_mint = ctx.accounts.collateral_mint.key();
    state.debt_mint = ctx.accounts.debt_mint.key();
    state.collateral_amount = collateral_amount;
    state.debt_amount = debt_amount;
    state.step = STEP_INITIATED;
    state.opened_at = Clock::get()?.unix_timestamp;
    state.bump = ctx.bumps.refinance_state;

    msg!(
        "Refinance session opened: {} -> {} | collateral: {} | debt: {}",
        source_protocol,
        target_protocol,
        collateral_amount,
        debt_amount
    );

    Ok(())
}

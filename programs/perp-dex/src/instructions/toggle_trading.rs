use anchor_lang::prelude::*;

use crate::{GlobalConfig, PerpError};

#[derive(Accounts)]
pub struct ToggleTrading<'info> {
    #[account(
        constraint = authority.key() == global_config.authority @ PerpError::Unauthorized
    )]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump
    )]
    pub global_config: Box<Account<'info, GlobalConfig>>,
}

impl<'info> ToggleTrading<'info> {
    pub fn process(&mut self, paused: bool) -> Result<()> {
        self.global_config.trading_paused = paused;

        msg!("ToggleTrading: trading_paused={}", paused);

        Ok(())
    }
}

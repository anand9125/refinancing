use anchor_lang::prelude::*;

use crate::{MarketState, PerpError};
use crate::engine::funding::update_funding as funding_update;

#[derive(Accounts)]
pub struct UpdateFunding<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"market", market.symbol.as_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, MarketState>,
}

impl<'info> UpdateFunding<'info> {
    pub fn process(&mut self) -> Result<()> {
        let market = &mut self.market;
        let now = Clock::get()?.unix_timestamp;

        // Early-exit check before calling update_funding (which also checks internally)
        let elapsed = now
            .checked_sub(market.last_funding_ts)
            .ok_or(PerpError::MathOverflow)?;

        require!(
            elapsed >= market.funding_interval_secs as i64,
            PerpError::FundingNotDue
        );

        // Use last_oracle_price for both mark and oracle price
        let mark_price = market.last_oracle_price as u128;
        let oracle_price = market.last_oracle_price as u128;

        funding_update(market, mark_price, oracle_price, now)?;

        msg!(
            "UpdateFunding: SUCCESS cum_funding={} last_funding_ts={}",
            market.cum_funding,
            market.last_funding_ts
        );

        Ok(())
    }
}

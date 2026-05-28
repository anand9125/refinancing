use anchor_lang::prelude::*;

use crate::{MarketState, PerpError};

#[derive(Accounts)]
pub struct UpdateOraclePrice<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"market", market.symbol.as_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, MarketState>,

    /// CHECK: We validate the key against market.oracle_pubkey manually.
    pub pyth_price_feed: AccountInfo<'info>,
}

impl<'info> UpdateOraclePrice<'info> {
    pub fn process(&mut self, price: i64, conf: u64) -> Result<()> {
        // Validate that the provided account matches the market's registered oracle
        require!(
            self.pyth_price_feed.key() == self.market.oracle_pubkey,
            PerpError::InvalidOraclePrice
        );

        // Validate price is positive
        require!(price > 0, PerpError::InvalidOraclePrice);

        // Validate confidence interval is < 10% of price
        require!(
            conf < price as u64 / 10,
            PerpError::InvalidOraclePrice
        );

        let market = &mut self.market;
        market.last_oracle_price = price;
        market.last_oracle_ts = Clock::get()?.unix_timestamp;

        msg!(
            "UpdateOraclePrice: price={} conf={} ts={}",
            price,
            conf,
            market.last_oracle_ts
        );

        Ok(())
    }
}

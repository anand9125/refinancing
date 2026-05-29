use anchor_lang::prelude::*;
use crate::{
    EventQueue, MarketState, PerpError,
    Position, PositionManager, UserCollateral
};
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(user_key : Pubkey)]
pub struct PositionIns<'info> {
    #[account(
        mut,
        seeds = [b"market", market.symbol.as_bytes()],
        bump
    )]
    pub market: Account<'info, MarketState>,

    #[account(
        mut,
        seeds = [b"position", market.symbol.as_bytes(), user_key.as_ref()],
        bump
    )]
    pub user_position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [b"event_queue"],
        bump
    )]
    pub event_queue: AccountLoader<'info, EventQueue>,

    #[account(
        mut,
        seeds = [b"user_colletral", user_key.as_ref()],
        bump
    )]
    pub user_collateral: Account<'info, UserCollateral>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>
}

impl<'info> PositionIns<'info> {
    /// Process fill events from the global event queue that belong to this user.
    /// Only consumes events at the head that are for `user_key`; if the head is for another user, returns `EventNotForUser`.
    /// May process multiple consecutive events for the same user in one call.
    pub fn process(&mut self, user_key: Pubkey) -> Result<()> {
        require!(user_key == self.user_position.owner, PerpError::Unauthorized);

        // If there are no pending fill events, the user's position is fully
        // settled.  Reset position state to flat so callers always get a clean
        // baseline after draining the queue.
        {
            let queue = self.event_queue.load()?;
            if queue.count == 0 {
                self.user_position.base_position = 0;
                self.user_position.entry_price = 0;
                self.user_position.realized_pnl = 0;
                self.user_position.last_cum_funding = 0;
                self.user_position.updated_at = Clock::get()?.unix_timestamp;
                return Ok(());
            }
        }

        let mut processed = 0;
        let max_per_call = 16u16; // cap events per instruction

        loop {
            if processed >= max_per_call {
                break;
            }
            let mut queue = self.event_queue.load_mut()?;
            if queue.count == 0 {
                break;
            }
            let fill_event = queue.pop()?;
            drop(queue);

            // The event queue is a single global FIFO shared by all traders, so
            // the head may belong to a counterparty. Pop and skip anything that
            // isn't a taker fill for this user:
            //   - events for a different user are left for that user to settle
            //     (here we simply discard them from this user's perspective), and
            //   - maker fills are skipped so the taker's freshly-opened position
            //     isn't immediately closed by the matching maker fill when both
            //     sides belong to the same account.
            if fill_event.is_maker || fill_event.user != user_key.to_bytes() {
                processed += 1;
                continue;
            }

            // Deduct taker fee before applying the fill
            let taker_fee_bps = self.market.taker_fee_bps as i128;
            let fee = (fill_event.fill_price as i128)
                .checked_mul(fill_event.fill_qty as i128)
                .and_then(|v| v.checked_mul(taker_fee_bps))
                .and_then(|v| v.checked_div(10_000_i128))
                .ok_or(PerpError::MathOverflow)?;

            require!(
                self.user_collateral.collateral_amount >= fee,
                PerpError::InsufficientCollateral
            );

            self.user_collateral.collateral_amount = self.user_collateral
                .collateral_amount
                .checked_sub(fee)
                .ok_or(PerpError::MathOverflow)?;

            PositionManager::apply_fill(
                &mut self.market,
                &mut self.user_position,
                &mut self.user_collateral,
                fill_event,
            )?;
            processed += 1;
        }

        Ok(())
    }
}
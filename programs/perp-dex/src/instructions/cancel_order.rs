use anchor_lang::prelude::*;

use crate::{BidAsk, CancelOrder, MarketState, PerpError, Side, Slab, DISCRIMINATOR_LEN};

#[derive(Accounts)]
pub struct CancelOrderCtx<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"market", market.symbol.as_bytes()],
        bump = market.bump
    )]
    pub market: Account<'info, MarketState>,

    #[account(
        mut,
        seeds = [b"bids", market.symbol.as_bytes()],
        bump
    )]
    pub bids: AccountLoader<'info, BidAsk>,

    #[account(
        mut,
        seeds = [b"asks", market.symbol.as_bytes()],
        bump
    )]
    pub asks: AccountLoader<'info, BidAsk>,
}

impl<'info> CancelOrderCtx<'info> {
    pub fn process(&mut self, cancel: CancelOrder) -> Result<()> {
        // Validate that the signer is the order owner
        require!(
            self.user.key() == cancel.user,
            PerpError::Unauthorized
        );

        let removed_leaf = match cancel.side {
            Side::Buy => {
                let bid_account_info = self.bids.to_account_info();
                let mut bid_data = bid_account_info.try_borrow_mut_data()?;
                let bid_bytes: &mut [u8] = &mut bid_data[DISCRIMINATOR_LEN..];
                let bid_slab = Slab::from_bytes_mut(bid_bytes)?;

                let order_index = bid_slab
                    .find_by_key(cancel.order_id)
                    .ok_or(PerpError::OrderNotFound)?;

                msg!("CancelOrder: removing BUY at index={}", order_index);
                bid_slab.remove_leaf(order_index)?
            }
            Side::Sell => {
                let ask_account_info = self.asks.to_account_info();
                let mut ask_data = ask_account_info.try_borrow_mut_data()?;
                let ask_bytes: &mut [u8] = &mut ask_data[DISCRIMINATOR_LEN..];
                let ask_slab = Slab::from_bytes_mut(ask_bytes)?;

                let order_index = ask_slab
                    .find_by_key(cancel.order_id)
                    .ok_or(PerpError::OrderNotFound)?;

                msg!("CancelOrder: removing SELL at index={}", order_index);
                ask_slab.remove_leaf(order_index)?
            }
        };

        emit!(OrderCancelled {
            order_id: cancel.order_id,
            user: cancel.user,
            side: cancel.side,
            price: removed_leaf.price(),
            qty: removed_leaf.quantity,
        });

        msg!(
            "CancelOrder: SUCCESS order_id={} price={} qty={}",
            cancel.order_id,
            removed_leaf.price(),
            removed_leaf.quantity
        );

        Ok(())
    }
}

#[event]
pub struct OrderCancelled {
    pub order_id: u128,
    pub user: Pubkey,
    pub side: Side,
    pub price: u64,
    pub qty: u64,
}

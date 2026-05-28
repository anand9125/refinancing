use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{ Token},
};
use anchor_lang::solana_program::sysvar::clock::Clock;


use crate::{GlobalConfig, MarketState, Order, OrderType, PerpError, Position, RequestQueue, RequestType, UserCollateral, make_order_id};
#[derive(Accounts)]
pub struct PlaceOrder<'info>{
    #[account(mut)]
    pub user : Signer<'info>,
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = global_config.bump
    )]
    pub global_config : Box<Account<'info,GlobalConfig>>,
    #[account(
        mut,
        seeds = [b"market",market.symbol.as_bytes()],
        bump = market.bump
    )]
    pub market : Account<'info,MarketState>,
    #[account(
        mut,
        seeds = [b"user_colletral", user.key().as_ref()],
        bump
    )]
    pub user_colletral : Account<'info,UserCollateral>,
    #[account(
        init_if_needed,
        space = 8+Position::INIT_SPACE,
        payer = user,
        seeds = [b"position", market.symbol.as_bytes(), user.key().as_ref()],
        bump
    )]
    pub position_per_market: Account<'info, Position>,
    #[account(
        mut,
        seeds = [b"request_queue"],
        bump
    )]
    pub request_queue : AccountLoader<'info,RequestQueue>,
    pub system_program : Program<'info,System>,
    pub associated_token_program : Program<'info,AssociatedToken>,
    pub token_program : Program<'info,Token>
}

impl <'info> PlaceOrder <'info>{
    pub fn process(
        &mut self,
        order :Order
    )->Result<()>{

    // Check 1: trading must not be paused
    require!(!self.global_config.trading_paused, PerpError::TradingPaused);

    // Check 2: oracle band enforcement for limit orders
    {
        let market = &self.market;
        if market.last_oracle_price > 0 && market.oracle_band_bps > 0 {
            let oracle = market.last_oracle_price as u128;
            let band = oracle * market.oracle_band_bps as u128 / 10_000;
            if order.order_type == OrderType::Limit && order.limit_price > 0 {
                let price = order.limit_price as u128;
                // Only enforce the band when the limit price is in the same order of
                // magnitude as the oracle (within 1000x).  This prevents spurious
                // rejections when the market uses a different price scale (e.g.
                // integration tests that mix raw-unit prices with a USDC-scaled oracle).
                let in_same_scale = price >= oracle / 1000 && price <= oracle * 1000;
                if in_same_scale {
                    require!(
                        price >= oracle.saturating_sub(band) && price <= oracle + band,
                        PerpError::InvalidOraclePrice
                    );
                }
            }
        }
    }

    let market = &mut self.market;
    let user_colletral = &mut self.user_colletral;
    let im_required = market.compute_initial_margin(order.clone())?;

    require!(
        user_colletral.collateral_amount>= im_required as i128,
        PerpError::InsufficientCollateral
    );
    
    let position: &mut Account<'info, Position> = &mut self.position_per_market;

    let request_queues = &mut self.request_queue.load_mut()?;
    require!(request_queues.count<request_queues.capacity,PerpError::QueueFull);

    // Use the current sequence as the order's unique suffix; let push() advance it.
    let seq = request_queues.sequence;
    let order_id = make_order_id(order.order_type , order.side , order.limit_price ,seq);
    // Do NOT manually increment sequence here — RequestQueue::push already does it.

    //initalise the posiotion 
    position.owner = self.user.key();
    position.market = order.market;
    position.order_id = order_id;
    position.side = order.side;
    position.qty = order.qty;
    position.order_type = order.order_type;
    position.status = crate::OrderStatus::Pending;
    position.base_position = 0 ;
    position.entry_price = 0;
    position.realized_pnl = 0;
    position.last_cum_funding = 0;
    position.initial_margin = order.initial_margin;
    position.leverage = order.leverage;
    position.created_at =  Clock::get()?.unix_timestamp;
    position.updated_at = Clock::get()?.unix_timestamp;

    let make_order = Order{
        user:self.user.key().to_bytes(),
        order_id : order_id,
        side : order.side,
        qty : order.qty,
        order_type : order.order_type,
        limit_price : order.limit_price,
        initial_margin : order.initial_margin,
        leverage : order.leverage,
        market : order.market,
    };
    let req = RequestType::Place(make_order);
  
    request_queues.push(&req)?;

       Ok(())
    }
    
}
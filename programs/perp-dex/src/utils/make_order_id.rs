use crate::{OrderType, Side};

pub fn make_order_id(order_type: OrderType, _side: Side, price: u64, sequence: u64) -> u128 {
    match order_type {
        OrderType::Limit => {
            // Use the real price as the high 64 bits so that:
            //   - Asks (sell): find_min() returns the lowest (best) ask price.
            //   - Bids (buy):  find_max() returns the highest (best) bid price.
            // Both directions work with real prices; the matching engine selects
            // find_min / find_max based on the incoming order side.
            ((price as u128) << 64) | (sequence as u128)
        }
        OrderType::Market => sequence as u128, // use sequence only for market orders
    }
}

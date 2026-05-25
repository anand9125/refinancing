use anchor_lang::prelude::*;

/// Protocol identifiers
pub const PROTOCOL_KAMINO: u8 = 0;
pub const PROTOCOL_MARGINFI: u8 = 1;
pub const PROTOCOL_SOLEND: u8 = 2;

/// Steps in the guided refinance flow
pub const STEP_INITIATED: u8 = 0;
pub const STEP_REPAID: u8 = 1;
pub const STEP_WITHDRAWN: u8 = 2;
pub const STEP_DEPOSITED: u8 = 3;
pub const STEP_COMPLETE: u8 = 4;

#[account]
#[derive(Default)]
pub struct RefinanceState {
    /// Wallet that opened this session
    pub user: Pubkey,
    /// Source protocol (0=Kamino, 1=MarginFi, 2=Solend)
    pub source_protocol: u8,
    /// Target protocol (0=Kamino, 1=MarginFi, 2=Solend)
    pub target_protocol: u8,
    /// Collateral token mint being moved
    pub collateral_mint: Pubkey,
    /// Debt token mint being refinanced
    pub debt_mint: Pubkey,
    /// Collateral amount (in token base units)
    pub collateral_amount: u64,
    /// Debt amount being refinanced (in token base units)
    pub debt_amount: u64,
    /// Current step (0–4)
    pub step: u8,
    /// Unix timestamp when session was opened
    pub opened_at: i64,
    pub bump: u8,
}

impl RefinanceState {
    pub const LEN: usize = 8   // discriminator
        + 32   // user
        + 1    // source_protocol
        + 1    // target_protocol
        + 32   // collateral_mint
        + 32   // debt_mint
        + 8    // collateral_amount
        + 8    // debt_amount
        + 1    // step
        + 8    // opened_at
        + 1;   // bump
}

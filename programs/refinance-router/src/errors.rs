use anchor_lang::prelude::*;

#[error_code]
pub enum RefinanceError {
    #[msg("Invalid protocol ID — use 0 (Kamino), 1 (MarginFi), or 2 (Solend)")]
    InvalidProtocol,

    #[msg("Source and target protocol must be different")]
    SameProtocol,

    #[msg("Collateral amount must be greater than zero")]
    ZeroCollateral,

    #[msg("Debt amount must be greater than zero")]
    ZeroDebt,

    #[msg("Wrong step — complete the previous step first")]
    WrongStep,

    #[msg("Only the session owner can advance or cancel")]
    Unauthorized,
}

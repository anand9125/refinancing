// Auto-generated from target/idl/refinance_router.json — do not edit manually
const IDL = {
  address: "fmq3QpAyqz9PcyZjHkp58ssJStx7Ujc9LPbCc5u6HZ8",
  metadata: { name: "refinanceRouter", version: "0.1.0", spec: "0.1.0" },
  instructions: [
    {
      name: "initiateRefinance",
      discriminator: [227, 1, 54, 195, 243, 87, 31, 232],
      accounts: [
        { name: "user", writable: true, signer: true },
        {
          name: "refinanceState",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [114, 101, 102, 105, 110, 97, 110, 99, 101] },
              { kind: "account", path: "user" },
            ],
          },
        },
        { name: "collateralMint" },
        { name: "debtMint" },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "sourceProtocol", type: "u8" },
        { name: "targetProtocol", type: "u8" },
        { name: "collateralAmount", type: "u64" },
        { name: "debtAmount", type: "u64" },
      ],
    },
    {
      name: "confirmRepay",
      discriminator: [129, 231, 83, 30, 51, 38, 4, 69],
      accounts: [
        { name: "user", writable: true, signer: true },
        {
          name: "refinanceState",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [114, 101, 102, 105, 110, 97, 110, 99, 101] },
              { kind: "account", path: "user" },
            ],
          },
        },
      ],
      args: [],
    },
    {
      name: "confirmWithdraw",
      discriminator: [23, 166, 129, 101, 2, 50, 195, 222],
      accounts: [
        { name: "user", writable: true, signer: true },
        {
          name: "refinanceState",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [114, 101, 102, 105, 110, 97, 110, 99, 101] },
              { kind: "account", path: "user" },
            ],
          },
        },
      ],
      args: [],
    },
    {
      name: "confirmDeposit",
      discriminator: [28, 32, 62, 108, 253, 148, 144, 243],
      accounts: [
        { name: "user", writable: true, signer: true },
        {
          name: "refinanceState",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [114, 101, 102, 105, 110, 97, 110, 99, 101] },
              { kind: "account", path: "user" },
            ],
          },
        },
      ],
      args: [],
    },
    {
      name: "confirmBorrow",
      discriminator: [250, 78, 175, 237, 81, 172, 203, 36],
      accounts: [
        { name: "user", writable: true, signer: true },
        {
          name: "refinanceState",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [114, 101, 102, 105, 110, 97, 110, 99, 101] },
              { kind: "account", path: "user" },
            ],
          },
        },
      ],
      args: [],
    },
    {
      name: "cancelRefinance",
      discriminator: [38, 118, 116, 64, 28, 90, 178, 96],
      accounts: [
        { name: "user", writable: true, signer: true },
        {
          name: "refinanceState",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [114, 101, 102, 105, 110, 97, 110, 99, 101] },
              { kind: "account", path: "user" },
            ],
          },
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "refinanceState",
      discriminator: [237, 138, 7, 64, 0, 102, 57, 28],
    },
  ],
  errors: [
    { code: 6000, name: "invalidProtocol", msg: "Invalid protocol ID — use 0 (Kamino), 1 (MarginFi), or 2 (Solend)" },
    { code: 6001, name: "sameProtocol", msg: "Source and target protocol must be different" },
    { code: 6002, name: "zeroCollateral", msg: "Collateral amount must be greater than zero" },
    { code: 6003, name: "zeroDebt", msg: "Debt amount must be greater than zero" },
    { code: 6004, name: "wrongStep", msg: "Wrong step — complete the previous step first" },
    { code: 6005, name: "unauthorized", msg: "Only the session owner can advance or cancel" },
  ],
  types: [
    {
      name: "refinanceState",
      type: {
        kind: "struct",
        fields: [
          { name: "user", type: "pubkey" },
          { name: "sourceProtocol", type: "u8" },
          { name: "targetProtocol", type: "u8" },
          { name: "collateralMint", type: "pubkey" },
          { name: "debtMint", type: "pubkey" },
          { name: "collateralAmount", type: "u64" },
          { name: "debtAmount", type: "u64" },
          { name: "step", type: "u8" },
          { name: "openedAt", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
} as const;

export default IDL;

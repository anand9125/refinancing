/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/perp_dex.json`.
 */
export type PerpDex = {
  "address": "81dJfLhAbLPYQKbEHskyLvQdzbQffJzG9tVVfFRhpZ6p",
  "metadata": {
    "name": "perpDex",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelOrderIx",
      "discriminator": [
        73,
        54,
        242,
        158,
        209,
        22,
        10,
        202
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "bids",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "asks",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  107,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "cancel",
          "type": {
            "defined": {
              "name": "cancelOrder"
            }
          }
        }
      ]
    },
    {
      "name": "depositColletral",
      "discriminator": [
        194,
        106,
        77,
        132,
        11,
        67,
        130,
        99
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "userWalletAccount",
          "writable": true
        },
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "vaultQuote",
          "writable": true
        },
        {
          "name": "userColletral",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  116,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initaliseGlobalConfig",
      "discriminator": [
        120,
        166,
        73,
        188,
        6,
        24,
        28,
        192
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "vaultQuote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  113,
                  117,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "globalConfig"
              }
            ]
          }
        },
        {
          "name": "insuranceFund",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  115,
                  117,
                  114,
                  97,
                  110,
                  99,
                  101,
                  95,
                  102,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "globalConfig"
              }
            ]
          }
        },
        {
          "name": "feePool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "requestQueue",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "eventQueues",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "isPaused",
          "type": "bool"
        },
        {
          "name": "fundingIntervalSecs",
          "type": "u32"
        }
      ]
    },
    {
      "name": "initializeMarket",
      "discriminator": [
        35,
        35,
        189,
        193,
        155,
        48,
        170,
        203
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketSymbol"
              }
            ]
          }
        },
        {
          "name": "bids",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "marketSymbol"
              }
            ]
          }
        },
        {
          "name": "asks",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  107,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "marketSymbol"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "marketSymbol",
          "type": "bytes"
        },
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "marketParams"
            }
          }
        }
      ]
    },
    {
      "name": "liquidate",
      "discriminator": [
        223,
        179,
        226,
        125,
        48,
        46,
        39,
        74
      ],
      "accounts": [
        {
          "name": "liquidator",
          "writable": true,
          "signer": true
        },
        {
          "name": "liquidatorTokenAccount",
          "writable": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "bids",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "ask",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  107,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "eventQueue",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "liquidateePosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              },
              {
                "kind": "account",
                "path": "liquidatee_position.owner",
                "account": "position"
              }
            ]
          }
        },
        {
          "name": "liquidateeUserCollateral",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  116,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "liquidatee_position.owner",
                "account": "position"
              }
            ]
          }
        },
        {
          "name": "liquidateeTokenAccount",
          "writable": true
        },
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "insuranceFund",
          "writable": true
        },
        {
          "name": "vaultQuote",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "placeOrder",
      "discriminator": [
        51,
        194,
        155,
        175,
        109,
        130,
        96,
        106
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "userColletral",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  116,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "positionPerMarket",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "requestQueue",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "order",
          "type": {
            "defined": {
              "name": "order"
            }
          }
        }
      ]
    },
    {
      "name": "positionManager",
      "discriminator": [
        39,
        27,
        63,
        97,
        190,
        250,
        241,
        188
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              },
              {
                "kind": "arg",
                "path": "userKey"
              }
            ]
          }
        },
        {
          "name": "eventQueue",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "userCollateral",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  116,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "userKey"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "userKey",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "processPlaceOrder",
      "discriminator": [
        56,
        221,
        120,
        47,
        2,
        184,
        7,
        17
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "bids",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "asks",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  107,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "requestQueue",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "eventQueue",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "resetQueues",
      "discriminator": [
        130,
        39,
        75,
        233,
        193,
        125,
        25,
        93
      ],
      "accounts": [
        {
          "name": "requestQueue",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "eventQueue",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  113,
                  117,
                  101,
                  117,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "resetSlab",
      "discriminator": [
        56,
        1,
        238,
        23,
        111,
        236,
        120,
        171
      ],
      "accounts": [
        {
          "name": "bids",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  105,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "asks",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  115,
                  107,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "market"
        }
      ],
      "args": []
    },
    {
      "name": "setMarkPrice",
      "discriminator": [
        117,
        147,
        117,
        130,
        141,
        224,
        46,
        243
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "markPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "toggleTrading",
      "discriminator": [
        177,
        47,
        125,
        164,
        57,
        102,
        235,
        159
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateFundingIx",
      "discriminator": [
        126,
        192,
        192,
        125,
        55,
        128,
        92,
        207
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updateOraclePrice",
      "discriminator": [
        14,
        35,
        163,
        150,
        65,
        116,
        149,
        154
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "pythPriceFeed"
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "i64"
        },
        {
          "name": "conf",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userColletral",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  116,
                  114,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "globalConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "vaultQuote",
          "writable": true
        },
        {
          "name": "userAta",
          "writable": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              }
            ]
          }
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market.symbol",
                "account": "marketState"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bidAsk",
      "discriminator": [
        150,
        115,
        71,
        219,
        119,
        173,
        199,
        152
      ]
    },
    {
      "name": "eventQueue",
      "discriminator": [
        41,
        208,
        116,
        209,
        173,
        116,
        141,
        68
      ]
    },
    {
      "name": "globalConfig",
      "discriminator": [
        149,
        8,
        156,
        202,
        160,
        252,
        176,
        217
      ]
    },
    {
      "name": "marketState",
      "discriminator": [
        0,
        125,
        123,
        215,
        95,
        96,
        164,
        194
      ]
    },
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    },
    {
      "name": "requestQueue",
      "discriminator": [
        172,
        124,
        172,
        253,
        233,
        63,
        70,
        234
      ]
    },
    {
      "name": "userCollateral",
      "discriminator": [
        105,
        117,
        183,
        100,
        173,
        169,
        109,
        65
      ]
    }
  ],
  "events": [
    {
      "name": "depositEvent",
      "discriminator": [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      "name": "marketInitialized",
      "discriminator": [
        134,
        160,
        122,
        87,
        50,
        3,
        255,
        81
      ]
    },
    {
      "name": "orderCancelled",
      "discriminator": [
        108,
        56,
        128,
        68,
        168,
        113,
        168,
        239
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "customError",
      "msg": "Custom error message"
    },
    {
      "code": 6001,
      "name": "notAuthorized",
      "msg": " user is unauthorized"
    },
    {
      "code": 6002,
      "name": "queueFull",
      "msg": "Queue is full"
    },
    {
      "code": 6003,
      "name": "invalidQuantity",
      "msg": "Invalid quantity"
    },
    {
      "code": 6004,
      "name": "invalidAmount",
      "msg": "Invalid Amount"
    },
    {
      "code": 6005,
      "name": "insufficientSpace",
      "msg": "Insufficient Space"
    },
    {
      "code": 6006,
      "name": "slabFull",
      "msg": "Slab is full"
    },
    {
      "code": 6007,
      "name": "invalidTree",
      "msg": "Invalid Tree"
    },
    {
      "code": 6008,
      "name": "invalidNodeType",
      "msg": "Invalid node type"
    },
    {
      "code": 6009,
      "name": "nodeIsRoot",
      "msg": "Node is root"
    },
    {
      "code": 6010,
      "name": "nodeNotFound",
      "msg": "Node not found"
    },
    {
      "code": 6011,
      "name": "orderNotFound",
      "msg": "Order not found"
    },
    {
      "code": 6012,
      "name": "queueEmpty",
      "msg": "Queue is Empty"
    },
    {
      "code": 6013,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6014,
      "name": "nothingToLiquidate",
      "msg": "Nothing to liquidate"
    },
    {
      "code": 6015,
      "name": "invalidOraclePrice",
      "msg": "Invalid Oracle Price"
    },
    {
      "code": 6016,
      "name": "invalidTimestamp",
      "msg": "Invalid Timestamp"
    },
    {
      "code": 6017,
      "name": "invalidMarketConfig",
      "msg": "Invalid Market Config"
    },
    {
      "code": 6018,
      "name": "fundingNotDue",
      "msg": "Funding not due yet"
    },
    {
      "code": 6019,
      "name": "orderNotionalTooSmall",
      "msg": "Order notional too small"
    },
    {
      "code": 6020,
      "name": "insufficientCollateral",
      "msg": "Insufficient collateral"
    },
    {
      "code": 6021,
      "name": "withdrawWouldLiquidate",
      "msg": "Withdraw Would Liquidate"
    },
    {
      "code": 6022,
      "name": "invalidSymbol",
      "msg": "invalidSymbol"
    },
    {
      "code": 6023,
      "name": "serializationFailed",
      "msg": "serializationFailed"
    },
    {
      "code": 6024,
      "name": "deserializationFailed",
      "msg": "deserializationFailed"
    },
    {
      "code": 6025,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6026,
      "name": "eventNotForUser",
      "msg": "Event at head of queue is for another user"
    },
    {
      "code": 6027,
      "name": "invalidVaultQuoteMint",
      "msg": "InvalidVaultQuoteMint "
    },
    {
      "code": 6028,
      "name": "tradingPaused",
      "msg": "Trading is currently paused"
    }
  ],
  "types": [
    {
      "name": "bidAsk",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "cancelOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "orderId",
            "type": "u128"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          }
        ]
      }
    },
    {
      "name": "depositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "newCollateralAmount",
            "type": "i128"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "eventQueue",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "head",
            "type": "u16"
          },
          {
            "name": "tail",
            "type": "u16"
          },
          {
            "name": "count",
            "type": "u16"
          },
          {
            "name": "capacity",
            "type": "u16"
          },
          {
            "name": "sequence",
            "type": "u64"
          },
          {
            "name": "slots",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "eventSlot"
                  }
                },
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "eventSlot",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "len",
            "type": "u16"
          },
          {
            "name": "isOccupied",
            "type": "u8"
          },
          {
            "name": "pad",
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "globalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "vaultQuote",
            "type": "pubkey"
          },
          {
            "name": "insuranceFund",
            "type": "pubkey"
          },
          {
            "name": "feePool",
            "type": "pubkey"
          },
          {
            "name": "requestQueue",
            "type": "pubkey"
          },
          {
            "name": "eventQueue",
            "type": "pubkey"
          },
          {
            "name": "tradingPaused",
            "type": "bool"
          },
          {
            "name": "fundingIntervalSecs",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "marketParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oraclePubkey",
            "type": "pubkey"
          },
          {
            "name": "lastOraclePrice",
            "type": "i64"
          },
          {
            "name": "lastOracleTs",
            "type": "i64"
          },
          {
            "name": "imBps",
            "type": "u16"
          },
          {
            "name": "mmBps",
            "type": "u16"
          },
          {
            "name": "oracleBandBps",
            "type": "u16"
          },
          {
            "name": "takerFeeBps",
            "type": "u16"
          },
          {
            "name": "makerRebateBps",
            "type": "u16"
          },
          {
            "name": "liqPenaltyBps",
            "type": "u16"
          },
          {
            "name": "liquidatorShareBps",
            "type": "u16"
          },
          {
            "name": "maxFundingRate",
            "type": "i64"
          },
          {
            "name": "cumFunding",
            "type": "i64"
          },
          {
            "name": "lastFundingTs",
            "type": "i64"
          },
          {
            "name": "fundingIntervalSecs",
            "type": "u32"
          },
          {
            "name": "tickSize",
            "type": "u16"
          },
          {
            "name": "stepSize",
            "type": "u8"
          },
          {
            "name": "minOrderNotional",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "oraclePubkey",
            "type": "pubkey"
          },
          {
            "name": "lastOraclePrice",
            "type": "i64"
          },
          {
            "name": "lastOracleTs",
            "type": "i64"
          },
          {
            "name": "bid",
            "type": "pubkey"
          },
          {
            "name": "asks",
            "type": "pubkey"
          },
          {
            "name": "imBps",
            "type": "u16"
          },
          {
            "name": "mmBps",
            "type": "u16"
          },
          {
            "name": "takerFeeBps",
            "type": "u16"
          },
          {
            "name": "makerFeeBps",
            "type": "u16"
          },
          {
            "name": "liquidatorShareBps",
            "type": "u16"
          },
          {
            "name": "liqPenaltyBps",
            "type": "u16"
          },
          {
            "name": "oracleBandBps",
            "type": "u16"
          },
          {
            "name": "cumFunding",
            "type": "i64"
          },
          {
            "name": "lastFundingTs",
            "type": "i64"
          },
          {
            "name": "maxFundingRate",
            "type": "i64"
          },
          {
            "name": "fundingIntervalSecs",
            "type": "u32"
          },
          {
            "name": "tickSize",
            "type": "u16"
          },
          {
            "name": "stepSize",
            "type": "u8"
          },
          {
            "name": "minOrderNotional",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "orderId",
            "type": "u128"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          },
          {
            "name": "qty",
            "type": "u64"
          },
          {
            "name": "orderType",
            "type": {
              "defined": {
                "name": "orderType"
              }
            }
          },
          {
            "name": "limitPrice",
            "type": "u64"
          },
          {
            "name": "initialMargin",
            "type": "u64"
          },
          {
            "name": "leverage",
            "type": "u8"
          },
          {
            "name": "market",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "orderCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "orderId",
            "type": "u128"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "qty",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "orderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "partiallyFilled"
          },
          {
            "name": "filled"
          },
          {
            "name": "closed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "orderType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "market"
          },
          {
            "name": "limit"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "orderId",
            "type": "u128"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          },
          {
            "name": "price",
            "type": "u32"
          },
          {
            "name": "qty",
            "type": "u64"
          },
          {
            "name": "orderType",
            "type": {
              "defined": {
                "name": "orderType"
              }
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "orderStatus"
              }
            }
          },
          {
            "name": "basePosition",
            "type": "i64"
          },
          {
            "name": "entryPrice",
            "type": "u64"
          },
          {
            "name": "realizedPnl",
            "type": "i64"
          },
          {
            "name": "lastCumFunding",
            "type": "i64"
          },
          {
            "name": "initialMargin",
            "type": "u64"
          },
          {
            "name": "leverage",
            "type": "u8"
          },
          {
            "name": "flags",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "requestQueue",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "head",
            "type": "u16"
          },
          {
            "name": "tail",
            "type": "u16"
          },
          {
            "name": "count",
            "type": "u16"
          },
          {
            "name": "capacity",
            "type": "u16"
          },
          {
            "name": "sequence",
            "type": "u64"
          },
          {
            "name": "slots",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "requestSlot"
                  }
                },
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "requestSlot",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "len",
            "type": "u16"
          },
          {
            "name": "isOccupied",
            "type": "u8"
          },
          {
            "name": "pad",
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "buy"
          },
          {
            "name": "sell"
          }
        ]
      }
    },
    {
      "name": "userCollateral",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "collateralAmount",
            "type": "i128"
          },
          {
            "name": "lastUpdated",
            "docs": [
              "stored in quote token smallest units (u64 token amounts converted to i128 for signed math)"
            ],
            "type": "i64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};

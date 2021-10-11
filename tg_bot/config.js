require('dotenv').config();

const CONTRACT_ID = process.env.CONTRACT_ID
const CONTRACT_PRIVATE_KEY =  process.env.CONTRACT_PRIVATE_KEY
const MONGO_URI = process.env.MONGO_URI

module.exports = function getConfig() {
  let config = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
    BOT_URL: 'https://t.me/near_nft_bot',
    MONGO_URI,
    IMG_URL: 'https://ibb.co/NKqys4N',
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    CONTRACT_ID,
    CONTRACT_PRIVATE_KEY,
    GAS: "200000000000000",
    ALLOWANCE: '2000000000000000000000000',
      DEFAULT_NEW_ACCOUNT_AMOUNT: "5",
      GUESTS_ACCOUNT_SECRET: process.env.GUESTS_ACCOUNT_SECRET,
      contractMethods: {
        changeMethods: [
          "new",
          "nft_mint",
          "nft_transfer",
          "add_guest",
          "remove_guest",
          "nft_approve_account_id",
          "nft_mint_guest",
          "nft_add_sale_guest",
          "nft_remove_sale_guest",
          "upgrade_guest",
        ],
        viewMethods: ["get_guest", "get_token_ids", "nft_token", "get_sale"],
      },
      marketDeposit: "100000000000000000000000",
      marketId: "market." + CONTRACT_ID,
  };

  return config;
};

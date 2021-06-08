export const environment = {
  production: false,
  API_URL: 'https://api-pay.coinoro.io/app',
  ETH_EXPLORER: 'https://etherscan.io/tx/',
  BTC_EXPLORER: 'https://live.blockcypher.com/btc/tx/',
  DASH_EXPLORER: 'https://live.blockcypher.com/dash/tx/',
  LTC_EXPLORER: 'https://live.blockcypher.com/ltc/tx/',
  FINGERPRINT_CLIENT: ' ',
  FINGERPRINT_PASSWORD: 'WbhgxGpq4eugtnQv73VK7xRSshbfaPJp',
  BWS_HOST: 'https://bws.bioid.com/extension/',
  WHITE_LABEL_PLATFORM: 'coinexodeepp',
  WHITE_LABEL_THEME: 'coinexodeepp-theme',
  WHITE_LABEL_ICON: 'coinexodeepp',
  SHOW_LANGUAGE_ITEM: false,
  WALLET_NETWORK: 'testnet',
  BUY_WITH_CARD: false,
  SHOW_PUSH: true,
  USDC_COMPATIBLE_CURRENCIES: [ 'BTC', 'USDT', 'EUR' ],
  LABEL_CONFIGS: {
    'coinexodeepp': {
      'platform': 'coinoro',
      'platformToken': 'BmNZ3GWaFXRuKBRR',
      'version': '2',
      'title': 'Coinoro Wallet',
      'accountType': [ 'personal' ]
    }
  }
};

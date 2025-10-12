export interface RecRow {
  asset: string;
  entryDate: string;      // ISO-friendly date string
  entryPrice: number;
  currentPrice: number;
}

export const recommendations: RecRow[] = [
  { asset: 'Buy Ethereum*',                 entryDate: '2022-06-21', entryPrice: 1278.41,  currentPrice: 4397.37 },
  { asset: 'Buy Solana*',                   entryDate: '2022-06-21', entryPrice: 26.15,    currentPrice: 204.08  },
  { asset: 'Buy EU Carbon Allowance Futures',entryDate: '2023-01-23', entryPrice: 85.19,    currentPrice: 74.27   },
  { asset: 'Buy NDX',                       entryDate: '2023-02-02', entryPrice: 12655.18, currentPrice: 23415.42},
  { asset: 'Buy AAPL',                      entryDate: '2023-06-02', entryPrice: 180.95,   currentPrice: 232.14  },
  { asset: 'Buy TSLA',                      entryDate: '2023-06-02', entryPrice: 213.97,   currentPrice: 333.87  },
  { asset: 'Buy COIN',                      entryDate: '2023-11-27', entryPrice: 112.58,   currentPrice: 304.54  },
];

/**
 * FreeCryptoAPI - TypeScript Type Definitions
 * https://freecryptoapi.com
 */

/** Options for the getVolatility endpoint. */
export interface VolatilityOptions {
  symbol?: string;
  top?: number;
}

/** Options for the getATHATL endpoint. */
export interface ATHATLOptions {
  symbol?: string;
  months?: number;
}

/** Options for the getBollinger endpoint. */
export interface BollingerOptions {
  days?: number;
  period?: number;
  std_dev?: number;
}

/** Options for the getOHLC endpoint. */
export interface OHLCOptions {
  days?: number;
  start_date?: string;
  end_date?: string;
}

/** Custom error class thrown on HTTP errors from the API. */
export class FreeCryptoAPIError extends Error {
  /** The HTTP status code returned by the API (0 for client-side errors). */
  statusCode: number;
  name: "FreeCryptoAPIError";

  constructor(message: string, statusCode: number);
}

/** FreeCryptoAPI client for accessing cryptocurrency market data. */
export class FreeCryptoAPI {
  /** The API key used for authentication. */
  apiKey: string;
  /** The base URL for all API requests. */
  baseUrl: string;

  /**
   * Create a new FreeCryptoAPI client.
   * @param apiKey - Your FreeCryptoAPI API key.
   * @throws {FreeCryptoAPIError} If apiKey is missing or not a string.
   */
  constructor(apiKey: string);

  // ---------------------------------------------------------------------------
  // Market Data
  // ---------------------------------------------------------------------------

  /**
   * Get a list of all available cryptocurrencies.
   * GET /getCryptoList
   */
  getCryptoList(): Promise<any>;

  /**
   * Get current price data for one or more symbols.
   * Separate multiple symbols with "+". Append "@exchange" for a specific exchange.
   * GET /getData?symbol={symbol}
   * @param symbol - Symbol(s) to query, e.g. "BTC", "BTC+ETH", or "BTC@binance".
   */
  getData(symbol: string): Promise<any>;

  /**
   * Get the top cryptocurrencies by market cap.
   * GET /getTop?top={top}
   * @param top - Number of top coins to return.
   */
  getTop(top?: number): Promise<any>;

  /**
   * Get price data converted to a specific local/fiat currency.
   * GET /getDataCurrency?symbol={symbol}&local={local}
   * @param symbol - Crypto symbol, e.g. "BTC".
   * @param local - Local currency code, e.g. "EUR".
   */
  getDataCurrency(symbol: string, local: string): Promise<any>;

  /**
   * Get performance metrics for a cryptocurrency.
   * GET /getPerformance?symbol={symbol}
   * @param symbol - Crypto symbol, e.g. "BTC".
   */
  getPerformance(symbol: string): Promise<any>;

  /**
   * Get volatility data for a specific symbol or top coins.
   * GET /getVolatility
   * @param options - Optional filters: symbol or top.
   */
  getVolatility(options?: VolatilityOptions): Promise<any>;

  /**
   * Get all-time high and all-time low data.
   * GET /getATHATL
   * @param options - Optional filters: symbol or months.
   */
  getATHATL(options?: ATHATLOptions): Promise<any>;

  /**
   * Get the current Crypto Fear & Greed Index.
   * GET /getFearGreed
   */
  getFearGreed(): Promise<any>;

  // ---------------------------------------------------------------------------
  // Technical Analysis
  // ---------------------------------------------------------------------------

  /**
   * Get technical analysis indicators for a symbol.
   * GET /getTechnicalAnalysis?symbol={symbol}
   * @param symbol - Crypto symbol, e.g. "BTC".
   */
  getTechnicalAnalysis(symbol: string): Promise<any>;

  /**
   * Get breakout signals, optionally filtered by symbol.
   * GET /getBreakouts
   * @param symbol - Optional crypto symbol to filter by.
   */
  getBreakouts(symbol?: string): Promise<any>;

  /**
   * Get correlation data between multiple symbols.
   * GET /getCorrelation?symbols={symbols}&days={days}
   * @param symbols - Symbols separated by "+", e.g. "BTC+ETH+SOL".
   * @param days - Number of days to compute correlation over.
   */
  getCorrelation(symbols: string, days?: number): Promise<any>;

  /**
   * Get support and resistance levels for a symbol.
   * GET /getSupportResistance
   * @param symbol - Crypto symbol, e.g. "BTC".
   * @param period - Optional time period for calculation.
   */
  getSupportResistance(symbol: string, period?: string): Promise<any>;

  /**
   * Get Moving Average Ribbon data for a symbol.
   * GET /getMARibbon
   * @param symbol - Crypto symbol, e.g. "BTC".
   * @param days - Optional number of days.
   */
  getMARibbon(symbol: string, days?: number): Promise<any>;

  /**
   * Get Bollinger Bands data for a symbol.
   * GET /getBollinger
   * @param symbol - Crypto symbol, e.g. "BTC".
   * @param options - Optional parameters: days, period, std_dev.
   */
  getBollinger(symbol: string, options?: BollingerOptions): Promise<any>;

  // ---------------------------------------------------------------------------
  // Exchange Data
  // ---------------------------------------------------------------------------

  /**
   * Get data for a specific exchange.
   * GET /getExchange?exchange={exchange}
   * @param exchange - Exchange name, e.g. "binance".
   */
  getExchange(exchange: string): Promise<any>;

  // ---------------------------------------------------------------------------
  // Conversion
  // ---------------------------------------------------------------------------

  /**
   * Convert an amount from one currency to another.
   * GET /getConversion?from={from}&to={to}&amount={amount}
   * @param from - Source currency symbol, e.g. "BTC".
   * @param to - Target currency symbol, e.g. "USD".
   * @param amount - Amount to convert.
   */
  getConversion(from: string, to: string, amount: number): Promise<any>;

  // ---------------------------------------------------------------------------
  // Historical Data
  // ---------------------------------------------------------------------------

  /**
   * Get historical price data for a symbol over a number of days.
   * GET /getHistory?symbol={symbol}&days={days}
   * @param symbol - Crypto symbol, e.g. "BTC".
   * @param days - Number of past days.
   */
  getHistory(symbol: string, days: number): Promise<any>;

  /**
   * Get price data for a symbol within a specific date range.
   * GET /getTimeframe?symbol={symbol}&start={start}&end={end}
   * @param symbol - Crypto symbol, e.g. "BTC".
   * @param start - Start date (YYYY-MM-DD).
   * @param end - End date (YYYY-MM-DD).
   */
  getTimeframe(symbol: string, start: string, end: string): Promise<any>;

  /**
   * Get OHLC (Open-High-Low-Close) candlestick data.
   * GET /getOHLC
   * @param symbol - Crypto symbol, e.g. "BTC".
   * @param options - Optional parameters: days, start_date, end_date.
   */
  getOHLC(symbol: string, options?: OHLCOptions): Promise<any>;
}

export default FreeCryptoAPI;

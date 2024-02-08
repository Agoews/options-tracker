import { Trade } from "./fetcher";

interface AggregatedTrades {
  [key: number]: {
    openTrades: Array<
      Pick<
        Trade,
        | "tradeid"
        | "ticker"
        | "actions"
        | "strategy"
        | "strike"
        | "openquantity"
        | "isclosed"
        | "optionprice"
        | "expirationdate"
      >
    >;
    closedTrades: Array<
      Pick<
        Trade,
        | "tradeid"
        | "closedtradeid"
        | "closingprice"
        | "completiondate"
        | "closedquantity"
      >
    >;
    averageClosingPrice: number;
    totalClosingQuantity: number;
  };
}

export const tradeTableFormatter = (trades: Trade[]): AggregatedTrades => {
  const aggregated: AggregatedTrades = {};
  trades.forEach((trade) => {
    if (!aggregated[trade.tradeid]) {
      aggregated[trade.tradeid] = {
        openTrades: [],
        closedTrades: [],
        averageClosingPrice: 0,
        totalClosingQuantity: 0,
      };
    }

    if (trade.openquantity !== null) {
      aggregated[trade.tradeid].openTrades.push({
        tradeid: trade.tradeid,
        ticker: trade.ticker,
        actions: trade.actions,
        strategy: trade.strategy,
        strike: trade.strike,
        openquantity: trade.openquantity,
        isclosed: trade.isclosed,
        optionprice: trade.optionprice,
        expirationdate: trade.expirationdate,
      });
    }

    if (trade.closedquantity > 0) {
      aggregated[trade.tradeid].closedTrades.push({
        tradeid: trade.tradeid,
        closedtradeid: trade.closedtradeid,
        closingprice: trade.closingprice,
        completiondate: trade.completiondate,
        closedquantity: trade.closedquantity,
      });
      aggregated[trade.tradeid].totalClosingQuantity += trade.closedquantity;
    }
  });

  Object.keys(aggregated).forEach((key) => {
    const tradeId = Number(key); // Convert key to number for TS
    const tradeGroup = aggregated[tradeId];
    if (tradeGroup.closedTrades.length > 0) {
      const totalClosingPrice = tradeGroup.closedTrades.reduce(
        (sum, trade) => sum + Number(trade.closingprice) * trade.closedquantity,
        0
      );
      tradeGroup.averageClosingPrice =
        totalClosingPrice / (tradeGroup.totalClosingQuantity ?? 1);
    }
  });

  return aggregated;
};

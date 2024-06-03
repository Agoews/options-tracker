import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const {
    userEmail,
    ticker,
    coveredCallStockPrice,
    coveredCallStrike,
    coveredCallPremium,
    coveredCallQuantity,
    coveredCallExpiration,
  } = await request.json();

  const stockPriceNum = Number(coveredCallStockPrice);
  const strikeNum = Number(coveredCallStrike);
  const premiumNum = Number(coveredCallPremium);
  const quantityNum = Number(coveredCallQuantity);

  const currentHoldingsData = await sql`
  SELECT * FROM CurrentStockHoldings WHERE Email = ${userEmail} AND Ticker = ${ticker}
  `;

  const currentOptionsProfitNum = Number(
    currentHoldingsData.rows[0].optionsprofit
  );
  const currentCostBasisNum = Number(currentHoldingsData.rows[0].costbasis);
  const currentOpenOptions = Number(currentHoldingsData.rows[0].openoptions);
  const currentMaxOptions = Number(currentHoldingsData.rows[0].maxoptions);

  console.log(
    "server data: ",
    userEmail,
    ticker,
    "stockPriceNum",
    stockPriceNum,
    "strikeNum",
    strikeNum,
    "premiumNum",
    premiumNum,
    "quantityNum",
    quantityNum,
    "currentOptionsProfitNum",
    currentOptionsProfitNum,
    "currentCostBasisNum",
    currentCostBasisNum,
    "currentOpenOptions",
    currentOpenOptions,
    "currentMaxOptions",
    currentMaxOptions
  );
  try {
    // Get CurrentStockHoldings data

    const optionsProfit = currentOptionsProfitNum + premiumNum * quantityNum;
    const costBasis = currentCostBasisNum - premiumNum * quantityNum;
    const openOptions = currentOpenOptions + quantityNum;
    const maxOptions = currentMaxOptions - quantityNum;

    // Update CurrentStockHoldings table
    await sql`
      UPDATE CurrentStockHoldings
      SET
        OptionsProfit = ${optionsProfit},
        CostBasis = ${costBasis},
        OpenOptions = ${openOptions},
        MaxOptions = ${maxOptions}
      WHERE
        Email = ${userEmail} AND Ticker = ${ticker}
    `;

    // Update OpenTrades table
    await sql`
      INSERT INTO OpenTrades (
        email, ticker, actions, strike, currentprice, openquantity, optionprice, expirationdate, strategy, isClosed
      )
      VALUES (
        ${userEmail}, ${ticker}, 'COVERED CALL', ${strikeNum}, ${stockPriceNum}, ${quantityNum}, ${premiumNum}, ${coveredCallExpiration}, 'WHEEL', 'FALSE'
      );
    `;

    return NextResponse.json(
      { message: "Stock holding and trade updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

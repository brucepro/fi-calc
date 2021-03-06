import _ from 'lodash';
import withdrawal from './withdrawal';
import adjustPortfolioInvestment from './adjust-portfolio-investment';
import inflationFromCpi from '../market-data/inflation-from-cpi';
import {
  YearResult,
  MarketData,
  WithdrawalStrategies,
  Portfolio,
  DipObject,
  AdditionalWithdrawals,
  ComputedData,
  ResultsByYear,
} from './run-simulations-interfaces';

interface SimulateOneYearOptions {
  startYear: number;
  yearsRemaining: number;
  rebalancePortfolioAnnually: boolean;
  isFirstYear: boolean;
  year: number;
  previousResults: YearResult;
  initialComputedData: ComputedData;
  resultsByYear: ResultsByYear;
  marketData: MarketData;
  dipThreshold: number;
  firstYearCpi: number;
  didDip: boolean;
  lowestValue: number;
  withdrawalConfiguration: any;
  initialPortfolio: Portfolio;
  portfolio: Portfolio;
  withdrawalMethod: WithdrawalStrategies;
  lowestSuccessfulDip: DipObject;
  additionalWithdrawalsForYear: AdditionalWithdrawals;
  additionalIncomeForYear: AdditionalWithdrawals;
  n: number;
}

export default function simulateOneYear({
  n,
  yearsRemaining,
  startYear,
  rebalancePortfolioAnnually,
  isFirstYear,
  year,
  previousResults,
  initialComputedData,
  resultsByYear,
  marketData,
  firstYearCpi,
  withdrawalMethod,
  withdrawalConfiguration,
  didDip,
  lowestValue,
  dipThreshold,
  initialPortfolio,
  portfolio,
  lowestSuccessfulDip,
  additionalWithdrawalsForYear,
  additionalIncomeForYear,
}: SimulateOneYearOptions): YearResult | null {
  // If we had no results for last year, then we can't compute anything
  // for this year either.
  if (!isFirstYear && !previousResults) {
    return null;
  }

  const previousComputedData = isFirstYear
    ? initialComputedData
    : resultsByYear[n - 1].computedData;

  const yearStartValue = previousComputedData.portfolio.totalValue;

  const yearMarketData = marketData[year];
  const currentCpi = Number(yearMarketData.cpi);

  const cumulativeInflation = inflationFromCpi({
    startCpi: Number(firstYearCpi),
    endCpi: currentCpi,
  });

  const withdrawalAmount = withdrawal[withdrawalMethod]({
    ...withdrawalConfiguration,
    previousResults,
    initialPortfolio,
    isFirstYear,
    yearMarketData,
    yearsRemaining,
    firstYearCpi: Number(firstYearCpi),
    cpi: currentCpi,
    portfolioTotalValue: yearStartValue,
    inflation: cumulativeInflation,
  });

  const additionalIncomeAmount = additionalIncomeForYear.reduce(
    (result, withdrawal) => {
      if (!withdrawal.inflationAdjusted) {
        return result + withdrawal.value;
      } else {
        return result + withdrawal.value * cumulativeInflation;
      }
    },
    0
  );

  const additionalWithdrawalAmount = additionalWithdrawalsForYear.reduce(
    (result, withdrawal) => {
      if (!withdrawal.inflationAdjusted) {
        return result + withdrawal.value;
      } else {
        return result + withdrawal.value * cumulativeInflation;
      }
    },
    0
  );

  const availableFundsToWithdraw = yearStartValue + additionalIncomeAmount;
  const totalWithdrawalAmount = Math.min(
    withdrawalAmount + additionalWithdrawalAmount,
    availableFundsToWithdraw
  );

  const baseWithdrawalAmount = Math.min(
    withdrawalAmount,
    availableFundsToWithdraw
  );

  const actualAdditionalWithdrawalAmount =
    totalWithdrawalAmount - baseWithdrawalAmount;

  const portfolioValueBeforeMarketChanges =
    yearStartValue + additionalIncomeAmount - totalWithdrawalAmount;
  const isOutOfMoney = portfolioValueBeforeMarketChanges === 0;

  let adjustedInvestmentValues = _.map(
    portfolio.investments,
    (investment, index) =>
      adjustPortfolioInvestment({
        portfolioValueBeforeMarketChanges,
        investment,
        index,
        isOutOfMoney,
        previousComputedData,
        rebalancePortfolioAnnually,
        initialPortfolio,
        yearMarketData,
      })
  );

  const endValue = _.reduce(
    adjustedInvestmentValues,
    (result, investment) => result + investment.value,
    0
  );

  const endValueInFirstYearDollars = Number(
    (endValue / cumulativeInflation).toFixed(2)
  );

  if (!didDip) {
    didDip = endValue <= dipThreshold;
  }

  if (endValue < lowestValue) {
    lowestValue = endValue;
  }

  if (didDip) {
    if (lowestValue < lowestSuccessfulDip.value) {
      lowestSuccessfulDip = {
        value: lowestValue,
        startYear,
        year,
      };
    }
  }

  const totalWithdrawalAmountInFirstYearDollars = Number(
    (totalWithdrawalAmount / cumulativeInflation).toFixed(2)
  );

  return {
    year,
    isOutOfMoney,
    marketData: yearMarketData,
    cpi: currentCpi,
    computedData: {
      cumulativeInflation,
      totalWithdrawalAmount,
      baseWithdrawalAmount,
      additionalWithdrawalAmount: actualAdditionalWithdrawalAmount,
      totalWithdrawalAmountInFirstYearDollars,
      portfolio: {
        totalValueInFirstYearDollars: endValueInFirstYearDollars,
        totalValue: endValue,
        investments: adjustedInvestmentValues,
      },
    },
  };
}

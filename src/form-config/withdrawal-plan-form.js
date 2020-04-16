import {
  isRequired,
  numberRequired,
  tooLarge,
  tooSmall,
} from '../utils/forms/validators';
import maxDollarInput from '../utils/forms/max-dollar-input';

export default {
  values: {
    withdrawalStrategy: {
      type: 'enumeration',
      keyType: 'string',
      values: [
        {
          key: 'constantWithdrawal',
          display: 'Constant Withdrawal',
        },
        {
          key: 'portfolioPercent',
          display: 'Percent of Portfolio',
        },
        {
          key: 'gk',
          display: 'Guyton-Klinger',
        },
        {
          key: '95percent',
          display: '95% Rule',
        },

        // {
        //   key: 'hebeler',
        //   display: 'Hebeler autopilot',
        // },
      ],
    },

    /* Constant withdrawal */
    annualWithdrawal: {
      type: 'number',
      default: 40000,
      validators: [
        isRequired,
        numberRequired,
        tooSmall(0),
        tooLarge(maxDollarInput),
      ],
    },

    /* Percent of portfolio */
    percentageOfPortfolio: {
      type: 'number',
      default: 4,
      validators: [isRequired, numberRequired, tooSmall(0), tooLarge(100)],
    },

    minWithdrawalLimitEnabled: {
      type: 'boolean',
      default: true,
    },

    maxWithdrawalLimitEnabled: {
      type: 'boolean',
      default: true,
    },

    minWithdrawalLimit: {
      type: 'number',
      default: 35000,
      validators: [
        isRequired,
        numberRequired,
        tooSmall(0),
        tooLarge(maxDollarInput),
      ],
    },

    maxWithdrawalLimit: {
      type: 'number',
      default: 60000,
      validators: [
        isRequired,
        numberRequired,
        tooSmall(0),
        tooLarge(maxDollarInput),
      ],
    },

    inflationAdjustedFirstYearWithdrawal: {
      type: 'boolean',
      default: true,
    },

    /* Guyton-Klinger */
    gkInitialSpending: {
      type: 'number',
      default: 40000,
      validators: [
        isRequired,
        numberRequired,
        tooSmall(0),
        tooLarge(maxDollarInput),
      ],
    },

    gkWithdrawalUpperLimit: {
      type: 'number',
      default: 20,
      validators: [isRequired, numberRequired, tooSmall(0), tooLarge(100)],
    },

    gkWithdrawalLowerLimit: {
      type: 'number',
      default: 20,
      validators: [isRequired, numberRequired, tooSmall(0), tooLarge(100)],
    },

    gkUpperLimitAdjustment: {
      type: 'number',
      default: 10,
      validators: [isRequired, numberRequired, tooSmall(0), tooLarge(100)],
    },

    gkLowerLimitAdjustment: {
      type: 'number',
      default: 10,
      validators: [isRequired, numberRequired, tooSmall(0), tooLarge(100)],
    },

    gkModifiedWithdrawalRule: {
      type: 'boolean',
      default: true,
    },

    gkIgnoreLastFifteenYears: {
      type: 'boolean',
      default: false,
    },

    /* 95% Rule */
    ninetyFiveInitialRate: {
      type: 'number',
      default: 4,
      validators: [isRequired, numberRequired, tooSmall(0), tooLarge(100)],
    },

    ninetyFivePercentage: {
      type: 'number',
      default: 95,
      validators: [isRequired, numberRequired, tooSmall(0), tooLarge(100)],
    },
  },
};
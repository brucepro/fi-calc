import {
  isRequired,
  numberRequired,
  tooLarge,
  tooSmall,
} from '../utils/forms/validators';
import maxDollarInput from '../utils/forms/max-dollar-input';

export default {
  values: {
    stockInvestmentValue: {
      type: 'number',
      default: 1000000,
      validators: [
        isRequired,
        numberRequired,
        tooSmall(0),
        tooLarge(maxDollarInput),
      ],
    },

    stockInvestmentFees: {
      type: 'number',
      default: 0.04,
      validators: [isRequired, numberRequired, tooSmall(0), tooLarge(100)],
    },

    bondsValue: {
      type: 'number',
      default: 0,
      validators: [
        isRequired,
        numberRequired,
        tooSmall(0),
        tooLarge(maxDollarInput),
      ],
    },
  },
};

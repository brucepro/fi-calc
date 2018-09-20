import React, { Component, createRef } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import validators from './validators';
import Dialog from '../dialog';
import { morph } from '../../utils/animations';
import { getUpdatedInputFormState } from '../../utils/forms/form-utils';

export default class PortfolioDialogForm extends Component {
  render() {
    const { onClose } = this.props;
    const { inputs } = this.state;

    const isFormValid = this.isFormValid();

    const { stockInvestmentValue } = inputs;

    return (
      <Dialog
        nodeRef={this.dialogRef}
        open={true}
        onEscPressed={e => {
          e.preventDefault();
          e.stopPropagation();

          onClose();
        }}>
        <h1 className="dialog_header">Spending Plan</h1>
        <div className="dialog_contents">
          <div className="labelContainer">
            <label
              htmlFor="spendingPlan_stockInvestmentValue"
              className="label">
              Equities
            </label>
          </div>
          <div className="input_group">
            <div className="input_extra">$</div>
            <input
              ref={this.stockInvestmentValueRef}
              value={stockInvestmentValue.value}
              className={classnames('input', {
                input_error: stockInvestmentValue.error,
              })}
              autoComplete="off"
              type="number"
              pattern="\d*"
              inputMode="numeric"
              id={`spendingPlan_stockInvestmentValue`}
              onKeyDown={this.onKeyDownInput}
              onChange={event =>
                this.updateValue('stockInvestmentValue', event.target.value)
              }
            />
          </div>
          {stockInvestmentValue.errorMsg && (
            <div className="calculator-errorMsg">
              {stockInvestmentValue.errorMsg}
            </div>
          )}
          {!stockInvestmentValue.errorMsg && (
            <div className="dialog_explanation">
              Historical stock market data will be used to calculate the changes
              in your equities over time.
            </div>
          )}
        </div>
        <div className="dialog_footer">
          <button className="button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            ref={this.saveBtnRef}
            disabled={!isFormValid}
            className="button button-primary"
            type="button"
            onClick={this.onConfirmChanges}>
            Save
          </button>
        </div>
      </Dialog>
    );
  }

  dialogRef = createRef();
  stockInvestmentValueRef = createRef();
  saveBtnRef = createRef();

  state = {
    inputs: {
      stockInvestmentValue: {
        value: this.props.stockInvestmentValue,
        error: null,
      },
      inflationAdjustedstockInvestmentValue: {
        value: this.props.inflationAdjustedstockInvestmentValue,
        error: null,
      },
    },
    isFormValid: true,
  };

  componentDidMount() {
    if (this.stockInvestmentValueRef.current) {
      this.stockInvestmentValueRef.current.focus();
      this.stockInvestmentValueRef.current.select();
    }
  }

  componentWillEnter = cb => {
    const animation = morph(200);
    animation.componentWillEnter(
      cb,
      this.dialogRef.current,
      this.props.triggerRef.current
    );
  };

  componentWillLeave = cb => {
    const animation = morph(200);

    animation.componentWillLeave(
      cb,
      this.dialogRef.current,
      this.props.triggerRef.current
    );
  };

  updateValue = (valueName, newValue, cb) => {
    const { inputs } = this.state;

    const newInputs = _.merge({}, inputs, {
      [valueName]: {
        value: newValue,
      },
    });

    const newFormState = getUpdatedInputFormState({
      inputs: newInputs,
      validators,
    });

    this.setState(
      {
        ...newFormState,
      },
      cb
    );
  };

  onConfirmChanges = () => {
    const { onConfirm } = this.props;
    const {
      stockInvestmentValue,
      inflationAdjustedstockInvestmentValue,
    } = this.state.inputs;

    const numericStockValue = Number(stockInvestmentValue.value);

    let newStockValue;
    if (Number.isInteger(numericStockValue)) {
      newStockValue = String(numericStockValue);
    } else {
      newStockValue = numericStockValue.toFixed(2);
    }

    const updates = {
      stockInvestmentValue: newStockValue,
      inflationAdjustedstockInvestmentValue:
        inflationAdjustedstockInvestmentValue.value,
    };

    onConfirm(updates);
  };

  isFormValid = () => {
    return this.state.isFormValid;
  };

  onKeyDownInput = e => {
    if (e.key === 'Enter' && this.isFormValid()) {
      e.preventDefault();
      e.stopPropagation();

      if (!e.metaKey) {
        _.invoke(this.saveBtnRef.current, 'focus');
      } else {
        this.onConfirmChanges();
      }
    }
  };
}

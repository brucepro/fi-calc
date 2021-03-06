import { useCallback, useMemo } from 'react';
import _ from 'lodash';
import { useCurrentRef } from 'core-hooks';
import { useForm as useVendorForm } from '../vendor/forms';
import useUndo from '../state/undo-history';
import reactOnInputBlur from '../utils/forms/react-on-input-blur';

function isObject(val) {
  if (val === null) {
    return false;
  }
  return typeof val === 'function' || typeof val === 'object';
}

// This manages the interplay between form state (which can be invalid...it is whatever the user has
// typed in), and the "source of truth" state that's in context, which is what the results are always
// based off of.

export default function useForm({ formConfig, useSourceOfTruth }) {
  // This is the state that's stored in context.
  const { state, setState } = useSourceOfTruth();

  const useVendorFormOptions = useMemo(() => {
    return _.mapValues(formConfig.values, (val, key) => {
      const possibleInitialValue = state[key];
      let initialValue;
      if (isObject(possibleInitialValue)) {
        initialValue = possibleInitialValue.key;
      } else {
        initialValue = possibleInitialValue;
      }

      return {
        validators: formConfig.values[key].validators,
        initialValue,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { addReverseAction } = useUndo();
  const { inputs, updateFormValue } = useVendorForm(useVendorFormOptions);

  const inputsRef = useCurrentRef(inputs);
  const stateRef = useCurrentRef(state);

  // Should there be an onChange for each kind of select? Probably, why not?
  const changeSelect = useCallback((id, e) => {
    const prevValidValue = stateRef.current[id];
    const { value } = e.target;
    const valueObject = _.find(formConfig.values[id].values, { key: value });

    if (prevValidValue === valueObject) {
      return;
    }

    addReverseAction(() => {
      updateFormValue(id, prevValidValue.key);
      setState({ [id]: prevValidValue });
    });

    // This is a select, so the value is also valid. We set the form AND update the "source of truth" state used in
    // the calculation.
    updateFormValue(id, value);
    setState({ [id]: valueObject });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeCheckbox = useCallback((id, e) => {
    const prevValidValue = stateRef.current[id];
    const { checked } = e.target;

    if (prevValidValue === checked) {
      return;
    }

    addReverseAction(() => {
      updateFormValue(id, prevValidValue);
      setState({ [id]: prevValidValue });
    });

    // This is a select, so the value is also valid. We set the form AND update the "source of truth" state used in
    // the calculation.
    updateFormValue(id, checked);
    setState({ [id]: checked });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitInput = useCallback((id, newValue) => {
    const prevValidValue = stateRef.current[id];

    const isNumber = formConfig.values[id]?.type === 'number';
    const parsedNewValue = isNumber ? Number(newValue) : newValue;

    // If the value has not changed, then we do not need to take any action
    if (parsedNewValue === prevValidValue) {
      return;
    }

    reactOnInputBlur({
      id,
      prevValidValue,
      inputs: inputsRef.current,
      updateFormValue,
      onPersist() {
        addReverseAction(() => {
          updateFormValue(id, prevValidValue);

          setState({
            [id]: prevValidValue,
          });
        });

        setState({
          [id]: parsedNewValue,
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    setState,
    addReverseAction,
    inputs,
    updateFormValue,
    inputsRef,
    stateRef,
    changeSelect,
    changeCheckbox,
    commitInput,
  };
}

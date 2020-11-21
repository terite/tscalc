import * as React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

interface State {
  txtValue: string;
  errMsg: string | undefined;
}

export class IntegerInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      txtValue: props.value.toString(),
      errMsg: undefined,
    };
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // props.onChange is not used in rendering
    return (
      this.props.value !== nextProps.value ||
      this.props.min !== nextProps.min ||
      this.state.txtValue !== nextState.txtValue ||
      this.state.errMsg !== nextState.errMsg
    );
  }

  componentDidUpdate(oldProps: Props): void {
    if (oldProps.value !== this.props.value) {
      this.setState((state) => ({
        txtValue:
          Number(state.txtValue) === this.props.value
            ? state.txtValue
            : this.props.value.toString(),
      }));
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const txtValue = event.target.value;
    let errMsg: string | undefined;

    const value = txtValue.trim() ? Number(txtValue) : NaN;
    if (Number.isNaN(value)) {
      errMsg = 'Improperly formatted number';
    } else if (!Number.isInteger(value)) {
      errMsg = 'Must be an integer';
    } else if (typeof this.props.min === 'number' && value < this.props.min) {
      errMsg =
        this.props.min === 0
          ? 'Must be positive'
          : `Must be greater than ${this.props.min}`;
    }

    this.setState({ txtValue, errMsg }, () => {
      if (typeof value === 'number' && !errMsg) {
        this.props.onChange(value);
      }
    });
  };

  render(): React.ReactNode {
    let className = 'form-control';
    if (!!this.state.errMsg) {
      className += ' is-invalid';
    }

    return (
      <input
        className={className}
        value={this.state.txtValue}
        onChange={this.handleChange}
        type="number"
        min={this.props.min}
        step="1"
      />
    );
  }
}

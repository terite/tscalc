import * as React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

interface State {
  txtValue: string;
}

export class IntegerInput extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      txtValue: props.value.toString(),
    };
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
    const value = event.target.value;
    this.setState({ txtValue: value }, () => {
      if (!value.trim()) {
        return;
      }
      const num = Number(value);
      if (isNaN(num)) {
        return;
      }
      if (!Number.isInteger(num)) {
        return;
      }

      if (typeof this.props.min === 'number' && num < this.props.min) {
        // TODO: Error
        return;
      }

      this.props.onChange(num);
    });
  };

  render(): React.ReactNode {
    return (
      <input
        className="form-control"
        value={this.state.txtValue}
        onChange={this.handleChange}
        type="number"
        min={this.props.min}
        step="1"
      />
    );
  }
}

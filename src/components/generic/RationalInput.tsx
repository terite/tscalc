import * as React from 'react';
import classNames from 'classnames';

import { Rational } from '../../rational';

interface Props {
    value: Rational;
    onChange: (value: Rational) => void;
    positiveOnly?: boolean;
}

interface State {
    error: string | undefined;
    txtValue: string;
}

export class RationalInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
          error: '',
          txtValue: rationalToString(props.value),
        };
    }

    componentDidUpdate(oldProps: Props) {
      if (!this.props.value.equal(oldProps.value)) {
        let parsed: Rational;
        try {
          parsed = stringToRational(this.state.txtValue)
        } catch (err) {
          return;
        }

        if (!parsed.equal(this.props.value)) {
          this.setState({
            txtValue: rationalToString(this.props.value)
          })
        }
      }
    }

    public handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const str = event.target.value;

        let errmsg: string | undefined;
        let parsed: Rational | undefined;

        try {
          parsed = stringToRational(str);
        } catch (err) {
          errmsg = err.message;
        }

        if (parsed && this.props.positiveOnly && parsed.isNegative()) {
          parsed = undefined;
          errmsg = 'Number must be positive';
        }
        this.setState({ txtValue: str, error: errmsg }, () => {
          if (parsed) {
            this.props.onChange(parsed);
          }
        });
    };

    render() {
        return (
            <input
                className={classNames('form-control', { 'is-invalid': !!this.state.error})}
                value={this.state.txtValue}
                onChange={this.handleChange}
                type="text"
            />
        );
    }
}

function stringToRational(str: string): Rational {
        if (!str.trim()) {
          throw new Error('Empty!');
        }

        const index = str.indexOf('/');
        const lastIndex = str.lastIndexOf('/');
        if (index !== lastIndex) {
          throw new Error('Too many slashes');
        }

        return Rational.fromString(str);
}

function rationalToString(rational: Rational): string {
  const dec = rational.toFloat().toString();
  if (dec.length < 10) {
    return dec;
  }

  return rational.toFraction();
}

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
      if (!oldProps.value.equal(this.props.value)) {
        this.setState({
          error: undefined,
          txtValue: rationalToString(this.props.value),
        });
      }
    }

    public handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const str = event.target.value;
        this.setState({ txtValue: str, error: undefined });

        let rational;
        try {
          rational = stringToRational(str);
        } catch (err) {
          this.setState({error: err.message});
          return
        }

        if (this.props.positiveOnly && rational.isNegative()) {
            this.setState({ error: 'Number must be positive' });
            return;
        }

        this.props.onChange(rational);
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

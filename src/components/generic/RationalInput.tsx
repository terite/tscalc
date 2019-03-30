import * as React from "react";
import { Rational } from "../../rational";

interface Props {
    value: Rational;
    onChange: (value: Rational) => void;
    positiveOnly?: boolean;
}

interface State {
    txtValue: string;
    error?: string;
}

export class RationalInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            txtValue: props.value.toDecimal(),
        };
    }

    public handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        const str = (event.target as HTMLInputElement).value;
        this.setState({ txtValue: str, error: undefined });
        if (!str.trim()) {
            return;
        }

        const index = str.indexOf("/");
        const lastIndex = str.lastIndexOf("/");
        if (index !== lastIndex) {
            this.setState({ error: "Too many slashes" });
            return;
        }

        let rational;
        try {
            rational = Rational.fromString(str);
        } catch (err) {
            this.setState({ error: err.message });
            return;
        }

        if (this.props.positiveOnly && rational.isNegative()) {
            this.setState({ error: "Number must be positive" });
            return;
        }
        this.props.onChange(rational);
    };

    render() {
        let className = 'form-control';
        if (this.state.error) {
            className += ' is-invalid';
        }
        return (
            <input
                className={className}
                value={this.state.txtValue}
                onChange={this.handleChange}
                type="text"
            />
        );
    }
}

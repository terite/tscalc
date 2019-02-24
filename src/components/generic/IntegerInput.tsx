import * as React from "react";

interface Props {
    value: number;
    onChange: (value: number) => void;
    intOnly?: boolean;
    positiveOnly?: boolean;
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

    public handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        const value = (event.target as HTMLInputElement).value;
        this.setState({ txtValue: value });
        if (!value.trim()) {
            return;
        }
        const num = Number(value);
        if (this.props.intOnly && !Number.isInteger(num)) {
            return;
        }
        if (this.props.positiveOnly && num < 0) {
            return;
        }
        this.props.onChange(num);
    };

    render() {
        return (
            <input
                className="form-control"
                value={this.state.txtValue}
                onChange={this.handleChange}
                type="number"
                min="0"
                step="1"
            />
        );
    }
}

import * as React from "react";
import Popper from "popper.js";

interface DropdownHeader {
    header: React.ReactNode;
}

interface DropdownDivider {
    divider: true;
}

interface DropdownEntry<T> {
    key: React.Key;
    disabled?: boolean;
    active?: boolean;
    option: T;
}

type DropdownOption<T> = DropdownHeader | DropdownDivider | DropdownEntry<T>;

interface Props<T> {
    options: DropdownOption<T>[];
    selected: T;
    onSelect(selected: T): void;

    renderOption(option: T): React.ReactNode;
    renderSelected(option: T): React.ReactNode;
}
interface State {
    isOpen: boolean;
}

export class Dropdown<T> extends React.Component<Props<T>, State> {
    buttonRef: React.RefObject<any>;

    constructor(props: Props<T>) {
        super(props);
        this.state = {
            isOpen: false,
        };
        this.buttonRef = React.createRef();
    }

    handleToggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    };

    handleSelect = (selected: T) => {
        this.props.onSelect(selected);
        if (this.state.isOpen) {
            this.setState({
                isOpen: false,
            });
        }
    };

    handleWantClose = () => {
        if (this.state.isOpen) {
            this.setState({
                isOpen: false,
            });
        }
    };

    render() {
        const canToggle = this.props.options.some(option => {
            return ('option' in option) && !option.disabled
        });

        const classes = ["btn", "btn-secondary"];
        if (canToggle) {
            classes.push("dropdown-toggle");
        } else {
            classes.push("disabled");
        }

        let floater: React.ReactNode | null;
        if (this.state.isOpen) {
            floater = (
                <DropdownMenu
                    parentRef={this.buttonRef}
                    options={this.props.options}
                    renderOption={this.props.renderOption}
                    onSelect={this.handleSelect}
                    onWantClose={this.handleWantClose}
                />
            );
        }

        return (<>
            <button
                ref={this.buttonRef}
                className={classes.join(" ")}
                type="button"
                onClick={() => {
                    canToggle && this.handleToggle()
                }}
            >
                {this.props.renderSelected(this.props.selected)}
            </button>
            {floater}
        </>)
    }
}

interface DropdownMenuProps<T> {
    parentRef: React.RefObject<any>;
    options: DropdownOption<T>[];
    renderOption(option: T): React.ReactNode;
    onSelect(selected: T): void;
    onWantClose(): void;
}

interface DropdownMenuState {
    style: React.CSSProperties;
}

class DropdownMenu<T> extends React.Component<DropdownMenuProps<T>, DropdownMenuState> {
    popperInstance: Popper | null = null;
    menuRef: React.RefObject<HTMLDivElement>;

    constructor(props: DropdownMenuProps<T>) {
        super(props);
        this.menuRef = React.createRef();
        this.state = {
            style: {}
        }
    }

    popperUpdate = (data: Popper.Data) => {
        this.setState({
            style: data.styles as React.CSSProperties
        });
        return data;
    }

    handleBodyClick = (event: MouseEvent) => {
        if (!this.menuRef.current) {
            throw new Error('Click event without menu rendered. This should not happen.');
        }
        if (!event.target) {
            throw new Error('Click event without click target. This should not happen.');
        }
        // TODO: why doesnt EventTarget satisfy "Node"
        const target = event.target as any;
        if (!this.menuRef.current.contains(target)) {
            // Click was outside menu
            this.props.onWantClose();
        }
    };

    componentDidMount() {
        if (this.popperInstance) {
            throw new Error('Component mounted twice?');
        }

        const referenceEl = this.props.parentRef.current;
        if (!referenceEl) {
            throw new Error('Cannot mount DropdownMenu without parentRef');
        }

        const menuEl = this.menuRef.current;
        if (!menuEl) {
            throw new Error('Cannot mount DropdownMenu without menuRef');
        }

        this.popperInstance = new Popper(referenceEl, menuEl, {
            modifiers: {
                applyStyle: { enabled: false },
                updateStateWithStyle: {
                    enabled: true,
                    fn: this.popperUpdate,
                },
            },
        });

        document.body.addEventListener('click', this.handleBodyClick);
    }

    componentWillUnmount() {
        if (!this.popperInstance) {
            return;
        }
        this.popperInstance.disableEventListeners();
        this.popperInstance = null;
        document.body.removeEventListener('click', this.handleBodyClick);
    }

    renderOptions = () => {
        return this.props.options.map((option, i) => {
            if ("header" in option) {
                return (
                    <h6 className="dropdown-header" key={"ddkey" + i}>
                        {option.header}
                    </h6>
                );
            }
            if ("divider" in option) {
                return <div className="dropdown-divider" key={"ddkey" + i} />;
            }

            const classes = ["dropdown-item"];
            option.active && classes.push("active");
            option.disabled && classes.push("disabled");

            return (
                <button
                    key={option.key}
                    className={classes.join(" ")}
                    onClick={() => this.props.onSelect(option.option)}
                    type="button"
                >
                    {this.props.renderOption(option.option)}
                </button>
            );
        });
    };

    render() {
        return (
            <div className="dropdown-menu show" style={this.state.style} ref={this.menuRef}>
                {this.renderOptions()}
            </div>
        );
    }
}

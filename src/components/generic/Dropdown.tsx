import * as React from 'react';
import Popper from 'popper.js';

import { assert } from '../../util';

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

const ESC_KEYCODE = 27;

export class Dropdown<T> extends React.PureComponent<Props<T>, State> {
  buttonRef: React.RefObject<HTMLButtonElement> = React.createRef();

  state: State = {
    isOpen: false,
  };

  handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    if (!this.getCanToggle()) {
      return;
    }

    // Prevent the "opening" click from immediately closing the dropdown
    e.stopPropagation();

    this.setState((state) => ({
      ...state,
      isOpen: !state.isOpen,
    }));
  };

  handleSelect = (selected: T): void => {
    this.props.onSelect(selected);
    this.setState({
      isOpen: false,
    });
  };

  handleWantClose = (): void => {
    this.setState({
      isOpen: false,
    });
  };

  getCanToggle(): boolean {
    for (const option of this.props.options) {
      if ('option' in option && !option.disabled) {
        return true;
      }
    }
    return false;
  }

  render(): React.ReactNode {
    const classes = ['btn', 'btn-secondary'];
    if (this.getCanToggle()) {
      classes.push('dropdown-toggle');
    } else {
      classes.push('disabled');
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

    return (
      <>
        <button
          ref={this.buttonRef}
          className={classes.join(' ')}
          type="button"
          onClick={this.handleClick}
        >
          {this.props.renderSelected(this.props.selected)}
        </button>
        {floater}
      </>
    );
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
  style: object;
}

class DropdownMenu<T> extends React.PureComponent<
  DropdownMenuProps<T>,
  DropdownMenuState
> {
  popperInstance: Popper | null = null;
  menuRef: React.RefObject<HTMLDivElement> = React.createRef();

  state: DropdownMenuState = {
    style: {},
  };

  popperUpdate = (data: Popper.Data): Popper.Data => {
    this.setState({
      style: data.styles,
    });
    return data;
  };

  handleBodyClick = (event: MouseEvent): void => {
    if (!(event.target instanceof Node)) {
      console.warn('handleBodyClick called for non-node', event.target);
      return;
    }
    assert(this.menuRef.current);

    if (!this.menuRef.current.contains(event.target)) {
      // Click was outside menu
      this.props.onWantClose();
    }
  };

  handleKeyEvent = (event: KeyboardEvent): void => {
    if (event.keyCode === ESC_KEYCODE) {
      this.props.onWantClose();
    }
  };

  componentDidMount(): void {
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
    document.body.addEventListener('keyup', this.handleKeyEvent);
  }

  componentWillUnmount(): void {
    if (this.popperInstance) {
      this.popperInstance.disableEventListeners();
      this.popperInstance = null;
    }
    document.body.removeEventListener('click', this.handleBodyClick);
    document.body.removeEventListener('keyup', this.handleKeyEvent);
  }

  renderOptions = (): React.ReactNode => {
    return this.props.options.map((option, i) => {
      if ('header' in option) {
        return (
          <h6 className="dropdown-header" key={'ddkey' + i}>
            {option.header}
          </h6>
        );
      }
      if ('divider' in option) {
        return <div className="dropdown-divider" key={'ddkey' + i} />;
      }

      const classes = ['dropdown-item'];
      option.active && classes.push('active');
      option.disabled && classes.push('disabled');

      return (
        <button
          key={option.key}
          className={classes.join(' ')}
          onClick={() => this.props.onSelect(option.option)}
          type="button"
        >
          {this.props.renderOption(option.option)}
        </button>
      );
    });
  };

  render(): React.ReactNode {
    return (
      <div
        className="dropdown-menu show"
        style={this.state.style}
        ref={this.menuRef}
      >
        {this.renderOptions()}
      </div>
    );
  }
}

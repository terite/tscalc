import React from 'react';
import classNames from 'classnames';

import { Tooltip } from './generic';

import styles from './Icon.module.css';

interface Props {
  obj: { icon_row: number; icon_col: number };

  title?: string;
  onClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  style?: React.CSSProperties;
  tooltip?: React.ReactNode;
  text?: string;
}

interface State {}

export class Icon extends React.PureComponent<Props, State> {
  iconRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.iconRef = React.createRef();
  }

  render() {
    const x = -this.props.obj.icon_col * 32;
    const y = -this.props.obj.icon_row * 32;

    const divStyle = {
      display: 'inline-block',
      backgroundPosition: `${x}px ${y}px`,
      width: '32px',
      height: '32px',
      ...this.props.style,
    };

    let icon = (
      <div
        ref={this.iconRef}
        onClick={this.props.onClick}
        title={this.props.title}
        className={classNames(styles.Icon, 'game-icon')}
        style={divStyle}
      >
        &nbsp;
      </div>
    );

    if (this.props.tooltip) {
      icon = (
        <>
          {icon}
          <Tooltip children={this.props.tooltip} relativeTo={this.iconRef} />
        </>
      );
    }

    if (this.props.text) {
      icon = (
        <div style={{ lineHeight: '32px' }}>
          {icon}
          <span style={{ marginLeft: '9px' }}>{this.props.text}</span>
        </div>
      );
    }

    return icon;
  }
}

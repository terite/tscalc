import React from 'react';
import classNames from 'classnames';

import { BaseDisplayable } from '../game';
import { Tooltip } from './generic';

import styles from './Icon.module.css';

interface Props {
  obj: BaseDisplayable;

  className?: string;
  title?: string;
  onClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  tooltip?: React.ReactNode;
  text?: React.ReactNode;
}

interface State {}

export class Icon extends React.PureComponent<Props, State> {
  iconRef = React.createRef<HTMLDivElement>();

  render(): React.ReactNode {
    const x = -this.props.obj.iconCol * 32;
    const y = -this.props.obj.iconRow * 32;

    const divStyle: React.CSSProperties = {
      backgroundPosition: `${x}px ${y}px`,
    };

    let icon = (
      <div
        ref={this.iconRef}
        onClick={this.props.onClick}
        title={this.props.title}
        className={classNames(styles.Icon, 'game-icon', this.props.className)}
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
        <div className={styles.IconTextWrapper}>
          {icon}
          <span className={styles.IconText}>{this.props.text}</span>
        </div>
      );
    }

    return icon;
  }
}

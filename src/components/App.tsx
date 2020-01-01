import React from 'react';
import classNames from 'classnames';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';

import { RecipeGroup } from './RecipeGroup';
import { Settings } from './Settings';

import { AppActions, AppState, withBoth } from '../state';
import { assertNever } from '../util';

import styles from './App.module.css';

interface Props {
  state: AppState;
  actions: AppActions;
}

interface State {
  activePage: ActivePage;
}

enum ActivePage {
  Factory = 'FACTORY',
  Settings = 'SETTINGS',
}

class RawApp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activePage: ActivePage.Factory,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      document.body.classList.add('shift-down');
    }
  };
  handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      document.body.classList.remove('shift-down');
    }
  };

  handleClickGroup = (i: number) => {
    this.setState({
      activePage: ActivePage.Factory,
    });
    this.props.actions.setActiveGroup(i);
  };

  handleClickAddGroup: React.MouseEventHandler<any> = (event) => {
    event.preventDefault();
    const defaultName = `Factory ${this.props.state.groups.length + 1}`;
    const name = prompt('What do you want to name this group?', defaultName);
    if (!name || !name.trim()) {
      return;
    }
    this.props.actions.addGroup(name);
  };

  handleClickSettings = () => {
    this.setState({
      activePage: ActivePage.Settings,
    });
  };

  renderNavbar() {
    const settingsActive = this.state.activePage === ActivePage.Settings;

    const activeKey = settingsActive
      ? 'settings'
      : this.props.state.activeGroupIdx;

    const factoryPills = this.props.state.groups.map((group, i) => {
      const active = activeKey === i;
      return (
        <Nav.Item onClick={() => this.handleClickGroup(i)} key={i}>
          <Nav.Link active={active}>{group.name}</Nav.Link>
        </Nav.Item>
      );
    });

    return (
      <>
        <Nav className="flex-column">
          <Nav.Item>
            <Nav.Link disabled>
              <span role="img" aria-label="Factory icon">
                🏭
              </span>{' '}
              Factories
            </Nav.Link>
          </Nav.Item>
          {factoryPills}
          <Nav.Item>
            <Nav.Link onClick={this.handleClickAddGroup}>
              Add A Factory
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeKey === 'settings'}
              onClick={this.handleClickSettings}
            >
              <span role="img" aria-label="Gear icon">
                ⚙️
              </span>{' '}
              Settings
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </>
    );
  }

  renderFactory = () => {
    const group = this.props.state.groups[this.props.state.activeGroupIdx];

    return <RecipeGroup group={group} />;
  };

  renderSettings = () => {
    return <Settings />;
  };

  render() {
    if (!this.props.state.gameData.raw) {
      return null;
    }
    let body: JSX.Element;
    if (this.state.activePage === ActivePage.Factory) {
      body = this.renderFactory();
    } else if (this.state.activePage === ActivePage.Settings) {
      body = this.renderSettings();
    } else {
      return assertNever(this.state.activePage);
    }

    return (
      <Container fluid>
        <Row>
          <Col xs="2" className={classNames('bg-primary', styles.Sidebar)}>
            {this.renderNavbar()}
          </Col>
          <Col>{body}</Col>
        </Row>
      </Container>
    );
  }
}

export const App = withBoth(RawApp);

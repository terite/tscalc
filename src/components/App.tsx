import React from 'react';

import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import Nav from 'react-bootstrap/Nav';
import SplitButton from 'react-bootstrap/SplitButton';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { RecipeGroup } from './RecipeGroup';
import { Settings } from './Settings';

import { AppActions, AppState, withBoth } from '../state';
import { assertNever } from '../util';

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

  handleClickAddGroup: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    const defaultName = `Factory ${this.props.state.groups.length + 1}`;
    const name = prompt('What do you want to name this group?', defaultName);
    if (!name || !name.trim()) {
      return;
    }
    this.props.actions.addGroup(name);
  };

  handleClickRemoveGroup = (i: number) => {
    const group = this.props.state.groups[this.props.state.activeGroupIdx];
    if (window.confirm(`Are you sure you want to delete ${group.name}`)) {
      this.props.actions.removeGroup(i);
    }
  };

  handleClickRenameGrorup = (i: number) => {
    const name = prompt(
      'Whatcha wanna call it now?',
      this.props.state.groups[i].name
    );
    if (name) {
      this.props.actions.renameGroup(i, name);
    }
  };

  renderNavbar = () => {
    const settingsActive = this.state.activePage === ActivePage.Settings;

    const activeKey = settingsActive
      ? 'settings'
      : this.props.state.activeGroupIdx;

    const factoryPills = this.props.state.groups.map((group, i) => (
      <SplitButton
        key={i}
        variant={activeKey === i ? 'primary' : 'secondary'}
        id={i}
        onClick={() => {
          this.handleClickGroup(i);
        }}
        title={group.name}
      >
        <Dropdown.Item
          onClick={() => {
            this.handleClickRenameGrorup(i);
          }}
        >
          Rename
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          onClick={() => {
            this.handleClickRemoveGroup(i);
          }}
        >
          Delete
        </Dropdown.Item>
      </SplitButton>
    ));

    return (
      <Nav variant="tabs" className="px-2 pt-2">
        {factoryPills}
        <Nav.Item>
          <Nav.Link title="Add a factory" onClick={this.handleClickAddGroup}>
            +
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="settings">Settings</Nav.Link>
        </Nav.Item>
      </Nav>
    );
  };

  renderFactory = () => {
    const group = this.props.state.groups[this.props.state.activeGroupIdx];

    return (
      <Container>
        <RecipeGroup rows={group.rows} />
      </Container>
    );
  };

  renderSettings = () => {
    return (
      <Container>
        <Settings />
      </Container>
    );
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
          <Col xs="3">{this.renderNavbar()}</Col>
          <Col>{body}</Col>
        </Row>
      </Container>
    );
  }
}

export const App = withBoth(RawApp);

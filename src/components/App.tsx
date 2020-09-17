import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useRecoilValue, useRecoilState, RecoilState } from 'recoil';

import { RecipeGroup } from './RecipeGroup';
import { Settings } from './Settings';

import { useGroupAdd, AddGroupAction } from '../actions';
import { groupAtomsAtom, groupsState } from '../atoms';
import { RecipeGroupData } from '../state';
import { GameData } from '../game';
import { assertNever } from '../util';

import styles from './App.module.css';

interface Props {
  gameData: GameData;
  groupAtoms: RecoilState<RecipeGroupData>[];
  groups: RecipeGroupData[];
  onAddGroup: AddGroupAction;
  onRemoveGroup(groupAtom: RecoilState<RecipeGroupData>): void;
}

interface State {
  activePage: ActivePage;
  activeGroupIdx: number;
}

enum ActivePage {
  Factory,
  Settings,
}

class RawApp extends React.PureComponent<Props, State> {
  state: State = {
    activePage: ActivePage.Factory,
    activeGroupIdx: 0,
  };

  componentDidMount(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }
  componentWillUnmount(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Shift') {
      document.body.classList.add('shift-down');
    }
  };
  handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Shift') {
      document.body.classList.remove('shift-down');
    }
  };

  handleClickGroup = (i: number): void => {
    this.setState({
      activePage: ActivePage.Factory,
      activeGroupIdx: i,
    });
  };

  handleClickAddGroup: React.MouseEventHandler<any> = (event): void => {
    event.preventDefault();
    const defaultName = `Factory ${this.props.groups.length + 1}`;
    const name = prompt('What do you want to name this group?', defaultName);
    if (!name || !name.trim()) {
      return;
    }
    this.props.onAddGroup({ name, rows: [] });
  };

  handleClickSettings = (): void => {
    this.setState({
      activePage: ActivePage.Settings,
    });
  };

  renderNavbar(): React.ReactNode {
    const settingsActive = this.state.activePage === ActivePage.Settings;

    const activeKey = settingsActive ? 'settings' : this.state.activeGroupIdx;

    const factoryPills = this.props.groups.map((group, i) => {
      const active = activeKey === i;
      return (
        <button
          key={i}
          type="button"
          className={`list-group-item list-group-item-action ${
            active ? 'active' : ''
          }`}
          onClick={() => this.handleClickGroup(i)}
        >
          {group.name}
        </button>
      );
    });

    return (
      <>
        <ul className="list-group mt-3">
          <li className="list-group-item">
            <span role="img" aria-label="Factory icon">
              🏭
            </span>{' '}
            Factories
          </li>

          {factoryPills}

          <button
            type="button"
            className="list-group-item list-group-item-action"
            onClick={this.handleClickAddGroup}
          >
            <span role="img" aria-label="Factory icon">
              ＋
            </span>{' '}
            Add a Factory
          </button>
        </ul>

        <ul className="list-group mt-3">
          <button
            type="button"
            className={`list-group-item list-group-item-action ${
              settingsActive ? 'active' : ''
            }`}
            onClick={this.handleClickSettings}
          >
            <span role="img" aria-label="Gear icon">
              ⚙️
            </span>{' '}
            Settings
          </button>
        </ul>
      </>
    );
  }

  renderFactory = (): React.ReactNode => {
    const groupAtom = this.props.groupAtoms[this.state.activeGroupIdx];
    return (
      <RecipeGroup
        groupAtom={groupAtom}
        onRemoveGroup={this.props.onRemoveGroup}
      />
    );
  };

  renderSettings = (): React.ReactNode => {
    return <Settings />;
  };

  render(): React.ReactNode {
    if (!this.props.gameData.raw) {
      return null;
    }
    let body: React.ReactNode;
    if (this.state.activePage === ActivePage.Factory) {
      body = this.renderFactory();
    } else if (this.state.activePage === ActivePage.Settings) {
      body = this.renderSettings();
    } else {
      return assertNever(this.state.activePage);
    }

    return (
      <div className="container-fluid">
        <div className="row">
          <div className={classNames('col col-2 bg-primary', styles.Sidebar)}>
            {this.renderNavbar()}
          </div>
          <div className="col pt-3">{body}</div>
        </div>
      </div>
    );
  }
}

export const App: React.FC<{
  gameData: GameData;
}> = ({ gameData }) => {
  const groups = useRecoilValue(groupsState);

  const [groupAtoms, setGroupAtoms] = useRecoilState(groupAtomsAtom);

  const handleAddGroup = useGroupAdd();

  const handleRemoveGroup = useCallback(
    (groupAtom: RecoilState<RecipeGroupData>) => {
      console.log('removing group atom', groupAtom);
      setGroupAtoms((atoms) => atoms.filter((a) => a !== groupAtom));
    },
    [setGroupAtoms]
  );

  return (
    <RawApp
      gameData={gameData}
      groups={groups}
      groupAtoms={groupAtoms}
      onAddGroup={handleAddGroup}
      onRemoveGroup={handleRemoveGroup}
    />
  );
};

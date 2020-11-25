import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useRecoilValue, useSetRecoilState, RecoilState } from 'recoil';

import { RecipeGroup } from './RecipeGroup';
import { Settings } from './Settings';

import { useGroupAdd, AddGroupAction } from '../actions';
import { groupAtomsAtom, groupsState, GroupAtom } from '../atoms';
import { RecipeGroupData } from '../state';
import { GameData } from '../game';
import { assert, assertNever } from '../util';

import styles from './App.module.css';

interface Props {
  gameData: GameData;
  groups: [RecipeGroupData, GroupAtom][];
  onAddGroup: AddGroupAction;
  onRemoveGroupAtom(groupAtom: GroupAtom): void;
}

interface State {
  activePage: 'settings' | GroupAtom;
}

class RawApp extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    let activePage: State['activePage'] = 'settings';
    for (const x of this.props.groups) {
      activePage = x[1];
      break;
    }

    this.state = { activePage };
  }

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

  handleClickGroup = (groupAtom: GroupAtom): void => {
    this.setState({
      activePage: groupAtom,
    });
  };

  handleClickAddGroup = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    const defaultName = `Factory ${this.props.groups.length + 1}`;
    const name = prompt('What do you want to name this group?', defaultName);
    if (!name || !name.trim()) {
      return;
    }
    this.props.onAddGroup({ name, rows: [] });
  };

  handleRemoveGroupAtom = (groupAtom: GroupAtom): void => {
    if (this.state.activePage === groupAtom) {
      let changed = false;
      for (const xy of this.props.groups) {
        if (xy[1] !== groupAtom) {
          this.setState({
            activePage: xy[1],
          });
          changed = true;
          break;
        }
      }
      if (!changed) {
        this.setState({
          activePage: 'settings',
        });
      }
    }
    this.props.onRemoveGroupAtom(groupAtom);
  };

  handleClickSettings = (): void => {
    this.setState({
      activePage: 'settings',
    });
  };

  renderNavbar(): React.ReactNode {
    const settingsActive = this.state.activePage === 'settings';

    const factoryPills = this.props.groups.map(([group, groupAtom], i) => {
      const active = this.state.activePage === groupAtom;
      return (
        <button
          key={i}
          type="button"
          className={`list-group-item list-group-item-action ${
            active ? 'active' : ''
          }`}
          onClick={() => this.handleClickGroup(groupAtom)}
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

  renderBody(): React.ReactNode {
    if (this.state.activePage === 'settings') {
      return <Settings />;
    } else if (this.state.activePage) {
      return (
        <RecipeGroup
          groupAtom={this.state.activePage}
          onRemoveGroup={this.handleRemoveGroupAtom}
        />
      );
    } else {
      return assertNever(this.state.activePage);
    }
  }

  render(): React.ReactNode {
    assert(this.props.gameData, 'falsy gameData, should never happen');

    return (
      <div className="container-fluid">
        <div className="row">
          <div className={classNames('col col-2 bg-primary', styles.Sidebar)}>
            {this.renderNavbar()}
          </div>
          <div className="col pt-3">{this.renderBody()}</div>
        </div>
      </div>
    );
  }
}

export const App: React.FC<{
  gameData: GameData;
}> = ({ gameData }) => {
  const groups = useRecoilValue(groupsState);

  const setGroupAtoms = useSetRecoilState(groupAtomsAtom);

  const handleAddGroup = useGroupAdd();

  const handleRemoveGroupAtom = useCallback(
    (groupAtom: RecoilState<RecipeGroupData>) => {
      setGroupAtoms((atoms) => atoms.filter((a) => a !== groupAtom));
    },
    [setGroupAtoms]
  );

  return (
    <RawApp
      gameData={gameData}
      groups={groups}
      onAddGroup={handleAddGroup}
      onRemoveGroupAtom={handleRemoveGroupAtom}
    />
  );
};

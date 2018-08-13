import * as React from "react"

import {PopperHelper} from './PopperHelper'


interface DropdownHeader {
    header: React.ReactNode
}

interface DropdownDivider {
    divider: true
}

interface DropdownEntry<T> {
    key: React.Key,
    disabled?: boolean
    active?: boolean
    option: T
}

type DropdownOption<T> = DropdownHeader | DropdownDivider | DropdownEntry<T>

interface DropdownProps<T> {
    options: DropdownOption<T>[]
    selected: T
    onSelect(selected: T): void

    renderOption(option: T): React.ReactNode
    renderSelected(option: T): React.ReactNode
}



export class Dropdown<T> extends React.Component<DropdownProps<T>, {}> {

    controller: PopperHelper['controller']|null = null
    canToggle: boolean

    constructor(props: DropdownProps<T>) {
        super(props)

        if (props.options.length == 0) {
            this.canToggle = false
        } else if (props.options.length > 1) {
            this.canToggle = true
        } else {
            const option = props.options[0]
            this.canToggle = 'active' in option && !option.active
        }
    }

    handleBodyClick = () => {
        if (!this.controller || !this.controller.isShown) {
            return
        }
        this.controller && this.controller.hide()
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode == 27) {
            this.controller && this.controller.hide()
        }
    }

    componentDidMount() {
        // document.body.addEventListener('click', this.handleBodyClick)
        // document.body.addEventListener('keydown', this.handleKeyDown)
    }

    componentWillUnmount() {
        // document.body.removeEventListener('click', this.handleBodyClick)
        // document.body.removeEventListener('keydown', this.handleKeyDown)
    }

    handleSelect = (selected: T) => {
        this.props.onSelect(selected)
        this.controller && this.controller.hide()
    }

    renderDropdown = (style: React.CSSProperties) => {
        const options = this.props.options.map((option, i) => {
            if ('header' in option) {
                return <h6 className="dropdown-header" key={"ddkey" + i}>{option.header}</h6>
            }
            if ('divider' in option) {
                return <div className="dropdown-divider" key={"ddkey"+i}></div>
            }

            const classes = ["dropdown-item"]
            option.active && classes.push('active')
            option.disabled && classes.push('disabled')

            return (
                <button
                  key={option.key}
                  className={classes.join(" ")}
                  onClick={() => this.handleSelect(option.option)}
                  type="button">
                    {this.props.renderOption(option.option)}
                </button>
            )
        })

        return (
            <div className="dropdown-menu show" style={style}>
                {options}
            </div>
        )
    }

    render () {
        return (
            <PopperHelper
                target={({style}) => this.renderDropdown(style)}
                options={{
                    placement : 'bottom',
                }}>
            {({controller}) => {
                this.controller = controller

                let classes = ["btn", "btn-secondary"]
                if (this.canToggle) {
                    classes.push('dropdown-toggle')
                } else {
                    classes.push('disabled')
                }

                return (
                    <button
                        className={classes.join(" ")}
                        type="button"
                        onClick={() => {
                            this.canToggle && controller.toggle()
                        }}>
                            {this.props.renderSelected(this.props.selected)}
                    </button>
                )
            }}
            </PopperHelper>
        )
    }
}


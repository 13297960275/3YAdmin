import React from 'react';
import { Menu } from 'antd';

class ModuleMenu extends React.PureComponent {
    render() {
        const list = [];
        // console.log(this.props.moduleList)
        for (let item of this.props.moduleList) {
            list.push(
                <Menu.Item key={item.name}>
                    {item.title}
                </Menu.Item>
            );
        }
        return (
            <Menu
                onClick={this.props.updateModule}
                selectedKeys={[this.props.currentModule]}
                mode="horizontal"
                theme="dark"
                style={this.props.style}
            >
                {list}
            </Menu>
        )
    }
}
export default ModuleMenu;

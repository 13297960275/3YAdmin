import React from 'react';
import { withRouter } from 'react-router-dom';
import { Menu, Icon, Layout } from 'antd';
import { connect } from 'react-redux';
import '@/style/header.less';
import ModuleMenu from '@/components/ModuleMenu';
import { updateModule } from '@/reducers/app';
import { logout } from 'api';
import { removeToken } from '@/utils/token';
import FullScreen from '@/components/FullScreen';
import SearchInput from '@/components/SearchInput';

const { Header } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class MyHeader extends React.PureComponent {
    updateModule = (e) => {
        let accesseMenu = this.props.accessMenu;
        let moduleList = accesseMenu.filter(item => {
            return item.leftMemu && item.name === e.key
        });
        let moduleMenu = moduleList[0].children;
        this.props.updateModule({
            currentModule: e.key,
            moduleMenu: moduleMenu
        });
    }
    menuClick = e => {
        if (e.key === 'logout') {
            this.logout();
        } else {
            this.props.toggleNavTab();
        }
        // e.key === 'logout' && this.logout();
        // e.key === 'navTab' && this.props.toggleNavTab && this.props.toggleNavTab();
    }
    logout = async () => {
        try {
            await logout();
        } catch (e) {

        }
        removeToken();
        this.props.history.push('/login')
    }
    render() {
        const headerWidth = this.props.headerWidth
        console.log("MyHeader render")//withRouter的缘故，每次点击同一个菜单，都会re-render
        return (
            <Header style={{ padding: 0, height: 'auto', position: 'fixed', width: '100%', zIndex: 9 }}>
                    <ul className="top-nav" style={{ lineHeight: '65px', marginLeft: 10, width: headerWidth, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <li>
                            <a className="item" onClick={this.props.toggle} href="javascript:;" target={"_blank"}>
                                <Icon type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'} />
                            </a>
                        </li>
                        <li>
                            <ModuleMenu
                                style={{ lineHeight: '64px' }}
                                moduleList={this.props.moduleList}
                                updateModule={this.updateModule}
                                currentModule={this.props.currentModule}
                            />
                        </li>
                        <li style={{ width: '25em' }}>
                            <SearchInput style={{ display: 'inline-block', padding: '0px 20px', width: '100%' }} />
                        </li>
                        <li>
                            <ul className="top-nav" style={{ lineHeight: '65px' }}>
                                <li>
                                    <a className="item" href="https://github.com/wjkang/3YAdmin" target={"_blank"}>
                                        <Icon type="github" />
                                    </a>
                                </li>
                                <li>
                                    <a className="item" href="javascript:;" target={"_blank"}>
                                        <FullScreen />
                                    </a>
                                </li>
                                {
                                    process.env.REACT_APP_LAYOUT_MODE !== 'tab' ? 
                                        <li>
                                            <a className="item" href="javascript:;" target={"_blank"}>
                                                <Icon key="navTab" onClick={this.menuClick} type={this.props.navTabshow ? 'arrow-up' : 'arrow-down'} style={{ fontSize: 16 }} />
                                            </a>
                                        </li>
                                        :
                                        null
                                }
                            </ul>
                        </li>
                        <li>
                        <Menu
                            mode="horizontal"
                            style={{ lineHeight: '64px' }}
                            onClick={this.menuClick}
                            theme="dark"
                        >
                            <SubMenu title={<span className="avatar"><img src={this.props.avatar} alt="头像" /><i className="on bottom b-white" /></span>}>
                                <MenuItemGroup title="用户中心">
                                    <Menu.Item key="setting:1">你好 - {this.props.name}</Menu.Item>
                                    <Menu.Item key="setting:2"><Icon type="user" />个人信息</Menu.Item>
                                    <Menu.Item key="logout"><span onClick={this.logout}><Icon type="logout" />退出登录</span></Menu.Item>
                                </MenuItemGroup>
                            </SubMenu>
                        </Menu>
                        </li>
                    </ul>
                {/* <Row type="flex" justify="start">
                    <Col xs={6} sm={6} md={2} lg={2} xl={2}>
                        <ul className="top-nav" style={{ lineHeight: '65px', marginLeft: 10 }}>
                            <li>
                                <a className="item" onClick={this.props.toggle} href="javascript:;" target={"_blank"}>
                                    <Icon type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'} />
                                </a>
                            </li>
                        </ul>
                    </Col>
                    <Col xs={18} sm={18} md={8} lg={7} xl={6}>
                        <ModuleMenu
                            style={{ lineHeight: '64px' }}
                            moduleList={this.props.moduleList}
                            updateModule={this.updateModule}
                            currentModule={this.props.currentModule}
                        />
                    </Col>
                    <Col xs={18} sm={18} md={6} lg={4} xl={6} style={{ textAlign: 'center' }}>
                        <SearchInput style={{ display: 'inline-block', padding: '0px 20px', width: '100%' }} />
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={4} xl={4} style={{ textAlign: 'right' }}>
                        <ul className="top-nav" style={{ lineHeight: '65px' }}>
                            <li>
                                <a className="item" href="https://github.com/wjkang/3YAdmin" target={"_blank"}>
                                    <Icon type="github" />
                                </a>
                            </li>
                            <li>
                                <a className="item" href="javascript:;" target={"_blank"}>
                                    <FullScreen />
                                </a>
                            </li>
                            {
                                process.env.REACT_APP_LAYOUT_MODE !== 'tab' ? 
                                    <li>
                                        <a className="item" href="javascript:;" target={"_blank"}>
                                            <Icon key="navTab" onClick={this.menuClick} type={this.props.navTabshow ? 'arrow-up' : 'arrow-down'} style={{ fontSize: 16 }} />
                                        </a>
                                    </li>
                                    :
                                    null
                            }
                        </ul>
                    </Col>
                    <Col xs={6} sm={6} md={2} lg={2} xl={2}>
                        <Menu
                            mode="horizontal"
                            style={{ lineHeight: '64px' }}
                            onClick={this.menuClick}
                            theme="dark"
                        >
                            <SubMenu title={<span className="avatar"><img src={this.props.avatar} alt="头像" /><i className="on bottom b-white" /></span>}>
                                <MenuItemGroup title="用户中心">
                                    <Menu.Item key="setting:1">你好 - {this.props.name}</Menu.Item>
                                    <Menu.Item key="setting:2"><Icon type="user" />个人信息</Menu.Item>
                                    <Menu.Item key="logout"><span onClick={this.logout}><Icon type="logout" />退出登录</span></Menu.Item>
                                </MenuItemGroup>
                            </SubMenu>
                        </Menu>
                    </Col>
                </Row> */}
            </Header>
        )
    }
}

const mapStateToProps = state => {
    return {
        name: state.user.name,
        avatar: state.user.avatar,
        currentModule: state.app.currentModule,
        moduleList: state.app.moduleList,
        accessMenu: state.app.accessMenu
    }
};
const mapDispatchToProps = dispatch => {
    return {
        updateModule: (module) => {
            dispatch(updateModule(module));
        }
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MyHeader));

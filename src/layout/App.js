import React from 'react';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import './App.css';
import MyHeader from '@/containers/MyHeader';
import MySider from '@/containers/MySider';
import MyBreadcrumb from '@/containers/MyBreadcrumb';
import MyNavTabs from '@/containers/MyNavTabs';
import { getToken } from '@/utils/token';
import { getUserInfo, getAccessMemu } from 'api';
import { updateUserInfo } from '@/redux/reducers/user';
import { updateAccessMenu } from '@/redux/reducers/app';
import util from '@/utils/util';
import AppRouters from '@/routers/AppRouters';
import constantMenu from '@/routers/customMenu';

const { Content } = Layout;

class App extends React.PureComponent {
  state = {
    collapsed: false,
    responsive: false,
    navTabShow: false,
    navTabTop: 65,
    navTabWidth: '100%',
    headerWidth: '100%'
  }
  componentDidMount() {
    this.initAppData();//数据初始化完后再触发一次render
    this.getClientWidth();//判断屏幕尺寸再触发一次render(不需要可去掉)
    window.onresize = () => {
      this.getClientWidth();
    }
    setTimeout(() => {
      let loading = document.getElementById("StartLoading");
      loading && document.body.removeChild(loading);
    }, 200);
  }
  componentWillUpdate(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.initChildData(nextProps)
    }
  }
  componentDidUpdate(prevProps, prevState) {
    // console.log('componentDidUpdate')
    const clientWidth = document.body.clientWidth;
    const navTabWidth = document.getElementsByClassName('ant-layout-content')[0].clientWidth
    const sliderWidth = document.getElementsByClassName('ant-layout-sider')[0].clientWidth
    const headerWidth = clientWidth - sliderWidth
    // console.log(clientWidth, navTabWidth, headerWidth, sliderWidth, prevState, this.state)
    if (prevState.collapsed == this.state.collapsed) {
        this.setState({ 
            navTabWidth: navTabWidth,
            headerWidth: headerWidth
        });
    }
  }
  getClientWidth = () => {    // 获取当前浏览器宽度并设置responsive管理响应式
    const clientWidth = document.body.clientWidth;
    const navTabWidth = document.getElementsByClassName('ant-layout-content').length > 0 ? document.getElementsByClassName('ant-layout-content')[0].clientWidth : '100%'
    const headerWidth = document.getElementsByClassName('ant-layout-sider').length > 0 ? (clientWidth - document.getElementsByClassName('ant-layout-sider')[0].clientWidth) : '100%'
    this.setState({
      responsive: clientWidth <= 992,
      collapsed: clientWidth <= 992,
      navTabWidth,
      headerWidth
    });
    if (clientWidth < 576) {
      this.setState({
        // navTabTop: 193
        navTabTop: 65
      });
      return;
    }
    if (clientWidth < 768) {
      this.setState({
        // navTabTop: 129
        navTabTop: 65
      });
      return;
    }
    if (clientWidth >= 768) {
      this.setState({
        navTabTop: 65
      });
      return;
    }
  }
  toggle = () => {
    const clientWidth = document.body.clientWidth;
    const navTabWidth = document.getElementsByClassName('ant-layout-content')[0].clientWidth
    const sliderWidth = document.getElementsByClassName('ant-layout-sider')[0].clientWidth
    const headerWidth = clientWidth - sliderWidth
    this.setState({
        collapsed: !this.state.collapsed,
        navTabWidth: !this.state.collapsed ? navTabWidth + 120 : navTabWidth - 120 ,
        headerWidth: !this.state.collapsed ? headerWidth + 120 : headerWidth - 120 
    });
    this.refs['MySider'].wrappedInstance.setOpenKeys(this.state.collapsed);//https://github.com/ant-design/ant-design/issues/8911
  }
  toggleNavTab = () => {
    this.setState({ 
        navTabShow: !this.state.navTabShow,
    });
  }
  initAppData = async () => { //获取用户信息,菜单,权限列表(整个应用就一种layout布局,App就是相当母版页,不必在AuthrizedRoute里每次路由跳转的时候判断是否需要获取,是否登录也在此处判断)
    //没有登录，跳转到登录界面，并记下当前路径
    let token = getToken();
    if (!token) {
      this.props.history.push('/login');
      return;
    }
    let [infoRes, menuRes] = await Promise.all([getUserInfo(), getAccessMemu()]);
    let permission = [...infoRes.data.userRole, ...infoRes.data.userPermission];
    let isAdmin = infoRes.data.isAdmin;
    let userInfo = {
      name: infoRes.data.userName,
      avatar: infoRes.data.avatarUrl,
      isAdmin: isAdmin,
      permission: permission
    }
    localStorage.setItem("permission", JSON.stringify(permission));
    localStorage.setItem("isAdmin", isAdmin);
    menuRes.data.push(...constantMenu);
    let openAccesseMenu = util.openAccesseMenu(menuRes.data);
    let moduleList = menuRes.data.filter(item => {
      return item.leftMemu
    });
    let currentModule = moduleList[0].name;
    let moduleMenu = moduleList[0].children;
    this.props.updateAccessMenu({
      currentModule: currentModule,
      accessMenu: menuRes.data,
      openAccessMenu: openAccesseMenu,
      moduleMenu: moduleMenu,
      moduleList: moduleList
    });
    this.props.updateUserInfo(userInfo);
    this.initChildData(this.props);
    // console.log('==========', this.props)
  }
  initChildData(props) {
    this.refs['MySider'].wrappedInstance.initMenu(props.location.pathname);
  }
  render() {
    console.log("App render");
    return (
      <Layout>
        <MySider
          ref={'MySider'}
          responsive={this.state.responsive}
          collapsed={this.state.collapsed}
        >
        </MySider>
        <Layout>
          <MyHeader collapsed={this.state.collapsed} headerWidth={this.state.headerWidth} toggle={this.toggle} toggleNavTab={this.toggleNavTab} navTabshow={this.state.navTabShow}>
          </MyHeader>
          <MyNavTabs style={{ top: this.state.navTabTop, position: 'fixed', zIndex: 9, width: this.state.headerWidth, display: this.state.navTabShow ? 'block' : 'none' }} show={this.state.navTabShow} />
          <MyBreadcrumb style={{ padding: '10px 10px 10px 17px', background: '#e6f7ff', marginTop: this.state.navTabTop + 59 + (this.state.navTabShow ? 0 : -59) }} />
          <Content style={{ padding: 24 }}>
            <AppRouters />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
const mapStateToPorps = state => {
  const { name } = state.user;
  return { name };
};
const mapDispatchToProps = dispatch => {
  return {
    updateUserInfo: (info) => {
      dispatch(updateUserInfo(info))
    },
    updateAccessMenu: (accessMenu) => {
      dispatch(updateAccessMenu(accessMenu))
    }
  }
}
export default connect(mapStateToPorps, mapDispatchToProps)(App);

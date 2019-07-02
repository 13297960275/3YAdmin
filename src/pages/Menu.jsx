import React from 'react';
import { Row, Col, Tree, Form, Input, Button, Switch, InputNumber, message, Tag, TreeSelect, Icon, Popconfirm } from 'antd';
import { getAllMenu, getAccessMemu, saveMenu, delMenu } from 'api';
import Icons from '@/Icons';
import { connect } from 'react-redux';
import { updateAccessMenu } from '@/redux/reducers/app';
import util from '@/utils/util';
import constantMenu from '@/routers/customMenu';

const TreeNode = Tree.TreeNode;
const FormItem = Form.Item;
const SelectTreeNode = TreeSelect.TreeNode;

const iconsTree = [];
for (let item of Icons) {
    let chidren = [];
    for (let child of item.icons) {
        chidren.push(<SelectTreeNode value={child.icon} title={<span><Icon type={child.icon} style={{ color: '#08c' }} /> &nbsp;&nbsp;{child.title}</span>} key={child.icon} />)
    }
    iconsTree.push(<SelectTreeNode title={item.title} key={item.title}>{chidren}</SelectTreeNode>)
}
class Menu extends React.PureComponent {
    state = {
        menuList: [],
        tempMenu: {
            id: '',
            parentId: 0
        },
        selected: false,
        addChild: false,
        delEnable: true,
        visible: false
    }
    componentDidMount() {
        this.initData();
        // console.log(this.props);
    }
    initData = async () => {
        // let menuListRes = await getAllMenu();
        // let menuList = menuListRes.data;
        // this.setState({
        //     menuList: menuList
        // })
        // console.log(menuList);
        
        let [menuListRes, menuRes] = await Promise.all([getAllMenu(), getAccessMemu()]);
        let menuList = menuListRes.data;
        this.setState({
            menuList: menuList
        })
        menuRes.data.push(...constantMenu);
        let openAccesseMenu = util.openAccesseMenu(menuRes.data);
        let moduleList = menuRes.data.filter(item => {
            return item.leftMemu
        });
        let currentModule = this.props.currentModule;
        let moduleMenu = this.props.moduleMenu;
        this.props.updateAccessMenu({
            currentModule: currentModule,
            accessMenu: menuRes.data,
            openAccessMenu: openAccesseMenu,
            moduleMenu: moduleMenu,
            moduleList: moduleList
        });
    }

    onSelect = (selectedKeys, info) => {
        let { setFieldsValue, resetFields } = this.props.form;
        if (selectedKeys.length === 0) {
            resetFields();
            this.setState({
                selected: false,
                addChild: false,
                delEnable: true,
                tempMenu: {
                    id: '',
                    parentId: 0
                }
            })
            return;
        }
        let id = selectedKeys[0];
        let menu = this.findMenuById(id);
        this.setState({
            selected: true,
            addChild: false,
            delEnable: false,
            tempMenu: { ...menu }
        });
        setFieldsValue({
            name: menu.name,
            title: menu.title,
            functionCode: menu.functionCode,
            sort: menu.sort,
            leftMemu: menu.leftMemu,
            isLock: menu.isLock,
            icon: menu.icon
        });
    }
    findMenuById = (id) => {
        let menu = {};
        let getMenu = function (menuList) {
            for (var item of menuList) {
                if (item.id == id) {
                    menu = { ...item };
                    menu.children = null;
                    break;
                } else {
                    if (item.children && item.children.length > 0) {
                        getMenu(item.children);
                    }
                }
            }
        };
        getMenu(this.state.menuList);
        return menu;
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(async (err, values) => {
            if (!err) {
                let data = { id: this.state.tempMenu.id, parentId: this.state.tempMenu.parentId, ...values };
                try {
                    await saveMenu(data);
                    message.success('提交成功');
                    // window.location.reload();
                    this.initData();
                } catch (ex) {
                    console.log(ex);
                }

            }
        });
    }
    confirm = () => {
        this.setState({ visible: false });
        // message.success('Next step.');
        this.props.form.validateFieldsAndScroll(async (err, values) => {
            if (!err) {
                let data = { id: this.state.tempMenu.id, parentId: this.state.tempMenu.parentId, ...values };
                try {
                    await delMenu(data.id);
                    message.success('删除成功');
                    // window.location.reload();
                    this.initData();
                } catch (ex) {
                    console.log(ex);
                }
            }
        });
    }
    cancel = () => {
        this.setState({ visible: false });
        // message.error('Click on cancel.');
    }
    handleVisibleChange = visible => {
        if (!visible) {
          this.setState({ visible });
          return;
        }
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let data = { id: this.state.tempMenu.id, parentId: this.state.tempMenu.parentId, ...values };
                if (data.parentId == 0) {
                    this.setState({ visible: true }); // show the popconfirm 顶层菜单
                } else {
                    this.setState({ visible: false });
                    this.confirm(); // next step 费顶层菜单直接删除
                }

            }
        });
    }
    addChildMenu = () => {
        this.setState({
            addChild: true,
            selected: false,
            delEnable: true,
            tempMenu: {
                ...this.state.tempMenu,
                id: '',
                parentId: this.state.tempMenu.id
            }
        });
        this.props.form.resetFields();
    }
    addTopMenu = () => {
        this.setState({
            addChild: false,
            selected: false,
            delEnable: true,
            tempMenu: {
                ...this.state.tempMenu,
                id: '',
                parentId: 0
            }
        });
        this.props.form.resetFields();
    }
    render() {
        const renderMenu = (menuList) => menuList.map(
            menu =>
                <TreeNode title={menu.title} key={menu.id}>
                    {menu.children && menu.children.length > 0 ? renderMenu(menu.children) : ''}
                </TreeNode>
        )
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { xs: { span: 24 }, sm: { span: 8 }, },
            wrapperCol: { xs: { span: 24 }, sm: { span: 16 }, },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: { span: 24, offset: 0, },
                sm: { span: 16, offset: 8, },
            },
        };
        return (
            <div>
                <Row type="flex" justify="start">
                    <Col xs={24} sm={24} md={12} lg={6} xl={6} style={{ backgroundColor: '#fafafa' }}>
                        <div style={{ padding: 10 }}>
                            <Button icon='plus' type="primary" size='small' onClick={this.addTopMenu}>添加顶级菜单</Button>&nbsp;&nbsp;&nbsp;&nbsp;

                            <Button disabled={!this.state.selected} icon='plus' size='small' onClick={this.addChildMenu}>添加子菜单</Button>
                        </div>
                        <Tree
                            onSelect={this.onSelect}
                        >
                            {renderMenu(this.state.menuList)}
                        </Tree>

                    </Col>
                    <Col xs={24} sm={24} md={12} lg={9} xl={9}>

                        <Form onSubmit={this.handleSubmit}>
                            <div style={{ padding: 10, paddingLeft: 50, display: this.state.selected ? 'block' : 'none' }}>
                                正在编辑菜单：<Tag color="#108ee9">{this.state.tempMenu.title}</Tag >
                            </div>
                            <div style={{ padding: 10, paddingLeft: 50, display: this.state.addChild ? 'block' : 'none' }}>
                                添加&nbsp;&nbsp;<Tag color="#108ee9">{this.state.tempMenu.title}</Tag >子菜单
                            </div>
                            <FormItem
                                {...formItemLayout}
                                hasFeedback
                                label="名称"
                            >
                                {getFieldDecorator('name', {
                                    rules: [{
                                        required: true, message: '名称不能为空!',
                                    }],
                                })(
                                    <Input />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                hasFeedback
                                label="标题"
                            >
                                {getFieldDecorator('title', {
                                    rules: [{
                                        required: true, message: '标题不能为空!',
                                    }],
                                })(
                                    <Input />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                hasFeedback
                                label="权限码"
                            >
                                {getFieldDecorator('functionCode')(
                                    <Input />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}

                                label="排序"
                            >
                                {getFieldDecorator('sort', { initialValue: 0 })(
                                    <InputNumber min={0} />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}

                                label="是否左侧显示"
                            >
                                {getFieldDecorator('leftMemu', { valuePropName: 'checked' })(
                                    <Switch />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}

                                label="是否锁定"
                            >
                                {getFieldDecorator('isLock', { valuePropName: 'checked' })(
                                    <Switch />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                hasFeedback
                                label="图标"
                            >
                                {getFieldDecorator('icon', { initialValue: '' })(
                                    <TreeSelect
                                        showSearch
                                        style={{ width: 300 }}
                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                        placeholder="Please select"
                                        allowClear
                                        treeDefaultExpandAll
                                    >
                                        {iconsTree}
                                    </TreeSelect>
                                )}
                            </FormItem>

                            <FormItem {...tailFormItemLayout}>
                                <Button type="primary" htmlType="submit">提交</Button>
                                <Popconfirm
                                    title="确认要删除当前菜单？"
                                    visible={this.state.visible}
                                    onVisibleChange={this.handleVisibleChange}
                                    onConfirm={this.confirm}
                                    onCancel={this.cancel}
                                    okText="确认"
                                    cancelText="取消"
                                    >
                                    <Button type="danger" htmlType="button" disabled={this.state.delEnable}>删除</Button>
                                </Popconfirm>
                            </FormItem>
                        </Form>
                    </Col>
                </Row>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentModule: state.app.currentModule,
        accessMenu: state.app.accessMenu,
        openAccessMenu: state.app.openAccessMenu,
        moduleMenu: state.app.moduleMenu,
        moduleList: state.app.moduleList
    }
}
const mapDispatchToProps = dispatch => {
    return {
        updateAccessMenu: (accessMenu) => {
            dispatch(updateAccessMenu(accessMenu))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)((Form.create()(Menu)));

// export default Form.create()(Menu);
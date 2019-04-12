<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2019/4/12
 * Time: 10:54
 */

namespace app\admin\controller\maintain;


use app\common\controller\AdminController;

/**
 * I型设备维护控制器
 * Class ModelOne
 * @package app\admin\controller\maintain
 */
class ModelOne extends AdminController {

    /**
     * 默认模型对象
     */
    protected $model = null;

    /**
     * 初始化
     * User constructor.
     */
    public function __construct() {
        parent::__construct();
        $this->model = new \app\admin\model\maintain\ModelOne;
    }

    /**
     * 文章分类
     * @return mixed|\think\response\Json
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public function index() {
        if (!$this->request->isPost()) {
            if ($this->request->get('type') == 'ajax') {
                $page = $this->request->get('page', 1);
                $limit = $this->request->get('limit', 10);
                $search = (array)$this->request->get('search', []);
                return json($this->model->getList($page, $limit, $search));
            }
            $type_list = [
                ['id' => 1, 'title' => '全部'],
                ['id' => 2, 'title' => '闲置'],
                ['id' => 3, 'title' => '运行'],
                ['id' => 4, 'title' => '故障'],
                ['id' => 5, 'title' => '自用'],
                ['id' => 6, 'title' => '出租'],
                ['id' => 7, 'title' => '待租'],
                ['id' => 8, 'title' => '待售'],
            ];
            $basic_data = [
                'title' => '检测设备信息',
                'data'  => '',
                'type_list' => $type_list,
            ];
            return $this->fetch('', $basic_data);
        } else {
            $post = $this->request->post();

            //验证数据
            $validate = $this->validate($post, 'app\admin\validate\Common.edit_field');
            if (true !== $validate) return __error($validate);

            //保存数据,返回结果
            return $this->model->editField($post);
        }
    }

    /**
     * 添加
     * @return mixed
     */
    public function add() {
        if (!$this->request->isPost()) {
            $basic_data = [
                'title' => '添加公告',
            ];
            return $this->fetch('form', $basic_data);
        } else {
            $post = $this->request->post();

            //验证数据
            $validate = $this->validate($post, 'app\admin\validate\blog\Notice.add');
            if (true !== $validate) return __error($validate);

            //保存数据,返回结果
            return $this->model->addData($post);
        }
    }

    /**
     * 修改
     * @return mixed|string|\think\response\Json
     */
    public function edit() {
        if (!$this->request->isPost()) {

            //查找所需修改用户
            $data = $this->model->where('id', $this->request->get('id'))->find();
            if (empty($data)) return msg_error('暂无数据，请重新刷新页面！');

            //基础数据
            $basic_data = [
                'title' => '修改会员信息',
                'data'  => $data,
            ];
            return $this->fetch('form', $basic_data);
        } else {
            $post = $this->request->post();

            //验证数据
            $validate = $this->validate($post, 'app\admin\validate\blog\Notice.edit');
            if (true !== $validate) return __error($validate);

            //保存数据,返回结果
            return $this->model->editData($post);
        }
    }

    /**
     * 删除
     * @return \think\response\Json
     */
    public function del() {
        $get = $this->request->get();

        //验证数据
        if (!is_array($get['id'])) {
            $validate = $this->validate($get, 'app\admin\validate\blog\Notice.del');
            if (true !== $validate) return __error($validate);
        }

        //执行删除操作
        return $this->model->delData($get['id'], true);
    }

    /**
     * 更改状态
     * @return \think\response\Json
     */
    public function status() {
        $get = $this->request->get();

        //验证数据
        $validate = $this->validate($get, 'app\admin\validate\blog\Notice.status');
        if (true !== $validate) return __error($validate);

        //判断状态
        $status = $this->model->where('id', $get['id'])->value('status');
        $status == 1 ? list($msg, $status) = ['启用成功', $status = 0] : list($msg, $status) = ['禁用成功', $status = 1];

        //执行更新操作操作
        $update = $this->model->where('id', $get['id'])->update(['status' => $status]);

        if ($update >= 1) return __success($msg);
        return __error('数据有误，请刷新重试！');
    }
}
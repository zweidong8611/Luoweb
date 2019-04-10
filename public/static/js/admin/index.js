var $, tab, dataStr, layer;
layui.config({
    base: "/static/js/admin/"
}).extend({
    "bodyTab": "bodyTab"
})
layui.use(['bodyTab', 'form', 'element', 'layer', 'jquery'], function () {
    var form = layui.form,
        element = layui.element;
    $ = layui.$;
    layer = parent.layer === undefined ? layui.layer : top.layer;
    tab = layui.bodyTab({
        openTabNum: "50",  //最大可打开窗口数量
        url: "/api/admin.common/getMenu" //获取菜单json地址
    });

    //通过顶部菜单获取左侧二三级菜单   注：此处只做演示之用，实际开发中通过接口传参的方式获取导航数据
    function getData(json) {
        //使用AJAX验证菜单栏，体验低
        $.get(tab.tabConfig.url, function (data) {
            console.log(data);
            //保存为sessionStorage
            // sessionStorage.setItem('menu_data', JSON.stringify(data));
            var count = 0;
            for (var item in data) {
                if (json == item) {
                    console.log(item);
                    count++;
                    dataStr = data[item];
                    //重新渲染左侧菜单
                    tab.render();
                }
            }
            if (count == 0) {
                layer.alert('导航栏数据有误，或者未刷新缓存！', {icon: 2});
            }
        })
    }

    //页面加载时判断左侧菜单是否显示
    //通过顶部菜单获取左侧菜单
    $(".topLevelMenus li,.mobileTopLevelMenus dd").click(function () {
        if ($(this).parents(".mobileTopLevelMenus").length != "0") {
            $(".topLevelMenus li").eq($(this).index()).addClass("layui-this").siblings().removeClass("layui-this");
        } else {
            $(".mobileTopLevelMenus dd").eq($(this).index()).addClass("layui-this").siblings().removeClass("layui-this");
        }
        $(".layui-layout-admin").removeClass("showMenu");
        $("body").addClass("site-mobile");
        getData($(this).data("menu"));
        //渲染顶部窗口
        tab.tabMove();
    })

    //隐藏左侧导航
    $(".hideMenu").click(function () {
        if ($(".topLevelMenus li.layui-this a").data("url")) {
            layer.msg("此栏目状态下左侧菜单不可展开");  //主要为了避免左侧显示的内容与顶部菜单不匹配
            return false;
        }
        $(".layui-layout-admin").toggleClass("showMenu");
        //渲染顶部窗口
        tab.tabMove();
    })

    //通过顶部菜单获取左侧二三级菜单   注：此处只做演示之用，实际开发中通过接口传参的方式获取导航数据
    // getData("contentManagement");
    //初始化导航栏
    $(function () {
        $.get(tab.tabConfig.url, function (data) {
            console.log('***********初始化菜单栏************');
            console.log(data);
            for (var item in data) {
                console.log(item);//得到键
                dataStr = data[item];
                //重新渲染左侧菜单
                tab.render();
                console.log('***********初始化菜单栏************');
                return false;
            }
        })
    });

    //手机设备的简单适配
    $('.site-tree-mobile').on('click', function () {
        $('body').addClass('site-mobile');
    });
    $('.site-mobile-shade').on('click', function () {
        $('body').removeClass('site-mobile');
    });

    // 添加新窗口
    $("body").on("click", ".layui-nav .layui-nav-item a:not('.mobileTopLevelMenus .layui-nav-item a')", function () {
        //如果不存在子级
        if ($(this).siblings().length == 0) {
            addTab($(this));
            $('body').removeClass('site-mobile');  //移动端点击菜单关闭菜单层
        }
        $(this).parent("li").siblings().removeClass("layui-nav-itemed");
    })

    //清除缓存
    $(".clearCache").click(function () {
        var index = layer.msg('清除缓存中，请稍候', {icon: 16, time: false, shade: 0.8});
        //清除浏览器缓存
        window.sessionStorage.clear();
        window.localStorage.clear();
        //清除服务器缓存
        $.get("/api/admin.common/clearCache", function (res) {
            if (res.code == 0) {
                setTimeout(function () {
                    layer.close(index);
                    layer.msg(res.msg);
                }, 1000);
            } else {
                setTimeout(function () {
                    layer.close(index);
                    layer.msg("服务端缓存清除失败！");
                }, 1000);
            }
        })
        return false;
    })

    //刷新后还原打开的窗口
    if (cacheStr == "true") {
        if (window.sessionStorage.getItem("menu") != null) {
            menu = JSON.parse(window.sessionStorage.getItem("menu"));
            curmenu = window.sessionStorage.getItem("curmenu");
            var openTitle = '';
            for (var i = 0; i < menu.length; i++) {
                openTitle = '';
                if (menu[i].icon) {
                    if (menu[i].icon.split("-")[0] == 'icon') {
                        openTitle += '<i class="seraph ' + menu[i].icon + '"></i>';
                    } else {
                        openTitle += '<i class="layui-icon">' + menu[i].icon + '</i>';
                    }
                }
                openTitle += '<cite>' + menu[i].title + '</cite>';
                openTitle += '<i class="layui-icon layui-unselect layui-tab-close" data-id="' + menu[i].layId + '">&#x1006;</i>';
                element.tabAdd("bodyTab", {
                    title: openTitle,
                    content: "<iframe src='" + menu[i].href + "' data-id='" + menu[i].layId + "'></frame>",
                    id: menu[i].layId
                })
                //定位到刷新前的窗口
                if (curmenu != "undefined") {
                    if (curmenu == '' || curmenu == "null") {  //定位到后台首页
                        element.tabChange("bodyTab", '');
                    } else if (JSON.parse(curmenu).title == menu[i].title) {  //定位到刷新前的页面
                        element.tabChange("bodyTab", menu[i].layId);
                    }
                } else {
                    element.tabChange("bodyTab", menu[menu.length - 1].layId);
                }
            }
            //渲染顶部窗口
            tab.tabMove();
        }
    } else {
        window.sessionStorage.removeItem("menu");
        window.sessionStorage.removeItem("curmenu");
    }
})

//打开新窗口
function addTab(_this) {
    tab.tabAdd(_this);
}


//图片管理弹窗
function showImg() {
    $.getJSON('json/images.json', function (json) {
        let res = json;
        layer.photos({
            photos: res,
            anim: 5
        });
    });
}
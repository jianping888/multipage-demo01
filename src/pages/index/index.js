import "./index.scss";
import "../../assets/css/common.scss";
const Util = require("../../js/api.js");
// import "../../js/api.js";
(function ($, window) {
    var t1=null; //轮询
    var resData={
        allGatheringPoint:[],
        allVehicleLocations:[]
    }
    var pointsList=[],markerList=[]; //车辆点与聚合点集合
    init()
    function init(){ //页面初始化
        pointsList=[],markerList=[];
        allVehicleLocations()
    }
    function mapFn(pointsList,markerList){
        
            var cluster, markers = [];
            var count //点集合的长度
            var centerMarker //中心点标记
            var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(-5, -30)});

            var map = new AMap.Map("container", {
                resizeEnable: true,
                center: [115.845079,28.763892],
                zooms:[4,18]
            }); 

            //渲染点集合（车辆点位展示）
            addCluster(2);

            //车辆点位信息展示样式设置
            function setCarStyle(vinCode){  //vinCode: 查询车辆VIN
                for (var i = 0; i < pointsList.length; i += 1) {
                    var marker
                    if(vinCode && vinCode==pointsList[i].vin){
                        marker=new AMap.Marker({
                            position: [ pointsList[i].longitude,pointsList[i].latitude ],
                            // content: '<div style="background-color: hsla(180, 100%, 50%, 0.7); height: 24px; width: 24px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 1px;"></div>',
                            content: '<img width=40 height=40 src="./images/car-select.png" />',
                            offset: new AMap.Pixel(-20, -20)
                        })
                        map.setCenter([pointsList[i].longitude, pointsList[i].latitude]); //设置地图中心点
                    }else{
                        marker=new AMap.Marker({
                            position: [ pointsList[i].longitude,pointsList[i].latitude ],
                            // content: '<div style="background-color: hsla(180, 100%, 50%, 0.7); height: 24px; width: 24px; border: 1px solid hsl(180, 100%, 40%); border-radius: 12px; box-shadow: hsl(180, 100%, 50%) 0px 0px 1px;"></div>',
                            content: '<img src="https://webapi.amap.com/theme/v1.3/markers/n/mark_b1.png" />',
                            offset: new AMap.Pixel(-15, -15)
                        })
                    }
                    marker.content = '<p>'+pointsList[i].vin+'</p>';
                    marker.on('mouseover', infoOpen);
                    //注释后打开地图时默认关闭信息窗体
                    //marker.emit('mouseover', {target: marker});
                    marker.on('mouseout', infoClose);
                    marker.on('click', newMAp);
                    markers.push(marker)
                }
                count = markers.length;
            }
            //聚合点样式设置
            function _renderClusterMarker (context) {
                var factor = Math.pow(context.count / count, 1 / 18);
                var div = document.createElement('div');
                var Hue = 180 - factor * 180;
                var bgColor = 'hsla(' + Hue + ',100%,50%,0.7)';
                var fontColor = 'hsla(' + Hue + ',100%,20%,1)';
                var borderColor = 'hsla(' + Hue + ',100%,40%,1)';
                var shadowColor = 'hsla(' + Hue + ',100%,50%,1)';
                div.style.backgroundColor = bgColor;
                var size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
                div.style.width = div.style.height = size + 'px';
                div.style.border = 'solid 1px ' + borderColor;
                div.style.borderRadius = size / 2 + 'px';
                div.style.boxShadow = '0 0 1px ' + shadowColor;
                div.innerHTML = context.count;
                div.style.lineHeight = size + 'px';
                div.style.color = fontColor;
                div.style.fontSize = '14px';
                div.style.textAlign = 'center';
                context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
                context.marker.setContent(div)
            };
            //点集合渲染函数（车辆点位展示）
            function addCluster(tag,vinCode) {
                setCarStyle(vinCode)
                if (cluster) {
                    cluster.setMap(null);
                }
                if (tag == 2) {//完全自定义
                    cluster = new AMap.MarkerClusterer(map, markers, {
                        gridSize: 100,
                        maxZoom: 17,
                        // minClusterSize: 100,
                        averageCenter: true,
                        renderClusterMarker: _renderClusterMarker
                    });
                } else if (tag == 1) {//自定义图标
                    var sts = [{
                        url: "https://a.amap.com/jsapi_demos/static/images/blue.png",
                        size: new AMap.Size(32, 32),
                        offset: new AMap.Pixel(-16, -16)
                    }, {
                        url: "https://a.amap.com/jsapi_demos/static/images/green.png",
                        size: new AMap.Size(32, 32),
                        offset: new AMap.Pixel(-16, -16)
                    }, {
                        url: "https://a.amap.com/jsapi_demos/static/images/orange.png",
                        size: new AMap.Size(36, 36),
                        offset: new AMap.Pixel(-18, -18)
                    }, {
                        url: "https://a.amap.com/jsapi_demos/static/images/red.png",
                        size: new AMap.Size(48, 48),
                        offset: new AMap.Pixel(-24, -24)
                    }, {
                        url: "https://a.amap.com/jsapi_demos/static/images/darkRed.png",
                        size: new AMap.Size(48, 48),
                        offset: new AMap.Pixel(-24, -24)
                    }];
                    cluster = new AMap.MarkerClusterer(map, markers, {
                        styles: sts,
                        gridSize: 80
                    });
                } else {//默认样式
                    cluster = new AMap.MarkerClusterer(map, markers, {gridSize: 80});
                }
            }

            // 将 聚集点位置 添加到地图
            map.add(markerList);

            //绘制覆盖物,右下角弹框开始

            var mouseTool = new AMap.MouseTool(map); 
            //监听draw事件可获取画好的覆盖物
            var overlays = []; //打点图标
            var circleList=[]; //点周边阴影
            mouseTool.on('draw',function(e){
                map.remove(overlays)
                overlays = [];
                overlays.push(e.obj);
            }) 
            //画图图形选择方法，根据不同的type，画不同类型的图像
            function draw(type){
            switch(type){
                case 'marker':{
                    mouseTool.marker({
                    //同Marker的Option设置
                    });
                    break;
                }
                case 'polyline':{
                    mouseTool.polyline({
                    strokeColor:'#80d8ff'
                    //同Polyline的Option设置
                    });
                    break;
                }
                case 'polygon':{
                    mouseTool.polygon({
                    fillColor:'#00b0ff',
                    strokeColor:'#80d8ff'
                    //同Polygon的Option设置
                    });
                    break;
                }
                case 'rectangle':{
                    mouseTool.rectangle({
                    fillColor:'#00b0ff',
                    strokeColor:'#80d8ff'
                    //同Polygon的Option设置
                    });
                    break;
                }
                case 'circle':{
                    mouseTool.circle({
                    fillColor:'#00b0ff',
                    strokeColor:'#80d8ff'
                    //同Circle的Option设置
                    });
                    break;
                }
            }
            }
            //画其它图形选项，需求只画点，这里注释不用
            // var radios = document.getElementsByName('func');
            // for(var i=0;i<radios.length;i+=1){
            //     radios[i].onchange = function(e){
            //     draw(e.target.value)
            //     }
            // }
            draw('marker')
            //清楚画点
            document.getElementById('clear').onclick = function(){
                map.remove(overlays)
                map.remove(circleList);
                overlays = [];
                $("#addText").val('');

            }
            //增加聚点  
            document.getElementById('add').onclick = function(){
                var member=($("#addText").val()).trim();
                if(!member || overlays.length==0){
                    return
                }
                gatheringPointAdd({
                    "member": member,
                    "longitude": overlays[0].B.position.lng,
                    "latitude": overlays[0].B.position.lat
                })
            } 
            //关闭画点
            // document.getElementById('close').onclick = function(){
            //     mouseTool.close(true)//关闭，并清除覆盖物
            //     for(var i=0;i<radios.length;i+=1){
            //         radios[i].checked = false;
            //     }
            // }
            //绘制覆盖物,右下角弹框结束

            //为地图注册click事件获取鼠标点击出的经纬度坐标，右上角弹框开始
            var clickEventListener = map.on('click', function(e) {
                document.getElementById("lnglat").value = e.lnglat.getLng() + ',' + e.lnglat.getLat()
                // 构造矢量圆形
                var radius=(document.getElementById("distanccePoint").value).trim() || 0;
                var circle = new AMap.Circle({
                    center: new AMap.LngLat(e.lnglat.getLng(), e.lnglat.getLat()), // 圆心位置
                    radius: radius,  //半径
                    strokeColor: "#F33",  //线颜色
                    strokeOpacity: 1,  //线透明度
                    strokeWeight: 3,  //线粗细度
                    fillColor: "#ee2200",  //填充颜色
                    fillOpacity: 0.35 //填充透明度
                });
                circleList.push(circle)
                map.remove(circleList); //每次点击地图，清除上次的圆形
                map.add(circle);
            });
            //按关键字搜索功能
            var auto = new AMap.Autocomplete({
                input: "tipinput"
           });
            AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
            
        
            //鼠标点击事件,设置地图中心点及放大显示级别
            function newMAp(e) {
                map.setZoomAndCenter(15, e.target.getPosition());
                var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
                infoWindow.setContent(e.target.content);
                infoWindow.open(map, e.target.getPosition());	
            }
            function infoClose(e) {
                infoWindow.close(map, e.target.getPosition());
            }
            function infoOpen(e) {
                infoWindow.setContent(e.target.content);
                infoWindow.open(map, e.target.getPosition());
            }
            function select(e) {
                if (e.poi && e.poi.location) {
                    map.setZoom(15);
                    map.setCenter(e.poi.location);
                }
            }
            //下拉框选中聚集点跳转聚集点位置
            document.getElementById('markList').onchange=function(){
                if(resData.allGatheringPoint.length>0){
                    var vs = $('#markList').val();
                    map.remove(markerList); //清除聚集点，以便重新渲染聚集点
                    markerList=[];
                    resData.allGatheringPoint.forEach(item=>{
                        var startIcon
                        if(vs==item['member']){
                            map.setCenter([item['longitude'], item['latitude']]); //设置地图中心点
                            //将选中的聚集点图标替换成唯一标记图标
                            startIcon = new AMap.Icon({
                                // 图标尺寸
                                size: new AMap.Size(36, 36),
                                // 图标的取图地址
                                image: './images/marker-select.png',
                                // 图标所用图片大小
                                imageSize: new AMap.Size(36, 36)
                                // 图标取图偏移量
                                // imageOffset: new AMap.Pixel(-9, -3)
                            });
                        }else{
                            startIcon = new AMap.Icon({
                                // 图标尺寸
                                size: new AMap.Size(36, 36),
                                // 图标的取图地址
                                image: './images/marker.png',
                                // 图标所用图片大小
                                imageSize: new AMap.Size(36, 36)
                                // 图标取图偏移量
                                // imageOffset: new AMap.Pixel(-9, -3)
                            });
                        }
                        // 将 icon 传入 marker
                        var startMarker = new AMap.Marker({
                                position: new AMap.LngLat(item['longitude'],item['latitude']),
                                icon: startIcon,
                                offset: new AMap.Pixel(-18, -18),
                                title: item.member
                            });
                        markerList.push(startMarker)
                    })
                    map.add(markerList); //重新渲染聚集点
                }
            }
            //删除聚集点
            document.getElementById('delete').onclick = function(){
                var member=($("#markList").val()).trim()
                gatheringPointRemove({"member":member})
            }
            //获取聚集点周边车辆
            document.getElementById('getCalculate').onclick = function(){
                if(overlays.length==0){
                    return
                }
                var distance=($("#distanccePoint").val()).trim()
                calculateVehicleListByPoint({"distance":distance,"latitude":overlays[0].B.position.lat,"longitude": overlays[0].B.position.lng})
            }
            //下载列表
            document.getElementById('downLoad').onclick = function(){
                var member=($("#markList").val()).trim()
                var distance=($("#distanccePoint").val()).trim()
                downLoadFunc({"member":member,"distance":distance})
            }
            //根据VIN号定位车辆
            document.getElementById('vin').onkeydown = function(event){
                var e = event?event:window.event
                if(e.keyCode == 13){
                    var vin=($("#vin").val()).trim()
                    //查询vin号是否存在
                    var isExist=false;
                    for (var i = 0; i < pointsList.length; i += 1) {
                        if(vin && vin==pointsList[i].vin){
                            isExist=true;
                        }
                    }
                    if(isExist){
                        //渲染点集合（车辆点位展示）
                        markers = [];
                        addCluster(2,vin);   
                    }else{
                        Util.toast("VIN号不存在")
                    }  
                }
            }
            //根据经纬度设置中心点
            document.getElementById('degree').onkeydown = function(event){
                var e = event?event:window.event
                if(e.keyCode == 13){
                    var positionStr=($("#degree").val()).trim()
                    var position=positionStr.split(/\,|\，/)
                    if(position && position.length==2){
                        if(centerMarker){
                            map.remove(centerMarker);
                            centerMarker=null
                        } 
                        centerMarker = new AMap.Marker({
                            content: '<img width=30 height=30 src="./images/center.png" />',  // 自定义点标记覆盖物内容
                            position:  position, // 基点位置
                            offset: new AMap.Pixel(-15, -15) // 相对于基点的偏移位置
                        });
                        map.add(centerMarker);
                        map.setCenter(position); //设置地图中心点
                    }else{
                        Util.toast("请输入完整的经纬度")
                    }
                }
            }

            //为地图注册click事件获取鼠标点击出的经纬度坐标，右上角弹框结束

    }
    //请求数据
    //获取当前聚集点
    function allGatheringPoint() {
        var _this = this;
        Util.Fetch({
            url: Util.OPENAPI + '/vehicleGeo/allGatheringPoint',
            type: "GET",
            cbOk: function (res, textStatus, jqXHR) {
                // 创建一个 icon
                resData.allGatheringPoint=[]
                markerList=[]
                var markStr=''//聚集点下拉列表
                if(res&&res.data.length>0){
                    resData.allGatheringPoint=res.data;
                    var startIcon = new AMap.Icon({
                        // 图标尺寸
                        size: new AMap.Size(36, 36),
                        // 图标的取图地址
                        image: './images/marker.png',
                        // 图标所用图片大小
                        imageSize: new AMap.Size(36, 36)
                        // 图标取图偏移量
                        // imageOffset: new AMap.Pixel(-9, -3)
                    });
                    res.data.forEach(item=>{
                        // 将 icon 传入 marker
                        var startMarker = new AMap.Marker({
                            position: new AMap.LngLat(item['longitude'],item['latitude']),
                            icon: startIcon,
                            offset: new AMap.Pixel(-18, -18),
                            title: item.member
                        });
                        // startMarker.content = '<p>'+item.member+'</p>';
                        markerList.push(startMarker)
                        markStr+='<option value ='+item['member']+'>'+item['member']+'</option>'
                    })
                    document.getElementById("markList").innerHTML=markStr
                }
                //展示地图
                mapFn(pointsList,markerList)  
            }
        }, true);
    }
    //新增聚集点
    function gatheringPointAdd(data) {
        var _this = this;
        Util.Fetch({
            url: Util.OPENAPI + '/vehicleGeo/gatheringPointAdd',
            data: JSON.stringify(data),
            cbOk: function (res, textStatus, jqXHR) {
                init()
            }
        }, true);
    }
    //移除聚集点
    function gatheringPointRemove(data) {
        var _this = this;
        Util.Fetch({
            url: Util.OPENAPI + '/vehicleGeo/gatheringPointRemove',
            data: JSON.stringify(data),
            cbOk: function (res, textStatus, jqXHR) {
                init()       
            }
        }, true);
    }
    //获取指定坐标点、半径内的车辆 
    function calculateVehicleListByPoint(data) {
        var _this = this;
        Util.Fetch({
            url: Util.OPENAPI + '/vehicleGeo/calculateVehicleListByPoint',
            data: JSON.stringify(data),
            cbOk: function (res, textStatus, jqXHR) {
                document.getElementById("pointCar").value=res.data.length
            }
        }, true);
    }
    //获取所有车辆位置数据
    function allVehicleLocations() {
        Util.Fetch({
            url: Util.OPENAPI + '/vehicleGeo/allVehicleLocations',
            type: "GET",
            cbOk: function (res, textStatus, jqXHR) {
                if(res.code!=200){
                    window.location.href='./index.html'
                    return
                }
                pointsList=res.data   
                allGatheringPoint();
                $("#allCarNum").val(res.data.length)
            }
        }, true);
    }
    //下载列表
    function downLoadFunc(data){
        if(data && data.member && data.distance){
            var url=Util.OPENAPI + '/vehicleGeo/fetchSingleGatheringPointVehicles?member='+data.member+"&distance="+data.distance
            window.location.href=url
        }
    }
    //控制轮询
    document.getElementById("refreshBtn").onclick=function(){
        if($("#refreshBtn").val()==="关闭"){
            $("#refreshBtn").val("启动")
            clearInterval(t1)
        }else{
            $("#refreshBtn").val("关闭")
            t1=window.setInterval(init, 1000*60*3);
        }
    }
})(jQuery, window)

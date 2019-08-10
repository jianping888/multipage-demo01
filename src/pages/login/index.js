import "./index.scss";
import "../../assets/css/common.scss";
const Util = require("../../js/api.js");
// import "../../js/api.js";
(function ($, window) {
    document.getElementById("toLogin").onclick=function(){
        var userName=(document.getElementById("userName").value).trim();
        var passWord=(document.getElementById("password").value).trim();
        if(userName && passWord){
            loginFunc({"username":userName,"password":passWord})
        }
        
    }
    //登陆请求
    function loginFunc(data) {
        Util.Fetch({
            url: Util.OPENAPI + '/vehicleGeo/login',
            data: JSON.stringify(data),
            cbOk: function (res, textStatus, jqXHR) {
                if(res && res.code==200){
                    window.location.href='./index.html'
                }
            }
        }, true);
    }
})(jQuery, window)
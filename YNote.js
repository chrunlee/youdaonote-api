//--------
// 有道云笔记 Nodejs sdk
// @created by chrunlee
// @since 2018-05-21
//--------

//依赖模块
var qs = require('querystring'),
	request = require('superagent'),
	fs = require('fs');

// 
// 创建有道云SDK实例
// opts = {
// 	clientId : '',//申请的id
// 	clientSecret : '',//申请的密钥
//  oauthUrl : '',//申请的授权后回调地址
//	accessUrl : '',//申请的token回调地址
// }
//
function YNote( opts ){
	var _default = {
		state : 'state',
		display : 'web',
		responseType : 'code',
		grantType : 'authorization_code',
		//以下为有道笔记的api 地址，建议不要覆盖
		//有道笔记的oauth 授权地址
		_oauth_url : 'https://note.youdao.com/oauth/authorize2',
		//有道笔记的access token 获取地址
		_access_url : 'https://note.youdao.com/oauth/access2',
		//有道笔记的user api地址：获得用户信息
		_user_url : 'https://note.youdao.com/yws/open/user/get.json',
		//笔记本
		_notebook : {
			//有道笔记的notebook api 地址：获得所有的笔记本
			_list_url : 'https://note.youdao.com/yws/open/notebook/all.json',
			//有道笔记的note api 地址：获取笔记本下的所有笔记
			_note_url : 'https://note.youdao.com/yws/open/notebook/list.json',
			//有道笔记的create api 地址：创建笔记本
			_create_url : 'https://note.youdao.com/yws/open/notebook/create.json',
			//有道笔记的delete api地址：删除笔记
			_delete_url : 'https://note.youdao.com/yws/open/notebook/delete.json'
		},
		//笔记
		_note : {
			//有道笔记的create api 地址：创建笔记
			_create_url : 'https://note.youdao.com/yws/open/note/create.json',
			//有道笔记的get api 地址：查看笔记信息
			_get_url : 'https://note.youdao.com/yws/open/note/get.json',
			//有道笔记API ： 修改笔记内容
			_update_url : 'https://note.youdao.com/yws/open/note/update.json',
			//有道云笔记API ： 移动笔记到目标笔记本
			_move_url : 'https://note.youdao.com/yws/open/note/move.json',
			//有道云笔记API ：删除笔记
			_delete_url : 'https://note.youdao.com/yws/open/note/delete.json',
			//有道云笔记API：发布笔记/分享
			_publish_url :'https://note.youdao.com/yws/open/share/publish.json',
			//有道云笔记API：上传文件
			_upload_url : 'https://note.youdao.com/yws/open/resource/upload.json'
		}
	};
	this.config = Object.assign(_default,opts);
	// if(!this.config.clientId || !this.config.clientSecret || !this.config.oauthUrl){
	// 	throw new Error('缺少配置项:clientId/clientSecret/oauthUrl');
	// }
	return this;
}


YNote.prototype = {
	//返回数据
	getPromiseGET : function( url,exefn){
		return new Promise(function(resolve,reject){
			request.get(url)
			.then(function(rs){
				var rsObj = !rs || rs.text === '' ? {} : JSON.parse(rs.text);
				if(exefn)exefn(rsObj);
				resolve(rsObj);
			})
			.catch(function(e){
				reject(e);
			});
		});
	}
	,getPromisePOST : function(url,exefn){
		return new Promise(function(resolve,reject){
			request.post(url)
			.then(function(rs){
				var rsObj = !rs || rs.text === '' ? {} : JSON.parse(rs.text);
				if(exefn)exefn(rsObj);
				resolve(rsObj);
			})
			.catch(function(e){
				reject(e);
			});
		});
	}
	,getPromiseJSON : function(url,data,exefn){
		return new Promise(function(resolve,reject){
			request.post(url)
			.set('Content-type','application/x-www-form-urlencoded')
			.send(data)
			.then(function(rs){
				var rsObj = !rs || rs.text === '' ? {} : JSON.parse(rs.text);
				if(exefn)exefn(rsObj);
				resolve(rsObj);
			})
			.catch(function(e){
				reject(e);
			});
		});
	}
	,getPromiseMULTI : function(url,token,data,exefn){
		return new Promise(function(resolve,reject){
			request.post(url)
			.set('Content-Type','multipart/form-data')
			.set('Authorization','OAuth oauth_token="'+token+'"')
			.field(data)
			.then(function(rs){
				var rsObj = !rs || rs.text === '' ? {} : JSON.parse(rs.text);
				if(exefn)exefn(rsObj);
				resolve(rsObj);
			})
			.catch(function(e){
				reject(e);
			});
		});
	}
	,getPromiseFILE : function(url,token,filePath,exefn){
		return new Promise(function(resolve,reject){
			request.post(url)
			.set('Content-Type','multipart/form-data')
			.set('Authorization','OAuth oauth_token="'+token+'"')
			// .field(data)
			.attach('file',filePath)
			.then(function(rs){
				var rsObj = !rs || rs.text === '' ? {} : JSON.parse(rs.text);
				if(exefn)exefn(rsObj);
				resolve(rsObj);
			})
			.catch(function(e){
				reject(e);
			});
		});
	}
	//获得有道笔记的授权登录地址
	,getOAuthUrl : function(){
		var config = this.config;
		return config._oauth_url+'?client_id='+config.clientId+'&response_type='+config.responseType+'&redirect_uri='+config.oauthUrl+'&state='+config.state+'&display='+config.display;
	}
	//获得有道笔记请求access_token的地址
	,getAccessUrl : function( code ){
		var config = this.config;
		config._code = code;
		return config._access_url+'?client_id='+config.clientId+'&client_secret='+config.clientSecret+'&redirect_uri='+config.oauthUrl+'&grant_type='+config.grantType+'&code='+code;
	}
	//根据request 获得token
	,getToken : function( code ){
		var that = this,config = that.config;
		// 不应该缓存 access_token， 导致无法多个不同账号授权，而且没有返回 Promise 对象导致 getToken.then() 报错
		// if(config._access_token){
		// 	return config._access_token;
		// }
		if(!code && !config._code ){
			throw new Error('缺少配置项 code');
		}
		var accessUrl = that.getAccessUrl(code);
		return that.getPromiseGET(accessUrl,function(rsObj){
			if(rsObj.accessToken){
				config._access_token = rsObj.accessToken;
			}
		})
	}
	//获得用户信息
	,getUserInfo : function( token ){
		var that = this,config = this.config;
		return that.getPromiseGET(config._user_url+'?oauth_token='+token || config._access_token);
	}
	//获得
	,getAllNotebook : function( token ){
		var that = this,config = that.config;
		return that.getPromisePOST(config._notebook._list_url+'?oauth_token='+token || config._access_token)
	}
	//获得笔记本里的笔记所有笔记信息
	,getNoteOfBook(token,bookpath){
		var that = this,config = that.config;
		return that.getPromiseJSON(config._notebook._note_url,{
			'notebook':bookpath||'',
			'oauth_token':token || config._access_token
		});
	}
	//创建笔记本
	,createNotebook : function( token,name,createtime){
		var that = this,config = that.config;
		return that.getPromiseJSON(config._notebook._create_url,{
			'oauth_token' : token || config._access_token,
			'name' : name || '新建文件夹',
			'createtime' : createtime || ''
		});
	}
	//删除笔记本
	,deleteNotebook : function( token, notebookpath,modifyTime ){
		var that = this,config = that.config;
		return that.getPromiseJSON(config._notebook._delete_url,{
			'oauth_token' : token || config._access_token,
			'notebook' : notebookpath || '',
			'modify_time' : modifyTime || ''
		});
	}
	//创建笔记
	//note = {
	//  title : '',//string
	//	content : '',//string
	// 	author : '',//string
	//	source : '',//string
	// 	create_time : '',//number 单位为秒
	//	notebook : ''//string
	//}
	,createNote : function( token ,note ){
		var that = this,config = that.config;
		note = Object.assign({
			'oauth_token' : token ||config._access_token
		},note);
		if(!note.content){
			throw new Error('创建笔记缺少content内容');
		}
		return that.getPromiseMULTI(config._note._create_url,note.oauth_token,note)
	}
	//根据notepath 获得笔记的详细信息
	,getNote : function( token ,notepath ){
		var that = this,config = that.config;
		if(!notepath){
			throw new Error('笔记缺少路径');
		}
		return that.getPromiseJSON(config._note._get_url,{
			'oauth_token' : token || config._access_token,
			'path' : notepath
		});
	}
	//根据notepath 修改笔记内容
	,updateNote : function( token ,note ){
		var that = this,config = that.config;
		if(!note || !note.path || !note.content){
			throw new Error('更新笔记缺少path 或content数据')
		}
		return that.getPromiseMULTI(config._note._update_url,token || config._access_token,note);
	}
	//移动笔记到目标笔记本
	,moveNote : function( token,path,notebook){
		var that = this,config = that.config;
		return that.getPromiseJSON(config._note._move_url,{
			oauth_token : token || config._access_token,
			path : path,
			notebook : notebook
		});
	}
	//删除笔记
	,deleteNote : function(token,notepath){
		var that = this,config = that.config;
		return that.getPromiseJSON(config._note._delete_url,{
			oauth_token : token || config._access_token,
			path : notepath
		});
	}
	//分享笔记
	,publishNote : function(token,notepath){
		var that = this,config = that.config;
		return that.getPromiseJSON(config._note._publish_url,{
			oauth_token : token || config._access_token,
			path : notepath
		})
	}
	//上传
	,upload : function(token,filePath){
		var that= this,config= that.config;
		return that.getPromiseFILE(config._note._upload_url,token||config._access_token,filePath);
	}
	,download : function(token,url,filePath){
		var that = this,config = that.config;
		return new Promise(function(resolve,reject){
			request.get(url+'?oauth_token='+token)
			.then(function(res){
				fs.writeFile(filePath,res.body,function(){
					resolve(filePath);
				})
			})
			.catch(function(e){
				reject(e);
			})
		});
		

	}

};

module.exports = YNote;
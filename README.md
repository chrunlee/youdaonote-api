# youdaonote-api
有道云笔记-Nodejs 版本API 

# 概述
使用oauth2.0,访问有道云笔记API，对笔记、笔记本、资源进行操作。

# 参考
[有道云API](http://note.youdao.com/open/apidoc.html)

# 安装
首先在[http://note.youdao.com/open/developguide.html#app](http://note.youdao.com/open/developguide.html#app)申请自己的ConsumerKey，之后才可以使用。

然后安装模块`npm install ydnote`即可。

# 使用

```
var YNote = require('ydnote');

var youdao = new YNote({
	clientId : '',//申请的customerkey
	clientSecret : '',//申请的密钥
	oauthUrl : ''//申请的授权地址
});

//获得拼装后的授权地址，进行跳转
var oauthUrl = youdao.getOAuthUrl();

//用户授权后返回到授权地址，然后进行其他操作，注意：获得token后需要保存起来，进行判断，如果没有token或过期，需要重新获取(目前还没优化)
youdao.getToken(code)
.then(function(token){
	console.log(token);//获得token信息
})
.catch(function(e){
	console.log(e);//报错
})

//获得用户信息

youdao.getUserInfo(token).then(function(userInfo){
	console.log(userInfo);
})

// 获得所有的笔记本信息
youdao.getAllNotebook(token).then(function( bookList ){
 	console.log(`笔记本个数有：${bookList.length}`);
}).catch(function(e){
 	console.log(e.status);
 	console.log(e.message);
 	console.log(e.response.text)
})


//获得笔记本内的所有笔记信息
youdao.getNoteOfBook(token,'/513BEFD144B84F28923AE83B09BB3DF2').then(function( noteList ){
	console.log(`笔记个数有：${noteList.length}`);
}).catch(function(e){
	console.log(e.status);
	console.log(e.message);
})

//创建文件夹和删除
youdao.createNotebook(token,'API创建笔记本').then(function(rsObj){
	console.log('笔记本创建成功:'+rsObj.path);
	return youdao.deleteNotebook(token,rsObj.path);
}).then(function(){
	console.log('笔记本删除成功')
}).catch(function(e){
	console.log(e.status);
	console.log(e.message);
	console.log(e);
})


//创建笔记
youdao.createNote(token,{
	content : '<html><body><p style="color:red">笔记创建测试</p></body></html>',
	// content : 'aaa',
	title : '测试'
}).then(function(rsObj){
	console.log(rsObj);
//获得笔记信息
	return youdao.getNote(token,rsObj.path);
})
.then(function(rsObj){
	console.log(rsObj);
//更新笔记
	return youdao.updateNote(token,{
		path : rsObj.path,
		content : '修改'
	})
})
.then(function(rsObj){
	console.log(rsObj);
//移动笔记
	return youdao.moveNote(token,rsObj.path,'/513BEFD144B84F28923AE83B09BB3DF2')
})
.then(function(rsObj){
	console.log(rsObj);
//删除笔记
	return youdao.deleteNote(token,rsObj.path)
})
.then(function(rsObj){
	console.log(rsObj);
//分享笔记
	return youdao.publishNote(token,rsObj.path);
})
.then(function(rsObj){
	console.log(rsObj);
})
.catch(function(e){
	console.log(e.status);
	console.log(e.message);
	console.log(e.response.text);
})

//文件上传
youdao.upload(token,__dirname+'/test.js')
.then(function(rsObj){
	console.log(rsObj);
})
.catch(function(e){
	console.log(e);
})

//文件下载
youdao.download(token,'https://note.youdao.com/yws/open/resource/download/20114/140BC634A1D9455DAC1E0BFBBD7894C5','/home/test.js')
.then(function(rs){
	console.log(rs);
})
.catch(function(e){
	console.log(e);
})
```

# 说明
目前是第一版，还没有进行测试和优化，应该会有好多问题，欢迎各位拍砖。

#LICENSE 
MIT
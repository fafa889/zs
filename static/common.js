var MAC = {
	'History': {
		'Limit':20,
		'Days':3,
		'Json': '',
		'Display': true,
		'List': function($id){
			if($("#"+$id).length==0){ return; }
			this.Create($id);
			$('#'+$id).hover(function(){
				MAC.History.Show();
			}, function(){
				MAC.History.FlagHide();
			});
		},
		'Clear': function(){
			MAC.Cookie.Del('mac_history');
			$('#history_box').html('<li class="hx_clear">已清空观看记录。</li>');
		},	
		'Show': function(){
			$('#history_box').show();
		},
		'Hide': function(){
			$('#history_box').hide();
		},
		'FlagHide': function(){
			$('#history_box').hover(function(){
				MAC.History.Display = false;
				MAC.History.Show();
			}, function(){
				MAC.History.Display = true;
				MAC.History.Hide();
			});
			if(MAC.History.Display){
				MAC.History.Hide();
			}
		},
		'Create': function($id){
			var jsondata = [];
			if(this.Json){
				jsondata = this.Json;
			}else{
				var jsonstr = MAC.Cookie.Get('mac_history');
				if(jsonstr != undefined){
					jsondata = eval(jsonstr);
				}
			}
			html = '<dl class="drop-box history_box" id="history_box" style="display:none;position:absolute;">';
			html +='<dt>超过30条记录请 -> | <a target="_self" href="javascript:void(0)" onclick="MAC.History.Clear();">清空</a></dt>';
			if(jsondata.length > 20){
				MAC.Cookie.Del('mac_history');
				MAC.History.Clear();
			}
			if(jsondata.length > 0){
				for($i=0; $i<jsondata.length; $i++){
					if($i%2==1){
						html +='<dd class="odd">';
					}else{
						html +='<dd class="even">';
					}
					console.log(jsondata[$i].link);
					html +='<a href="'+jsondata[$i].link+'" class="hx_title" title="'+jsondata[$i].name+'">'+jsondata[$i].name+'</a></dd>';
				}
			}else{
				html +='<dd class="hx_title">暂无观看记录</dd>';
			}
			html += '</dl>';
			$('#'+$id).after(html);
			var w = $('#'+$id).width();
			var h = $('#'+$id).height();
			var position = $('#'+$id).position();
			$('#history_box').css({'left':position.left,'top':(position.top+h)});
		},	
		'Insert': function(name,link){
			var jsondata = MAC.Cookie.Get('mac_history');
			if(jsondata != undefined){
				this.Json = eval(jsondata);
				for($i=0;$i<this.Json.length;$i++){
					if(this.Json[$i].link == link){
						return false;
					}
				}
				if(!link){ link = document.URL; }
				jsonstr = '{video:[{"name":"'+name+'","link":"'+link+'"},';
				for($i=0; $i<=this.Limit; $i++){
					if(this.Json[$i]){
						jsonstr += '{"name":"'+this.Json[$i].name+'","link":"'+this.Json[$i].link+'"},';
					}else{
						break;
					}
				}
				jsonstr = jsonstr.substring(0,jsonstr.lastIndexOf(','));
				jsonstr += "]}";
			}else{
				jsonstr = '{video:[{"name":"'+name+'","link":"'+link+'"}]}';
			}
			this.Json = eval(jsonstr);
			MAC.Cookie.Set('mac_history',jsonstr,this.Days);
		}
	},
	'Cookie': {
		'Set': function(name,value,days){
			var exp = new Date();
			exp.setTime(exp.getTime() + days*24*60*60*1000);
			var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
			document.cookie=name+"="+escape(value)+";path=/;expires="+exp.toUTCString();
		},
		'Get': function(name){
			var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
			if(arr != null){ return unescape(arr[2]); return null; }
		},
		'Del': function(name){
			var exp = new Date();
			exp.setTime(exp.getTime()-1);
			var cval = this.Get(name);
			if(cval != null){ document.cookie = name+"="+escape(cval)+";path=/;expires="+exp.toUTCString(); }
		}
	},
	'Hits': function(tab, id) {
		$.get(SitePath + "inc/ajax.php?ac=hits&tab=" + tab + "&id=" + id, function(r) {$('#hits').html(r)})
	},	
	'UserFav':function(id){
		$.get(SitePath+"inc/ajax.php?ac=userfav&id="+id+"&rnd="+Math.random(),function(r){
			if(r=="ok"){ Swal.fire({text:'会员收藏成功！',type:'success',showConfirmButton:false,timer:1500}); }
			else if(r=="login"){ Swal.fire({text:'请先登录后再进行会员收藏操作！',type:'success',showConfirmButton:false,timer:1500}); }
			else if(r=="haved"){ Swal.fire({text:'您已经收藏过了！',type:'success',showConfirmButton:false,timer:1500}); }
			else{ Swal.fire({text:'发生错误！',type:'success',showConfirmButton:false,timer:1500}); }
		});  
	},
	'Au_q': function() {
			Swal.fire({
				position:'top',
				imageUrl: 'https://ae01.alicdn.com/kf/HTB1OE7kbECF3KVjSZJn762nHFXas.png',
				title: '找回密码须知',
				html: '<b style="color:#000">1.需要提供正确的用户名、邮箱、QQ等三个必要条件<br><br>若不能提供请联系管理员人工找回密码</b>',
				background: '#fff',
				allowOutsideClick: false,
				reverseButtons: true,
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				animation: true,
				confirmButtonText: '在线找回',
				cancelButtonText: '人工找回',
				footer:'<span class="glyphicon glyphicon-tags"> 遇到问题请联系管理员 QQ；3324219893</span>'
			}).then((result) => {
				if (result.value) {
					MAC.Forgot()
				} else if (result.dismiss === Swal.DismissReason.cancel) {
					swal.fire({title:'请添加管理员QQ',html:'管理员QQ 3324219893'})
				}
			})
	},	
	'Out': function() {
		$.ajax({type: 'get',url: SitePath + '?m=user-logout',timeout: 1000,
			success: function() {
				Swal.fire({
					text: '您已退出登录！',
					type: 'success',
					showConfirmButton: true,
					timer: 700
				});
				location.href = location.href;
			}
		});
	},
	'Forgot': function() {
 		var reg = RegExp('/IF|INI|CHR|get|post|request|cookie|server|eval|assert|fputs|fopen|global|chr|strtr|pack|system|gzuncompress|shell|base64|file|proc|preg|call|ini|:php|print|if|parse|replace|substr/g');
		var ifup = /^(?=.*\d+.*)(?=.*[a-z]+.*)[\da-z_]{5,17}$/;
		swal.mixin({
			position:'top',
			showCloseButton: true,
			showCancelButton: false,
			focusConfirm: false,
			allowOutsideClick: false,
			buttonsStyling: false,
			customClass: {confirmButton: 'btn btn-success btn-block'},			
 			imageUrl: 'https://ae01.alicdn.com/kf/HTB1OE7kbECF3KVjSZJn762nHFXas.png',
			confirmButtonText: '下一步',
 			progressSteps: ['1', '2', '3','4'],
			footer:'<span class="glyphicon glyphicon-tags"> 遇到问题请联系管理员 QQ；3324219893</span>'
 		}).queue([{
 			input: 'text',
 			title: '密码找回',
 			html: '<strong><a>请输入要找回的用户名</a></strong>',
            preConfirm: (name) => {
			    if(name.match(reg)){
					swal.showValidationMessage('账号包含特殊字符 正确示例[abc123]字母加数字');
					return false
				};             
				return fetch(`/?m=user-regcheck-t-u_name-s-${name}`)
                    .then(response => response.json())
					.then(function(data) {
					    if(data.res == false){
							console.log('true')
					    } else {
						    swal.showValidationMessage('未查询到您的账号')
						}
					})    
			}
 		}, {
 			input: 'password',
 			title: '密码找回',
			html: '<strong><a>请输入新密码(设置的密码要牢记哦)</a></strong>',
 			preConfirm: function(passwd) {
			    if(passwd.match(reg)){
					swal.showValidationMessage('密码请大于6小于15位 例:qwe123 wsxc_1234');
					return false
				};
				if (!passwd.match(ifup)) {
					swal.showValidationMessage('密码请大于6小于15位 例:qwe123 wsxc_1234<br><strong><a>用户密码必须字母开头加数字组合 看左边示例</a></strong>');
					return false				
				};
 			}
 		}, {
 			input: 'email',
 			title: '密码找回',
			html: '<strong><a>请输入您注册时的邮箱地址</a></strong>',
            preConfirm: (email) => {                
			    if(email.match(reg)){
					swal.showValidationMessage('邮箱地址包含特殊字符 请使用QQ邮箱重试');
					return false
				};				
				return fetch(`/?m=user-regcheck-t-u_email-s-${email}`)
                    .then(response => response.json())
					.then(function(data) {
					    if(data.res == false){
							console.log('true')
					    } else {
						    swal.showValidationMessage('未查询到您的邮箱')
						}						
					})    
			}			
 		}, {
 			input: 'text',
 			title: '密码找回',
			html: '<strong><a>请输入您注册时的QQ号</a></strong>',
            preConfirm: (qq) => {                
			    if(qq.match(reg)){
					swal.showValidationMessage('QQ地址包含特殊字符 请重新输入');
					return false
				};				
				return fetch(`/?m=user-regcheck-t-u_qq-s-${qq}`)
                    .then(response => response.json())
					.then(function(data) {
					    if(data.res == false){
							console.log('true')
					    } else {
						    swal.showValidationMessage('未查询到您的QQ号')
						}
					})    
			}
 		}]).then(function(result) {
 			if (result.value) {
 				swal.showLoading();
 				$.post(SitePath + '?m=user-forgot',{
 					flag: 'center',u_name: result.value[0],u_password: result.value[1],u_email:result.value[2],u_qq:result.value[3],u_phone:result.value[4],
 				}, function(data) {
 					if ('success' == data) {
							Swal.fire({
								imageUrl: 'https://ae01.alicdn.com/kf/HTB1OE7kbECF3KVjSZJn762nHFXas.png',
								html: '<b>找回密码成功 请牢记新密码！</b> '+'<a onclick="MAC.Login();"> 点我登录</a>',
								type: 'success',
								allowOutsideClick: false,
								confirmButtonText: '立即登录',
								showConfirmButton: true,
							}).then((result) => {
						        if (result.value) {
						            MAC.Login();
						        }
							})
 					} else if ('fan err' == data) {
							Swal.fire({
								text: '系统繁忙，请稍后重试!',
								type: 'warning',
								showConfirmButton: true,
							})
 					} else if ('error' == data) {
							Swal.fire({
								text: '找回密码失败！联系管理员QQ 3324219893',
								type: 'warning',
								showConfirmButton: true,
							})	
 					} else if ('texterr' == data) {
							Swal.fire({
								text: '表单信息不完整,请重填！',
								type: 'warning',
								showConfirmButton: true,
							})							
 					} else {
							Swal.fire({
								text: '未知错误！联系管理员QQ 3324219893',
								type: 'warning',
								showConfirmButton: true,
							})
 					}
 				})
 			}
 		});
	},
	'Regup': function () {
 		var reg = RegExp('/IF|INI|CHR|get|post|request|cookie|server|eval|assert|fputs|fopen|global|chr|strtr|pack|system|gzuncompress|shell|base64|file|proc|preg|call|ini|:php|print|if|parse|replace|substr/g');
		var ifup = /^(?=.*\d+.*)(?=.*[a-z]+.*)[\da-z_]{5,17}$/;
		swal.mixin({
			position:'top',
			showCloseButton: true,
			showCancelButton: false,
			focusConfirm: false,
			allowOutsideClick: false,
			buttonsStyling: false,
			customClass: {confirmButton: 'btn btn-success btn-block'},			
 			imageUrl: 'https://ae01.alicdn.com/kf/HTB1OE7kbECF3KVjSZJn762nHFXas.png',
			confirmButtonText: '下一步',
 			progressSteps: ['1', '2', '3','4', '5'],
			footer:'<span class="glyphicon glyphicon-tags"> 注册中遇到问题请联系管理员 QQ；3324219893</span>'

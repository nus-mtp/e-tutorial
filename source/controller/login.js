var rest = require ('rest');
var auth = require ('../auth');
var app = require ('../../app');
var models = require ('../../models');
var User = models.User;
var Avatar = models.Avatar;

var protocol = 'https';
var usehttps = app.get('use-https');

var ivleToken;

if (!usehttps) {
	protocol = 'http';
}

var get = function (req, res, next) {
	var auth = req.body.auth;
	console.log(1);
	console.log(auth);
	if (auth.success) {
		res.redirect('/')
	}
	res.redirect('https://ivle.nus.edu.sg/api/login/?apikey=' + app.get('api-key') + '&url=' + protocol + '://' + app.get ('server-ip') + ':' + app.get('server-port') + '/login/callback');
}

// Callback function fter IVLE login
var callback = function (req, res, next) {
	var ivleToken = req.query.token;
	var apikey = app.get ('api-key');

	//view profile
	rest ('https://ivle.nus.edu.sg/api/Lapi.svc/Profile_View?APIKey=' + apikey + '&AuthToken=' + ivleToken).then (function (response) {

		var result = JSON.parse (response.entity).Results[0];

		if (result != undefined) {
			result.Token = ivleToken;

			User.findOne({
				where:{
					id: result.UserID
				}
			}).then(function(user){
				if (!user){
					User.create({
						id: result.UserID,
						name: result.Name,
						email: result.Email,
						gender: result.Gender,
						token: result.Token,
						avatarId: 'avatar-01'
					}).then(function(user){
						var authToken = auth.setAuth (result.UserID, result.Name);
						user.addAvatar('avatar-01');
						user.addTutorial('general-chat', {
								role: 'tutor',
								exp: 0
								}
						);
						//dataValues.info(result.UserID + ' created user');
						res.cookie('token', authToken);
						return res.redirect('/');
					}).catch(function(err){
						//logger.error(result.UserID + ' create user failed');
						return res.json({success:false, at:'Create user', message:err});
					});
				} else {
					console.log('updating user');
					User.update({
						token: result.Token
					},{
						where:{
							id:result.UserID
						}
					}).then(function(user){
						var authToken = auth.setAuth (result.UserID, result.Name);
						//logger.info(result.UserID + ' updated user information');
						res.cookie('token', authToken);
						return res.redirect('/dashboard');
					}).catch(function(err){
						//logger.error(result.UserID + ' update user information failed');
						console.log(err.stack);
						return res.json({success:false, at:'Update user information', message:err});
					});
				}	
			});
		}
		else {
			//logger.error('Sync IVLE user information failed, cannot resolve IVLE information');
			return res.json({success: false, at:'Sync IVLE user information', message:'cannot resolve IVLE information'});
		}
	}).catch(function(err){
		//logger.error('Sync IVLE user information failed, cannot connect IVLE');
		console.log(err);
		return res.json({success: false, at:'Sync IVLE user information', message:'cannot connect IVLE'});
	})
};

//Avatar.findOne({ where: { id: 'avatar-01' } }).then(function (result) { console.log(result); });
//User.findOne({ where: { id: 'a0127127' } }).addAvatar(Avatar.findOne({ where: { id: 'avatar-01' } }));

module.exports.get = get;
module.exports.callback = callback;
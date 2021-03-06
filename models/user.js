'use strict';

var models = require('./');

module.exports = function(sequelize, DataTypes) {

	var User = sequelize.define('User', {
		id: {
			type: DataTypes.STRING,
			unique: true,
			primaryKey: true,
			validate: {
				notEmpty: true,
				isUnique: function(value, next) {
					User.find({
						where: {
							id: value
						}
					}).then(function (user) {
						if (user) {
							return next ('User already exists!');
						}
						return next ();
					}).catch(function (err) {
						return next (err);
					});
				}
			}
		},
		name: { type: DataTypes.STRING },
		email: { type: DataTypes.STRING },
		gender: { type: DataTypes.ENUM('Male', 'Female') },
		token: { type: DataTypes.STRING(511) },
		avatarId: { type: DataTypes.STRING },
		levelsSpent: { type: DataTypes.INTEGER }
	}, {
		classMethods: {
			associate: function(models) {
        		User.belongsToMany(models.Tutorial, {
        			through: 'userTutorial'
        		});
        		User.belongsToMany(models.Avatar, {
        			through: 'userAvatar'
        		});
    		}
    	}		
	}, {
		instanceMethods: {
			toJSON: function () {
				var values = this.get();
				delete values.token;
				return values;
			}
		}
    });

	return User;
};
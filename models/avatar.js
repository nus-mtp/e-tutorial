"use strict";

var models = require('./');

module.exports = function (sequelize, DataTypes) {

	var Avatar = sequelize.define('Avatar', {
		id: {
			type: DataTypes.STRING,
			unique: true,
			primaryKey: true
		},
		name: { type: DataTypes.STRING },
		price: { type: DataTypes.INTEGER },
		url: { type: DataTypes.STRING }
	}, {
		classMethods: {
			associate: function (models) {
				Avatar.belongsToMany(models.User, {
					through: 'userAvatar'
				});
			}
		}
	});

	return Avatar;

}
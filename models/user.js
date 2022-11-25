const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      email: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      provider: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'local',
      },
    }, {
      sequelize,
      timestamps: true,// 이 속성이 true면, createAt(생성시간), updateAt(수정시간) 필드가 자동생성된다
      underscored: false,
      modelName: 'User',
      tableName: 'users',
      paranoid: false,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.User.hasMany(db.Codi_image,{sourceKey:'id'});
    db.User.hasMany(db.Schedule,{sourceKey:'id'});
    db.User.hasOne(db.Preference,{sourceKey:'id'});
  }
};
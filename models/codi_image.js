const Sequelize = require('sequelize');

module.exports = class Codi_image extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      image_path: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Codi_image',
      tableName: 'codi_images',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Codi_image.belongsTo(db.User, {targetKey:'id'});

  }
};
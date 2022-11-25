const Sequelize = require('sequelize');

module.exports = class preference extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            preferred_type: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            preferred_color: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            price_max: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            shopping_term: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            open_to_newstyle: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATEONLY,
                allowNull: true,
                defaultValue: Sequelize.NOW,
            },
        }, {
            sequelize,
            timestamps: false,
            // 원래는 true다.
            // createdAt, updatedAt 의 좋은점은 생성할때 자동으로 현재시간이 됨
            // timestamp true로 하면 생기는일
            underscored: false,
            modelName: 'preference',
            tableName: 'preferences',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }
    static associate(db) {
        db.Preference.belongsTo(db.User, {targetKey:'id'});
      }

}
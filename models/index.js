const Sequelize = require('sequelize');

const User = require('./user');
const Schedule = require('./schedule');
const Codi_image = require('./codi_image');
const Preference = require('./preference');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

// 시퀄라이저 연결객체
const sequelize = new Sequelize(config.databse, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User=User;
db.Schedule=Schedule;
db.Codi_image=Codi_image;
db.Preference=Preference;

User.init(sequelize);
Schedule.init(sequelize);
Codi_image.init(sequelize);
Preference.init(sequelize);

User.associate(db);
Schedule.associate(db);
Codi_image.associate(db);
Preference.associate(db);

module.exports = db;


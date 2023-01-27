const Sequelize = require('sequelize');
//이때 생성자 함수에 db이름 username, password등 필요함
const sequelize = new Sequelize('node-complete', 'root', '3d720307', {
  dialect: 'mysql', host: 'localhost'
});


module.exports = sequelize;
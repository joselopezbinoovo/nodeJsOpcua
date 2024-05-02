const {DataTypes}= require('sequelize');
const sequelize = require('../models/index.js').sequelize;
const entity = require('./entityModel');

const serverConnection= sequelize.define("ServerConnection", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      connectionString: {
        type: DataTypes.STRING
      },
      socketTag: {
        type: DataTypes.STRING
      },
  },{
    timestamps:false,
    freezeTableName: true
  });

  serverConnection.hasMany(entity,{
    foreignKey:"id_serverConn",
    sourceKey:"id"
  })
  entity.belongsTo(serverConnection, { foreignKey: "id_serverConn", targetId: "id" });


module.exports = serverConnection;
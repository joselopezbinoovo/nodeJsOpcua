const {DataTypes}= require('sequelize');
const sequelize = require('../models/index.js').sequelize;


  const producto = sequelize.define("OpcUas", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    variableString: {
      type: DataTypes.STRING,
    },
    variableName: {
      type: DataTypes.STRING
    },
    conectionString: {
      type: DataTypes.STRING,
    }
  },{
    timestamps:false,
    freezeTableName: true
  });
module.exports = producto;
 
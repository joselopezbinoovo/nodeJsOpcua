const {DataTypes}= require('sequelize');
const sequelize = require('../models/index.js').sequelize;


  const valorPLC = sequelize.define("ValoresPLC", {
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
    },
    id_variable:{
      type: DataTypes.INTEGER

    }
  },{
    timestamps:false,
    freezeTableName: true
  });
module.exports = valorPLC;
 
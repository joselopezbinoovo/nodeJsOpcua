const {DataTypes}= require('sequelize');
const sequelize = require('../models/index.js').sequelize;
const valorPLC = require('./VariablePlcModel.js');

const variables = sequelize.define("Variables",{
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  selected:{
    type:DataTypes.BOOLEAN
  },
  des_variable: {
    type: DataTypes.STRING
  },
  image: {
    type: DataTypes.STRING
  },
  unidad: {
    type: DataTypes.STRING
  },
  monitoring: {
    type:DataTypes.BOOLEAN
  } 
    
  },{
    timestamps:false,
    freezeTableName: true
  });

  variables.hasOne(valorPLC, {
    foreignKey: 'id_variable',
    onDelete:'CASCADE'    
  });
  valorPLC.belongsTo(variables, {
    foreignKey: 'id_variable'
  });


  module.exports = variables;


const {DataTypes}= require('sequelize');
const sequelize = require('../models/index.js').sequelize;
const variables = require('../modelos/variablesModel.js');


const entity = sequelize.define("Entity", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      desc_entity: {
        type: DataTypes.STRING
      },
      image: {
        type: DataTypes.STRING
      },
      state:{
        type: DataTypes.BOOLEAN
      },
      order:{
        type:DataTypes.INTEGER,
      }
  },{
    timestamps:false,
    freezeTableName: true
  });


  entity.hasMany(variables,{
    foreignKey:"id_entity",
    sourceKey:"id"
  })
  variables.belongsTo(entity, { foreignKey: "id_entity", targetId: "id" });


  module.exports = entity;

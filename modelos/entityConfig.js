const {DataTypes}= require('sequelize');
const sequelize = require('../models/index.js').sequelize;
const entity = require('../modelos/entityModel.js');

const entityConfig = sequelize.define("EntityConfig", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
   /*    id_entity: {
        type: DataTypes.INTEGER
      }, */
      textColor: {
        type: DataTypes.STRING
      },
      bgColor: {
        type: DataTypes.STRING
      },
  },{
    timestamps:false,
    freezeTableName: true
  });


  entity.hasOne(entityConfig, {
    foreignKey: 'entity_id',
    onDelete:'CASCADE'    
  });
    entityConfig.belongsTo(entity, {
    foreignKey: 'entity_id'
  });




  

  module.exports = entityConfig
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OpcUa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OpcUa.init({
    variableString: DataTypes.STRING,
    variableName: DataTypes.STRING,
    conectionString: DataTypes.STRING,
    id_variable:DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'ValoresPLC',
  });
  return OpcUa;
};
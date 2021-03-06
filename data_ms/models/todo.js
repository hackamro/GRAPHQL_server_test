const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('todos', {
        name: { type: DataTypes.STRING(50) },
        description: { type: DataTypes.STRING(255) },
        validation: { type: DataTypes.INTEGER },
        money_costs: { type: DataTypes.DOUBLE },
        money_received: { type: DataTypes.DOUBLE }
    });
};

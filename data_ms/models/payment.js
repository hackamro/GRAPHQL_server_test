const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('payments', {
        description: {
            type: DataTypes.STRING(255)
        },
        money_paid: {
            type: DataTypes.DOUBLE
        }
    });
};
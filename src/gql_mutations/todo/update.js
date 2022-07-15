const { GraphQLID, GraphQLNonNull, GraphQLString, GraphQLList, GraphQLInt, GraphQLObjectType } = require('graphql')
const {todo_controller} = require('../../local_library');

module.exports = {
    type: GraphQLString,
    args: {
        id: { type: GraphQLID },
        name:{ type: GraphQLString },
        description: { type: GraphQLString },
        validation: { type: GraphQLInt },
        employeeId: { type: GraphQLID },
        customerId: { type: GraphQLID }
    },
    resolve: (
        root,
        args,
        { decoded:decoded, attributes:attributes }
        ,info 
        )=> {
        // -------------------------------------------------------------------- 
        if(! args.hasOwnProperty('id') ) throw new Error("id : is required");
        // -------------------------------------------------------------------- 
        console.log(decoded)//return id of user
        args.userId = decoded.id;
        return   todo_controller.update(args,attributes);
    }
}
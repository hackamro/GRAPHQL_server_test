﻿//-------------- public library
const { createServer } = require("http");
const { applyMiddleware } = require('graphql-middleware')
const { ApolloServer} = require("apollo-server-express");

//--------------
const express = require("express");
const attributesSelected = require('graphql-fields')
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');

//-------------- WS
const { ApolloServerPluginDrainHttpServer }  = require("apollo-server-core");
const { useServer } = require('graphql-ws/lib/use/ws')
const { WebSocketServer } = require('ws')

//-------------- local library
const {Token_Verifay} = require('../my_utils/_token')
pubsub = require('../my_utils/_pubsub');
const schema = require('./gql_schema');

//-------------- config
const graphql_path = '/gql';
const APOLLO_SERVER_PORT = process.env.APOLLO_SERVER_PORT;

//-------------- Middlewares
const Attributes_GraphqlMiddleware = async (resolve, root, args, context, info) => {
    try {
        context.attributes = Object.keys(attributesSelected(info));
    } catch (error) {
        console.log({ "ERROR : Attributes_GraphqlMiddleware : ": error.message });
    }
    const result = await resolve(root, args, context, info)
    return result
}

//-------------- Middlewares

async function Token_GraphqlMiddleware(resolve, root, args, context, info) {
	context.decoded = Token_Verifay(context.token,info.fieldName)
    if(context.decoded.id == null) throw new Error('ERROR : Token_GraphqlMiddleware .')
	return await resolve(root, args, context, info)
}

//-------------- RUN

async function run () {
    const app = express();
    const httpServer = createServer(app);

    const wsServer = new WebSocketServer({
        // path: graphql_path,
        server: httpServer,
    });
    const serverCleanup = useServer({ schema }, wsServer);
    //
    var IMAGES_DIR = './images/'
    app.use(express.static(IMAGES_DIR))
    //
    app.use(graphqlUploadExpress());
    //
    const schemaWithMiddleware = applyMiddleware(schema, Attributes_GraphqlMiddleware,Token_GraphqlMiddleware)
    // 
    const server = new ApolloServer({
        csrfPrevention: false,
        uploads: false,
        schema:schemaWithMiddleware,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
              async serverWillStart() {
                return {
                  async drainServer() {
                    await serverCleanup.dispose();
                  },
                };
              },
            },
          ],
        context: (ctx) => {
            //console.log('-------------------- ApolloServer : context: Object.keys(ctx) : --------  ',Object.keys(ctx))
            const token = ctx?.req?.headers?.authorization || '';
            return {token:token}
         },
         formatError: (err) => {
            return err.message;
        }
    });
    await server.start();
    server.applyMiddleware({ app,path: graphql_path,});
    //---------------------------------------------------------------- WS
    useServer({
        schema,
        context: (ctx, msg, args) => {
            // console.log('-------------------- context useServer : Object.keys(ctx) : --------  ',Object.keys(ctx))
            const token = ctx?.connectionParams?.Authorization || ''
            var decoded = Token_Verifay(token,'') ;
            return {decoded:decoded}; 
        },
        onConnect: async (ctx) => {
            // console.log('-------------------- onConnect useServer Object.keys(ctx) : ',Object.keys(ctx))
            const token = ctx?.connectionParams?.Authorization || ''
            decoded = Token_Verifay(token,'')
            console.log('-------------------- server : disconnected .')
            if(decoded.id == null) return false; // return false to sertver disconnect ro throw new Error('')
        },
        onDisconnect(ctx, code, reason) {
            // console.log('-------------------- onDisconnect useServer .')
        },
    },
    wsServer,
    );

    const PORT = Number(APOLLO_SERVER_PORT);
    httpServer.listen(PORT, () => {console.log(
    `ws://localhost:${PORT}${server.graphqlPath}\
     and\
     http://localhost:${PORT}${server.graphqlPath}`
    );
    });
};

run();

console.log('end')
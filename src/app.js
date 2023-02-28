require("dotenv").config();
const express = require('express');
const app  = express() ;
const port = process.env.PORT || 4000; 
const { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const graphQlSchema = require("./Schema/Schema");
 const graphQlResolvers = require("./resolver/index");
var schema = require('./graphql/bookSchemas')
const mongoose = require("mongoose").set("strictQuery", true);
const mongoDB_url = process.env.mongodb_url;
const cors = require("cors") ;
app.use(express.json()) ;
app.use('*', cors());
 
//database connection start with mongoDB 

const options = { useNewUrlParser: true, useUnifiedTopology: true  }
mongoose
  .connect(mongoDB_url, options)
  .then(() =>  console.log("Successfully connected with mongoDB !! "))
  .catch(error => {
    throw error
  });

//graphQL connectin 

app.use('/books', cors(), graphqlHTTP({
  schema: schema,
  rootValue: global,
  graphiql: true,
}));

//

app.use(
    "/grpahql",  cors() ,
    graphqlHTTP({
      schema: graphQlSchema,
      rootValue:  graphQlResolvers,
      graphiql:true,
    })
) ; 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const client = new MongoClient(mongoDB_url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const booksCollection = client.db("test").collection("books");
app.get("/bookData/:id" , async (req ,res) => {
const id = req.params.id ;
const resut = await booksCollection.findOne({_id: new ObjectId(id)}) ;
res.status(201).send(resut) ;
})

//database connection end with mongoDB 

app.get("/", (req, res) => {
    res.send("This is home page")
}); 

 // >>----------------->>

app.listen(port, (req, res) => {
    console.log(`Server runing on port number: ${port}`);
});















// const { MongoClient, ServerApiVersion } = require('mongodb');
// const client = new MongoClient(mongoDB_url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//   const booksCollection = client.db("book-store").collection("bookss");
//database connection start with mongoDB 

// const options = { useNewUrlParser: true, useUnifiedTopology: true  }
// mongoose
//   .connect(mongoDB_url, options)
//   .then(() =>  console.log("Successfully connected with mongoDB !! "))
//   .catch(error => {
//     throw error
//   }) 

// // Construct a schema, using GraphQL schema language
// var schema = buildSchema(`
//   type Query {
//     hello: String
//   }
// `);

// // The root provides a resolver function for each API endpoint
// var root = {
//   hello: () => {
//     return 'Hello world!';
//   },
// };


// app.use('/graphql', graphqlHTTP({
//   schema: schema,
//   rootValue: root,
//   graphiql: true,
// }));


// app.post("/books" , async (req ,res) => {
// const data = req.body ;
// const result = await booksCollection.insertOne(data) ;
// res.send(result) ;
// });
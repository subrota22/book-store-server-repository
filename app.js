require("dotenv").config();
const express = require('express');
const app  = express() ;
const port = process.env.PORT || 4000; 
const { graphqlHTTP } = require('express-graphql');
const mongoose = require("mongoose").set("strictQuery", true);
const mongoDB_url = process.env.mongodb_url;
const cors = require("cors") ;
//book schema
var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInt = require('graphql').GraphQLInt;
var GraphQLDate = require('graphql-date');
//
app.use(express.json()) ;
app.use('*', cors());

//

//database connection start with mongoDB 

const options = { useNewUrlParser: true, useUnifiedTopology: true  }
mongoose
  .connect(mongoDB_url, options)
  .then(() =>  console.log("Successfully connected with mongoDB !! "))
  .catch(error => {
    throw error
  });




//database connection start with mongoDB 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const client = new MongoClient(mongoDB_url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const booksCollection = client.db("test").collection("books");

// database connection start with mongoDB  

 //book shema start <<---------------------<<-----------------<<
const bookModelInfo = () => {
  
  var BookSchema = new mongoose.Schema({
  id: String,
  isbn: String,
  title: String,
  author: String,
  description: String,
  published_year:String ,
  publisher: String,
  updated_date: { type: Date, default: Date.now },
});

return mongoose.model("Book" , BookSchema) ;

}
const bookInfo = bookModelInfo() ;
//

const pagination = async  (page,size) => {
const cursor =  booksCollection.find({});
const count = await booksCollection.estimatedDocumentCount();
const data = await cursor.skip(page * size).limit(size).sort({_id: -1 }).toArray();
const paginationInfo = {data:data , count:count} ;
return paginationInfo ;
}

//book schema for graphQL
function bookSchema () {
var bookType = new GraphQLObjectType({
  name: 'book',
  fields: function () {
    return {
      _id: {
        type: GraphQLString
      },
      isbn: {
        type: GraphQLString
      },
      title: {
        type: GraphQLString
      },
      author: {
        type: GraphQLString
      },
      description: {
        type: GraphQLString
      },
      published_year: {
        type: GraphQLInt
      },
      publisher: {
        type: GraphQLString
      },
      updated_date: {
        type: GraphQLDate
      }
    }
  }
});




var queryType = new GraphQLObjectType({
  name: 'Query',
  fields:  function () {
    return {
      books: {
        type: new GraphQLList(bookType),
        resolve:async function () {
          const books = await bookInfo.find().exec()
          if (!books) {
            throw new Error('Error')
          }
          return books
        }
      },
      book: {
        type: bookType,
        args: {
          id: {
            name: '_id',
            type: GraphQLString
          }
        },
        resolve: async function (root, params) {
          const bookDetails = await bookInfo.findById(params.id).exec();
          if (!bookDetails) {
            throw new Error('Error')
          }
          return bookDetails
        }
      } ,
       //make pagination

       booksQuery: {
        type: bookType,
        args: {
          page: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          size: {
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        resolve: async function  (root, params) {
          const page = parseInt(params.page);
          const size = parseInt(params.size);
         const paginationData = await pagination(page , size) ;
         console.log("paginationData ==>" , paginationData);
          if (!paginationData) {
            throw new Error('Error');
          }
          return paginationData
        }
      },
    }
  }
});


var mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: function () {
    return {
      //add book 
      addBook: {
        type: bookType,
        args: {
          isbn: {
            type: new GraphQLNonNull(GraphQLString)
          },
          title: {
            type: new GraphQLNonNull(GraphQLString)
          },
          author: {
            type: new GraphQLNonNull(GraphQLString)
          },
          description: {
            type: new GraphQLNonNull(GraphQLString)
          },
          published_year: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          publisher: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async function  (root, params) {
          const bookModel =  new bookInfo(params);
          const newBook = await  bookModel.save();
          if (!newBook) {
            throw new Error('Error');
          }
          return newBook
        }
      },
//update 
      updateBook: {
        type: bookType,
        args: {
          id: {
            name: 'id',
            type: new GraphQLNonNull(GraphQLString)
          },
          isbn: {
            type: new GraphQLNonNull(GraphQLString)
          },
          title: {
            type: new GraphQLNonNull(GraphQLString)
          },
          author: {
            type: new GraphQLNonNull(GraphQLString)
          },
          description: {
            type: new GraphQLNonNull(GraphQLString)
          },
          published_year: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          publisher: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async function (root, params) {
          await bookInfo.findByIdAndUpdate(params.id, { isbn: params.isbn, title: params.title, author: params.author, description: params.description, published_year: params.published_year, publisher: params.publisher, updated_date: new Date() }, function (err) {
            if (err) return next(err);
          });
        }
      },
//remove book 
      removeBook: {
        type: bookType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve:async function(root, params) {
          const remBook = await bookInfo.findByIdAndRemove(params.id).exec();
          if (!remBook) {
            throw new Error('Error')
          }
          return remBook;
        }
      } ,
     

    }
  }
});
return  new GraphQLSchema({query:queryType, mutation: mutation });  ;
}
//>>------------------>>---------->> schema end 

//graphQL connectin 
const bookSchemaGet = bookSchema() ;
app.use('/books', cors(), graphqlHTTP({
  schema: bookSchemaGet,
  rootValue: global,
  graphiql: true,
}));



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




// var paginationType = new GraphQLObjectType({
//   name: 'bookQuery',
//   fields: function () {
//     return {
//       page: {
//         type: GraphQLString
//       },
//       size: {
//         type: GraphQLString
//       }
   
//     }
//   }
//   });
  
//   var paginationQuery = new GraphQLObjectType({
//   name: 'paginationQuery',
//   fields:  function () {
//     return {
//       booksQuery: {
//         type: new GraphQLList(paginationType),
//         resolve:async function () {
//           const data = await bookInfo.find();
//           if (!data) {
//             throw new Error('Error')
//           }
//           return data
//         }
//       },
    
//     }
//     }
//     }) ;
  
//     var paginationMutaion = new GraphQLObjectType({
//       name: 'mutation',
//       fields: function () {
//         return {
//           booksQuery: {
//             type: paginationType,
//             args: {
//               page: {
//                 type: new GraphQLNonNull(GraphQLString)
//               },
//               size: {
//                 type: new GraphQLNonNull(GraphQLString)
//               }
//             },
//             resolve: async function  (root, params) {
//               const page = parseInt(params.page);
//               const size = parseInt(params.size);
//               console.log("books params ==>" , params);
//               // ----> parametar  <---- //
//               const count = await bookInfo.estimatedDocumentCount();
//               const data = await bookInfo.find().skip(page * size).limit(size).sort({_id: -1 }).toArray();
//               const paginationData = { count, data } ;
  
//               if (!paginationData) {
//                 throw new Error('Error');
//               }
//               return paginationData
//             }
//           },
//         }}}) ;
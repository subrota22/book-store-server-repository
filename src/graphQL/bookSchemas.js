var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInt = require('graphql').GraphQLInt;
var GraphQLDate = require('graphql-date');
var BookModel = require('../models/Book');

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
          type: GraphQLString
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

  
var paginationType = new GraphQLObjectType({
  name: 'bookQuery',
  fields: function () {
    return {
      page: {
        type: GraphQLString
      },
      size: {
        type: GraphQLString
      }
   
    }
  }
});

var paginationQuery = new GraphQLObjectType({
  name: 'paginationQuery',
  fields:  function () {
    return {
      booksQuery: {
        type: new GraphQLList(paginationType),
        resolve:async function () {
          const data = await BookModel.find();
          if (!data) {
            throw new Error('Error')
          }
          return data
        }
      },
    
    }
    }
    }) ;

    var paginationMutaion = new GraphQLObjectType({
      name: 'mutation',
      fields: function () {
        return {
          booksQuery: {
            type: paginationType,
            args: {
              page: {
                type: new GraphQLNonNull(GraphQLString)
              },
              size: {
                type: new GraphQLNonNull(GraphQLString)
              }
            },
            resolve: async function  (root, params) {
              const page = parseInt(params.page);
              const size = parseInt(params.size);
              console.log("books params ==>" , params);
              // ----> parametar  <---- //
              const count = await BookModel.estimatedDocumentCount();
              const data = await BookModel.find().skip(page * size).limit(size).sort({_id: -1 }).toArray();
              const paginationData = { count, data } ;

              if (!paginationData) {
                throw new Error('Error');
              }
              return paginationData
            }
          },
        }}}) ;


  var queryType = new GraphQLObjectType({
    name: 'Query',
    fields:  function () {
      return {
        books: {
          type: new GraphQLList(bookType),
          resolve:async function () {
            const books = await BookModel.find().exec()
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
            const bookDetails = await BookModel.findById(params.id).exec();
            if (!bookDetails) {
              throw new Error('Error')
            }
            return bookDetails
          }
        }
      }
    }
  });



  
  var mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: function () {
      return {
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
              type: new GraphQLNonNull(GraphQLString)
            },
            publisher: {
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve: async function  (root, params) {
            const bookModel =  new BookModel(params);
            const newBook = await  bookModel.save();
            if (!newBook) {
              throw new Error('Error');
            }
            return newBook
          }
        },

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
            await BookModel.findByIdAndUpdate(params.id, { isbn: params.isbn, title: params.title, author: params.author, description: params.description, published_year: params.published_year, publisher: params.publisher, updated_date: new Date() }, function (err) {
              if (err) return next(err);
            });
          }
        },

        removeBook: {
          type: bookType,
          args: {
            id: {
              type: new GraphQLNonNull(GraphQLString)
            }
          },
          resolve:async function(root, params) {
            const remBook = await BookModel.findByIdAndRemove(params.id).exec();
            if (!remBook) {
              throw new Error('Error')
            }
            return remBook;
          }
        } ,
        
      }
    }
  });


module.exports = new GraphQLSchema({query:paginationQuery, mutation: paginationMutaion});
module.exports = new GraphQLSchema({query:queryType, mutation: mutation});


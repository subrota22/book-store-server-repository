const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  """
  A Post refers to available attributes for a Post
  """
  type Post {
    _id: ID!
    body: String!
    createdAt: String!
  }
  input PostType {
    body: String!
  }
  type RootQuery {
    posts: [Post!]
    post(_id: String!): Post!
  }
  type Mutation {
    createPost(post:PostType): Post,
    deletePost(_id: String): Post,
    updatePost(_id: String, body: String): String
  }
  schema {
    query: RootQuery
    mutation: Mutation
  }
`);
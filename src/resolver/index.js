
const Books = require("../models/post")

module.exports = {
    posts: async () => {
        try {
          const postsFetched = await Books.find();
          return postsFetched.map(post => {
            return {
              ...post._doc,
              _id: post.id,
              createdAt: new Date(post._doc.createdAt).toISOString(),
            }
          })
        } catch (error) {
          throw error
        }
      },

  post: async (_id) => {
    try {
      const postFetched = await Books.findById(_id);
      return {
        ...postFetched._doc,
        _id: postFetched.id,
        createdAt: new Date(postFetched._doc.createdAt).toISOString(),
      }
    } catch (error) {
      throw error
    }
  },

  createPost: async args => {
    try {
      const { body } = args;
      console.log("body", body);
      const books = new Books({
        body,
      })
      const newPost= await books.save()
      return { ...newPost._doc, _id: newPost.id }
    } catch (error) {
      throw error
    }
  },

  deletePost: async (id) => {
    try {
      const deletedPost = await Books.findByIdAndDelete(id);
      return {
        ...deletedPost._doc,
        _id: deletedPost.id,
        createdAt: new Date(deletedPost._doc.createdAt).toISOString(),
      }
    } catch (error) {
      throw error
    }
  },

  updatePost: async args => {
    try {
      const { _id, body } = args
      const updatedPost = await Books.findByIdAndUpdate(_id, { body: body });
      return `Books ${updatedPost.id} updated Successfully!!!`
    } catch (error) {
      throw error
    }
  },
}

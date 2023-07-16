const{ApolloServer} = require("apollo-server");
// import uuidv4 from 'uuid/v4'


//Demo user Data

let users = [{
    id: '1',
    name: 'Andrew',
    email: 'andrew@example.com',
    age: 27
}, {
    id: '2',
    name: 'Sarah',
    email: 'sarah@example.com'
}, {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com'
}]

let posts = [{
    id: '10',
    title: 'GraphQL 101',
    body: 'This is how to use GraphQL...',
    published: true,
    author: '1'
}, {
    id: '11',
    title: 'GraphQL 201',
    body: 'This is an advanced GraphQL post...',
    published: false,
    author: '1'
}, {
    id: '12',
    title: 'Programming Music',
    body: '',
    published: false,
    author: '2'
}]

let comments = [{
    id: '102',
    text: 'This worked well for me. Thanks!',
    author: '1',
    post: '10'
}, {
    id: '103',
    text: 'Glad you enjoyed it.',
    author: '3',
    post: '10'
}, {
    id: '104',
    text: 'This did no work.',
    author: '2',
    post: '11'
}, {
    id: '105',
    text: 'Nevermind. I got it to work.',
    author: '1',
    post: '11'
}]

// Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
        me: User!
        post: Post!
    }

    type Mutation{
        
        createUser(name:String!,email:String!,age:Int):User! #Normal way
        createPost(data:CreatePostInput!):Post! #Using input data type
        createComment(text:String!,author:ID!,post:ID!):Comment!

        deleteUser(id:ID!):User!
        deletePost(id:ID!):Post!
        deleteComment(id:ID):Comment!

        updateUser(id:ID!, data:UpdateUserInput!):User!
        updatepost(id:ID!, data:UpdatePostInput!):Post!
        updateComment(id:ID!, text: String!):Comment!
    }

    input CreatePostInput{
        title:String!
        body:String!
        published:Boolean!
        author:ID!
    }

    input UpdateUserInput{
        name: String
        email:String
        age:Int
    }

    input UpdatePostInput{
        title:String
        body:String
        published: Boolean

    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`

// Resolvers
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            }

            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            }

            return posts.filter((post) => {
                const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase())
                const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase())
                return isTitleMatch || isBodyMatch
            })
        },
        comments(parent, args, ctx, info) {
            return comments
        },
        me() {
            return {
                id: '123098',
                name: 'Mike',
                email: 'mike@example.com'
            }
        },
        post() {
            return {
                id: '092',
                title: 'GraphQL 101',
                body: '',
                published: false
            }
        }
    },
    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.post === parent.id
            })
        }
    },

    Mutation:{
        createUser(parent,args,ctx,info){
            const emailTaken=users.some((user)=>user.email===args.email)
            if(emailTaken){
                throw new Error('Email taken.')
            }
            const user={
                id:'123',
                name:args.name,
                email:args.email,
                age:args.age
            }

            users.push(user);
            return user
        },
        createPost(parent,args,ctx,info){
            const userExists =users.some((user)=>user.id===args.data.author)
            if(!userExists){
                throw new Error('User not found')
            }

            const post={
                id:'13456',
                title:args.data.title,
                body:args.data.body,
                published:args.data.published,
                author:args.data.author
            }

            posts.push(post)
            return post
        },
        createComment(parent,args,ctx,info){
            const userExists =users.some((user)=>user.id===args.author)
            const postExists=posts.some((post)=>{
                return post.id===args.post&&post.published===true
            })
           
            
            
           
            if(!userExists||!postExists){
                throw new Error("Comment Fail")
            }

            const comment={
                id:'12345678',
                text: args.text,
                author: args.author,
                post:args.post
            }

            comments.push(comment)
            return comment
        

        },
        deleteUser(parent, args, ctx, info){
            const userIndex = users.findIndex((user)=>{
                return user.id===args.id
            })

            if(userIndex===-1){
                throw new Error("User is not found")
            }

            const deletedUsers =users.splice(userIndex,1)

            posts=posts.filter((post)=>{

              
                const match=post.author===args.id

                // No delete posts(must delete all comment in the post) and comment that user put over here.
                // this for over writting post and comment array (this for learning purpose only)
                if(match){
                    comments=comments.filter((comment)=> comment.post !== post.id)
                }

                return !match

            })

            comments=comments.filter((comment)=>comment.author !==args.id)

            return deletedUsers[0]
        },
        deletePost(parent,args,ctx,info){
            const postIndex=posts.findIndex((post)=>{
               
                return post.id===args.id
            })

            if(postIndex===-1){
                throw new Error("Post is not found") 
            }
            const deletedPosts= posts.splice(postIndex,1)

            comments=comments.filter((comment=>comment.post==args.id))

            return deletedPosts[0]
        },
        deleteComment(parent,args,ctx,info){
            const commentIndex= comments.findIndex((comment)=>comment.id===comment.id)

            if(commentIndex===-1){
                throw new Error("Comment is not found")
            }

            const deletedComments=comments.splice(commentIndex,1)

            return deletedComments[0]
        },
        updateUser(parent,args,ctx,info){
            const user = users.find((user)=>user.id==args.id)

            

            if(!user){
                throw new Error ('User not found')
            }
            if(typeof args.data.email==='string'){
                const emailTaken=users.some((user)=>user.email===args.data.email)

                if(emailTaken){
                    throw new Error('Email taken')
                }

                user.email=args.data.email
            }

            if(typeof args.data.name==='string'){
                user.name=args.data.name
            }
            if(typeof args.data.age !=='undefined'){
                user.age=args.data.age
            }

            return user;
        },
        updatepost(parent,args,ctx,info){
          const post = posts.find((post)=>post.id===args.id)

          if(!post){
            throw new Error('Post not found')
          }
          
          if(typeof args.data.title==='string'){
            post.title=args.data.title
          }

          if(typeof args.data.body==='string'){
            post.body=args.data.body
          }
          if(typeof args.data.published==='boolean'){
            post.published=args.data.published
          }
           return post

        },
        updateComment(parent,args,ctx,info){
            const comment=comments.find((comment)=>comment.id===args.id)
            if(!comment){
                throw new Error("Commnet not found")
            }

            if(typeof args.text==='string'){
                comment.text=args.text
            }

            return comment
        }

    },
    Comment: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        post(parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id === parent.post
            })
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    }
}



const server = new ApolloServer({typeDefs,resolvers});


server.listen().then(({url})=>{
    console.log(`YOUR API IS RUNNING AT :${url}:)`);
});

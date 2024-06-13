var express = require("express");
var { createHandler } = require("graphql-http/lib/use/express");
var { buildSchema } = require("graphql");
var { ruruHTML } = require("ruru/server");
const { graphqlUploadExpress } = require("graphql-upload");
// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
    greeting(name: String!): String
    books: [Book]
  }

  type Book {
    title: String
    author: String
  }

  type Item {
    id: Float!
    imageFile: String
    isDeleteImage: Boolean!
    name:String
  }

  input SaveItemInput {
    id: Float!
    imageFile: Upload!
    isDeleteImage: Boolean!
  }

  type Mutation {
    addBook(title: String!, author: String!): Book
    saveItem(data: SaveItemInput!): Item
  }
`);

// Sample data
var books = [
  {
    title: "12312kj3k1j2",
    author: "F. Scott Fitzgerald",
  },
];

// The root provides a resolver function for each API endpoint
var resolver = {
  hello: () => {
    return "Hello world!";
  },
  greeting: ({ name }) => {
    return `Hello, ${name}!`;
  },
  books: () => {
    return books;
  },
  addBook: ({ title, author }) => {
    console.log({ title, author });
    const book = { title, author };
    books.push(book);
    return book;
  },
  saveItem: ({ data }) => {
    console.log("data request:", data);
    // Perform saving item logic here
    return {
      id: data.id,
      imageFile: data.imageFile,
      isDeleteImage: data.isDeleteImage,
    };
  },
};

var app = express();
// app.use(graphqlUploadExpress());

// Create and use the GraphQL handler.
app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: resolver,
  })
);

// Serve the GraphiQL IDE.
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

// Start the server at port
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");

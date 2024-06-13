const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const { TypeComposer, schemaComposer } = require("graphql-compose");
const { ruruHTML } = require("ruru/server");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

// Khởi tạo TypeComposer cho Item
const ItemTC = TypeComposer.create(`
  type Item {
    id: Float!
    imageFile: String
    isDeleteImage: Boolean!
    name: String
  }

  input SaveItemInput {
    id: Float!
    imageFile: Upload!
    isDeleteImage: Boolean!
  }
`);

// Khởi tạo resolver cho mutation saveItem
const resolver = {
  saveItem: async ({ args }) => {
    const { id, isDeleteImage } = args.data;
    const { createReadStream, filename, mimetype, encoding } = await args.data
      .imageFile;

    // Xử lý logic lưu trữ item và tệp tin ở đây
    const stream = createReadStream();
    // Ví dụ: Lưu tệp tin vào thư mục và trả về đường dẫn
    const filePath = `uploads/${filename}`;
    await new Promise((resolve, reject) =>
      stream
        .pipe(fs.createWriteStream(filePath))
        .on("finish", resolve)
        .on("error", reject)
    );

    console.log("Data request:", { id, filePath, isDeleteImage });
    return {
      id,
      imageFile: filePath, // Trả về đường dẫn của tệp tin đã lưu
      isDeleteImage,
    };
  },
};

// Định nghĩa mutation và resolver tương ứng
schemaComposer.Mutation.addFields({
  saveItem: {
    type: ItemTC.getType(),
    args: {
      data: ItemTC.getInputTypeComposer().getType(),
    },
    resolve: resolver.saveItem,
  },
});

// Khởi tạo TypeComposer cho loại Query
const QueryTC = TypeComposer.create(`
  type Query {
    hello: String
  }
`);

// Thêm loại Query vào schema
schemaComposer.Query.addFields({
  hello: {
    type: "String",
    resolve: () => "Hello World!",
  },
});

// Xây dựng schema từ schemaComposer
const graphqlSchema = schemaComposer.buildSchema();

// Tạo ứng dụng Express
const app = express();

// Middleware để xử lý các yêu cầu GraphQL
app.all(
  "/graphql",
  createHandler({
    schema: graphqlSchema,
    rootValue: resolver,
  })
);

// Định nghĩa endpoint cho GraphiQL IDE
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

// Khởi động server
const port = 4000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/graphql`);
});

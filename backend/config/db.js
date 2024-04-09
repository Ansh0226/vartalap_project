// const mongoose = require("mongoose");
// const MONGO_URI =
//   "mongodb+srv://ansh114:Ansh114@cluster0.mggucl0.mongodb.net/Vartalap?retryWrites=true&w=majority&appName=Cluster0";
// const connectDB = async () => {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("Connected to MongoDB");
//   } catch (err) {
//     console.error("Error connecting to MongoDB:", err);
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://ansh114:Ansh114@cluster0.mggucl0.mongodb.net/Vartalap?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   useFindAndModify: false, // Corrected option name
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1); // Exiting with a non-zero code to indicate failure
  }
};

module.exports = connectDB;

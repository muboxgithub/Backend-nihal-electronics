const express = require("express");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const passport = require('./middlewares/passportConfig'); // Load strategies
app.use(passport.initialize());

//user
const userRoute = require("./routes/userRoute");
app.use("/api/users", userRoute);

//auth
const authRoute = require("./routes/authRoute");
app.use("/api/auth", authRoute);

//categories
const categorieRoute = require("./routes/categorieRoute");
app.use("/api/categories", categorieRoute);

//products
const productRoute = require("./routes/productRoute");
app.use("/api/products", productRoute);
//product images
const productImageRoute = require("./routes/productImageRoute");
app.use("/api/products", productImageRoute);


app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});

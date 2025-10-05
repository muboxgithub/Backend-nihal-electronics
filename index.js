const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
app.use(
  morgan("combined", {
    stream: fs.createWriteStream("./logs/access.log", { flags: "a" }),
  })
);

const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const passport = require("./middlewares/passportConfig"); // Load strategies
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

//====get categories
app.get("/test-categ", async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      include: { products: true }, //include related products
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});
//product images
const productImageRoute = require("./routes/productImageRoute");
app.use("/api/products", productImageRoute);

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});

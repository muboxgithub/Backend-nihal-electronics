const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    original_price,
    discount_percentage,
    stock,
    category_id,
    brand,
    is_featured,
    badge_type,
    average_rating,
    review_count,
  } = req.body;

  // Check if user is admin
  if (req.user && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  try {
    //Validate category_id exists if provided
    if (category_id) {
      const category = await prisma.categories.findUnique({
        where: { category_id },
      });
      if (!category) {
        return res.status(400).json({ error: "Invalid category_id" });
      }
    }

    const newProduct = await prisma.products.create({
      data: {
        name,
        description,
        price,
        original_price,
        discount_percentage,
        stock,
        category_id,
        brand,
        is_featured,
        badge_type,
        average_rating,
        review_count,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        category: true, // Include related category
      },
      orderBy: { created_at: "desc" }, //sort by creation date
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const { product_id } = req.params;

  // Validate product_id is provided
  if (!product_id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const product = await prisma.products.findUnique({
      where: { product_id },
      include: {
        category: true, // Include related category
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

exports.updateProduct = async (req, res) => {
  const { product_id } = req.params;
  const {
    name,
    description,
    price,
    original_price,
    discount_percentage,
    stock,
    category_id,
    brand,
    is_featured,
    badge_type,
    average_rating,
    review_count,
  } = req.body;

  // Validate product_id is provided
  if (!product_id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  // Optional: Check if user is admin
  if (req.user && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  try {
    // First, check if product exists
    const product = await prisma.products.findUnique({
      where: { product_id },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    //Validate category_id exists if provided
    if (category_id) {
      const category = await prisma.categories.findUnique({
        where: { category_id },
      });
      if (!category) {
        return res.status(400).json({ error: "Invalid category_id" });
      }
    }

    const updatedProduct = await prisma.products.update({
      where: { product_id },
      data: {
        name,
        description,
        price,
        original_price,
        discount_percentage,
        stock,
        category_id,
        brand,
        is_featured,
        badge_type,
        average_rating,
        review_count,
      },
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { product_id } = req.params;

  // Validate product_id is provided
  if (!product_id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  //Check if user is admin
  if (req.user && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  try {
    // First, check if product exists
    const product = await prisma.products.findUnique({
      where: { product_id },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete product
    await prisma.products.delete({
      where: { product_id },
    });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

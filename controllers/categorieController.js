const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// Create a new category
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;

  //Check if user is admin
  if (req.user && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  try {
    const newCategory = await prisma.categories.create({
      data: { name, description },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.categories.findMany({
      include: { products: true }, //include related products
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// get category by id
exports.getCategoryById = async (req, res) => {
  const { category_id } = req.params;

  // Validate category_id is provided
  if (!category_id) {
    return res.status(400).json({ error: "Category ID is required" });
  }

  try {
    const category = await prisma.categories.findUnique({
      where: { category_id },
      include: { products: true }, //include related products
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  const { category_id } = req.params;
  const { name, description } = req.body;
  
  // Check if user is admin
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin role required' });
  }
  
  try {
    // First, check if category exists
    const category = await prisma.categories.findUnique({
      where: { category_id },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updatedCategory = await prisma.categories.update({
      where: { category_id },
      data: { name, description },
    });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  const { category_id } = req.params;
  
  // Check if user is admin
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin role required' });
  }
  
  try {
    // First, check if category exists
    const category = await prisma.categories.findUnique({
      where: { category_id },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Delete category (related products will have category_id set to null)
    await prisma.categories.delete({
      where: { category_id },
    });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};



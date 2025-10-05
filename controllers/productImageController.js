const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const { uploadsDir } = require("../middlewares/multerMiddleware");

exports.createProductImages = async (req, res) => {
  const product_id = req.params.product_id;
  const { alt_text, is_primary } = req.body;
  const files = req.files;

  // Check if user is admin
  if (req.user && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  // Validate files uploaded
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  try {
    // Validate product exists
    const product = await prisma.products.findUnique({
      where: { product_id },
    });
    if (!product) {
      // Early cleanup on 404
      files.forEach((file) => {
        const filePath = path.join(uploadsDir, file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      return res.status(404).json({ error: "Product not found" });
    }

    // Prepare image data
    const imageData = files.map((file, index) => {
      const currentIsPrimary = Array.isArray(is_primary)
        ? is_primary[index] === "true"
        : index === 0 && is_primary === "true";

      return {
        product_id,
        url: `/uploads/products/${file.filename}`,
        alt_text: Array.isArray(alt_text)
          ? alt_text[index]
          : alt_text || `Product image ${index + 1}`,
        is_primary: currentIsPrimary || false,
      };
    });

    // Use transaction for atomicity
    const newImages = await prisma.$transaction(async (tx) => {
      // Unset previous primaries if any new primary
      const hasPrimary = imageData.some((img) => img.is_primary);
      if (hasPrimary) {
        await tx.productImages.updateMany({
          where: { product_id, is_primary: true },
          data: { is_primary: false },
        });
      }

      // Create each image and collect results
      const createdImages = [];
      for (const data of imageData) {
        const created = await tx.productImages.create({
          data,
          include: { product: true },
        });
        createdImages.push(created);
      }

      return createdImages;
    });

    res.status(201).json(newImages);
  } catch (error) {
    console.error("Error creating product images:", error);
    // Cleanup
    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    res.status(500).json({
      error: "Failed to create product images",
      details: error.message,
    });
  }
};

exports.getProductImages = async (req, res) => {
  const { product_id } = req.params;

  try {
    const images = await prisma.productImages.findMany({
      where: { product_id },
      include: { product: true },
      orderBy: { created_at: "asc" }, // Or by is_primary first
    });

    if (!images || images.length === 0) {
      return res
        .status(404)
        .json({ error: "No images found for this product" });
    }

    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching product images:", error);
    res.status(500).json({ error: "Failed to fetch product images" });
  }
};

exports.getProductImageById = async (req, res) => {
  const { product_id, image_id } = req.params; // image_id is the UUID string

  try {
    let whereClause = { image_id }; // Use 'image_id' as the field name (Prisma model PK)

    // Optional: Validate image belongs to product
    if (product_id) {
      whereClause = { image_id, product_id };
    }

    const image = await prisma.productImages.findUnique({
      where: whereClause,
      include: { product: true },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.status(200).json(image);
  } catch (error) {
    console.error("Error fetching product image:", error);
    res.status(500).json({ error: "Failed to fetch product image" });
  }
};

exports.updateProductImage = async (req, res) => {
  const { product_id, image_id } = req.params;

  // Handle form data body (multer populates req.body for non-file fields)
  const { alt_text, is_primary } = req.body || {};
  const newFile = req.file; // Single file upload for update

  // Check if user is admin
  if (req.user && req.user.role !== "admin") {
    // Cleanup new file if uploaded but unauthorized
    if (newFile) {
      const filePath = path.join(uploadsDir, newFile.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  // Validate request has at least one field to update
  if (!alt_text && is_primary === undefined && !newFile) {
    // Cleanup new file if uploaded but no valid fields
    if (newFile) {
      const filePath = path.join(uploadsDir, newFile.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return res.status(400).json({
      error: "No fields to update. Provide image, alt_text and/or is_primary",
    });
  }

  try {
    // Validate image exists and belongs to the specified product
    const existingImage = await prisma.productImages.findFirst({
      where: {
        image_id,
        product_id,
      },
      include: { product: true },
    });

    if (!existingImage) {
      // Cleanup new file if uploaded but image not found
      if (newFile) {
        const filePath = path.join(uploadsDir, newFile.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      return res
        .status(404)
        .json({ error: "Product image not found for this product" });
    }

    // Use transaction for atomic operations
    const updatedImage = await prisma.$transaction(async (tx) => {
      // If setting this image as primary, unset previous primary
      if (is_primary === "true" || is_primary === true) {
        await tx.productImages.updateMany({
          where: {
            product_id,
            is_primary: true,
            image_id: { not: image_id }, // Exclude current image
          },
          data: { is_primary: false },
        });
      }

      // Prepare update data
      const updateData = {};
      if (alt_text !== undefined) updateData.alt_text = alt_text;
      if (is_primary !== undefined) {
        updateData.is_primary = is_primary === "true" || is_primary === true;
      }

      // If new file uploaded, update URL and prepare to delete old file
      let oldImagePath = null;
      if (newFile) {
        const oldFilename = existingImage.url.split("/").pop();
        oldImagePath = path.join(uploadsDir, oldFilename);
        updateData.url = `/uploads/products/${newFile.filename}`;
      }

      // Update the image
      const result = await tx.productImages.update({
        where: { image_id },
        data: updateData,
        include: { product: true },
      });

      // Delete old image file after successful update
      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      return result;
    });

    res.status(200).json(updatedImage);
  } catch (error) {
    console.error("Error updating product image:", error);

    // Cleanup new file on error
    if (newFile) {
      const filePath = path.join(uploadsDir, newFile.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Handle Prisma known errors
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product image not found" });
    }

    res.status(500).json({
      error: "Failed to update product image",
      details: error.message,
    });
  }
};

exports.deleteProductImage = async (req, res) => {
  const { product_id, image_id } = req.params; // Now requires product_id

  // Check if user is admin
  if (req.user && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied: Admin role required" });
  }

  try {
    // Fetch existing image with product validation
    const existingImage = await prisma.productImages.findUnique({
      where: { image_id, product_id }, // Validates belongs to product
    });

    if (!existingImage) {
      return res
        .status(404)
        .json({ error: "Image not found for this product" });
    }

    // Delete from DB
    await prisma.productImages.delete({
      where: { image_id }, // No need for product_id here if PK is unique
    });

    // Delete physical file (extract filename from url)
    const filename = existingImage.url.split("/").pop(); // e.g., "images-123.png"
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting product image:", error);
    res.status(500).json({ error: "Failed to delete product image" });
  }
};

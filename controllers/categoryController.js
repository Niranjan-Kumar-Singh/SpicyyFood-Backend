const Category = require('../models/category');
const Item = require('../models/item');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    
    // Create new category
    const newCategory = new Category({
      name,
      image: result.secure_url,
    });

    const savedCategory = await newCategory.save();

    // Cleanup the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to remove temp file:", err);
    });

    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing category
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;

    if (req.file) {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      category.image = result.secure_url;

      // Cleanup temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to remove temp file:", err);
      });
    }

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if items exist in the category
    const items = await Item.find({ categoryId: category._id });
    if (items.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with associated items' });
    }

    await category.deleteOne();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories with items
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const items = await Item.find().populate('categoryId', 'name').lean();

    const categoriesWithItems = categories.map(category => ({
      ...category,
      items: items.filter(item => item.categoryId._id.toString() === category._id.toString()),
    }));

    res.status(200).json(categoriesWithItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch only categories (ID and Name)
exports.getCategoriesOnly = async (req, res) => {
  try {
    const categories = await Category.find({}, "_id name image"); // Fetch only required fields

    // Format the response
    const formattedCategories = categories.map((category) => ({
      id: category._id, // Generate a simple numeric ID (optional)
      name: category.name,
      image: category.image || "/uploads/default.jpg", // Use a default image if missing
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
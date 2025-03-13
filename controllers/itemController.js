const Item = require('../models/item'); // Import Item model 
const Category = require('../models/category'); // Import Category model
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc Add a new item to the menu
// @route POST /api/items
// @access Private
exports.addItem = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;

    // Verify category ID validity
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Check for image file
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    
    // Remove local file after uploading to Cloudinary
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete local file:', err);
    });

    // Create and save the new item
    const newItem = new Item({
      name,
      description,
      price,
      categoryId,
      image: result.secure_url,
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Fetch all items or filter by category
// @route GET /api/items?categoryId=xyz
// @access Public
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('categoryId', 'name');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Fetch items by category
// @route GET /api/items/category/:categoryId
// @access Public
exports.getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = await Item.find({ categoryId }).populate('categoryId', 'name');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update an existing item
// @route PUT /api/items/:id
// @access Private
exports.updateItem = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Validate category if changed
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      item.categoryId = categoryId;
    }

    // Update fields
    item.name = name || item.name;
    item.description = description || item.description;
    item.price = price || item.price;

    // Upload new image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      item.image = result.secure_url;
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to remove temp file:', err);
      });
    }

    const updatedItem = await item.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete item by ID
// @route DELETE /api/items/:itemId
// @access Private
exports.deleteItemById = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
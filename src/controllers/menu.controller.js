// Import required packages
import MenuItem from '../models/menu.model.js';

// Create a new menu item
export const createMenuItem = async (req, res) => {
  try {
    const menuItemData = req.body;
    
    // Check if menu item with same name already exists
    const existingItem = await MenuItem.findOne({ 
      name: { $regex: new RegExp(`^${menuItemData.name}$`, 'i') }
    });
    
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Menu item with this name already exists'
      });
    }

    const newMenuItem = await MenuItem.create(menuItemData);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newMenuItem
    });

  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message
    });
  }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const { isActive, category, dietaryOption, search } = req.query;
    
    let query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (dietaryOption) {
      query.dietaryOptions = dietaryOption;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      message: 'Menu items retrieved successfully',
      data: menuItems,
      count: menuItems.length
    });

  } catch (error) {
    console.error('Get all menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu items',
      error: error.message
    });
  }
};

// Get a single menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item retrieved successfully',
      data: menuItem
    });

  } catch (error) {
    console.error('Get menu item by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu item',
      error: error.message
    });
  }
};

// Update a menu item by ID
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if menu item exists
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // If updating name, check if another item with same name exists
    if (updateData.name && updateData.name.toLowerCase() !== menuItem.name.toLowerCase()) {
      const existingItem = await MenuItem.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Menu item with this name already exists'
        });
      }
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedMenuItem
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
};

// Delete a menu item by ID
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await MenuItem.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message
    });
  }
};

// Get menu items by category
export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { isActive } = req.query;

    let query = { category };
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const menuItems = await MenuItem.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: `Menu items for category '${category}' retrieved successfully`,
      data: menuItems,
      count: menuItems.length,
      category
    });

  } catch (error) {
    console.error('Get menu items by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu items by category',
      error: error.message
    });
  }
};

// Get dietary-specific menu items
export const getDietaryMenuItems = async (req, res) => {
  try {
    const { dietaryType } = req.params;
    const { isActive } = req.query;

    let query = { 
      dietaryOptions: dietaryType,
      isActive: isActive !== 'false'
    };

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      message: `Dietary menu items for '${dietaryType}' retrieved successfully`,
      data: menuItems,
      count: menuItems.length,
      dietaryType
    });

  } catch (error) {
    console.error('Get dietary menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dietary menu items',
      error: error.message
    });
  }
};

// Search menu items
export const searchMenuItems = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const menuItems = await MenuItem.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: 'Menu items search completed successfully',
      data: menuItems,
      count: menuItems.length,
      searchQuery: q,
      filters: { category, minPrice, maxPrice }
    });

  } catch (error) {
    console.error('Search menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching menu items',
      error: error.message
    });
  }
};
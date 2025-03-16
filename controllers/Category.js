const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if ((!name, !description)) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // create category
    const categoriesDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log("categoriesDetails", categoriesDetails);
    return res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// show all categorys

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );
    return res.status(200).json({
      success: true,
      message: "got all categories successfully",
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//category Page Details

exports.categoryPageDetails = async (req, res) => {
  try {
    // get CategoryId
    const { categoryId } = req.body;
    //get courses for specified categoryId
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    //validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category Not found",
      });
    }
    //get coursesfor different categories
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    //get top 10 selling courses
    //HW - write it on your own

    //return response
    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

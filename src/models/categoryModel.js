const mongoose = require("mongoose");

const category_schema = mongoose.Schema(
  {
    name: { type: String, trim: true },
    icon: { type: String, trim: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

category_schema.index({
  name: "text",
});

const Category = mongoose.model("Category", category_schema);

module.exports = Category;

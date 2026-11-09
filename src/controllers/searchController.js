const mongoose = require("mongoose");
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Chapter = require("../models/chapterModel");

const escapeRegex = (value) =>
  String(value || "").replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

exports.globalSearch = async (req, res) => {
  try {
    const q = String(req.query.q || req.query.search || "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 20);

    if (q.length < 2) {
      return responseHandler(res, 200, "Search results fetched successfully", {
        members: [],
        categories: [],
        products: [],
        chapters: [],
        services: [],
      });
    }

    const regex = new RegExp(escapeRegex(q), "i");
    const blockedUsersList =
      (
        await User.findById(req.userId).select("blockedUsers")
      )?.blockedUsers || [];

    const [members, categories, products, chapters, tagUsers, taggedProducts] =
      await Promise.all([
        User.find({
          status: { $in: ["active", "awaiting_payment"] },
          _id: {
            $ne: new mongoose.Types.ObjectId(req.userId),
            $nin: blockedUsersList,
          },
          $or: [
            { name: regex },
            { memberId: regex },
            { phone: regex },
            { email: regex },
          ],
        })
          .select("name image memberId chapter phone")
          .populate("chapter", "name")
          .limit(limit)
          .lean(),

        Category.find({ name: regex, status: true })
          .select("name")
          .limit(limit)
          .lean(),

        Product.find({
          status: "accepted",
          $or: [{ name: regex }, { description: regex }],
        })
          .select("name image price offerPrice seller tags")
          .limit(limit)
          .lean(),

        Chapter.find({
          $or: [{ name: regex }, { shortCode: regex }],
        })
          .select("name shortCode")
          .limit(limit)
          .lean(),

        User.find(
          { businessTags: regex },
          { businessTags: 1, _id: 0 }
        )
          .limit(200)
          .lean(),

        Product.find({
          status: "accepted",
          tags: regex,
        })
          .select("name image price offerPrice seller tags")
          .limit(limit)
          .lean(),
      ]);

    const businessTags = [
      ...new Set(
        tagUsers
          .flatMap((user) => user.businessTags || [])
          .map((tag) => String(tag || "").trim())
          .filter((tag) => tag && regex.test(tag))
      ),
    ]
      .slice(0, limit)
      .map((name) => ({
        type: "business_tag",
        name,
      }));

    const serviceProducts = taggedProducts.map((item) => ({
      type: "product",
      _id: item._id,
      name: item.name,
      image: item.image || "",
      price: item.price,
      offerPrice: item.offerPrice,
      tags: item.tags || [],
    }));

    const services = [...businessTags, ...serviceProducts].slice(0, limit);

    return responseHandler(res, 200, "Search results fetched successfully", {
      members: members.map((item) => ({
        _id: item._id,
        name: item.name,
        image: item.image || "",
        memberId: item.memberId || "",
        phone: item.phone || "",
        chapter: item.chapter?.name || "",
        chapterId: item.chapter?._id || item.chapter || null,
      })),
      categories: categories.map((item) => ({
        _id: item._id,
        name: item.name,
      })),
      products: products.map((item) => ({
        _id: item._id,
        name: item.name,
        image: item.image || "",
        price: item.price,
        offerPrice: item.offerPrice,
        seller: item.seller,
        tags: item.tags || [],
      })),
      chapters: chapters.map((item) => ({
        _id: item._id,
        name: item.name,
        shortCode: item.shortCode || "",
      })),
      services,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

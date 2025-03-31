const responseHandler = require("../helpers/responseHandler");
const State = require("../models/stateModel");
const validations = require("../validations");
const checkAccess = require("../helpers/checkAccess");
const District = require("../models/districtModel");
const Zone = require("../models/zoneModel");
const Chapter = require("../models/chapterModel");
const Member = require("../models/memberModel");
const User = require("../models/userModel");
const { isUserAdmin } = require("../utils/adminCheck");

//state

exports.createState = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const createStateValidator = validations.createStateSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );

    if (createStateValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createStateValidator.error}`
      );
    }

    const newState = await State.create(req.body);
    if (!newState) {
      return responseHandler(res, 400, `state creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New state created successfullyy..!`,
      newState
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getState = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "state with this Id is required");
    }

    const findState = await State.findById(id);
    if (findState) {
      return responseHandler(
        res,
        200,
        `state found successfully..!`,
        findState
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateState = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "state Id is required");
    }

    const { error } = validations.editStateSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const updateState = await State.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (this.updateZone) {
      return responseHandler(
        res,
        200,
        `state updated successfully..!`,
        updateState
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllStates = async (req, res) => {
  try {
    const getAllStates = await State.find();
    if (getAllStates) {
      return responseHandler(
        res,
        200,
        `states found successfully..!`,
        getAllStates
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

// exports.deleteState = async (req, res) => {
//   try {
//     const check = await checkAccess(req.roleId, "permissions");
//     if (!check || !check.includes("stateManagement_modify")) {
//       return responseHandler(
//         res,
//         403,
//         "You don't have permission to perform this action"
//       );
//     }
//     const { id } = req.params;

//     if (!id) {
//       return responseHandler(res, 400, "state Id is required");
//     }

//     const deleteState = await State.findByIdAndDelete(id);
//     if (deleteState) {
//       return responseHandler(res, 200, `state deleted successfully..!`);
//     }
//   } catch (error) {
//     return responseHandler(res, 500, `Internal Server Error ${error.message}`);
//   }
// };

//district

exports.createDistrict = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const createDistrictValidator = validations.createDistrictSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );

    if (createDistrictValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createDistrictValidator.error}`
      );
    }

    const newDistrict = await District.create(req.body);
    if (!newDistrict) {
      return responseHandler(res, 400, `district creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New district created successfullyy..!`,
      newDistrict
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getDistrict = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "district with this Id is required");
    }

    const findDistrict = await District.findById(id);
    if (findDistrict) {
      return responseHandler(
        res,
        200,
        `district found successfully..!`,
        findDistrict
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateDistrict = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "district Id is required");
    }

    const { error } = validations.editDistrictSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const updateDistrict = await District.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (this.updateDistrict) {
      return responseHandler(
        res,
        200,
        `district updated successfully..!`,
        updateDistrict
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

//zone

exports.createZone = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const createZoneValidator = validations.createZoneSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );

    if (createZoneValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createZoneValidator.error}`
      );
    }

    const newZone = await Zone.create(req.body);
    if (!newZone) {
      return responseHandler(res, 400, `zone creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New zone created successfullyy..!`,
      newZone
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getZone = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "zone with this Id is required");
    }

    const findZone = await Zone.findById(id);
    if (findZone) {
      return responseHandler(res, 200, `zone found successfully..!`, findZone);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateZone = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "zone Id is required");
    }

    const { error } = validations.editZoneSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const updateZone = await Zone.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (this.updateZone) {
      return responseHandler(
        res,
        200,
        `zone updated successfully..!`,
        updateZone
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

//chapter

exports.createChapter = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const createChapterValidator = validations.createChapterSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );

    if (createChapterValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createChapterValidator.error}`
      );
    }

    const newChapter = await Chapter.create(req.body);
    if (!newChapter) {
      return responseHandler(res, 400, `chapter creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New Chapter created successfullyy..!`,
      newChapter
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getChapter = async (req, res) => {
  try {
    // const check = await checkAccess(req.roleId, "permissions");
    // if (!check || !check.includes("hierarchyManagement_view")) {
    //   return responseHandler(
    //     res,
    //     403,
    //     "You don't have permission to perform this action"
    //   );
    // }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "chapter with this Id is required");
    }

    const findChapter = await Chapter.findById(id).populate(
      "admins.user",
      "name phone"
    );
    if (findChapter) {
      return responseHandler(
        res,
        200,
        `chapter found successfully..!`,
        findChapter
      );
    }
    return responseHandler(res, 400, `Chapter not found...!`);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { id } = req.params;

    if (!id) {
      return responseHandler(res, 400, "chapter Id is required");
    }

    const { error } = validations.editChapterSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const updateChapter = await Chapter.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (this.updateChapter) {
      return responseHandler(
        res,
        200,
        `chapter updated successfully..!`,
        updateChapter
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getLevels = async (req, res) => {
  try {
    if (req.role == "admin") {
      const check = await checkAccess(req.roleId, "permissions");
      if (!check || !check.includes("hierarchyManagement_view")) {
        return responseHandler(
          res,
          403,
          "You don't have permission to perform this action"
        );
      }
    } else if (req.role == "user") {
      const check = req.user;
      if (check.role == "member") {
        return responseHandler(
          res,
          403,
          "You don't have permission to perform this action"
        );
      }
    }

    const { id, type } = req.params;
    const { chooseAdmin } = req.query;
    if (!id) {
      return responseHandler(res, 400, "ID is required");
    }

    if (!type) {
      return responseHandler(res, 400, "Type is required");
    }

    if (type === "state") {
      const findState = await Zone.find({ stateId: id });
      if (findState) {
        return responseHandler(
          res,
          200,
          `Zones found successfully..!`,
          findState
        );
      }
    } else if (type === "zone") {
      const findZone = await District.find({ zoneId: id });
      if (findZone) {
        return responseHandler(
          res,
          200,
          `Districts found successfully..!`,
          findZone
        );
      }
    } else if (type === "district") {
      const findDistrict = await Chapter.find({ districtId: id });
      if (findDistrict) {
        return responseHandler(
          res,
          200,
          `Chapters found successfully..!`,
          findDistrict
        );
      }
    } else if (type === "user") {
      const query = { chapter: id };
      let findUsers = await User.find(query).populate({
        path: "chapter",
        select: "name",
        populate: {
          path: "districtId",
          select: "name",
          populate: {
            path: "zoneId",
            select: "name",
            populate: {
              path: "stateId",
              select: "name",
            },
          },
        },
      });
      if (chooseAdmin) {
        const nonAdminUsers = await Promise.all(
          findUsers.map(async (user) => {
            const adminData = await isUserAdmin(user._id);
            return adminData ? null : user;
          })
        );

        findUsers = nonAdminUsers.filter(Boolean);
      }
      if (findUsers) {
        return responseHandler(
          res,
          200,
          `Users found successfully..!`,
          findUsers
        );
      }
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getHierarchyList = async (req, res) => {
  try {
    const { type } = req.params;

    const { limit = 10, pageNo = 1, search } = req.query;

    const skip = (pageNo - 1) * limit;

    const filter = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    if (!type) {
      return responseHandler(res, 400, "Type parameter is required", []);
    }

    let data = [];

    const mapData = (items, category) =>
      items.map((item) => ({
        _id: item._id,
        name: item.name,
        admins: item.admins || [],
        category,
        pstCount: item.admins.length,
        createdAt: item.createdAt,
      }));

    if (type === "state") {
      const states = await State.find(filter).limit(limit).skip(skip);
      data = mapData(states, "state");
    } else if (type === "zone") {
      const zones = await Zone.find(filter).limit(limit).skip(skip);
      data = mapData(zones, "zone");
    } else if (type === "district") {
      const districts = await District.find(filter).limit(limit).skip(skip);
      data = mapData(districts, "district");
    } else if (type === "chapter") {
      const chapters = await Chapter.find(filter).limit(limit).skip(skip);
      data = mapData(chapters, "chapter");
    } else if (type === "all") {
      const states = await State.find();
      const zones = await Zone.find();
      const districts = await District.find();
      const chapters = await Chapter.find();

      data = [
        ...mapData(states, "state"),
        ...mapData(zones, "zone"),
        ...mapData(districts, "district"),
        ...mapData(chapters, "chapter"),
      ];
    } else {
      return responseHandler(res, 400, "Invalid type parameter", []);
    }
    if (!data.length) {
      return responseHandler(res, 404, `${type} data not found`, []);
    }

    return responseHandler(
      res,
      200,
      `${type} data retrieved successfully`,
      data
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error`, []);
  }
};

exports.createLevel = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { type } = req.params;

    if (!type) {
      return responseHandler(res, 400, "Type is required");
    }

    if (type === "state") {
      const createStateValidator = validations.createStateSchema.validate(
        req.body,
        {
          abortEarly: true,
        }
      );

      if (createStateValidator.error) {
        return responseHandler(
          res,
          400,
          `Invalid input: ${createStateValidator.error}`
        );
      }
      const createState = await State.create(req.body);
      if (createState) {
        return responseHandler(
          res,
          200,
          "State created successfully",
          createState
        );
      }
    } else if (type === "zone") {
      const createZoneValidator = validations.createZoneSchema.validate(
        req.body,
        {
          abortEarly: true,
        }
      );

      if (createZoneValidator.error) {
        return responseHandler(
          res,
          400,
          `Invalid input: ${createZoneValidator.error}`
        );
      }
      const createZone = await Zone.create(req.body);
      if (createZone) {
        return responseHandler(
          res,
          200,
          "Zone created successfully",
          createZone
        );
      }
    } else if (type === "district") {
      const createDistrictValidator = validations.createDistrictSchema.validate(
        req.body,
        {
          abortEarly: true,
        }
      );

      if (createDistrictValidator.error) {
        return responseHandler(
          res,
          400,
          `Invalid input: ${createDistrictValidator.error}`
        );
      }
      const createDistrict = await District.create(req.body);
      if (createDistrict) {
        return responseHandler(
          res,
          200,
          "District created successfully",
          createDistrict
        );
      }
    } else if (type === "chapter") {
      const createChapterValidator = validations.createChapterSchema.validate(
        req.body,
        {
          abortEarly: true,
        }
      );

      if (createChapterValidator.error) {
        return responseHandler(
          res,
          400,
          `Invalid input: ${createChapterValidator.error}`
        );
      }
      const createChapter = await Chapter.create(req.body);
      if (createChapter) {
        return responseHandler(
          res,
          200,
          "Chapter created successfully",
          createChapter
        );
      }
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error`);
  }
};

exports.updateLevel = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { type } = req.params;

    if (!type) {
      return responseHandler(res, 400, "Type is required");
    }

    const { levelId } = req.query;

    if (!levelId) {
      return responseHandler(res, 400, "Level ID is required");
    }

    if (type === "state") {
      const updateState = await State.findByIdAndUpdate(levelId, req.body, {
        new: true,
      });
      if (updateState) {
        return responseHandler(
          res,
          200,
          "State updated successfully",
          updateState
        );
      }
    } else if (type === "zone") {
      const updateZone = await Zone.findByIdAndUpdate(levelId, req.body, {
        new: true,
      });
      if (updateZone) {
        return responseHandler(
          res,
          200,
          "Zone updated successfully",
          updateZone
        );
      }
    } else if (type === "district") {
      const updateDistrict = await District.findByIdAndUpdate(
        levelId,
        req.body,
        {
          new: true,
        }
      );
      if (updateDistrict) {
        return responseHandler(
          res,
          200,
          "District updated successfully",
          updateDistrict
        );
      }
    } else if (type === "chapter") {
      const updateChapter = await Chapter.findByIdAndUpdate(levelId, req.body, {
        new: true,
      });
      if (updateChapter) {
        return responseHandler(
          res,
          200,
          "Chapter updated successfully",
          updateChapter
        );
      }
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error`);
  }
};

exports.getLevel = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const { type } = req.params;

    if (!type) {
      return responseHandler(res, 400, "Type is required");
    }

    const { levelId } = req.query;

    if (type === "state") {
      const findState = await State.findById(levelId).populate(
        "admins.user",
        "name"
      );
      if (findState) {
        return responseHandler(
          res,
          200,
          `State found successfully..!`,
          findState
        );
      }
    } else if (type === "zone") {
      const findZone = await Zone.findById(levelId).populate(
        "admins.user",
        "name"
      );
      if (findZone) {
        return responseHandler(
          res,
          200,
          `Zone found successfully..!`,
          findZone
        );
      }
    } else if (type === "district") {
      const findDistrict = await District.findById(levelId).populate(
        "admins.user",
        "name"
      );
      if (findDistrict) {
        return responseHandler(
          res,
          200,
          `District found successfully..!`,
          findDistrict
        );
      }
    } else if (type === "chapter") {
      const findChapter = await Chapter.findById(levelId).populate(
        "admins.user",
        "name"
      );
      if (findChapter) {
        return responseHandler(
          res,
          200,
          `Chapter found successfully..!`,
          findChapter
        );
      }
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error`);
  }
};

exports.deleteLevel = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("hierarchyManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { type } = req.params;

    if (!type) {
      return responseHandler(res, 400, "Type is required");
    }

    const { levelId } = req.query;

    if (type === "state") {
      const deleteState = await State.findByIdAndDelete(levelId);
      if (deleteState) {
        return responseHandler(
          res,
          200,
          "State deleted successfully",
          deleteState
        );
      }
    } else if (type === "zone") {
      const deleteZone = await Zone.findByIdAndDelete(levelId);
      if (deleteZone) {
        return responseHandler(
          res,
          200,
          "Zone deleted successfully",
          deleteZone
        );
      }
    } else if (type === "district") {
      const deleteDistrict = await District.findByIdAndDelete(levelId);
      if (deleteDistrict) {
        return responseHandler(
          res,
          200,
          "District deleted successfully",
          deleteDistrict
        );
      }
    } else if (type === "chapter") {
      const deleteChapter = await Chapter.findByIdAndDelete(levelId);
      if (deleteChapter) {
        return responseHandler(
          res,
          200,
          "Chapter deleted successfully",
          deleteChapter
        );
      }
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error`);
  }
};

exports.getAllDistricts = async (req, res) => {
  try {
    const getAllDistricts = await District.find();
    if (getAllDistricts) {
      return responseHandler(
        res,
        200,
        `districts found successfully..!`,
        getAllDistricts
      );
    }
    return responseHandler(res, 400, `District not found...!`);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllChapters = async (req, res) => {
  try {
    const getAllChapters = await Chapter.find().select("-admins -districtId");
    if (getAllChapters) {
      const headers = [
        { header: "ID", key: "Name" },
        { header: "Chapter Name", key: "ChapterName" },
        { header: "Short Code", key: "ShortCode" },
      ];

      const mappedData = getAllChapters.map((item) => {
        return {
          Name: item._id,
          ChapterName: item.name,
          ShortCode: item.shortCode,
        };
      });

      const data = {
        headers,
        body: mappedData,
      };
      return responseHandler(res, 200, `chapters found successfully..!`, data);
    }
    return responseHandler(res, 400, `Chapter not found...!`);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

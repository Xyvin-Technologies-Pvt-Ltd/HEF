const Joi = require("joi");

const linkSchema = Joi.object({
  name: Joi.string().required(),
  link: Joi.string().uri().required(),
});

exports.createEventSchema = Joi.object({
  eventName: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  image: Joi.string(),
  startDate: Joi.date().required(),
  startTime: Joi.date().required(),
  endDate: Joi.date().required(),
  endTime: Joi.date().required(),
  platform: Joi.string(),
  link: Joi.string(),
  venue: Joi.string(),
  organiserName: Joi.string().required(),
  speakers: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        designation: Joi.string().required(),
        role: Joi.string().required(),
        image: Joi.string(),
      })
    )
    .required(),
  status: Joi.string(),
});

exports.editEventSchema = Joi.object({
  eventName: Joi.string(),
  description: Joi.string(),
  type: Joi.string(),
  image: Joi.string(),
  startDate: Joi.date(),
  startTime: Joi.date(),
  endDate: Joi.date(),
  endTime: Joi.date(),
  platform: Joi.string(),
  link: Joi.string(),
  venue: Joi.string(),
  organiserName: Joi.string(),
  speakers: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      designation: Joi.string(),
      role: Joi.string(),
      image: Joi.string(),
    })
  ),
  status: Joi.string(),
});

exports.createRoleSchema = Joi.object({
  roleName: Joi.string().required(),
  description: Joi.string(),
  permissions: Joi.array(),
  status: Joi.boolean(),
});

exports.editRoleSchema = Joi.object({
  roleName: Joi.string(),
  description: Joi.string(),
  permissions: Joi.array(),
  status: Joi.boolean(),
});

exports.createAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
  status: Joi.boolean(),
});

exports.editAdminSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  role: Joi.string(),
  password :Joi.string(),
  status: Joi.boolean(),
});

exports.createNewsSchema = Joi.object({
  category: Joi.string(),
  title: Joi.string(),
  content: Joi.string(),
  media: Joi.string(),
  status: Joi.string(),
});

exports.editNewsSchema = Joi.object({
  category: Joi.string(),
  title: Joi.string(),
  content: Joi.string(),
  media: Joi.string(),
  status: Joi.string(),
});

exports.createPromotionSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  type: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  media: Joi.string(),
  link: Joi.string(),
});

exports.editPromotionSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  type: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  media: Joi.string(),
  link: Joi.string(),
});

exports.createNotificationSchema = Joi.object({
  users: Joi.array().required(),
  subject: Joi.string().required(),
  content: Joi.string().required(),
  media: Joi.string().required(),
  link: Joi.string(),
  type: Joi.string().required(),
});

exports.createReport = Joi.object({
  content: Joi.string().required(),
  reportType: Joi.string().valid("Post", "Chat", "User", "Message").required(),
});

exports.createStateSchema = Joi.object({
  name: Joi.string().required(),
  admins: Joi.array(),
});

exports.editStateSchema = Joi.object({
  name: Joi.string().required(),
  admins: Joi.array(),
});

exports.createDistrictSchema = Joi.object({
  name: Joi.string().required(),
  zoneId: Joi.string().required(),
  admins: Joi.array(),
});

exports.editDistrictSchema = Joi.object({
  name: Joi.string(),
  zoneId: Joi.string(),
  admins: Joi.array(),
});

exports.createChapterSchema = Joi.object({
  name: Joi.string().required(),
  districtId: Joi.string().required(),
  admins: Joi.array(),
});

exports.editChapterSchema = Joi.object({
  name: Joi.string().required(),
  districtId: Joi.string(),
  admins: Joi.array(),
});

exports.createZoneSchema = Joi.object({
  name: Joi.string().required(),
  stateId: Joi.string().required(),
  admins: Joi.array(),
});

exports.editZoneSchema = Joi.object({
  name: Joi.string(),
  stateId: Joi.string(),
  admins: Joi.array(),
});

exports.createMemberSchema = Joi.object({
  name: Joi.string(),
  //memberId: Joi.string(),
  chapterId: Joi.string(),
  subscription: Joi.string(),
  role: Joi.string(),
});

exports.editMemberSchema = Joi.object({
  name: Joi.string(),
  chapterId: Joi.string(),
  subscription: Joi.string(),
  admins: Joi.array(),
});




exports.createProductSchema = Joi.object({
  seller: Joi.string().required(), 
  name: Joi.string().required(),
  image: Joi.string().required(), 
  price: Joi.number().required(),
  offerPrice: Joi.number().required(),
  description: Joi.string().required(),
  moq: Joi.number().required(),
  units: Joi.string().required(),
  status: Joi.string(),
});

exports.updateProductSchema = Joi.object({
  name: Joi.string(),
  image: Joi.string(),
  price: Joi.number(),
  offerPrice: Joi.number(),
  description: Joi.string(),
  moq: Joi.number(),
  units: Joi.string(),
  status: Joi.string(),
  reason: Joi.string(),
});


exports.createUserSchema = Joi.object({
  name: Joi.string().required(),
  uid: Joi.string().required(),
  memberId: Joi.string(),
  bloodgroup: Joi.string(),
  role: Joi.string(),
  chapter: Joi.string(),
  image: Joi.string(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required(),
  secondaryPhone: Joi.array(),
  bio: Joi.string(),
  status: Joi.string(),
  address: Joi.string(),
  businessCatogary: Joi.string(),
  businessSubCatogary: Joi.string(),
  company: Joi.object({
    name: Joi.string(),
    designation: Joi.string(),
    email: Joi.string().email(),
    websites: Joi.string(),
    phone: Joi.string(),
  }),
});

exports.editUserSchema = Joi.object({
  name: Joi.string().required(),
  uid: Joi.string().required(),
  memberId: Joi.string(),
  bloodgroup: Joi.string(),
  role: Joi.string(),
  chapter: Joi.string(),
  image: Joi.string(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required(),
  secondaryPhone: Joi.array(),
  bio: Joi.string(),
  status: Joi.string(),
  address: Joi.string(),
  businessCatogary: Joi.string(),
  businessSubCatogary: Joi.string(),
  company: Joi.object({
    name: Joi.string(),
    designation: Joi.string(),
    email: Joi.string().email(),
    websites: Joi.string(),
    phone: Joi.string(),
  }),
});

exports.updateUserSchema = Joi.object({
 
  name: Joi.string().required(),
  uid: Joi.string().required(),
  memberId: Joi.string(),
  bloodgroup: Joi.string(),
  role: Joi.string(),
  chapter: Joi.string(),
  image: Joi.string(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required(),
  secondaryPhone: Joi.array(),
  bio: Joi.string(),
  status: Joi.string(),
  address: Joi.string(),
  businessCatogary: Joi.string(),
  businessSubCatogary: Joi.string(),
  company: Joi.object({
    name: Joi.string(),
    designation: Joi.string(),
    email: Joi.string().email(),
    websites: Joi.string(),
    phone: Joi.string(),
  }),
});

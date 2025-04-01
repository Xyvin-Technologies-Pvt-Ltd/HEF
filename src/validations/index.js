const Joi = require("joi");

const linkSchema = Joi.object({
  name: Joi.string().required(),
  link: Joi.string().uri().required(),
});

// exports.createFeedsSchema = Joi.object({
//   media: Joi.string(),
//   content: Joi.string().required(),
// });

exports.createFeedsSchema = Joi.object({
  type: Joi.string().allow(""),
  media: Joi.string(),
  link: Joi.string(),
  content: Joi.string().required(),
});

exports.createEventSchema = Joi.object({
  eventName: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  image: Joi.string(),
  eventDate: Joi.date().required(),
  eventEndDate: Joi.date(),
  startDate: Joi.date().required(),
  startTime: Joi.date().required(),
  endDate: Joi.date().required(),
  endTime: Joi.date().required(),
  limit: Joi.number().required(),
  platform: Joi.string(),
  link: Joi.string(),
  venue: Joi.string(),
  organiserName: Joi.string().required(),
  coordinator: Joi.array().items(Joi.string()),
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
  attended: Joi.array().items(Joi.string()),
});

exports.editEventSchema = Joi.object({
  eventName: Joi.string(),
  description: Joi.string(),
  type: Joi.string(),
  image: Joi.string(),
  eventDate: Joi.date(),
  startDate: Joi.date(),
  startTime: Joi.date(),
  endDate: Joi.date(),
  endTime: Joi.date(),
  platform: Joi.string(),
  link: Joi.string(),
  limit: Joi.number(),
  venue: Joi.string(),
  organiserName: Joi.string(),
  coordinator: Joi.array().items(Joi.string()),
  speakers: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      designation: Joi.string(),
      role: Joi.string(),
      image: Joi.string(),
    })
  ),
  status: Joi.string(),
  attended: Joi.array().items(Joi.string()),
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
  password: Joi.string(),
  status: Joi.boolean(),
});

exports.createNewsSchema = Joi.object({
  category: Joi.string(),
  title: Joi.string(),
  content: Joi.string(),
  media: Joi.string(),
  status: Joi.string(),
  pdf: Joi.string(),
});

exports.editNewsSchema = Joi.object({
  category: Joi.string(),
  title: Joi.string(),
  content: Joi.string(),
  media: Joi.string(),
  status: Joi.string(),
  pdf: Joi.string(),
});

exports.createPromotionSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  type: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  media: Joi.string(),
  link: Joi.string(),
  status: Joi.string(),
});

exports.editPromotionSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  type: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  media: Joi.string(),
  link: Joi.string(),
  status: Joi.string(),
});

exports.createNotificationSchema = Joi.object({
  users: Joi.array(),
  subject: Joi.string().required(),
  content: Joi.string().required(),
  media: Joi.string(),
  link: Joi.string(),
  type: Joi.string().required(),
  level: Joi.string(),
  id: Joi.array(),
});

exports.createReport = Joi.object({
  content: Joi.string().required(),
  reportType: Joi.string()
    .valid("Feeds", "Chat", "User", "Message", "Product")
    .required(),
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
  shortCode: Joi.string().required(),
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
  tags: Joi.array(),
  moq: Joi.number().required(),
  units: Joi.string().required(),
  status: Joi.string(),
});

exports.updateProductSchema = Joi.object({
  seller: Joi.string(),
  name: Joi.string(),
  image: Joi.string(),
  price: Joi.number(),
  offerPrice: Joi.number(),
  description: Joi.string(),
  tags: Joi.array(),
  moq: Joi.number(),
  units: Joi.string(),
  status: Joi.string(),
  reason: Joi.string(),
});

exports.createUserSchema = Joi.object({
  name: Joi.string().required(),
  memberId: Joi.string(),
  bloodgroup: Joi.string(),
  chapter: Joi.string(),
  designation: Joi.string(),
  image: Joi.string(),
  file: Joi.array().items(Joi.string()),
  email: Joi.string().email(),
  phone: Joi.string().trim().required(),
  secondaryPhone: Joi.object({
    whatsapp: Joi.string(),
    business: Joi.string(),
  }),
  bio: Joi.string(),
  status: Joi.string(),
  address: Joi.string(),
  businessCatogary: Joi.string(),
  businessSubCatogary: Joi.string(),
  businessTags: Joi.array(),
  dateOfJoining: Joi.date(),
  company: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      designation: Joi.string(),
      email: Joi.string().email(),
      websites: Joi.string(),
      phone: Joi.string(),
      logo: Joi.string(),
    })
  ),
});

exports.editUserSchema = Joi.object({
  name: Joi.string(),
  uid: Joi.string(),
  memberId: Joi.string(),
  bloodgroup: Joi.string(),
  designation: Joi.string(),
  chapter: Joi.string(),
  image: Joi.string(),
  file: Joi.array().items(Joi.string()),
  email: Joi.string().email(),
  phone: Joi.string().trim(),
  secondaryPhone: Joi.object({
    whatsapp: Joi.string(),
    business: Joi.string(),
  }),
  bio: Joi.string(),
  status: Joi.string(),
  address: Joi.string(),
  businessCatogary: Joi.string(),
  businessSubCatogary: Joi.string(),
  businessTags: Joi.array(),
  dateOfJoining: Joi.date(),
  company: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      designation: Joi.string(),
      email: Joi.string().email(),
      websites: Joi.string(),
      phone: Joi.string(),
      logo: Joi.string(),
    })
  ),
  social: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string(),
    })
  ),
  websites: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string(),
    })
  ),
  awards: Joi.array().items(
    Joi.object({
      image: Joi.string(),
      name: Joi.string(),
      authority: Joi.string(),
    })
  ),
  videos: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string(),
    })
  ),
  certificates: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string(),
    })
  ),
});

exports.updateUserSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required.",
  }),
  uid: Joi.string(),
  memberId: Joi.string(),
  bloodgroup: Joi.string(),
  designation: Joi.string(),
  chapter: Joi.string(),
  image: Joi.string(),
  file: Joi.array().items(Joi.string()),
  email: Joi.string().email().allow(""),
  phone: Joi.string().trim().required().messages({
    "string.empty": "Phone number is required.",
  }),
  secondaryPhone: Joi.object({
    whatsapp: Joi.string(),
    business: Joi.string(),
  }),
  bio: Joi.string(),
  status: Joi.string(),
  address: Joi.string(),
  businessCatogary: Joi.string(),
  businessSubCatogary: Joi.string(),
  businessTags: Joi.array(),
  company: Joi.array().items(
    Joi.object({
      name: Joi.string().required().messages({
        "string.empty": "Company name is required.",
      }),
      designation: Joi.string(),
      email: Joi.string().email().messages({
        "string.email": "Company email must be a valid email.",
      }),
      websites: Joi.string(),
      phone: Joi.string(),
      logo: Joi.string().allow(""),
    })
  ),
  social: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string(),
    })
  ),
  websites: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string(),
    })
  ),
  awards: Joi.array().items(
    Joi.object({
      image: Joi.string(),
      name: Joi.string(),
      authority: Joi.string(),
    })
  ),
  videos: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string(),
    })
  ),
  certificates: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      link: Joi.string(),
    })
  ),
  fcm: Joi.string().allow(''),
});

exports.createReviewSchema = Joi.object({
  toUser: Joi.string().required(),
  rating: Joi.number().required(),
  comment: Joi.string().required(),
});

exports.updateReviewSchema = Joi.object({
  toUser: Joi.string().required(),
  rating: Joi.number().required(),
  comment: Joi.string().required(),
});

exports.createAnalyticSchema = Joi.object({
  type: Joi.string().required(),
  member: Joi.string().required(),
  sender: Joi.string(),
  title: Joi.string().required(),
  description: Joi.string(),
  amount: Joi.number(),
  referral: Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    info: Joi.string(),
  }),
  contact: Joi.string(),
  date: Joi.date(),
  time: Joi.string(),
  meetingLink: Joi.string(),
  location: Joi.string(),
  status: Joi.string(),
});

exports.createMemberSchema = Joi.object({
  name: Joi.string().required(),
  bloodgroup: Joi.string(),
  image: Joi.string(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required(),
  bio: Joi.string(),
  status: Joi.string(),
  address: Joi.string(),
  businessCatogary: Joi.string(),
  businessSubCatogary: Joi.string(),
  chapter: Joi.string().required(),
  company: Joi.object({
    name: Joi.string(),
    designation: Joi.string(),
    email: Joi.string().email(),
    websites: Joi.string(),
    phone: Joi.string(),
  }),
});

exports.createSubscriptionSchema = Joi.object({
  user: Joi.string().required(),
  expiryDate: Joi.date().required(),
});

exports.updateSubscriptionSchema = Joi.object({
  user: Joi.string().required(),
  expiryDate: Joi.date().required(),
});

exports.createGroupSchame = Joi.object({
  groupName: Joi.string().required(),
  groupInfo: Joi.string().required(),
  participantIds: Joi.array().required(),
  chapter: Joi.string(),
});

exports.editGroupSchema = Joi.object({
  groupName: Joi.string(),
  groupInfo: Joi.string(),
  participantIds: Joi.array(),
});

exports.createAccessSchema = Joi.object({
  sendNotification: Joi.boolean().required(),
  postRequirement: Joi.boolean().required(),
  addReward: Joi.boolean().required(),
  addCertificate: Joi.boolean().required(),
  addSocialmedia: Joi.boolean().required(),
});

exports.editAccessSchema = Joi.object({
  sendNotification: Joi.boolean(),
  postRequirement: Joi.boolean(),
  addReward: Joi.boolean(),
  addCertificate: Joi.boolean(),
  addSocialmedia: Joi.boolean(),
});

exports.PaymentSchema = Joi.object({
  user: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  category: Joi.string().required().valid("app", "membership"),
  parentSub: Joi.string().required(),
  receipt: Joi.string(),
  status: Joi.string(),
});

exports.UserPaymentSchema = Joi.object({
  category: Joi.string().required().valid("app", "membership"),
  receipt: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  parentSub: Joi.string().required(),
});

exports.createParentSubSchema = Joi.object({
  academicYear: Joi.string().required(),
  expiryDate: Joi.date().required(),
});

exports.editParentSubSchema = Joi.object({
  academicYear: Joi.string(),
  expiryDate: Joi.date(),
});

exports.PaymentSchema = Joi.object({
  user: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  category: Joi.string().required().valid("app", "membership"),
  parentSub: Joi.string().required(),
  receipt: Joi.string(),
  status: Joi.string(),
});

exports.bulkCreateUserSchema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
    email: Joi.string().allow("").email(),
    phone: Joi.string().required(),
    chapter: Joi.string().required(),
    businessTags: Joi.array(),
    dateOfJoining: Joi.date(),
    designation: Joi.string(),
  })
);

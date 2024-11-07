const Joi = require("joi");

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
  

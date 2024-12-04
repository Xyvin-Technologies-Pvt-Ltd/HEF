const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const Analytic = require("../models/analyticModel");




exports.sendRequest = async (req, res) => {
  try {
    const { error } = validations.createAnalyticSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    req.body.sender = req.userId;
    const analytic = await Analytic.create(req.body);
    return responseHandler(res, 201, "Request created successfully", analytic);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.viewAllRequestSend = async (req, res) => {
  try {
    const analytics = await Analytic.find()
      .populate()
      
    return responseHandler(
      res,
      200,
      "Requests fetched successfully",
      analytics
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};





exports.getReceivedRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const receivedRequests = await Analytic.find({ member: userId });

    return responseHandler(
      res,
      200,
      "Received requests fetched successfully",
      receivedRequests
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;

   
    const sentRequests = await Analytic.find({ sender: userId });

    return responseHandler(
      res,
      200,
      "Sent requests fetched successfully",
      sentRequests
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};



exports.getHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const [sentRequests, receivedRequests] = await Promise.all([
      Analytic.find({ sender: userId }),    
      Analytic.find({ member: userId }), 
    ]);

  
    return responseHandler(res, 200, "User requests fetched successfully", {
      sentRequests,
      receivedRequests,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


// exports.getSentRequestById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.userId;

//     // Find the request by ID and ensure the user is the sender
//     const sentRequest = await Analytic.findOne({ _id: id, sender: userId });

//     if (!sentRequest) {
//       return responseHandler(res, 404, "Sent request not found");
//     }

//     return responseHandler(
//       res,
//       200,
//       "Sent request fetched successfully",
//       sentRequest
//     );
//   } catch (error) {
//     return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
//   }
// };

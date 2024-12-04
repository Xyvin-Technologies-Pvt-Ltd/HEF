/**
 * @swagger
 * tags:
 *   - name: Analytic
 *     description: Analytic-related endpoints
 */

/**
 * @swagger
 * /analytic:
 *   post:
 *     summary: Create a new analytic request
 *     description: Creates a new analytic request with the provided details.
 *     tags:
 *       - Analytic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of the analytic request
 *                 enum:
 *                   - Business
 *                   - One v One Meeting
 *                   - Training Session
 *                 example: "Business"
 *               member:
 *                 type: string
 *                 description: ID of the member associated with the request
 *                 example: "64fa12b5d1234a1234567890"
 *               sender:
 *                 type: string
 *                 description: ID of the sender of the request
 *                 example: "64fa12b5d1234a1234567891"
 *               title:
 *                 type: string
 *                 description: Title of the analytic request
 *                 example: "Business Strategy Meeting"
 *               description:
 *                 type: string
 *                 description: Detailed description of the request
 *                 example: "Discussing growth strategies for the upcoming quarter"
 *               referral:
 *                 type: string
 *                 description: Referral user ID
 *                 example: "64fa12b5d1234a1234567892"
 *               contact:
 *                 type: string
 *                 description: Contact number of the user
 *                 example: "+1234567890"
 *               amount:
 *                 type: string
 *                 description: Amount involved in the session
 *                 example: 2000
 *               discount:
 *                 type: string
 *                 description: Discount applied as a percentage
 *                 example: "10%"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the session
 *                 example: "2024-12-01"
 *               time:
 *                 type: string
 *                 format: time
 *                 description: Time of the session
 *                 example: "14:00"
 *               meetingLink:
 *                 type: string
 *                 description: Meeting link (if applicable)
 *                 example: "https://zoom.us/j/123456789"
 *               location:
 *                 type: string
 *                 description: Physical location (if applicable)
 *                 example: "Conference Room A"
 *               status:
 *                 type: string
 *                 description: Status of the request
 *                 enum:
 *                   - accepted
 *                   - pending
 *                   - rejected
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: New analytic request created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /analytic:
 *   get:
 *     summary: Retrieve all analytic requests
 *     description: Fetches a list of all analytic requests.
 *     tags:
 *       - Analytic
 *     responses:
 *       200:
 *         description: A list of analytic requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: Type of the analytic request
 *                     example: "Business"
 *                   member:
 *                     type: string
 *                     description: ID of the member
 *                     example: "64fa12b5d1234a1234567890"
 *                   sender:
 *                     type: string
 *                     description: ID of the sender
 *                     example: "64fa12b5d1234a1234567891"
 *                   title:
 *                     type: string
 *                     description: Title of the request
 *                     example: "Business Strategy Meeting"
 *                   status:
 *                     type: string
 *                     description: Status of the request
 *                     example: "accepted"
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /analytic/send:
 *   get:
 *     summary: Retrieve a list of sent analytic requests
 *     description: Fetches all analytic requests sent by the logged-in user.
 *     tags:
 *       - Analytic
 *     responses:
 *       200:
 *         description: A list of sent analytic requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: Type of the analytic request
 *                     example: "Business"
 *                   member:
 *                     type: string
 *                     description: ID of the member
 *                     example: "64fa12b5d1234a1234567890"
 *                   sender:
 *                     type: string
 *                     description: ID of the sender
 *                     example: "64fa12b5d1234a1234567891"
 *                   title:
 *                     type: string
 *                     description: Title of the request
 *                     example: "Business Strategy Meeting"
 *                   status:
 *                     type: string
 *                     description: Status of the request
 *                     example: "pending"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /analytic/received:
 *   get:
 *     summary: Retrieve a list of received analytic requests
 *     description: Fetches all analytic requests received by the logged-in user.
 *     tags:
 *       - Analytic
 *     responses:
 *       200:
 *         description: A list of received analytic requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: Type of the analytic request
 *                     example: "Business"
 *                   member:
 *                     type: string
 *                     description: ID of the member
 *                     example: "64fa12b5d1234a1234567890"
 *                   sender:
 *                     type: string
 *                     description: ID of the sender
 *                     example: "64fa12b5d1234a1234567891"
 *                   title:
 *                     type: string
 *                     description: Title of the request
 *                     example: "Team Collaboration Request"
 *                   status:
 *                     type: string
 *                     description: Status of the request
 *                     example: "accepted"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /analytic/history:
 *   get:
 *     summary: Retrieve the history of analytic requests
 *     description: Fetches a history of both sent and received analytic requests for the logged-in user.
 *     tags:
 *       - Analytic
 *     responses:
 *       200:
 *         description: A combined list of sent and received analytic requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sentRequests:
 *                   type: array
 *                   description: List of requests sent by the user
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         description: Type of the analytic request
 *                         example: "Business"
 *                       member:
 *                         type: string
 *                         description: ID of the member
 *                         example: "64fa12b5d1234a1234567890"
 *                       sender:
 *                         type: string
 *                         description: ID of the sender
 *                         example: "64fa12b5d1234a1234567891"
 *                       title:
 *                         type: string
 *                         description: Title of the request
 *                         example: "Project Update"
 *                       status:
 *                         type: string
 *                         description: Status of the request
 *                         example: "pending"
 *                 receivedRequests:
 *                   type: array
 *                   description: List of requests received by the user
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         description: Type of the analytic request
 *                         example: "Business"
 *                       member:
 *                         type: string
 *                         description: ID of the member
 *                         example: "64fa12b5d1234a1234567890"
 *                       sender:
 *                         type: string
 *                         description: ID of the sender
 *                         example: "64fa12b5d1234a1234567891"
 *                       title:
 *                         type: string
 *                         description: Title of the request
 *                         example: "Team Collaboration Request"
 *                       status:
 *                         type: string
 *                         description: Status of the request
 *                         example: "rejected"
 *       500:
 *         description: Internal server error
 */


// /**
//  * @swagger
//  * /analytic/send/{id}:
//  *   get:
//  *     summary: Retrieve a sent request by ID
//  *     description: Fetches the details of a specific sent analytic request by its ID.
//  *     tags:
//  *       - Analytic
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the sent analytic request
//  *     responses:
//  *       200:
//  *         description: Sent request details
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 type:
//  *                   type: string
//  *                   description: Type of the analytic request
//  *                   example: "Business"
//  *                 member:
//  *                   type: string
//  *                   description: ID of the member
//  *                   example: "64fa12b5d1234a1234567890"
//  *                 sender:
//  *                   type: string
//  *                   description: ID of the sender
//  *                   example: "64fa12b5d1234a1234567891"
//  *                 title:
//  *                   type: string
//  *                   description: Title of the request
//  *                   example: "Business Strategy Meeting"
//  *                 status:
//  *                   type: string
//  *                   description: Status of the request
//  *                   example: "pending"
//  *       404:
//  *         description: Sent request not found
//  *       500:
//  *         description: Internal server error
//  */

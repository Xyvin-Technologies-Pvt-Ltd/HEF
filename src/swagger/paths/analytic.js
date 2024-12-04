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

/**w
 * @swagger
 * /analytic:
 *   get:
 *     summary: Fetch user requests
 *     description: Retrieve sent requests, received requests, or both based on the filter parameter.
 *     tags:
 *       - Analytic
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [sent, received]
 *         required: false
 *         description: Specify "sent" to fetch sent requests, "received" to fetch received requests, or leave empty to fetch all.
 *     responses:
 *       200:
 *         description: Successfully fetched requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Requests fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID of the analytic request
 *                         example: "64acfd273f0c123456789abc"
 *                       type:
 *                         type: string
 *                         description: Type of the analytic request
 *                         example: "Business"
 *                       member:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID of the member
 *                             example: "64fa12b5d1234a1234567890"
 *                           name:
 *                             type: string
 *                             description: Name of the member
 *                             example: "Jane Doe"
 *                           image:
 *                             type: string
 *                             description: URL of the member's image
 *                             example: "https://example.com/images/jane.jpg"
 *                       sender:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID of the sender
 *                             example: "64fa12b5d1234a1234567891"
 *                           name:
 *                             type: string
 *                             description: Name of the sender
 *                             example: "John Smith"
 *                           image:
 *                             type: string
 *                             description: URL of the sender's image
 *                             example: "https://example.com/images/john.jpg"
 *                       title:
 *                         type: string
 *                         description: Title of the request
 *                         example: "Business Strategy Meeting"
 *                       status:
 *                         type: string
 *                         description: Status of the request
 *                         example: "pending"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation date of the request
 *                         example: "2024-12-04T10:15:00.000Z"
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Internal server error
 */



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
 *     summary: Send a new analytic request
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
 *                 type: object
 *                 description: Member details
 *                 properties:
 *                   state:
 *                     type: string
 *                     description: State ID
 *                     example: "64fa12b5d1234a1234567890"
 *                   zone:
 *                     type: string
 *                     description: Zone ID
 *                     example: "64fa12b5d1234a1234567891"
 *                   district:
 *                     type: string
 *                     description: District ID
 *                     example: "64fa12b5d1234a1234567892"
 *                   chapter:
 *                     type: string
 *                     description: Chapter ID
 *                     example: "64fa12b5d1234a1234567893"
 *               title:
 *                 type: string
 *                 description: Title of the request
 *                 example: "Business Strategy Meeting"
 *               discription:
 *                 type: string
 *                 description: Description of the request
 *                 example: "Discussing growth strategies"
 *               referal:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Referral user ID
 *                       example: "64fa12b5d1234a1234567894"
 *               contact:
 *                 type: string
 *                 description: Contact information
 *                 example: "+1234567890"
 *               amount:
 *                 type: string
 *                 description: Amount involved in the session
 *                 example: "2000"
 *               discount:
 *                 type: string
 *                 description: Discount applied
 *                 example: "10%"
 *               date:
 *                 type: string
 *                 description: Date of the request
 *                 example: "2024-12-01"
 *               time:
 *                 type: string
 *                 description: Time of the request
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
 *                   - Accepted
 *                   - Pending
 *                   - Rejected
 *                 example: "Pending"
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
 *     summary: View all analytic requests
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
 *                     type: object
 *                     description: Member details
 *                   title:
 *                     type: string
 *                     description: Title of the request
 *                     example: "Business Strategy Meeting"
 *                   status:
 *                     type: string
 *                     description: Status of the request
 *                     example: "Accepted"
 *       500:
 *         description: Internal server error
 */

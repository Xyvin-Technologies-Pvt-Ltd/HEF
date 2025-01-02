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
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /analytic/status:
 *   post:
 *     summary: Update the status of an analytic request
 *     description: Updates the status of an analytic request based on the provided requestId and action (approve/reject).
 *     tags:
 *       - Analytic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the analytic request to update
 *                 example: "64fa12b5d1234a1234567890"
 *               action:
 *                 type: string
 *                 description: The action to perform on the request (approve or reject)
 *                 enum:
 *                   - accepted
 *                   - rejected
 *                 example: "accepted"
 *     responses:
 *       200:
 *         description: Request status successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request successfully approved."
 *                 updatedRequest:
 *                   type: object
 *                   description: The updated analytic request object
 *       400:
 *         description: Invalid input - Missing requestId or invalid action
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /analytic/{requestId}:
 *   delete:
 *     summary: Delete an analytic request by ID
 *     description: Deletes an analytic request based on the provided request ID.
 *     tags:
 *       - Analytic
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         description: ID of the analytic request to delete
 *         schema:
 *           type: string
 *           example: "64fa12b5d1234a1234567890"
 *     responses:
 *       200:
 *         description: Request successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request successfully deleted."
 *                 deletedRequest:
 *                   type: object
 *                   description: The deleted analytic request object
 *       400:
 *         description: Invalid input - Missing or incorrect request ID
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /analytic/chapter/{chapterId}:
 *   get:
 *     summary: Fetch analytic requests by chapter
 *     description: Retrieves analytic requests where either the sender or member belongs to the specified chapter.
 *     tags:
 *       - Analytic
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         description: ID of the chapter for which to fetch analytic requests
 *         schema:
 *           type: string
 *           example: "64fa12b5d1234a1234567890"
 *     responses:
 *       200:
 *         description: Successfully fetched analytic requests for the chapter.
 *       400:
 *         description: Missing or invalid chapter ID.
 *       404:
 *         description: No requests found for the specified chapter.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * tags:
 *   name: UserAccess
 *   description: UserAccess management and operations
 */


/**
 * @swagger
 * /useraccess:
 *   post:
 *     summary: Create a new user access
 *     description: Adds new access permissions for a user.
 *     tags:
 *       - UserAccess
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sendNotification:
 *                 type: boolean
 *               postRequirement:
 *                 type: boolean
 *               addReward:
 *                 type: boolean
 *               addCertificate:
 *                 type: boolean
 *               addSocialmedia:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User access created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /useraccess:
 *   get:
 *     summary: Get all user access records
 *     description: Retrieves all user access permissions from the database.
 *     tags:
 *       - UserAccess
 *     responses:
 *       200:
 *         description: Access records retrieved successfully
 *       404:
 *         description: No records found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /useraccess/{id}:
 *   put:
 *     summary: Update user access by ID
 *     description: Edits an existing user access record by its unique ID.
 *     tags:
 *       - UserAccess
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user access record to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sendNotification:
 *                 type: boolean
 *               postRequirement:
 *                 type: boolean
 *               addReward:
 *                 type: boolean
 *               addCertificate:
 *                 type: boolean
 *               addSocialmedia:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User access updated successfully
 *       400:
 *         description: Invalid request or ID not found
 *       500:
 *         description: Internal Server Error
 */

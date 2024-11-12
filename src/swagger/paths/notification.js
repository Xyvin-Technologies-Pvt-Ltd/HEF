/**
 * @swagger
 * tags:
 *   - name: Notification
 *     description: Notification related endpoints
 */

/**
 * @swagger
 * /notification:
 *   post:
 *     summary: Create a new notification
 *     description: Creates a new notification and optionally sends emails to the users specified in the request.
 *     tags:
 *       - Notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       format: objectId
 *                       description: User ID for whom the notification is intended
 *                     read:
 *                       type: boolean
 *                       description: Whether the notification has been read
 *                 example:
 *                   - user: "60d21b4667d0d8992e610c85"
 *                     read: false
 *               subject:
 *                 type: string
 *                 description: Subject of the notification
 *                 example: "System Update"
 *               content:
 *                 type: string
 *                 description: Content of the notification
 *                 example: "There will be a system update at midnight."
 *               media:
 *                 type: string
 *                 description: Media link associated with the notification
 *                 example: "https://example.com/media/update-image.png"
 *               link:
 *                 type: string
 *                 description: Link for more information
 *                 example: "https://example.com/more-info"
 *               type:
 *                 type: string
 *                 enum: ["email", "in-app"]
 *                 description: Type of notification
 *                 example: "email"
 *     responses:
 *       200:
 *         description: Notification created successfullyy
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /notification/user:
 *   get:
 *     summary: Get a user list of Notification
 *     description: Retrieves a  user list of Notification.
 *     tags:
 *       - Notification
 *     responses:
 *       200:
 *         description: successfullyy retrieved the list of Notification
 *       500:
 *         description: Internal Server Error
 */
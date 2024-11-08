/**
 * @swagger
 * tags:
 *   - name: Feeds
 *     description: Feeds related endpoints
 */

/**
 * @swagger
 * /feeds:
 *   post:
 *     summary: Create new feeds
 *     description: Creates a new feed with the provided details.
 *     tags:
 *       - Feeds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "Article"
 *               media:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               link:
 *                 type: string
 *                 example: "https://example.com/article"
 *               content:
 *                 type: string
 *                 example: "This is the content of the feed..."
 *     responses:
 *       201:
 *         description: New Feeds created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /feeds/single/{id}:
 *   get:
 *     summary: Get feed by ID
 *     description: Retrieves a specific feed by its ID.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the feed to retrieve
 *     responses:
 *       200:
 *         description: Feed found successfully
 *       400:
 *         description: Bad Request - Invalid ID or ID not provided
 *       404:
 *         description: Feed not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /feeds/list:
 *   get:
 *     summary: Get a list of feeds
 *     description: Retrieves a paginated list of feeds with optional filtering by status.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination (defaults to 1)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter feeds by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of feeds per page (defaults to 10)
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of feeds
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /feeds/admin/list:
 *   get:
 *     summary: Get a list of feeds
 *     description: Retrieves a paginated list of feeds with optional filtering by status.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination (defaults to 1)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter feeds by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of feeds per page (defaults to 10)
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of feeds
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /feeds/like/{id}:
 *   post:
 *     summary: Like or Unlike a feed
 *     description: Allows a user to like or unlike a specific feed. If the user has already liked the feed, it will be unliked, and if the user hasn't liked it yet, it will be liked.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The ID of the feed to like or unlike.
 *     responses:
 *       200:
 *         description: Successfully liked or unliked the feed
 *       400:
 *         description: Bad request, feed ID is required
 *       404:
 *         description: Feed not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /feeds/comment/{id}:
 *   post:
 *     summary: Comment on a feed
 *     description: Adds a comment to a specific feed by the user.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The ID of the feed to comment on.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "This is the content of the feed..."
 *     responses:
 *       200:
 *         description: Successfully commented on the feed
 *       400:
 *         description: Bad request, feed ID is required
 *       404:
 *         description: Feed not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /feeds/single/{id}:
 *   delete:
 *     summary: Delete a feed
 *     description: Delete a specific feed by its ID.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the feed to be deleted
 *     responses:
 *       200:
 *         description: Successfully deleted the feed
 *       400:
 *         description: Bad request, missing feed ID
 *       404:
 *         description: Feed not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /feeds/user/{id}:
 *   get:
 *     summary: Get feeds authored by a specific user
 *     description: Retrieve all feeds created by a user based on their user ID.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose feeds are being retrieved.
 *     responses:
 *       200:
 *         description: Successfully retrieved feeds authored by the user
 *       400:
 *         description: User ID is required
 *       404:
 *         description: Feeds not found for the user
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /feeds/single/{action}/{id}:
 *   put:
 *     summary: Update feed status (accept/reject)
 *     description: Accept or reject a feed by updating its status. Accepting a feed sets the status to "published", while rejecting it sets the status to "rejected" with a reason.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - name: action
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [accept, reject]
 *         description: Action to be performed (accept or reject).
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the feed to be updated.
 *       - name: reason
 *         in: body
 *         required: false
 *         description: Reason for rejecting the feed (only required if action is "reject").
 *         schema:
 *           type: object
 *           properties:
 *             reason:
 *               type: string
 *               example: "The content does not meet the guidelines."
 *     responses:
 *       200:
 *         description: Feeds updated successfully
 *       400:
 *         description: Feed ID is required
 *       404:
 *         description: Feed not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /feeds/my-feeds:
 *   get:
 *     summary: Get feeds created by the authenticated user
 *     description: Retrieve all feeds authored by the currently authenticated user.
 *     tags:
 *       - Feeds
 *     responses:
 *       200:
 *         description: Feeds found successfully
 *       404:
 *         description: Feeds not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /feeds/not-interested/{id}:
 *   put:
 *     summary: Mark a feed as not interested
 *     description: Add the User ID to the user's list of "not interested" feeds.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to mark as not interested
 *         schema:
 *           type: string
 *           example: "643b2a4a5b673a64f56c742b"
 *     responses:
 *       200:
 *         description: Feed marked as not interested successfully
 *       400:
 *         description: Invalid request (e.g., missing user ID or failed update)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /feeds/interested/{id}:
 *   put:
 *     summary: Mark a feed as interested
 *     description: Remove the User ID from the user's list of "not interested" feeds.
 *     tags:
 *       - Feeds
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to remove from the not interested list
 *         schema:
 *           type: string
 *           example: "643b2a4a5b673a64f56c742b"
 *     responses:
 *       200:
 *         description: Feed marked as interested successfully
 *       400:
 *         description: Invalid request (e.g., missing user ID or failed update)
 *       500:
 *         description: Internal server error
 */

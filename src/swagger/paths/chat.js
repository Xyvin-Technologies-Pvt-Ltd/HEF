/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: Chat related endpoints
 */

/**
 * @swagger
 * /chat/create-group:
 *   post:
 *     summary: Create a new group chat
 *     description: Creates a new group chat with the specified participants and group name.
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 description: The name of the group chat
 *                 example: "Project Team"
 *               groupInfo:
 *                 type: string
 *                 description: Additional information about the group
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                 description: List of participant IDs to be added to the group
 *                 example:
 *                   - "60d21b4667d0d8992e610c85"
 *                   - "60d21b4667d0d8992e610c86"
 *     responses:
 *       201:
 *         description: Group chat created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/get-chats:
 *   get:
 *     summary: Get chat threads
 *     description: Retrieves all chat threads that the authenticated user is a part of.
 *     tags:
 *       - Chat
 *     responses:
 *       200:
 *         description: Chat threads retrieved successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/group-message/{id}:
 *   get:
 *     summary: Get group chat messages
 *     description: Retrieves all messages in a specific group chat by group ID. Marks all messages as "seen" for the authenticated user.
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The ID of the group chat
 *     responses:
 *       200:
 *         description: Group messages retrieved successfully
 *       404:
 *         description: No messages found in this group
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/between-users/{id}:
 *   get:
 *     summary: Get chat messages between two users
 *     description: Retrieves all chat messages between the authenticated user and another user identified by the user ID in the path.
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The ID of the other user
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       404:
 *         description: No messages found between the users
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/list-group:
 *   get:
 *     summary: Get list of chat groups
 *     description: Retrieve a paginated list of chat groups with member count.
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: pageNo
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page.
 *     responses:
 *       200:
 *         description: Successfully retrieved chat group list
 *       400:
 *         description: Bad request, invalid parameters
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/group-details/{id}:
 *   get:
 *     summary: Get details of a specific chat group
 *     description: Retrieve detailed information of a chat group, including participant details.
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat group
 *     responses:
 *       200:
 *         description: Successfully retrieved group details
 *       400:
 *         description: Bad request, group ID is missing
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/group/{id}:
 *   put:
 *     summary: Update chat group details
 *     description: Update the name, info, and participants of a specific chat group.
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat group to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 description: New name of the chat group
 *               groupInfo:
 *                 type: string
 *                 description: New information about the chat group
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of participant IDs to be added to the group
 *             example:
 *               groupName: "New Group Name"
 *               groupInfo: "Updated group information"
 *               participantIds:
 *                 - "60d0fe4f5311236168a109ca"
 *                 - "60d0fe4f5311236168a109cb"
 *     responses:
 *       200:
 *         description: Successfully updated the group
 *       400:
 *         description: Bad request, invalid input or missing group ID
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/group/{id}:
 *   get:
 *     summary: Get chat group details
 *     description: Get the name, info, and participants of a specific chat group.
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat group to be Get
 *     responses:
 *       200:
 *         description: Successfully retrieved the group
 *       400:
 *         description: Bad request, invalid input or missing group ID
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/group/{id}:
 *   delete:
 *     summary: Delete a chat group
 *     description: Delete a specific chat group by its ID.
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat group to be deleted
 *     responses:
 *       200:
 *         description: Successfully deleted the group
 *       400:
 *         description: Bad request, missing group ID
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /chat/send-message/{id}:
 *   post:
 *     summary: Send a message to a chat
 *     description: Send a message to a specific chat or group. Creates a new chat if it does not exist and updates unread message counts.
 *     tags:
 *       - Chat
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat or group to which the message is sent.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the message.
 *                 example: "Hello, how are you?"
 *               isGroup:
 *                 type: boolean
 *                 description: Indicates whether the message is sent to a group or a direct chat.
 *                 example: false
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       500:
 *         description: Internal server error
 */

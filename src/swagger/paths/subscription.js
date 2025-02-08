/**
 * @swagger
 * tags:
 *   - name: Subscription
 *     description: Subscription related endpoints
 */

/**
 * @swagger
 * /subscription:
 *   post:
 *     summary: Create a subscription
 *     description: API endpoint to create a new subscription.
 *     tags:
 *       - Subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID associated with the subscription.
 *                 example: "6752c61b7610780144fa05d9"
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Expiry date of the subscription.
 *                 example: "2024-08-29"
 *     responses:
 *       201:
 *         description: Subscription created successfully.
 *       400:
 *         description: Bad request. Input validation failed.
 *   get:
 *     summary: Get all subscriptions
 *     description: API endpoint to retrieve all subscriptions.
 *     tags:
 *       - Subscription
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully.
 *       404:
 *         description: No subscriptions found.
 */

/**
 * @swagger
 * /subscription/single/{id}:
 *   get:
 *     summary: Get a subscription
 *     description: API endpoint to get an existing subscription
 *     tags:
 *       - Subscription
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the User
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription found successfullyy
 *       400:
 *         description: Bad request
 *       404:
 *         description: Subscription not found
 */

/**
 * @swagger
 * /subscription/single/{id}:
 *   put:
 *     summary: Update a subscription
 *     description: API endpoint to update an existing subscription
 *     tags:
 *       - Subscription
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the Subscription
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-29"
 *     responses:
 *       200:
 *         description: Subscription updated successfullyy
 *       400:
 *         description: Bad request
 *       404:
 *         description: Subscription not found
 */

/**
 * @swagger
 * tags:
 *   - name: Payment
 *     description: Payment and subscription related endpoints
 */

/**
 * @swagger
 * /payment/parent-subscription:
 *   post:
 *     summary: Create a parent subscription
 *     description: Creates a new parent subscription payment record
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               academicYear:
 *                 type: string
 *                 description: Academic year for the subscription
 *                 example: "2024-2025"
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date of the subscription
 *                 example: "2025-07-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Payment saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment saved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     academicYear:
 *                       type: string
 *                     expiryDate:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 *   
 *   get:
 *     summary: Get all parent subscriptions
 *     description: Retrieves all parent subscription payment records
 *     tags:
 *       - Payment
 *     responses:
 *       200:
 *         description: Successfully retrieved parent subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully retrieved subscriptions"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       academicYear:
 *                         type: string
 *                       expiryDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /payment/update/{id}:
 *   put:
 *     summary: Update payment
 *     description: Updates an existing payment and modifies user subscription status
 *     tags:
 *       - Payment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [app, membership]
 *                 description: Payment category
 *                 example: "app"
 *               user:
 *                 type: string
 *                 description: User ID
 *                 example: "507f1f77bcf86cd799439011"
 *               status:
 *                 type: string
 *                 enum: [active, expired, expiring, pending, cancelled]
 *                 description: Payment status
 *                 example: "active"
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Payment amount
 *                 example: 99.99
 *               parentSub:
 *                 type: string
 *                 description: Parent subscription ID
 *                 example: "507f1f77bcf86cd799439012"
 *               receipt:
 *                 type: string
 *                 description: Receipt identifier or URL
 *                 example: "receipt_123456"
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment updated successfully!"
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Error saving payment
 */

/**
 * @swagger
 * /payment/user/{userId}:
 *   get:
 *     summary: Get user payments
 *     description: Retrieves the latest app and membership payments for a specific user
 *     tags:
 *       - Payment
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose payments to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully retrieved payments"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       user:
 *                         type: string
 *                         description: Reference to User model
 *                       status:
 *                         type: string
 *                         enum: [active, expired, expiring, pending, cancelled]
 *                       amount:
 *                         type: number
 *                         minimum: 0
 *                       category:
 *                         type: string
 *                         enum: [app, membership]
 *                       parentSub:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           academicYear:
 *                             type: string
 *                           expiryDate:
 *                             type: string
 *                             format: date-time
 *                       receipt:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: number
 *                   example: 2
 *       500:
 *         description: Error retrieving payments
 */

/**
 * @swagger
 * /payment/user:
 *   post:
 *     summary: Create user payment
 *     description: Creates a new payment for the authenticated user
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - amount
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [app, membership]
 *                 description: Payment category
 *                 example: "app"
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Payment amount
 *                 example: 99.99
 *               status:
 *                 type: string
 *                 enum: [active, expired, expiring, pending, cancelled]
 *                 description: Payment status
 *                 default: "pending"
 *                 example: "pending"
 *               parentSub:
 *                 type: string
 *                 description: Parent subscription ID
 *                 example: "507f1f77bcf86cd799439012"
 *               receipt:
 *                 type: string
 *                 description: Receipt identifier or URL
 *                 example: "receipt_123456"
 *     responses:
 *       201:
 *         description: Payment submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment submitted successfully!"
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid request or input
 *       404:
 *         description: User not found
 *       500:
 *         description: Error saving payment
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ParentSub:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         academicYear:
 *           type: string
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *           description: Reference to User model
 *         status:
 *           type: string
 *           enum: [active, expired, expiring, pending, cancelled]
 *         amount:
 *           type: number
 *           minimum: 0
 *         category:
 *           type: string
 *           enum: [app, membership]
 *         parentSub:
 *           type: string
 *           description: Reference to ParentSub model
 *         receipt:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

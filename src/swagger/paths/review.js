/**
 * @swagger
 * tags:
 *   - name: Review
 *     description: Review related endpoints
 */



/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - toUser
 *         - rating
 *         - comment
 *       properties:
 *         toUser:
 *           type: string
 *           description: ID of the user who wrote the review
 *         rating:
 *           type: integer
 *           description: Rating given by the reviewer (1-5)
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *           description: Optional comment from the reviewer
 */

/**
 * @swagger
 * /review:
 *   post:
 *     summary: Create a new review
 *     description: Add a new review to the database.
 *     tags:
 *       - Review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 *   get:
 *     summary: Get reviews
 *     description: Retrieve all reviews or filter by userId using query parameters.
 *     tags:
 *       - Review
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter reviews by user ID
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /review/single/{id}:
 *   put:
 *     summary: Edit a review
 *     description: Update an existing review by ID.
 *     tags:
 *       - Review
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal Server Error
 *   delete:
 *     summary: Delete a review
 *     description: Remove an existing review by ID.
 *     tags:
 *       - Review
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal Server Error
 */

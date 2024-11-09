/**
 * @swagger
 * tags:
 *   - name: Promotion
 *     description: Promotion related endpoints
 */

/**
 * @swagger
 * /promotion:
 *   post:
 *     summary: Create a new promotion
 *     description: Creates a new promotion with the provided details. All required fields must be included in the request.
 *     tags:
 *       - Promotion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Summer Sale"
 *                 description: "The title of the promotion."
 *               description:
 *                 type: string
 *                 example: "Get 50% off on all items."
 *                 description: "Details about the promotion."
 *               type:
 *                 type: string
 *                 example: "Discount"
 *                 description: "Type of the promotion (e.g., Discount, Cashback)."
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-09-01"
 *                 description: "The start date of the promotion."
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-09-15"
 *                 description: "The end date of the promotion."
 *               media:
 *                 type: string
 *                 example: "image.png"
 *                 description: "The media associated with the promotion."
 *               link:
 *                 type: string
 *                 example: "https://example.com/promotion"
 *                 description: "A link to the promotion details."
 *     responses:
 *       201:
 *         description: Promotion created successfullyy
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /promotion/single/{id}:
 *   put:
 *     summary: Edit a promotion
 *     description: Updates an existing promotion with the provided details.
 *     tags:
 *       - Promotion
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the promotion to edit
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Summer Sale"
 *               description:
 *                 type: string
 *                 example: "Updated details about the promotion."
 *               type:
 *                 type: string
 *                 example: "Discount"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-09-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-09-20"
 *               media:
 *                 type: string
 *                 example: "updated-image.png"
 *               link:
 *                 type: string
 *                 example: "https://example.com/updated-promotion"
 *     responses:
 *       200:
 *         description: Promotion updated successfullyy
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /promotion/single/{id}:
 *   get:
 *     summary: Get promotion by ID
 *     description: Retrieves a promotion by its ID.
 *     tags:
 *       - Promotion
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the promotion to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion found successfullyy
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /promotion/single/{id}:
 *   delete:
 *     summary: Delete a promotion by ID
 *     description: Deletes a promotion from the system by its ID.
 *     tags:
 *       - Promotion
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the promotion to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion deleted successfullyy
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /promotion/list:
 *   get:
 *     summary: Get a list of promotions
 *     description: Retrieves a paginated list of promotions with optional filtering by status.
 *     tags:
 *       - Promotion
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
 *         description: Filter promotions by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of promotions per page (defaults to 10)
 *     responses:
 *       200:
 *         description: successfullyy retrieved the list of promotions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /promotion/user:
 *   get:
 *     summary: Get a user list of promotions
 *     description: Retrieves a  user list of promotions.
 *     tags:
 *       - Promotion
 *     responses:
 *       200:
 *         description: successfullyy retrieved the list of promotions
 *       500:
 *         description: Internal Server Error
 */
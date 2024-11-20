    /**
 * @swagger
 * tags:
 *   - name: News
 *     description: News related endpoints
 */

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a new news article
 *     description: Creates a new news article with the provided details.
 *     tags:
 *       - News
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Technology"
 *               title:
 *                 type: string
 *                 example: "New Tech Innovations in 2024"
 *               content:
 *                 type: string
 *                 example: "Details about the latest technology innovations..."
 *               media:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               status:
 *                 type: string
 *                 example: "Published"
 *     responses:
 *       201:
 *         description: New news created successfullyy
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /news/single/{id}:
 *   put:
 *     summary: Edit an existing news article
 *     description: Updates the details of an existing news article by ID.
 *     tags:
 *       - News
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the news article to updateString
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               media:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: News article updated successfullyy
 *       400:
 *         description: Invalid input
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /news/single/{id}:
 *   get:
 *     summary: Get a news article by ID
 *     description: Retrieves the details of a specific news article by ID.
 *     tags:
 *       - News
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the news article to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article retrieved successfullyy
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /news/single/{id}:
 *   delete:
 *     summary: Delete a news article by ID
 *     description: Deletes a specific news article by ID.
 *     tags:
 *       - News
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the news article to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article deleted successfullyy
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /news/list:
 *   get:
 *     summary: Get a list of news
 *     description: Retrieves a paginated list of news with optional filtering by status.
 *     tags:
 *       - News
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
 *         description: Filter news by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of news per page (defaults to 10)
 *     responses:
 *       200:
 *         description: successfullyy retrieved the list of news
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /news/user:
 *   get:
 *     summary: Get a user list of news
 *     description: Retrieves a  user list of news.
 *     tags:
 *       - News
 *     responses:
 *       200:
 *         description: successfullyy retrieved the list of news
 *       500:
 *         description: Internal Server Error
 */
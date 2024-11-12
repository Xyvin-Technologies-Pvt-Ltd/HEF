/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Product related endpoints
 */

/**
 * @swagger
 * /product/admin:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product with the provided details.
 *     tags:
 *       - Product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sample Product"
 *               description:
 *                 type: string
 *                 example: "This is a sample product description."
 *               price:
 *                 type: number
 *                 example: 99.99
 *               status:
 *                 type: string
 *                 example: "Available"
 *     responses:
 *       201:
 *         description: New product created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /product/single/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieves the details of a specific product by ID.
 *     tags:
 *       - Product
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the product to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /product/single/{id}:
 *   put:
 *     summary: Update a product by ID
 *     description: Updates the details of an existing product by ID.
 *     tags:
 *       - Product
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /product/single/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     description: Deletes a specific product by ID.
 *     tags:
 *       - Product
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /product/admin:
 *   get:
 *     summary: Get a list of products
 *     description: Retrieves a paginated list of products with optional filtering by search, status, and category.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination (defaults to 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of products per page (defaults to 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter products by name or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter products by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         seller:
 *           type: string
 *           description: Reference ID of the seller, linked to the User model
 *           example: "60c72b2f9b1e8e1a8c123abc"
 *         name:
 *           type: string
 *           description: Name of the product
 *           example: "User Created Product"
 *         image:
 *           type: string
 *           description: URL of the product image
 *           example: "https://example.com/image.jpg"
 *         price:
 *           type: number
 *           description: Original price of the product
 *           example: 49.99
 *         offerPrice:
 *           type: number
 *           description: Discounted price of the product
 *           example: 39.99
 *         description:
 *           type: string
 *           description: Description of the product
 *           example: "This is a user-created product."
 *         moq:
 *           type: number
 *           description: Minimum order quantity
 *           example: 10
 *         units:
 *           type: string
 *           description: Units of the product (e.g., "kg", "pcs")
 *           example: "pcs"
 *         status:
 *           type: string
 *           description: Current status of the product
 *           example: "pending"
 */

/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Product related endpoints
 */

/**
 * @swagger
 * /product/user:
 *   post:
 *     summary: Create a new product by user
 *     description: Allows a user to create a new product with pending status, subject to approval.
 *     tags:
 *       - Product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully and awaiting approval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         seller:
 *           type: string
 *           description: Reference ID of the seller, linked to the User model
 *           example: "60c72b2f9b1e8e1a8c123abc"
 *         name:
 *           type: string
 *           description: Name of the product
 *           example: "User Created Product"
 *         image:
 *           type: string
 *           description: URL of the product image
 *           example: "https://example.com/image.jpg"
 *         price:
 *           type: number
 *           description: Original price of the product
 *           example: 49.99
 *         offerPrice:
 *           type: number
 *           description: Discounted price of the product
 *           example: 39.99
 *         description:
 *           type: string
 *           description: Description of the product
 *           example: "This is a user-created product."
 *         moq:
 *           type: number
 *           description: Minimum order quantity
 *           example: 10
 *         units:
 *           type: string
 *           description: Units of the product (e.g., "kg", "pcs")
 *           example: "pcs"
 *         status:
 *           type: string
 *           description: Current status of the product
 *           enum: ["pending", "accepted", "rejected", "reported"]
 *           default: "pending"
 *           example: "pending"
 */



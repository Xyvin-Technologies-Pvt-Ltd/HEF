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
 *                 description: Name of the product
 *                 example: "User Created Product"
 *               seller:
 *                 type: string
 *                 description: seller name
 *                 example: "ansha"
 *               image:
 *                 type: string
 *                 description: URL of the product image
 *                 example: "https://example.com/image.jpg"
 *               price:
 *                 type: number
 *                 description: Original price of the product
 *                 example: 49.99
 *               offerPrice:
 *                 type: number
 *                 description: Discounted price of the product
 *                 example: 39.99
 *               description:
 *                 type: string
 *                 description: Description of the product
 *                 example: "This is a user-created product."
 *               moq:
 *                 type: number
 *                 description: Minimum order quantity
 *                 example: 10
 *               units:
 *                 type: string
 *                 description: Units of the product (e.g., "kg", "pcs")
 *                 example: "pcs"
 *               status:
 *                 type: string
 *                 description: Current status of the product
 *                 enum:
 *                   - pending
 *                   - accepted
 *                   - rejected
 *                   - reported
 *                 example: "pending"
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
 *     summary: Update an existing product
 *     description: Updates the details of an existing product by ID. Allows partial updates of the product fields.
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
 *                 description: Name of the product
 *                 example: "Updated Product Name"
 *               image:
 *                 type: string
 *                 description: URL of the product image
 *                 example: "https://example.com/updated-image.jpg"
 *               price:
 *                 type: number
 *                 description: Original price of the product
 *                 example: 79.99
 *               offerPrice:
 *                 type: number
 *                 description: Discounted price of the product
 *                 example: 59.99
 *               description:
 *                 type: string
 *                 description: Detailed description of the product
 *                 example: "Updated product description."
 *               moq:
 *                 type: number
 *                 description: Minimum order quantity
 *                 example: 5
 *               units:
 *                 type: string
 *                 description: Units of the product (e.g., "kg", "pcs")
 *                 example: "kg"
 *               status:
 *                 type: string
 *                 description: Current status of the product
 *                 example: "accepted"
 *               reason:
 *                 type: string
 *                 description: Reason for status change (if applicable)
 *                 example: "Approved after review"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Product not found
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *                 example: "User Created Product"
 *               seller:
 *                 type: string
 *                 description: seller name
 *                 example: "ansha"
 *               image:
 *                 type: string
 *                 description: URL of the product image
 *                 example: "https://example.com/image.jpg"
 *               price:
 *                 type: number
 *                 description: Original price of the product
 *                 example: 49.99
 *               offerPrice:
 *                 type: number
 *                 description: Discounted price of the product
 *                 example: 39.99
 *               description:
 *                 type: string
 *                 description: Description of the product
 *                 example: "This is a user-created product."
 *               moq:
 *                 type: number
 *                 description: Minimum order quantity
 *                 example: 10
 *               units:
 *                 type: string
 *                 description: Units of the product (e.g., "kg", "pcs")
 *                 example: "pcs"
 *               status:
 *                 type: string
 *                 description: Current status of the product
 *                 enum:
 *                   - pending
 *                   - accepted
 *                   - rejected
 *                   - reported
 *                 example: "pending"
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
 * /product:
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
 * /product/myproducts:
 *   get:
 *     summary: Fetch products created by the logged-in user
 *     description: Retrieves a list of products associated with the authenticated user.
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Missing User ID
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /product/admin/{userId}:
 *   get:
 *     summary: Fetch products by user Id
 *     description: Retrieves a list of products associated with the authenticated user.
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the admin to retrieve
 *         schema:
 *           type: string
 *           example: "6123abc456def7890ghi1234"
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Missing User ID
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal Server Error
 */


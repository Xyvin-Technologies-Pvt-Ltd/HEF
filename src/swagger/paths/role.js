/**
 * @swagger
 * tags:
 *   - name: Role
 *     description: Role related endpoints
 */

/**
 * @swagger
 * /role:
 *   post:
 *     summary: Create a new role
 *     description: API endpoint to create a new role
 *     tags:
 *       - Role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: "Manager"
 *               description:
 *                 type: string
 *                 example: "Manager of the company"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["read", "write"]
 *     responses:
 *       200:
 *         description: Role created successfullyy
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /role/single/{id}:
 *   put:
 *     summary: Update a role
 *     description: API endpoint to update an existing role
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the role to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: "Manager"
 *               description:
 *                 type: string
 *                 example: "Manager of the company"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["read", "write"]
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Role updated successfullyy
 *       400:
 *         description: Bad request
 *       404:
 *         description: Role not found
 *   get:
 *     summary: Get a role
 *     description: API endpoint to get an existing role
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the role to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role found
 *       404:
 *         description: Role not found
 *   delete:
 *     summary: Delete a role
 *     description: API endpoint to delete an existing role
 *     tags:
 *       - Role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the role to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfullyy
 *       400:
 *         description: Bad request
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /role/list:
 *   get:
 *     summary: Get a list of roles
 *     description: Retrieves a paginated list of roles with optional filtering by status.
 *     tags:
 *       - Role
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
 *         description: Filter roles by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of roles per page (defaults to 10)
 *     responses:
 *       200:
 *         description: successfullyy retrieved the list of roles
 *       500:
 *         description: Internal Server Error
 */

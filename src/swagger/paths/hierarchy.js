/**
 * @swagger
 * tags:
 *   - name: Hierarchy
 *     description: hierarchy related endpoints
 */

/**
 * @swagger
 * /hierarchy/state:
 *   post:
 *     summary: Create a new state
 *     description: Endpoint to create a new state.
 *     tags:
 *       - Hierarchy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "kerala"
 *               zones:
 *                 type: array
 *                 example: []
 *               admins:
 *                 type: array
 *                 example: []
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: New state created successfully.
 *       403:
 *         description: Forbidden - You don't have permission to perform this action.
 *       400:
 *         description: Invalid input or state creation failed.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /hierarchy/state/{id}:
 *   get:
 *     summary: Get state by ID
 *     description: Retrieve a specific state by its ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the state to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: State found successfully
 *       400:
 *         description: Bad Request - State ID is required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/state/{id}:
 *   put:
 *     summary: Update a state by ID
 *     description: Update an existing state using its ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the state to update
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
 *                 example: "kerala"
 *               zones:
 *                 type: array
 *                 example: []
 *               admins:
 *                 type: array
 *                 example: []
 *     responses:
 *       200:
 *         description: State updated successfully
 *       400:
 *         description: Bad Request - Missing state ID or invalid input
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/district:
 *   post:
 *     summary: Create a new district
 *     description: Endpoint to create a new district.
 *     tags:
 *       - Hierarchy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "wayanad"
 *               zoneId:
 *                 type: string
 *                 example : "60a6b9f8e4e6f123456789ab"
 *               chapters:
 *                 type: array
 *                 example: []
 *               admins:
 *                 type: array
 *                 example: []
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: District created successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/district/{id}:
 *   get:
 *     summary: Get a district by ID
 *     description: Retrieves a specific district by its unique ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "60a6b9f8e4e6f123456789ab"
 *         description: Unique identifier of the district
 *     responses:
 *       200:
 *         description: District found successfully
 *       400:
 *         description: Bad Request - District ID is required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/district/{id}:
 *   put:
 *     summary: Update a district by ID
 *     description: Updates a specific district by its unique ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "60a6b9f8e4e6f123456789ab"
 *         description: Unique identifier of the district to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "wayanad"
 *               zoneId:
 *                 type: string
 *                 example : "60a6b9f8e4e6f123456789ab"
 *               chapters:
 *                 type: array
 *                 example: []
 *               admins:
 *                 type: array
 *                 example: []
 *     responses:
 *       200:
 *         description: District updated successfully
 *       400:
 *         description: Bad Request - Invalid input or missing district ID
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/zone:
 *   post:
 *     summary: Create a new zone
 *     description: Endpoint to create a new zone.
 *     tags:
 *       - Hierarchy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "zone"
 *               stateId:
 *                 type: string
 *                 example : "60a6b9f8e4e6f123456789ab"
 *               districts:
 *                 type: array
 *                 example: []
 *               admins:
 *                 type: array
 *                 example: []
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: New zone created successfully
 *       400:
 *         description: Bad Request - Invalid input or zone creation failed
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/zone/{id}:
 *   get:
 *     summary: Get a zone by ID
 *     description: Retrieves a specific zone by its ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the zone to retrieve
 *     responses:
 *       200:
 *         description: Zone found successfully
 *       400:
 *         description: Bad Request - Zone ID is required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/zone/{id}:
 *   put:
 *     summary: Update a zone by ID
 *     description: Updates the information for a specific zone by its ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the zone to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "zone"
 *               stateId:
 *                 type: string
 *                 example : "60a6b9f8e4e6f123456789ab"
 *               districts:
 *                 type: array
 *                 example: []
 *               admins:
 *                 type: array
 *                 example: []
 *     responses:
 *       200:
 *         description: Zone updated successfully
 *       400:
 *         description: Bad Request - Zone ID required or invalid input
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/chapter:
 *   post:
 *     summary: Create a new chapter
 *     description: Creates a new chapter with the provided information.
 *     tags:
 *       - Hierarchy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties :
 *               name :
 *                type : string
 *               districtId :
 *                type : string
 *                example : "60a6b9f8e4e6f123456789ab"
 *               members :
 *                type : array
 *                example : []
 *               admins :
 *                type : array
 *                example : []
 *     responses:
 *       201:
 *         description: New Chapter created successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/chapter/{id}:
 *   get:
 *     summary: Get a chapter by ID
 *     description: Retrieves a chapter by its unique ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the chapter to retrieve
 *         schema:
 *           type: string
 *         example: "60b7c9f8e4e6f123456789af"
 *     responses:
 *       200:
 *         description: Chapter found successfully
 *       400:
 *         description: Bad Request - Chapter ID is required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/chapter/{id}:
 *   put:
 *     summary: Update a chapter by ID
 *     description: Updates the details of an existing chapter.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the chapter to update
 *         schema:
 *           type: string
 *         example: "60b7c9f8e4e6f123456789af"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties :
 *               name :
 *                type : string
 *               districtId :
 *                type : string
 *                example : "60a6b9f8e4e6f123456789ab"
 *               members :
 *                type : array
 *                example : []
 *               admins :
 *                type : array
 *                example : []
 *     responses:
 *       200:
 *         description: Chapter updated successfully
 *       400:
 *         description: Bad Request - Invalid input or missing chapter ID
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/member:
 *   post:
 *     summary: Create a new member
 *     description: Adds a new member to the system.
 *     tags:
 *       - Hierarchy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties :
 *               name :
 *                type : string
 *               chapterId :
 *                type : string
 *                example : "60a6b9f8e4e6f123456789ab"
 *               subscription :
 *                type  : string
 *                example : inactive
 *               admins :
 *                type : array
 *                example : []
 *     responses:
 *       201:
 *         description: Member created successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/member/{id}:
 *   get:
 *     summary: Get member by ID
 *     description: Retrieves a member by their ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the member to retrieve
 *         schema:
 *           type: string
 *         example: "60a7d9f8e4e6f123456789ab"
 *     responses:
 *       200:
 *         description: Member found successfully
 *       400:
 *         description: Bad Request - Member ID is required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/member/{id}:
 *   put:
 *     summary: Update a member by ID
 *     description: Updates a specific member by their ID.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the member to update
 *         schema:
 *           type: string
 *         example: "60a7d9f8e4e6f123456789ab"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties :
 *               name :
 *                type : string
 *               chapterId :
 *                type : string
 *                example : "60a6b9f8e4e6f123456789ab"
 *               subscription :
 *                type  : string
 *                example : "inactive"
 *               admins :
 *                type : array
 *                example : []
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       400:
 *         description: Bad Request - Invalid input or missing member ID
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /hierarchy/state/list:
 *   get:
 *     summary: Retrieve all states
 *     description: Fetches a list of all states. Access is restricted to users with the required permissions.
 *     tags:
 *       - Hierarchy
 *     responses:
 *       200:
 *         description: States retrieved successfully
 *       403:
 *         description: Access denied due to insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /hierarchy/levels/{id}/{type}:
 *   get:
 *     summary: Retrieve hierarchical levels
 *     description: Fetches zones, districts, or chapters based on the given `id` and `type`.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the state, zone, district, user
 *         schema:
 *           type: string
 *           example: "6489b1fda32c1e123456789a"
 *       - name: type
 *         in: path
 *         required: true
 *         description: The type of level to fetch (state, zone, or district).
 *         schema:
 *           type: string
 *           enum: [state, zone, district,user]
 *           example: "state"
 *     responses:
 *       200:
 *         description: Levels retrieved successfully
 *       400:
 *         description: Bad request (missing `id` or `type`)
 *       403:
 *         description: Access denied due to insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /hierarchy/list/{type}:
 *   get:
 *     summary: Retrieve hierarchy data by type
 *     description: Fetches hierarchical data for states, zones, districts, chapters, or all levels.
 *     tags:
 *       - Hierarchy
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         description: The type of hierarchy to fetch (state, zone, district, chapter, or all).
 *         schema:
 *           type: string
 *           enum: [state, zone, district, chapter, all]
 *           example: "state"
 *     responses:
 *       200:
 *         description: Hierarchy data retrieved successfully
 *       400:
 *         description: Missing or invalid `type` parameter
 *       403:
 *         description: Access denied due to insufficient permissions
 *       404:
 *         description: No data found for the specified type
 *       500:
 *         description: Internal server error
 */

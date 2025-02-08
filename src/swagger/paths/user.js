/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and operations
 */

/**
 * @swagger
 * /user/send-otp:
 *   post:
 *     summary: Send OTP
 *     description: API endpoint to send an OTP to a user's phone number
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/verify:
 *   post:
 *     summary: Verify User
 *     description: API endpoint to verify a user using OTP and phone number
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: number
 *                 example: 72033
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login or register a user
 *     description: Authenticates a user using a Firebase client token. If the user does not exist, a new user is created and logged in.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientToken:
 *                 type: string
 *                 description: The Firebase client token for user authentication
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlZjQ3..."
 *               fcm:
 *                 type: string
 *                 description: The FCM token for push notifications
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlZjQ3..."
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Client Token is required
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/app-version:
 *   get:
 *     summary: Get the app version
 *     description: Fetches the current app version from the settings.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: App version fetched successfully
 *       500:
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /user:
 *   get:
 *     summary: fetch user
 *     description: Retrieves a list of all users.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/update:
 *   patch:
 *     summary: Update user
 *     description: Updates the information of an existing user.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *                 example: "John Doe"
 *               uid:
 *                 type: string
 *                 description: Unique identifier for the user.
 *                 example: "UID123456"
 *               bloodgroup:
 *                 type: string
 *                 description: User's blood group.
 *                 example: "O+"
 *               role:
 *                 type: string
 *                 description: Role assigned to the user.
 *                 enum: ["president", "secretary", "treasurer", "rep", "member"]
 *                 example: "member"
 *               chapter:
 *                 type: string
 *                 description: Reference to the user's chapter ID.
 *                 example: "63f9c6e4f3b17c00084b8b99"
 *               image:
 *                 type: string
 *                 description: URL of the user's profile image.
 *                 example: "https://example.com/image.jpg"
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: A string representing a file path or URL.
 *                 description: An array of file paths or URLs associated with the member.
 *                 example:
 *                   - "https://example.com/file1.pdf"
 *                   - "https://example.com/file2.jpg"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user.
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 description: Primary phone number of the user.
 *                 example: "+1234567890"
 *               secondaryPhone:
 *                 type: object
 *                 properties:
 *                   whatsapp:
 *                     type: string
 *                     description: WhatsApp phone number of the user.
 *                     example: "+1234567891"
 *                   business:
 *                     type: string
 *                     description: Business phone number of the user.
 *                     example: "+1234567892"
 *               bio:
 *                 type: string
 *                 description: Brief biography or description of the user.
 *                 example: "Experienced developer in web technologies."
 *               status:
 *                 type: string
 *                 description: Current status of the user.
 *                 enum: ["active", "inactive", "suspended", "deleted", "blocked"]
 *                 example: "active"
 *               address:
 *                 type: string
 *                 description: Residential address of the user.
 *                 example: "123 Main St, City, Country"
 *               businessCatogary:
 *                 type: string
 *                 description: User's business category.
 *                 example: "Technology"
 *               businessSubCatogary:
 *                 type: string
 *                 description: User's business sub-category.
 *                 example: "Software Development"
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the company.
 *                     example: "Tech Solutions Inc."
 *                   designation:
 *                     type: string
 *                     description: User's designation at the company.
 *                     example: "Software Engineer"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Company email of the user.
 *                     example: "johndoe@company.com"
 *                   websites:
 *                     type: string
 *                     description: Company's website.
 *                     example: "https://company.com"
 *                   phone:
 *                     type: string
 *                     description: Company's phone number.
 *                     example: "+1234567890"
 *               social:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Social platform name.
 *                       example: "LinkedIn"
 *                     link:
 *                       type: string
 *                       description: URL to the social profile.
 *                       example: "https://linkedin.com/in/johndoe"
 *               websites:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Website name.
 *                       example: "Personal Blog"
 *                     link:
 *                       type: string
 *                       description: URL to the website.
 *                       example: "https://johndoe.com"
 *               awards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       description: Award image URL.
 *                       example: "https://example.com/award.jpg"
 *                     name:
 *                       type: string
 *                       description: Name of the award.
 *                       example: "Best Developer"
 *                     authority:
 *                       type: string
 *                       description: Awarding authority.
 *                       example: "Tech Awards Committee"
 *               videos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the video.
 *                       example: "Tech Talk"
 *                     link:
 *                       type: string
 *                       description: URL to the video.
 *                       example: "https://youtube.com/video"
 *               certificates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the certificate.
 *                       example: "React Developer"
 *                     link:
 *                       type: string
 *                       description: URL to the certificate.
 *                       example: "https://example.com/certificate"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/single/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieves a user's details based on the provided user ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *           example: "6123abc456def7890ghi1234"
 *     responses:
 *       200:
 *         description: User found successfully
 *       400:
 *         description: User ID is missing
 *       403:
 *         description: Forbidden, user lacks permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /user/admin:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with detailed profile information. Access is restricted based on permissions.
 *     tags: [User]
 *     requestBody:
 *       description: Details of the user to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *                 example: "John Doe"
 *               uid:
 *                 type: string
 *                 description: Unique identifier for the user.
 *                 example: "UID123456"
 *               bloodgroup:
 *                 type: string
 *                 description: User's blood group.
 *                 example: "O+"
 *               role:
 *                 type: string
 *                 enum: ["president", "secretary", "treasurer", "rep", "member"]
 *                 description: Role assigned to the user.
 *                 example: "member"
 *               chapter:
 *                 type: string
 *                 description: Reference to the user's chapter ID.
 *                 example: "63f9c6e4f3b17c00084b8b99"
 *               image:
 *                 type: string
 *                 description: URL of the user's profile image.
 *                 example: "https://example.com/image.jpg"
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: A string representing a file path or URL.
 *                 description: An array of file paths or URLs associated with the member.
 *                 example:
 *                   - "https://example.com/file1.pdf"
 *                   - "https://example.com/file2.jpg"
 *               email:
 *                 type: string
 *                 description: Email address of the user.
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 description: Phone number of the user.
 *                 example: "+1234567890"
 *               secondaryPhone:
 *                 type: object
 *                 properties:
 *                   whatsapp:
 *                     type: string
 *                     description: WhatsApp phone number of the user.
 *                     example: "+1234567891"
 *                   business:
 *                     type: string
 *                     description: Business phone number of the user.
 *                     example: "+1234567892"
 *               bio:
 *                 type: string
 *                 description: Brief biography or description of the user.
 *                 example: "Experienced developer in web technologies."
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive", "suspended", "deleted", "blocked"]
 *                 description: Current status of the user.
 *                 example: "active"
 *               address:
 *                 type: string
 *                 description: Residential address of the user.
 *                 example: "123 Main St, City, Country"
 *               businessCatogary:
 *                 type: string
 *                 description: User's business category.
 *                 example: "Technology"
 *               businessSubCatogary:
 *                 type: string
 *                 description: User's business sub-category.
 *                 example: "Software Development"
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the company.
 *                     example: "Tech Solutions Inc."
 *                   designation:
 *                     type: string
 *                     description: User's designation at the company.
 *                     example: "Software Engineer"
 *                   email:
 *                     type: string
 *                     description: Company email of the user.
 *                     example: "johndoe@company.com"
 *                   websites:
 *                     type: string
 *                     description: Company's website.
 *                     example: "https://company.com"
 *                   phone:
 *                     type: string
 *                     description: Company's phone number.
 *                     example: "+1234567890"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input provided
 *       403:
 *         description: Forbidden, user lacks necessary permissions
 *       409:
 *         description: Conflict, user with this email or phone already exists
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /user/admin/single/{id}:
 *   get:
 *     summary: Get user by ID (Admin)
 *     description: Retrieves details of a single user by ID. Admin access required.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update user by ID (Admin)
 *     description: Updates a user's details based on their ID. Admin access required.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               role:
 *                 type: string
 *                 example: "secretary"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete user by ID (Admin)
 *     description: Deletes a user from the system based on their ID. Admin access required.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/admin/single/{id}:
 *   put:
 *     summary: Edit a user
 *     description: Updates a user's details based on the provided information. Access is restricted based on permissions.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *           example: "6123abc456def7890ghi1234"
 *     requestBody:
 *       description: Details to update for the user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *                 example: "John Doe"
 *               uid:
 *                 type: string
 *                 description: Unique identifier for the user.
 *                 example: "UID123456"
 *               bloodgroup:
 *                 type: string
 *                 description: User's blood group.
 *                 example: "O+"
 *               role:
 *                 type: string
 *                 description: Role assigned to the user.
 *                 enum: ["president", "secretary", "treasurer", "rep", "member"]
 *                 example: "member"
 *               chapter:
 *                 type: string
 *                 description: Reference to the user's chapter ID.
 *                 example: "63f9c6e4f3b17c00084b8b99"
 *               districtId:
 *                 type: string
 *                 description: Reference to the user's chapter ID.
 *                 example: "63f9c6e4f3b17c00084b8b99"
 *               image:
 *                 type: string
 *                 description: URL of the user's profile image.
 *                 example: "https://example.com/image.jpg"
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: A string representing a file path or URL.
 *                 description: An array of file paths or URLs associated with the member.
 *                 example:
 *                   - "https://example.com/file1.pdf"
 *                   - "https://example.com/file2.jpg"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user.
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 description: Primary phone number of the user.
 *                 example: "+1234567890"
 *               secondaryPhone:
 *                 type: object
 *                 properties:
 *                   whatsapp:
 *                     type: string
 *                     description: WhatsApp phone number of the user.
 *                     example: "+1234567891"
 *                   business:
 *                     type: string
 *                     description: Business phone number of the user.
 *                     example: "+1234567892"
 *               bio:
 *                 type: string
 *                 description: Brief biography or description of the user.
 *                 example: "Experienced developer in web technologies."
 *               status:
 *                 type: string
 *                 description: Current status of the user.
 *                 enum: ["active", "inactive", "suspended", "deleted", "blocked"]
 *                 example: "active"
 *               address:
 *                 type: string
 *                 description: Residential address of the user.
 *                 example: "123 Main St, City, Country"
 *               businessCatogary:
 *                 type: string
 *                 description: User's business category.
 *                 example: "Technology"
 *               businessSubCatogary:
 *                 type: string
 *                 description: User's business sub-category.
 *                 example: "Software Development"
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the company.
 *                     example: "Tech Solutions Inc."
 *                   designation:
 *                     type: string
 *                     description: User's designation at the company.
 *                     example: "Software Engineer"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Company email of the user.
 *                     example: "johndoe@company.com"
 *                   websites:
 *                     type: string
 *                     description: Company's website.
 *                     example: "https://company.com"
 *                   phone:
 *                     type: string
 *                     description: Company's phone number.
 *                     example: "+1234567890"
 *               social:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Social platform name.
 *                       example: "LinkedIn"
 *                     link:
 *                       type: string
 *                       description: URL to the social profile.
 *                       example: "https://linkedin.com/in/johndoe"
 *               websites:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Website name.
 *                       example: "Personal Blog"
 *                     link:
 *                       type: string
 *                       description: URL to the website.
 *                       example: "https://johndoe.com"
 *               awards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       description: Award image URL.
 *                       example: "https://example.com/award.jpg"
 *                     name:
 *                       type: string
 *                       description: Name of the award.
 *                       example: "Best Developer"
 *                     authority:
 *                       type: string
 *                       description: Awarding authority.
 *                       example: "Tech Awards Committee"
 *               videos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the video.
 *                       example: "Tech Talk"
 *                     link:
 *                       type: string
 *                       description: URL to the video.
 *                       example: "https://youtube.com/video"
 *               certificates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the certificate.
 *                       example: "React Developer"
 *                     link:
 *                       type: string
 *                       description: URL to the certificate.
 *                       example: "https://example.com/certificate"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input or User ID is missing
 *       403:
 *         description: Forbidden, user lacks permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /user/admin/list:
 *   get:
 *     summary: Get a list of users
 *     description: Retrieves a paginated list of users with optional filtering by status.
 *     tags:
 *       - User
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
 *         description: Filter users by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of users per page (defaults to 10)
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of users
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/list:
 *   get:
 *     summary: Get a list of active users
 *     description: Retrieve a paginated list of users with "active" status, including populated college and course details.
 *     tags:
 *       - User
 *     parameters:
 *       - name: pageNo
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination (default is 1)
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of users per page (default is 10)
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of active users
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/approvals:
 *   get:
 *     summary: Get list of users pending approval
 *     description: Retrieves a list of users whose status is awaiting approval.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of pending approvals retrieved successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/approval/{id}:
 *   put:
 *     summary: Approve a user
 *     description: Changes the user's status to "approved" based on their ID.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User approved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/block/{id}:
 *   put:
 *     summary: Block a user
 *     description: Sets the user's status to "blocked" based on their ID.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /user/approvals:
 *   get:
 *     summary: Get a list of users awaiting approval
 *     description: Retrieves a paginated list of users with an "inactive" status, awaiting approval.
 *     tags:
 *       - User
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
 *         description: The number of users per page (defaults to 10)
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of users awaiting approval
 *       403:
 *         description: Forbidden - User does not have permission to view approvals
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/approval/{id}:
 *   put:
 *     summary: Approve or update a user's status
 *     description: Approves or updates the status of a user based on the provided user ID. The user must have the permission to perform this action.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to approve or update
 *         schema:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the user (e.g., "awaiting-payment", "rejected", etc.)
 *                 example: "awaiting-payment"
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: User ID is required or User update failed
 *       403:
 *         description: Access denied due to insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /user/users:
 *   get:
 *     summary: Get a list of users
 *     description: Retrieve a paginated list of users. Optionally filter by status.
 *     tags:
 *       - User
 *     parameters:
 *       - name: pageNo
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users to retrieve per page.
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter users by status.
 *     responses:
 *       200:
 *         description: Users found successfully
 *       400:
 *         description: Bad Request - Invalid parameters
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /user/block/{id}:
 *   put:
 *     summary: Block a user
 *     description: Block the user with the specified ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to be blocked
 *         schema:
 *           type: string
 *           example: "643b2a4a5b673a64f56c742b"
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Bad request (e.g., missing user ID)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/unblock/{id}:
 *   put:
 *     summary: Unblock a user
 *     description: Unblock the user with the specified ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to be unblocked
 *         schema:
 *           type: string
 *           example: "643b2a4a5b673a64f56c742b"
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       400:
 *         description: Bad request (e.g., missing user ID)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/admin/block-user/{id}:
 *   patch:
 *     summary: Block a user by admin
 *     description: Block a user by setting their status to "blocked". This action can only be performed by an admin.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to block
 *         schema:
 *           type: string
 *           example: "643b2a4a5b673a64f56c742b"
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Invalid request (e.g., missing user ID or failed update)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/admin/unblock-user/{id}:
 *   patch:
 *     summary: Block a user by admin
 *     description: Block a user by setting their status to "blocked". This action can only be performed by an admin.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to block
 *         schema:
 *           type: string
 *           example: "643b2a4a5b673a64f56c742b"
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Invalid request (e.g., missing user ID or failed update)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /user/listuid:
 *   get:
 *     summary: Fetch user IDs and usernames
 *     description: Fetches a paginated list of user IDs and usernames, excluding blocked users and the current user.
 *     tags:
 *       - User
 *     parameters:
 *       - name: pageNo
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Invalid request (e.g., missing user ID or failed update)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /user/member:
 *   post:
 *     summary: Create a new member
 *     description: Adds a new member with detailed profile and business information.
 *     tags:
 *       - User
 *     requestBody:
 *       description: Details of the member to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the member.
 *                 example: "Jane Doe"
 *               bloodgroup:
 *                 type: string
 *                 description: Blood group of the member.
 *                 example: "B+"
 *               image:
 *                 type: string
 *                 description: URL of the member's profile image.
 *                 example: "https://example.com/member.jpg"
 *               email:
 *                 type: string
 *                 description: Email address of the member.
 *                 example: "jane.doe@example.com"
 *               phone:
 *                 type: string
 *                 description: Phone number of the member.
 *                 example: "+9876543210"
 *               bio:
 *                 type: string
 *                 description: Brief biography or description of the member.
 *                 example: "Entrepreneur in the tech industry."
 *               status:
 *                 type: string
 *                 description: Current status of the member.
 *                 example: "active"
 *               address:
 *                 type: string
 *                 description: Residential address of the member.
 *                 example: "456 Elm St, City, Country"
 *               businessCatogary:
 *                 type: string
 *                 description: Business category of the member.
 *                 example: "Health & Wellness"
 *               businessSubCatogary:
 *                 type: string
 *                 description: Business subcategory of the member.
 *                 example: "Fitness Coaching"
 *               chapter:
 *                 type: string
 *                 description: chapter id.
 *                 example: "673daf5791ec0506dccd130c" 
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the company.
 *                     example: "Wellness Corp"
 *                   designation:
 *                     type: string
 *                     description: Member's designation at the company.
 *                     example: "CEO"
 *                   email:
 *                     type: string
 *                     description: Company's email address.
 *                     example: "info@wellnesscorp.com"
 *                   websites:
 *                     type: string
 *                     description: Company's website.
 *                     example: "https://wellnesscorp.com"
 *                   phone:
 *                     type: string
 *                     description: Company's phone number.
 *                     example: "+1239876543"
 *     responses:
 *       201:
 *         description: Member created successfully
 *       400:
 *         description: Invalid input provided
 *       403:
 *         description: Forbidden, user lacks necessary permissions
 *       409:
 *         description: Conflict, member with this email or phone already exists
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /user/analytic-review/{userId}:
 *   patch:
 *     summary: Get user stats
 *     description: Retrieves the user's total products count, feeds count, and reviews, including reviewer details and comments.
 *     tags:
 *       - User
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
 *         description: User stats retrieved successfully
 *       400:
 *         description: Missing User ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

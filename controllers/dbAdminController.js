const { poolWafi } = require('../db/connection');
const bcrypt = require('bcryptjs');

// Helper function for database queries
const executeQueryWafi = async (queryWafi, paramsWafi = []) => {
    try {
        const [resultsWafi] = await poolWafi.query(queryWafi, paramsWafi);
        return { successWafi: true, dataWafi: resultsWafi };
    } catch (errorWafi) {
        console.error('Database query error:', errorWafi);
        return { successWafi: false, errorWafi: errorWafi.message };
    }
};

/* ==================== DASHBOARD STATS ==================== */

exports.getDashboardStatsWafi = async (req, res) => {
    try {
        // Get count of users
        const usersQueryWafi = "SELECT COUNT(*) as countWafi FROM wafi_users";
        const usersResultWafi = await executeQueryWafi(usersQueryWafi);

        // Get count of bases
        const basesQueryWafi = "SELECT COUNT(*) as countWafi FROM wafi_bases";
        const basesResultWafi = await executeQueryWafi(basesQueryWafi);

        // Get count of categories
        const categoriesQueryWafi = "SELECT COUNT(*) as countWafi FROM wafi_categories";
        const categoriesResultWafi = await executeQueryWafi(categoriesQueryWafi);

        // Get count of types
        const typesQueryWafi = "SELECT COUNT(*) as countWafi FROM wafi_types";
        const typesResultWafi = await executeQueryWafi(typesQueryWafi);

        // Get count of objects
        const objectsQueryWafi = "SELECT COUNT(*) as countWafi FROM wafi_objects";
        const objectsResultWafi = await executeQueryWafi(objectsQueryWafi);

        // Get recent bases (last 5)
        const recentBasesQueryWafi = `
      SELECT b.wafi_id, b.wafi_tag, b.wafi_name, b.wafi_th_level, b.wafi_created_at, 
             u.wafi_username 
      FROM wafi_bases b
      JOIN wafi_users u ON b.wafi_user_id = u.wafi_id
      ORDER BY b.wafi_created_at DESC
      LIMIT 5
    `;
        const recentBasesResultWafi = await executeQueryWafi(recentBasesQueryWafi);

        // Get top users by base count
        const topUsersQueryWafi = `
      SELECT u.wafi_id, u.wafi_username, u.wafi_email, u.wafi_role, 
             COUNT(b.wafi_id) as baseCountWafi
      FROM wafi_users u
      LEFT JOIN wafi_bases b ON u.wafi_id = b.wafi_user_id
      GROUP BY u.wafi_id
      ORDER BY baseCountWafi DESC
      LIMIT 5
    `;
        const topUsersResultWafi = await executeQueryWafi(topUsersQueryWafi);

        if (!usersResultWafi.successWafi || !basesResultWafi.successWafi ||
            !categoriesResultWafi.successWafi || !typesResultWafi.successWafi ||
            !objectsResultWafi.successWafi || !recentBasesResultWafi.successWafi ||
            !topUsersResultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching dashboard stats'
            });
        }

        return res.status(200).json({
            users: usersResultWafi.dataWafi[0].countWafi,
            bases: basesResultWafi.dataWafi[0].countWafi,
            categories: categoriesResultWafi.dataWafi[0].countWafi,
            types: typesResultWafi.dataWafi[0].countWafi,
            objects: objectsResultWafi.dataWafi[0].countWafi,
            recentBases: recentBasesResultWafi.dataWafi,
            topUsers: topUsersResultWafi.dataWafi
        });
    } catch (errorWafi) {
        console.error('Dashboard stats error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching dashboard stats'
        });
    }
};

/* ==================== CATEGORIES CONTROLLER ==================== */

// Get all categories
exports.getCategoriesWafi = async (req, res) => {
    try {
        const queryWafi = `
      SELECT 
        wafi_id, 
        wafi_name, 
        wafi_updated_at 
      FROM wafi_categories 
      ORDER BY wafi_name
    `;

        const resultWafi = await executeQueryWafi(queryWafi);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching categories'
            });
        }

        return res.status(200).json(resultWafi.dataWafi);
    } catch (errorWafi) {
        console.error('Get categories error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching categories'
        });
    }
};

// Get a single category by ID
exports.getCategoryByIdWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;

        const queryWafi = `
      SELECT 
        wafi_id, 
        wafi_name, 
        wafi_updated_at 
      FROM wafi_categories 
      WHERE wafi_id = ?
    `;

        const resultWafi = await executeQueryWafi(queryWafi, [idWafi]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching category'
            });
        }

        if (resultWafi.dataWafi.length === 0) {
            return res.status(404).json({
                successWafi: false,
                messageWafi: 'Category not found'
            });
        }

        // Get types for this category
        const typesQueryWafi = `
      SELECT 
        wafi_id, 
        wafi_name,
        wafi_updated_at
      FROM wafi_types 
      WHERE wafi_category_id = ?
      ORDER BY wafi_name
    `;

        const typesResultWafi = await executeQueryWafi(typesQueryWafi, [idWafi]);

        if (!typesResultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching category types'
            });
        }

        // Combine category and types
        const categoryDataWafi = resultWafi.dataWafi[0];
        categoryDataWafi.types = typesResultWafi.dataWafi;

        return res.status(200).json(categoryDataWafi);
    } catch (errorWafi) {
        console.error('Get category by ID error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching category'
        });
    }
};

// Create a new category
exports.createCategoryWafi = async (req, res) => {
    try {
        const { wafi_name } = req.body;

        // Validate required fields
        if (!wafi_name) {
            return res.status(400).json({
                successWafi: false,
                messageWafi: 'Category name is required'
            });
        }

        // Check if category name already exists
        const checkNameQueryWafi = "SELECT * FROM wafi_categories WHERE wafi_name = ?";
        const nameExistsWafi = await executeQueryWafi(checkNameQueryWafi, [wafi_name]);

        if (!nameExistsWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error checking category name'
            });
        }

        if (nameExistsWafi.dataWafi.length > 0) {
            return res.status(400).json({
                successWafi: false,
                messageWafi: 'Category name already exists'
            });
        }

        // Create category
        const createQueryWafi = "INSERT INTO wafi_categories (wafi_name) VALUES (?)";
        const createResultWafi = await executeQueryWafi(createQueryWafi, [wafi_name]);

        if (!createResultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error creating category'
            });
        }

        // Get the created category
        const getCategoryQueryWafi = `
      SELECT 
        wafi_id, 
        wafi_name, 
        wafi_updated_at 
      FROM wafi_categories 
      WHERE wafi_id = ?
    `;

        const categoryResultWafi = await executeQueryWafi(
            getCategoryQueryWafi,
            [createResultWafi.dataWafi.insertId]
        );

        if (!categoryResultWafi.successWafi || categoryResultWafi.dataWafi.length === 0) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Category created but error fetching data'
            });
        }

        return res.status(201).json({
            successWafi: true,
            messageWafi: 'Category created successfully',
            category: categoryResultWafi.dataWafi[0]
        });
    } catch (errorWafi) {
        console.error('Create category error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while creating category'
        });
    }
};

// Update a category
exports.updateCategoryWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;
        const { wafi_name } = req.body;

        // Validate required fields
        if (!wafi_name) {
            return res.status(400).json({
                successWafi: false,
                messageWafi: 'Category name is required'
            });
        }

        // Check if category exists
        const checkCategoryQueryWafi = "SELECT * FROM wafi_categories WHERE wafi_id = ?";
        const categoryExistsWafi = await executeQueryWafi(checkCategoryQueryWafi, [idWafi]);

        if (!categoryExistsWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error checking category'
            });
        }

        if (categoryExistsWafi.dataWafi.length === 0) {
            return res.status(404).json({
                successWafi: false,
                messageWafi: 'Category not found'
            });
        }

        // Check if name already exists for another category
        if (wafi_name !== categoryExistsWafi.dataWafi[0].wafi_name) {
            const checkNameQueryWafi = "SELECT * FROM wafi_categories WHERE wafi_name = ? AND wafi_id != ?";
            const nameExistsWafi = await executeQueryWafi(checkNameQueryWafi, [wafi_name, idWafi]);

            if (!nameExistsWafi.successWafi) {
                return res.status(500).json({
                    successWafi: false,
                    messageWafi: 'Error checking category name'
                });
            }

            if (nameExistsWafi.dataWafi.length > 0) {
                return res.status(400).json({
                    successWafi: false,
                    messageWafi: 'Category name already exists'
                });
            }
        }

        // Update category
        const updateQueryWafi = "UPDATE wafi_categories SET wafi_name = ? WHERE wafi_id = ?";
        const updateResultWafi = await executeQueryWafi(updateQueryWafi, [wafi_name, idWafi]);

        if (!updateResultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error updating category'
            });
        }

        // Get updated category
        const getCategoryQueryWafi = `
      SELECT 
        wafi_id, 
        wafi_name, 
        wafi_updated_at 
      FROM wafi_categories 
      WHERE wafi_id = ?
    `;

        const categoryResultWafi = await executeQueryWafi(getCategoryQueryWafi, [idWafi]);

        if (!categoryResultWafi.successWafi || categoryResultWafi.dataWafi.length === 0) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Category updated but error fetching data'
            });
        }

        return res.status(200).json({
            successWafi: true,
            messageWafi: 'Category updated successfully',
            category: categoryResultWafi.dataWafi[0]
        });
    } catch (errorWafi) {
        console.error('Update category error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while updating category'
        });
    }
};

// Delete a category
exports.deleteCategoryWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;

        // Check if category exists
        const checkCategoryQueryWafi = "SELECT * FROM wafi_categories WHERE wafi_id = ?";
        const categoryExistsWafi = await executeQueryWafi(checkCategoryQueryWafi, [idWafi]);

        if (!categoryExistsWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error checking category'
            });
        }

        if (categoryExistsWafi.dataWafi.length === 0) {
            return res.status(404).json({
                successWafi: false,
                messageWafi: 'Category not found'
            });
        }

        // Check if there are types using this category
        const checkTypesQueryWafi = "SELECT COUNT(*) as countWafi FROM wafi_types WHERE wafi_category_id = ?";
        const typesResultWafi = await executeQueryWafi(checkTypesQueryWafi, [idWafi]);

        if (!typesResultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error checking types'
            });
        }

        // For safety, let the client know how many types will be affected
        const typesCountWafi = typesResultWafi.dataWafi[0].countWafi;

        // Delete the category (foreign key constraints will cascade delete types and objects)
        const deleteQueryWafi = "DELETE FROM wafi_categories WHERE wafi_id = ?";
        const deleteResultWafi = await executeQueryWafi(deleteQueryWafi, [idWafi]);

        if (!deleteResultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error deleting category'
            });
        }

        return res.status(200).json({
            successWafi: true,
            messageWafi: `Category deleted successfully along with ${typesCountWafi} type(s)`
        });
    } catch (errorWafi) {
        console.error('Delete category error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while deleting category'
        });
    }
};

// ... existing code for other controllers ...
exports.getUsersWafi = async (req, res) => {
    try {
        const queryWafi = `
            SELECT
                wafi_id,
                wafi_username,
                wafi_email,
                wafi_role,
                wafi_created_at,
                wafi_updated_at
            FROM wafi_users
            ORDER BY wafi_created_at DESC
        `;
        const resultWafi = await executeQueryWafi(queryWafi);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching users'
            });
        }

        return res.status(200).json(resultWafi.dataWafi);
    } catch (errorWafi) {
        console.error('Get users error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching users'
        });
    }
};

// Get user by ID
exports.getUserByIdWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;
        const queryWafi = `
            SELECT
                wafi_id,
                wafi_username,
                wafi_email,
                wafi_role,
                wafi_created_at,
                wafi_updated_at
            FROM wafi_users
            WHERE wafi_id = ?
        `;
        const resultWafi = await executeQueryWafi(queryWafi, [idWafi]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching user'
            });
        }

        if (resultWafi.dataWafi.length === 0) {
            return res.status(404).json({
                successWafi: false,
                messageWafi: 'User not found'
            });
        }

        return res.status(200).json(resultWafi.dataWafi[0]);
    } catch (errorWafi) {
        console.error('Get user by ID error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching user'
        });
    }
};

// Create a new user
exports.createUserWafi = async (req, res) => {
    try {
        const { wafi_username, wafi_email, wafi_password, wafi_role = 'user' } = req.body;

        // Check if email already exists
        const checkEmailQueryWafi = `SELECT wafi_email FROM wafi_users WHERE wafi_email = ?`;
        const emailCheckResultWafi = await executeQueryWafi(checkEmailQueryWafi, [wafi_email]);

        if (!emailCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking email existence' });
        }

        if (emailCheckResultWafi.dataWafi.length > 0) {
            return res.status(409).json({ successWafi: false, messageWafi: 'Email already exists' });
        }

        const hashedPasswordWafi = await bcrypt.hash(wafi_password, 10);
        const queryWafi = `
            INSERT INTO wafi_users (wafi_username, wafi_email, wafi_password_hash, wafi_role)
            VALUES (?, ?, ?, ?)
        `;
        const resultWafi = await executeQueryWafi(queryWafi, [wafi_username, wafi_email, hashedPasswordWafi, wafi_role]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error creating user'
            });
        }

        return res.status(201).json({
            successWafi: true,
            messageWafi: 'User created successfully',
            userIdWafi: resultWafi.insertIdWafi
        });
    } catch (errorWafi) {
        console.error('Create user error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while creating user'
        });
    }
};

// Update an existing user
exports.updateUserWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;
        const { wafi_username, wafi_email, wafi_password, wafi_role } = req.body;

        // Check if user exists
        const checkUserQueryWafi = `SELECT wafi_id FROM wafi_users WHERE wafi_id = ?`;
        const userCheckResultWafi = await executeQueryWafi(checkUserQueryWafi, [idWafi]);

        if (!userCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking user existence' });
        }

        if (userCheckResultWafi.dataWafi.length === 0) {
            return res.status(404).json({ successWafi: false, messageWafi: 'User not found' });
        }

        const updatesWafi = [];
        const valuesWafi = [];

        if (wafi_username) {
            updatesWafi.push('wafi_username = ?');
            valuesWafi.push(wafi_username);
        }
        if (wafi_email) {
            // Check if the new email already exists for another user
            const checkEmailQueryWafi = `SELECT wafi_email FROM wafi_users WHERE wafi_email = ? AND wafi_id != ?`;
            const emailCheckResultWafi = await executeQueryWafi(checkEmailQueryWafi, [wafi_email, idWafi]);
            if (!emailCheckResultWafi.successWafi) {
                return res.status(500).json({ successWafi: false, messageWafi: 'Error checking email existence' });
            }
            if (emailCheckResultWafi.dataWafi.length > 0) {
                return res.status(409).json({ successWafi: false, messageWafi: 'Email already exists' });
            }
            updatesWafi.push('wafi_email = ?');
            valuesWafi.push(wafi_email);
        }
        if (wafi_password) {
            const hashedPasswordWafi = await bcrypt.hash(wafi_password, 10);
            updatesWafi.push('wafi_password_hash = ?');
            valuesWafi.push(hashedPasswordWafi);
        }
        if (wafi_role) {
            updatesWafi.push('wafi_role = ?');
            valuesWafi.push(wafi_role);
        }

        if (updatesWafi.length === 0) {
            return res.status(200).json({ successWafi: true, messageWafi: 'No user data to update' });
        }

        const queryWafi = `
            UPDATE wafi_users
            SET ${updatesWafi.join(', ')}
            WHERE wafi_id = ?
        `;
        valuesWafi.push(idWafi);

        const resultWafi = await executeQueryWafi(queryWafi, valuesWafi);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error updating user'
            });
        }

        return res.status(200).json({
            successWafi: true,
            messageWafi: 'User updated successfully'
        });
    } catch (errorWafi) {
        console.error('Update user error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while updating user'
        });
    }
};

// Delete a user
exports.deleteUserWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;

        // Check if user exists
        const checkUserQueryWafi = `SELECT wafi_id FROM wafi_users WHERE wafi_id = ?`;
        const userCheckResultWafi = await executeQueryWafi(checkUserQueryWafi, [idWafi]);

        if (!userCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking user existence' });
        }
        if (userCheckResultWafi.dataWafi.length === 0) {
            return res.status(404).json({ successWafi: false, messageWafi: 'User not found' });
        }
        const selectBasesQueryWafi = `SELECT wafi_id FROM wafi_bases WHERE wafi_user_id = ?`;
        const selectBasesResultWafi = await executeQueryWafi(selectBasesQueryWafi, [idWafi]);

        const deleteObjectsQueryWafi = `DELETE FROM wafi_objects WHERE wafi_base_id IN (?)`;
        const deleteObjectsResultWafi = await executeQueryWafi(deleteObjectsQueryWafi, [selectBasesResultWafi.dataWafi.map(base => base.wafi_id)]);

        const deleteBasesQueryWafi = `DELETE FROM wafi_bases WHERE wafi_user_id = ?`;
        const deleteBasesResultWafi = await executeQueryWafi(deleteBasesQueryWafi, [idWafi]);

        const queryWafi = `DELETE FROM wafi_users WHERE wafi_id = ?`;
        const resultWafi = await executeQueryWafi(queryWafi, [idWafi]);
        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error deleting user'
            });
        }

        return res.status(200).json({
            successWafi: true,
            messageWafi: 'User deleted successfully'
        });
    } catch (errorWafi) {
        console.error('Delete user error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while deleting user'
        });
    }
};

// Get all types
exports.getTypesWafi = async (req, res) => {
    try {
        const queryWafi = `
            SELECT
                wt.wafi_id,
                wt.wafi_name,
                wt.wafi_category_id,
                wc.wafi_name AS category_name,
                wt.wafi_updated_at
            FROM wafi_types wt
            JOIN wafi_categories wc ON wt.wafi_category_id = wc.wafi_id
            ORDER BY wc.wafi_name, wt.wafi_name
        `;
        const resultWafi = await executeQueryWafi(queryWafi);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching types'
            });
        }

        return res.status(200).json(resultWafi.dataWafi);
    } catch (errorWafi) {
        console.error('Get types error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching types'
        });
    }
};

// Get type by ID
exports.getTypeByIdWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;
        const queryWafi = `
            SELECT
                wt.wafi_id,
                wt.wafi_name,
                wt.wafi_category_id,
                wc.wafi_name AS category_name,
                wt.wafi_updated_at
            FROM wafi_types wt
            JOIN wafi_categories wc ON wt.wafi_category_id = wc.wafi_id
            WHERE wt.wafi_id = ?
        `;
        const resultWafi = await executeQueryWafi(queryWafi, [idWafi]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching type'
            });
        }

        if (resultWafi.dataWafi.length === 0) {
            return res.status(404).json({
                successWafi: false,
                messageWafi: 'Type not found'
            });
        }

        return res.status(200).json(resultWafi.dataWafi[0]);
    } catch (errorWafi) {
        console.error('Get type by ID error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching type'
        });
    }
};

// Create a new type
exports.createTypeWafi = async (req, res) => {
    try {
        const { wafi_category_id, wafi_name } = req.body;

        // Check if category exists
        const checkCategoryQueryWafi = `SELECT wafi_id FROM wafi_categories WHERE wafi_id = ?`;
        const categoryCheckResultWafi = await executeQueryWafi(checkCategoryQueryWafi, [wafi_category_id]);

        if (!categoryCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking category existence' });
        }

        if (categoryCheckResultWafi.dataWafi.length === 0) {
            return res.status(400).json({ successWafi: false, messageWafi: 'Category not found' });
        }

        // Check if type name already exists for this category
        const checkTypeNameQueryWafi = `SELECT wafi_name FROM wafi_types WHERE wafi_category_id = ? AND wafi_name = ?`;
        const typeNameCheckResultWafi = await executeQueryWafi(checkTypeNameQueryWafi, [wafi_category_id, wafi_name]);

        if (!typeNameCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking type name existence' });
        }

        if (typeNameCheckResultWafi.dataWafi.length > 0) {
            return res.status(409).json({ successWafi: false, messageWafi: 'Type name already exists in this category' });
        }

        const queryWafi = `
            INSERT INTO wafi_types (wafi_category_id, wafi_name)
            VALUES (?, ?)
        `;
        const resultWafi = await executeQueryWafi(queryWafi, [wafi_category_id, wafi_name]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error creating type'
            });
        }

        return res.status(201).json({
            successWafi: true,
            messageWafi: 'Type created successfully',
            typeIdWafi: resultWafi.insertIdWafi
        });
    } catch (errorWafi) {
        console.error('Create type error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while creating type'
        });
    }
};

// Update an existing type
exports.updateTypeWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;
        const { wafi_category_id, wafi_name } = req.body;

        // Check if type exists
        const checkTypeQueryWafi = `SELECT wafi_id, wafi_category_id FROM wafi_types WHERE wafi_id = ?`;
        const typeCheckResultWafi = await executeQueryWafi(checkTypeQueryWafi, [idWafi]);

        if (!typeCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking type existence' });
        }

        if (typeCheckResultWafi.dataWafi.length === 0) {
            return res.status(404).json({ successWafi: false, messageWafi: 'Type not found' });
        }

        const existingTypeWafi = typeCheckResultWafi.dataWafi[0];
        const updatesWafi = [];
        const valuesWafi = [];

        if (wafi_category_id) {
            // Check if the new category exists
            const checkCategoryQueryWafi = `SELECT wafi_id FROM wafi_categories WHERE wafi_id = ?`;
            const categoryCheckResultWafi = await executeQueryWafi(checkCategoryQueryWafi, [wafi_category_id]);
            if (!categoryCheckResultWafi.successWafi) {
                return res.status(500).json({ successWafi: false, messageWafi: 'Error checking category existence' });
            }
            if (categoryCheckResultWafi.dataWafi.length === 0) {
                return res.status(400).json({ successWafi: false, messageWafi: 'Category not found' });
            }
            updatesWafi.push('wafi_category_id = ?');
            valuesWafi.push(wafi_category_id);
        }

        if (wafi_name) {
            // Check if the new type name already exists for this category (excluding the current type)
            const checkTypeNameQueryWafi = `SELECT wafi_name FROM wafi_types WHERE wafi_category_id = ? AND wafi_name = ? AND wafi_id != ?`;
            const typeNameCheckResultWafi = await executeQueryWafi(checkTypeNameQueryWafi, [wafi_category_id || existingTypeWafi.wafi_category_id, wafi_name, idWafi]);
            if (!typeNameCheckResultWafi.successWafi) {
                return res.status(500).json({ successWafi: false, messageWafi: 'Error checking type name existence' });
            }
            if (typeNameCheckResultWafi.dataWafi.length > 0) {
                return res.status(409).json({ successWafi: false, messageWafi: 'Type name already exists in this category' });
            }
            updatesWafi.push('wafi_name = ?');
            valuesWafi.push(wafi_name);
        }

        if (updatesWafi.length === 0) {
            return res.status(200).json({ successWafi: true, messageWafi: 'No type data to update' });
        }

        const queryWafi = `
            UPDATE wafi_types
            SET ${updatesWafi.join(', ')}
            WHERE wafi_id = ?
        `;
        valuesWafi.push(idWafi);

        const resultWafi = await executeQueryWafi(queryWafi, valuesWafi);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error updating type'
            });
        }

        return res.status(200).json({
            successWafi: true,
            messageWafi: 'Type updated successfully'
        });
    } catch (errorWafi) {
        console.error('Update type error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while updating type'
        });
    }
};

// Delete a type
exports.deleteTypeWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;

        // Check if type exists
        const checkTypeQueryWafi = `SELECT wafi_id FROM wafi_types WHERE wafi_id = ?`;
        const typeCheckResultWafi = await executeQueryWafi(checkTypeQueryWafi, [idWafi]);

        if (!typeCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking type existence' });
        }

        if (typeCheckResultWafi.dataWafi.length === 0) {
            return res.status(404).json({ successWafi: false, messageWafi: 'Type not found' });
        }

        const queryWafi = `
            DELETE FROM wafi_types
            WHERE wafi_id = ?
        `;
        const resultWafi = await executeQueryWafi(queryWafi, [idWafi]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error deleting type'
            });
        }

        return res.status(200).json({
            successWafi: true,
            messageWafi: 'Type deleted successfully'
        });
    } catch (errorWafi) {
        console.error('Delete type error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while deleting type'
        });
    }
};

exports.getBasesWafi = async (req, res) => {
    try {
        const queryWafi = `
            SELECT
                wb.wafi_id,
                wb.wafi_user_id,
                wu.wafi_username AS user_name,
                wb.wafi_tag,
                wb.wafi_name,
                wb.wafi_th_level,
                wb.wafi_created_at,
                wb.wafi_updated_at
            FROM wafi_bases wb
            JOIN wafi_users wu ON wb.wafi_user_id = wu.wafi_id
            ORDER BY wu.wafi_username, wb.wafi_tag
        `;
        const resultWafi = await executeQueryWafi(queryWafi);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching bases'
            });
        }

        return res.status(200).json(resultWafi.dataWafi);
    } catch (errorWafi) {
        console.error('Get bases error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching bases'
        });
    }
};

// Get base by ID
exports.getBaseByIdWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;
        const queryWafi = `
            SELECT
                wb.wafi_id,
                wb.wafi_user_id,
                wu.wafi_username AS user_name,
                wb.wafi_tag,
                wb.wafi_name,
                wb.wafi_th_level,
                wb.wafi_created_at,
                wb.wafi_updated_at
            FROM wafi_bases wb
            JOIN wafi_users wu ON wb.wafi_user_id = wu.wafi_id
            WHERE wb.wafi_id = ?
        `;
        const resultWafi = await executeQueryWafi(queryWafi, [idWafi]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error fetching base'
            });
        }

        if (resultWafi.dataWafi.length === 0) {
            return res.status(404).json({
                successWafi: false,
                messageWafi: 'Base not found'
            });
        }

        return res.status(200).json(resultWafi.dataWafi[0]);
    } catch (errorWafi) {
        console.error('Get base by ID error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while fetching base'
        });
    }
};

// Create a new base
exports.createBaseWafi = async (req, res) => {
    try {
        const { wafi_user_id, wafi_tag, wafi_name, wafi_th_level } = req.body;

        // Check if user exists
        const checkUserQueryWafi = `SELECT wafi_id FROM wafi_users WHERE wafi_id = ?`;
        const userCheckResultWafi = await executeQueryWafi(checkUserQueryWafi, [wafi_user_id]);

        if (!userCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking user existence' });
        }

        if (userCheckResultWafi.dataWafi.length === 0) {
            return res.status(400).json({ successWafi: false, messageWafi: 'User not found' });
        }

        // Check if tag already exists
        const checkTagQueryWafi = `SELECT wafi_tag FROM wafi_bases WHERE wafi_tag = ?`;
        const tagCheckResultWafi = await executeQueryWafi(checkTagQueryWafi, [wafi_tag]);

        if (!tagCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking tag existence' });
        }

        if (tagCheckResultWafi.dataWafi.length > 0) {
            return res.status(409).json({ successWafi: false, messageWafi: 'Base tag already exists' });
        }

        const queryWafi = `
            INSERT INTO wafi_bases (wafi_user_id, wafi_tag, wafi_name, wafi_th_level)
            VALUES (?, ?, ?, ?)
        `;
        const resultWafi = await executeQueryWafi(queryWafi, [wafi_user_id, wafi_tag, wafi_name, wafi_th_level]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error creating base'
            });
        }

        return res.status(201).json({
            successWafi: true,
            messageWafi: 'Base created successfully',
            baseIdWafi: resultWafi.insertIdWafi
        });
    } catch (errorWafi) {
        console.error('Create base error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while creating base'
        });
    }
};

exports.updateBaseWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;
        const { wafi_user_id, wafi_tag, wafi_name, wafi_th_level } = req.body;

        // Check if base exists
        const checkBaseQueryWafi = `SELECT wafi_id FROM wafi_bases WHERE wafi_id = ?`;
        const baseCheckResultWafi = await executeQueryWafi(checkBaseQueryWafi, [idWafi]);

        if (!baseCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking base existence' });
        }

        if (baseCheckResultWafi.dataWafi.length === 0) {
            return res.status(404).json({ successWafi: false, messageWafi: 'Base not found' });
        }

        const updatesWafi = [];
        const valuesWafi = [];

        if (wafi_user_id) {
            // Check if the new user exists
            const checkUserQueryWafi = `SELECT wafi_id FROM wafi_users WHERE wafi_id = ?`;
            const userCheckResultWafi = await executeQueryWafi(checkUserQueryWafi, [wafi_user_id]);
            if (!userCheckResultWafi.successWafi) {
                return res.status(500).json({ successWafi: false, messageWafi: 'Error checking user existence' });
            }
            if (userCheckResultWafi.dataWafi.length === 0) {
                return res.status(400).json({ successWafi: false, messageWafi: 'User not found' });
            }
            updatesWafi.push('wafi_user_id = ?');
            valuesWafi.push(wafi_user_id);
        }

        if (wafi_tag) {
            // Check if the new tag already exists for another base
            const checkTagQueryWafi = `SELECT wafi_tag FROM wafi_bases WHERE wafi_tag = ? AND wafi_id != ?`;
            const tagCheckResultWafi = await executeQueryWafi(checkTagQueryWafi, [wafi_tag, idWafi]);
            if (!tagCheckResultWafi.successWafi) {
                return res.status(500).json({ successWafi: false, messageWafi: 'Error checking tag existence' });
            }
            if (tagCheckResultWafi.dataWafi.length > 0) {
                return res.status(409).json({ successWafi: false, messageWafi: 'Base tag already exists' });
            }
            updatesWafi.push('wafi_tag = ?');
            valuesWafi.push(wafi_tag);
        }

        if (wafi_name !== undefined) {
            updatesWafi.push('wafi_name = ?');
            valuesWafi.push(wafi_name);
        }

        if (wafi_th_level !== undefined) {
            updatesWafi.push('wafi_th_level = ?');
            valuesWafi.push(wafi_th_level);
        }

        if (updatesWafi.length === 0) {
            return res.status(200).json({ successWafi: true, messageWafi: 'No base data to update' });
        }

        const queryWafi = `
            UPDATE wafi_bases
            SET ${updatesWafi.join(', ')}
            WHERE wafi_id = ?
        `;
        valuesWafi.push(idWafi);

        const resultWafi = await executeQueryWafi(queryWafi, valuesWafi);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error updating base'
            });
        }

        return res.status(200).json({
            successWafi: true,
            messageWafi: 'Base updated successfully'
        });
    } catch (errorWafi) {
        console.error('Update base error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while updating base'
        });
    }
};


exports.deleteBaseWafi = async (req, res) => {
    try {
        const idWafi = req.params.id;

        // Check if base exists
        const checkBaseQueryWafi = `SELECT wafi_id FROM wafi_bases WHERE wafi_id = ?`;
        const baseCheckResultWafi = await executeQueryWafi(checkBaseQueryWafi, [idWafi]);

        if (!baseCheckResultWafi.successWafi) {
            return res.status(500).json({ successWafi: false, messageWafi: 'Error checking base existence' });
        }

        if (baseCheckResultWafi.dataWafi.length === 0) {
            return res.status(404).json({ successWafi: false, messageWafi: 'Base not found' });
        }

        const queryWafi = `
            DELETE FROM wafi_bases
            WHERE wafi_id = ?
        `;
        const resultWafi = await executeQueryWafi(queryWafi, [idWafi]);

        if (!resultWafi.successWafi) {
            return res.status(500).json({
                successWafi: false,
                messageWafi: 'Error deleting base'
            });
        }

        return res.status(200).json({
            successWafi: true,
            messageWafi: 'Base deleted successfully'
        });
    } catch (errorWafi) {
        console.error('Delete base error:', errorWafi);
        return res.status(500).json({
            successWafi: false,
            messageWafi: 'Server error while deleting base'
        });
    }
};
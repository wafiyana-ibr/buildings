const { poolWafi } = require('../db/connection');
const bcryptWafi = require('bcryptjs');
const jwtWafi = require('jsonwebtoken');
require('dotenv').config();
// ========== USER CONTROLLERS ==========

// Register new user
exports.signUpUserWafi = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if email already exists
        const [existingUsersWafi] = await poolWafi.execute(
            'SELECT * FROM wafi_users WHERE wafi_email = ?',
            [email]
        );

        if (existingUsersWafi.length > 0) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        // Hash the password
        const saltRoundsWafi = 10; ``
        const passwordHashWafi = await bcryptWafi.hash(password, saltRoundsWafi);

        // Insert new user
        const [resultWafi] = await poolWafi.execute(
            'INSERT INTO wafi_users (wafi_username, wafi_email, wafi_password_hash, wafi_role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHashWafi, 'user']
        );

        const payloadWafi = {
            id: resultWafi.insertId,
            username,
            email,
            role: 'user'
        };

        const tokenWafi = jwtWafi.sign(payloadWafi, process.env.JWT_SECRET_WAFI, { expiresIn: '1h' });
        res.cookie('token', tokenWafi, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        res.status(201).json({
            message: 'User registered successfully',
        });
    } catch (errorWafi) {
        console.error('Error registering user:', errorWafi);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

/**
 * Melakukan proses login pengguna Wafi.
 *
 * Langkah-langkah:
 * 1. Ambil `email` dan `password` dari body request.
 * 2. Cari pengguna di database `wafi_users` berdasarkan `email`.
 * 3. Jika pengguna tidak ditemukan, kirim error 401 (Invalid credentials).
 * 4. Ambil data pengguna dari hasil query.
 * 5. Bandingkan `password` yang diberikan dengan hash password yang tersimpan menggunakan bcrypt.
 * 6. Jika password tidak cocok, kirim error 401 (Invalid credentials).
 * 7. Buat payload JWT berisi informasi pengguna (id, username, email, role).
 * 8. Tandatangani payload menjadi token JWT menggunakan secret key dan opsi masa berlaku.
 * 9. Set token JWT sebagai HTTP-only cookie di response.
 * 10. Kirim respons sukses dengan pesan login berhasil.
 * 11. Tangani error yang terjadi selama proses login dan kirim error 500.
 *
 * @route   POST /api/wafi/auth/signin
 * @body    {string} email - Email pengguna.
 * @body    {string} password - Password pengguna.
 * @returns {object} 200 - Respons sukses dengan pesan login berhasil dan cookie 'token' yang berisi JWT.
 * @returns {object} 401 - Respons error jika email tidak ditemukan atau password tidak cocok.
 * @returns {object} 500 - Respons error jika terjadi kesalahan server selama proses login.
 */
// Login user
exports.signInUserWafi = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [usersWafi] = await poolWafi.execute(
            'SELECT * FROM wafi_users WHERE wafi_email = ?',
            [email]
        );

        if (usersWafi.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const userWafi = usersWafi[0];
        const passwordMatchWafi = await bcryptWafi.compare(password, userWafi.wafi_password_hash);

        if (!passwordMatchWafi) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const payloadWafi = {
            id: userWafi.wafi_id,
            username: userWafi.wafi_username,
            email: userWafi.wafi_email,
            role: userWafi.wafi_role
        };
        const tokenWafi = jwtWafi.sign(payloadWafi, process.env.JWT_SECRET_WAFI, { expiresIn: '30d' });
        res.cookie('token', tokenWafi, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            message: 'Login successful',
        });
    } catch (errorWafi) {
        console.error('Error logging in:', errorWafi);
        res.status(500).json({ error: 'Failed to log in' });
    }
};

// Add logout function
exports.logoutUserWafi = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax'
        });

        res.json({ message: 'Logout successful' });
    } catch (errorWafi) {
        console.error('Error logging out:', errorWafi);
        res.status(500).json({ error: 'Failed to log out' });
    }
};

// Ensure getUserMe is using the correct approach
exports.getUserMeWafi = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userIdWafi = req.user.id;

        const [rowsWafi] = await poolWafi.execute(
            'SELECT wafi_id, wafi_username, wafi_email, wafi_role FROM wafi_users WHERE wafi_id = ?',
            [userIdWafi]
        );

        if (rowsWafi.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data without password
        res.json({
            id: rowsWafi[0].wafi_id,
            username: rowsWafi[0].wafi_username,
            email: rowsWafi[0].wafi_email,
            role: rowsWafi[0].wafi_role
        });
    } catch (errorWafi) {
        console.error('Error fetching user:', errorWafi);
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
};

exports.getUserWafi = async (req, res) => {
    try {
        const { userId } = req.params;

        const [rowsWafi] = await poolWafi.execute(
            'SELECT * FROM wafi_users WHERE wafi_id = ?',
            [userId]
        );

        if (rowsWafi.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(rowsWafi[0]);
    } catch (errorWafi) {
        console.error('Error fetching user:', errorWafi);
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
};

// ========== BASE CONTROLLERS ==========

// Get all bases for a user
exports.getUserBasesWafi = async (req, res) => {
    try {
        const { userId } = req.params;

        const [rowsWafi] = await poolWafi.execute(
            'SELECT * FROM wafi_bases WHERE wafi_user_id = ?',
            [userId]
        );

        res.json(rowsWafi);
    } catch (errorWafi) {
        console.error('Error fetching bases:', errorWafi);
        res.status(500).json({ error: 'Failed to retrieve bases' });
    }
};
exports.getUserBaseByTagWafi = async (req, res) => {
    try {
        const { userId, tag } = req.params;
        const formattedTagWafi = tag.startsWith('#') ? tag : `#${tag}`;

        const [rowsWafi] = await poolWafi.execute(
            'SELECT * FROM wafi_bases WHERE wafi_user_id = ? AND wafi_tag = ?',
            [userId, formattedTagWafi]
        );

        if (rowsWafi.length === 0) {
            return res.status(404).json({ error: 'Base not found' });
        }

        res.json(rowsWafi[0]);
    } catch (errorWafi) {
        console.error('Error fetching base by tag:', errorWafi);
        res.status(500).json({ error: 'Failed to retrieve base' });
    }
}

// Add a new base
exports.addBaseWafi = async (req, res) => {
    try {
        const { userId, playerTag, name, thLevel } = req.body;
        // Validate that all required parameters are present and not undefined
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        if (!playerTag) {
            return res.status(400).json({ error: 'playerTag is required' });
        }

        if (!thLevel) {
            return res.status(400).json({ error: 'thLevel is required' });
        }

        // Format the tag to ensure it starts with '#'
        const formattedTagWafi = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;

        // Provide a default name if not provided
        const baseNameWafi = name || 'Unnamed Base';

        const [resultWafi] = await poolWafi.execute(
            'INSERT INTO wafi_bases (wafi_user_id, wafi_tag, wafi_name, wafi_th_level) VALUES (?, ?, ?, ?)',
            [userId, formattedTagWafi, baseNameWafi, thLevel]
        );

        res.status(201).json({
            id: resultWafi.insertId,
            message: 'Base added successfully'
        });
    } catch (errorWafi) {
        console.error('Error adding base:', errorWafi);
        res.status(500).json({ error: 'Failed to add base' });
    }
};

// Update a base
exports.updateBaseWafi = async (req, res) => {
    try {
        const { baseId } = req.params;
        const { tag, name, thLevel } = req.body;
        // Validate input data
        if (!tag) {
            return res.status(400).json({ error: 'Tag is required' });
        }

        // Format tag if needed
        const formattedTagWafi = tag.startsWith('#') ? tag : `#${tag}`;

        // Use default values if not provided
        const baseNameWafi = name || 'Unnamed Base';
        const baseThLevelWafi = thLevel || 1;

        const [resultWafi] = await poolWafi.execute(
            'UPDATE wafi_bases SET wafi_tag = ?, wafi_name = ?, wafi_th_level = ? WHERE wafi_id = ?',
            [formattedTagWafi, baseNameWafi, baseThLevelWafi, baseId]
        );

        if (resultWafi.affectedRows === 0) {
            return res.status(404).json({ error: 'Base not found' });
        }

        res.json({
            message: 'Base updated successfully',
            id: baseId,
            tag: formattedTagWafi,
            name: baseNameWafi,
            thLevel: baseThLevelWafi
        });
    } catch (errorWafi) {
        console.error('Error updating base:', errorWafi);
        res.status(500).json({ error: 'Failed to update base' });
    }
}

// Get single base
exports.getBaseWafi = async (req, res) => {
    try {
        const { baseId } = req.params;

        const [rowsWafi] = await poolWafi.execute(
            'SELECT * FROM wafi_bases WHERE wafi_id = ?',
            [baseId]
        );

        if (rowsWafi.length === 0) {
            return res.status(404).json({ error: 'Base not found' });
        }

        res.json(rowsWafi[0]);
    } catch (errorWafi) {
        console.error('Error fetching base:', errorWafi);
        res.status(500).json({ error: 'Failed to retrieve base' });
    }
};
// Delete a base
exports.deleteBaseWafi = async (req, res) => {
    try {
        const { baseId, userId } = req.params;
        const [deleteObjectWafi] = await poolWafi.execute(
            'DELETE FROM wafi_objects WHERE wafi_base_id = ?',
            [baseId]
        );
        const [resultWafi] = await poolWafi.execute(
            'DELETE FROM wafi_bases WHERE wafi_id = ? AND wafi_user_id = ?',
            [baseId, userId]
        );

        if (resultWafi.affectedRows === 0) {
            return res.status(404).json({ error: 'Base not found or not authorized' });
        }

        res.json({ message: 'Base deleted successfully' });
    } catch (errorWafi) {
        console.error('Error deleting base:', errorWafi);
        res.status(500).json({ error: 'Failed to delete base' });
    }
};

// ========== OBJECT CONTROLLERS ==========

// Get all objects for a base
exports.getObjectWafi = async (req, res) => {
    try {
        const { baseId } = req.params;

        const [rowsWafi] = await poolWafi.execute(
            'SELECT o.wafi_id, t.wafi_name, t.wafi_id as wafi_type_id, c.wafi_name as wafi_category_name, o.wafi_level FROM wafi_objects o INNER JOIN wafi_types t ON t.wafi_id = o.wafi_type_id INNER JOIN wafi_categories as c ON c.wafi_id = t.wafi_category_id WHERE o.wafi_base_id = ?',
            [baseId]
        );
        if (rowsWafi.length === 0) {
            return res.status(404).json({ error: 'No objects found for this base' });
        }

        res.json(rowsWafi);
    } catch (errorWafi) {
        console.error('Error fetching objects:', errorWafi);
        res.status(500).json({ error: 'Failed to retrieve objects' });
    }
}

// Update object level
exports.updateObjectLevelWafi = async (req, res) => {
    try {
        const { objectId } = req.params;
        const { level } = req.body;

        // Validate the level value
        if (level === undefined || level < 0) {
            return res.status(400).json({ error: 'Invalid level value' });
        }

        const [resultWafi] = await poolWafi.execute(
            'UPDATE wafi_objects SET wafi_level = ? WHERE wafi_id = ?',
            [level, objectId]
        );

        if (resultWafi.affectedRows === 0) {
            return res.status(404).json({ error: 'Object not found' });
        }

        res.json({
            message: 'Object level updated successfully',
            objectId,
            level
        });
    } catch (errorWafi) {
        console.error('Error updating object level:', errorWafi);
        res.status(500).json({ error: 'Failed to update object level' });
    }
};


/**
 * Membuat atau memperbarui objek game (bangunan) untuk base Wafi berdasarkan hasil pemindaian.
 *
 * Langkah-langkah:
 * 1. Validasi data bangunan (`buildings` harus array tidak kosong, setiap item harus memiliki `name` dan `level` >= 0).
 * 2. Periksa apakah `baseId` valid dan ada di database.
 * 3. Kelompokkan data `buildings` berdasarkan nama tipe bangunan.
 * 4. Loop setiap tipe bangunan yang unik.
 * 5. Cari `wafi_id` yang sesuai dengan nama tipe bangunan.
 * 6. Jika tipe tidak ditemukan, catat sebagai error.
 * 7. Ambil semua objek yang sudah ada untuk base dan tipe bangunan ini.
 * 8. Perbarui level objek yang sudah ada sesuai dengan jumlah dan level yang diberikan dalam pemindaian (hanya jika level berbeda).
 * 9. Sisipkan objek baru jika jumlah dalam pemindaian lebih banyak dari yang sudah ada.
 * 10. Biarkan objek tambahan yang ada di database jika jumlahnya lebih banyak dari pemindaian.
 * 11. Kumpulkan status (updated, created, unchanged, error) setiap operasi.
 * 12. Kirim respons JSON dengan ringkasan hasil pemrosesan.
 * 13. Tangani error umum selama proses.
 *
 * @route   POST /api/wafi/bases/:baseId/objects/scan
 * @param   {string} baseId - ID base Wafi.
 * @body    {Array<Object>} buildings - Array objek bangunan dari hasil pemindaian untuk dibuat atau diperbarui. Setiap objek memiliki properti `name` (string) dan `level` (number, >= 0).
 * @returns {object} - Respons dengan status pemrosesan objek (jumlah total diproses, diperbarui, dibuat, tidak berubah, dan error).
 */

exports.createOrUpdateObjectsWafi = async (req, res) => {
    try {
        const { baseId } = req.params;
        const { buildings } = req.body;

        if (!Array.isArray(buildings) || buildings.length === 0) {
            return res.status(400).json({ error: 'Invalid buildings data' });
        }

        // First verify the base exists
        const [baseCheckWafi] = await poolWafi.execute(
            'SELECT wafi_id FROM wafi_bases WHERE wafi_id = ?',
            [baseId]
        );

        if (baseCheckWafi.length === 0) {
            return res.status(404).json({ error: 'Base not found' });
        }

        // Process buildings grouped by name
        const buildingsByNameWafi = {};
        buildings.forEach(building => {
            if (!building.name || building.level === undefined || building.level < 0) {
                return; // Skip invalid data
            }

            if (!buildingsByNameWafi[building.name]) {
                buildingsByNameWafi[building.name] = [];
            }
            buildingsByNameWafi[building.name].push(building);
        });

        // Process each building type
        const resultsWafi = [];

        for (const [buildingName, buildingsOfType] of Object.entries(buildingsByNameWafi)) {
            try {
                // Get the type ID for this building name
                const [typeRowsWafi] = await poolWafi.execute(
                    'SELECT wafi_id FROM wafi_types WHERE wafi_name = ?',
                    [buildingName]
                );

                if (typeRowsWafi.length === 0) {
                    resultsWafi.push({
                        name: buildingName,
                        status: 'error',
                        message: 'Building type not found'
                    });
                    continue;
                }

                const typeIdWafi = typeRowsWafi[0].wafi_id;

                // Get all existing objects of this type for this base
                const [existingObjectsWafi] = await poolWafi.execute(
                    'SELECT wafi_id, wafi_level FROM wafi_objects WHERE wafi_base_id = ? AND wafi_type_id = ?',
                    [baseId, typeIdWafi]
                );


                // Update existing objects up to the count provided in the scan
                const updateCountWafi = Math.min(existingObjectsWafi.length, buildingsOfType.length);

                for (let i = 0; i < updateCountWafi; i++) {
                    const objectIdWafi = existingObjectsWafi[i].wafi_id;
                    const newLevelWafi = buildingsOfType[i].level;

                    // Only update if level has changed
                    if (existingObjectsWafi[i].wafi_level !== newLevelWafi) {
                        await poolWafi.execute(
                            'UPDATE wafi_objects SET wafi_level = ? WHERE wafi_id = ?',
                            [newLevelWafi, objectIdWafi]
                        );

                        resultsWafi.push({
                            name: buildingName,
                            objectId: objectIdWafi,
                            status: 'updated',
                            level: newLevelWafi
                        });
                    } else {
                        resultsWafi.push({
                            name: buildingName,
                            objectId: objectIdWafi,
                            status: 'unchanged',
                            level: newLevelWafi
                        });
                    }
                }

                // Insert additional objects if more were provided in the scan than exist in the database
                if (buildingsOfType.length > existingObjectsWafi.length) {
                    for (let i = existingObjectsWafi.length; i < buildingsOfType.length; i++) {
                        const [insertResultWafi] = await poolWafi.execute(
                            'INSERT INTO wafi_objects (wafi_base_id, wafi_type_id, wafi_level) VALUES (?, ?, ?)',
                            [baseId, typeIdWafi, buildingsOfType[i].level]
                        );

                        resultsWafi.push({
                            name: buildingName,
                            objectId: insertResultWafi.insertId,
                            status: 'created',
                            level: buildingsOfType[i].level
                        });
                    }
                }

                // Note: We intentionally leave any extra objects in the database untouched
                // if there are more in the database than in the scan
            } catch (errWafi) {
                console.error(`Error processing building ${buildingName}:`, errWafi);
                resultsWafi.push({
                    name: buildingName,
                    status: 'error',
                    message: errWafi.message
                });
            }
        }

        res.json({
            message: 'Objects processed successfully from scan results',
            results: resultsWafi,
            totalProcessed: resultsWafi.length,
            updated: resultsWafi.filter(r => r.status === 'updated').length,
            created: resultsWafi.filter(r => r.status === 'created').length,
            unchanged: resultsWafi.filter(r => r.status === 'unchanged').length,
            errors: resultsWafi.filter(r => r.status === 'error').length
        });
    } catch (errorWafi) {
        console.error('Error creating/updating objects from scan:', errorWafi);
        res.status(500).json({ error: 'Failed to process objects from scan' });
    }
};


// Delete an object
exports.deleteObjectWafi = async (req, res) => {
    try {
        const { objectId } = req.params;

        const [resultWafi] = await poolWafi.execute(
            'DELETE FROM wafi_objects WHERE wafi_id = ?',
            [objectId]
        );

        if (resultWafi.affectedRows === 0) {
            return res.status(404).json({ error: 'Object not found' });
        }

        res.json({
            message: 'Object deleted successfully',
            objectId
        });
    } catch (errorWafi) {
        console.error('Error deleting object:', errorWafi);
        res.status(500).json({ error: 'Failed to delete object' });
    }
};

/**
 * Menginisialisasi banyak objek game (bangunan) untuk base Wafi tertentu.
 *
 * Langkah-langkah:
 * 1. Validasi data bangunan (`buildings` harus array tidak kosong).
 * 2. Periksa apakah `baseId` valid dan ada di database.
 * 3. Loop setiap bangunan dalam `buildings`.
 * 4. Cari `wafi_id` yang sesuai dengan nama tipe bangunan.
 * 5. Jika tipe tidak ditemukan, catat sebagai error.
 * 6. Sisipkan objek bangunan baru ke database.
 * 7. Kumpulkan status (sukses/error) setiap inisialisasi.
 * 8. Kirim respons JSON dengan hasil inisialisasi.
 * 9. Tangani error umum selama proses.
 *
 * @route   POST /api/wafi/bases/:baseId/objects
 * @param   {string} baseId - ID base Wafi.
 * @body    {Array<Object>} buildings - Array objek bangunan untuk diinisialisasi.
 * @returns {object} - Respons dengan status inisialisasi.
 */
exports.initializeObjectsWafi = async (req, res) => {
    try {
        const { baseId } = req.params;
        const { buildings } = req.body;

        if (!Array.isArray(buildings) || buildings.length === 0) {
            return res.status(400).json({ error: 'Invalid buildings data' });
        }

        // First verify the base exists
        const [baseCheckWafi] = await poolWafi.execute(
            'SELECT wafi_id FROM wafi_bases WHERE wafi_id = ?',
            [baseId]
        );

        if (baseCheckWafi.length === 0) {
            return res.status(404).json({ error: 'Base not found' });
        }

        // Initialize results array
        const resultsWafi = [];

        // Process each building
        for (const building of buildings) {
            try {
                const { name, level = 0 } = building;

                if (!name) {
                    continue;
                }

                // Get the type ID for this building name
                const [typeRowsWafi] = await poolWafi.execute(
                    'SELECT wafi_id FROM wafi_types WHERE wafi_name = ?',
                    [name]
                );

                if (typeRowsWafi.length === 0) {
                    (`Building type not found: ${name}`);
                    resultsWafi.push({
                        name,
                        status: 'error',
                        message: 'Building type not found'
                    });
                    continue;
                }

                const typeIdWafi = typeRowsWafi[0].wafi_id;

                // Insert the new object with initial level 0
                const [insertResultWafi] = await poolWafi.execute(
                    'INSERT INTO wafi_objects (wafi_base_id, wafi_type_id, wafi_level) VALUES (?, ?, ?)',
                    [baseId, typeIdWafi, level]
                );

                resultsWafi.push({
                    name,
                    objectId: insertResultWafi.insertId,
                    status: 'created',
                    level: level
                });
            } catch (buildingErrorWafi) {
                console.error(`Error processing building:`, buildingErrorWafi);
                resultsWafi.push({
                    name: building.name || 'Unknown',
                    status: 'error',
                    message: buildingErrorWafi.message
                });
            }
        }

        res.json({
            message: 'Objects initialized successfully',
            count: resultsWafi.length,
            results: resultsWafi
        });
    } catch (errorWafi) {
        console.error('Error initializing objects:', errorWafi);
        res.status(500).json({ error: 'Failed to initialize objects' });
    }
};


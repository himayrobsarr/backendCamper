const db = require("../helpers/conexion");

const CamperModel = {
    // Obtener todos los campers
    getAllCampers: async () => {
        const query = "SELECT * FROM CAMPER";
        return db.query(query);
    },

    // Obtener un camper por ID
    getCamperById: async (id) => {
        const query = "SELECT * FROM CAMPER WHERE id = ?";
        return db.query(query, [id]);
    },

    // Crear un nuevo camper (solo el dueño del perfil o admin)
    createCamper: async ({
        user_id,
        title,
        description,
        about,
        image,
        main_video_url,
        document_number_id,
        full_name,
        age,
        city_id,
        profile_picture
    }, requestingUserId, userRole) => {
        // Verificar que solo el dueño del perfil o admin pueda crear
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para crear un perfil para otro usuario');
        }

        const query = `
            INSERT INTO CAMPER (
                user_id,
                title,
                description,
                about,
                image,
                main_video_url,
                document_number_id,
                full_name,
                age,
                city_id,
                profile_picture
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            user_id,
            title,
            description,
            about,
            image,
            main_video_url,
            document_number_id,
            full_name,
            age,
            city_id,
            profile_picture
        ];

        return db.query(query, values);
    },


    // Actualizar un camper existente (solo el dueño del perfil o admin)
    updateCamper: async (user_id, camperData, requestingUserId, userRole) => {
        // Verificar permisos
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para actualizar este perfil');
        }
        
        const query = "UPDATE CAMPER SET ? WHERE user_id = ?";
        const result = await db.query(query, [camperData, user_id]);
    
        if (result.affectedRows === 0) {
            throw new Error('Camper no encontrado o no actualizado');
        }

        return result;
    },

    // Actualizar los datos del camper (y asociar el documento)
    updateCamperAndUser: async (user_id, camperData, userData, requestingUserId, userRole) => {
        // Verificar permisos
        if (userRole !== 'admin' && user_id !== requestingUserId) {
            throw new Error('No tienes permiso para actualizar este perfil');
        }
        
        // Actualizar los datos del usuario
        const userQuery = "UPDATE USER SET ? WHERE id = ?";
        await db.query(userQuery, [userData, user_id]);

        // Actualizar los datos del camper
        const camperQuery = "UPDATE CAMPER SET ? WHERE user_id = ?";
        const result = await db.query(camperQuery, [camperData, user_id]);
    
        if (result.affectedRows === 0) {
            throw new Error('Camper no encontrado o no actualizado');
        }

        return result;
    },

    // Eliminar un camper
    deleteCamper: async (id, requestingUserId, userRole) => {
        const camper = await db.query("SELECT user_id FROM CAMPER WHERE id = ?", [id]);
        
        if (!camper.data.length) {
            throw new Error('Camper no encontrado');
        }

        if (userRole !== 'admin' && camper.data[0].user_id !== requestingUserId) {
            throw new Error('No tienes permiso para eliminar este perfil');
        }

        const query = "DELETE FROM CAMPER WHERE id = ?";
        return db.query(query, [id]);
    },
};

module.exports = CamperModel;

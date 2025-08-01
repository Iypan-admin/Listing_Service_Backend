// controllers/centersController.js

const supabase = require('../config/supabaseClient');

/**
 * Fetch all centers without pagination.
 */
const getAllCenters = async (req, res) => {
  try {
    // Remove pagination to get all centers
    const { data, error } = await supabase
      .from('centers')
      .select(`
        center_id, 
        created_at, 
        center_name,
        state (state_name),
        center_admin (name)
      `);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching centers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch centers.',
    });
  }
};

/**
 * Fetch a single center by its ID.
 */
const getCenterById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('centers')
      .select('center_id, created_at, center_name, state, center_admin')
      .eq('center_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Center not found.',
        });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching center by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch center details.',
    });
  }
};

/**
 * Get center details by center admin's user ID
 */
const getCenterByAdminId = async (req, res) => {
  try {
    // Get user ID from JWT token
    const userId = req.user.id;

    // Check if the user is a center admin
    const { data: centerAdminData, error: centerAdminError } = await supabase
      .from('centers')
      .select('center_id, center_name, created_at, state, center_admin')
      .eq('center_admin', userId)
      .single();

    if (centerAdminError && centerAdminError.code !== 'PGRST116') {
      throw centerAdminError;
    }

    // If the user is a center admin, return the specific center
    if (centerAdminData) {
      return res.status(200).json({
        success: true,
        data: [centerAdminData], // Wrap in an array for consistency
      });
    }

    // If not a center admin, return all centers
    const { data: allCenters, error: allCentersError } = await supabase
      .from('centers')
      .select('center_id, center_name, created_at, state, center_admin');

    if (allCentersError) {
      throw allCentersError;
    }

    res.status(200).json({
      success: true,
      data: allCenters,
    });
  } catch (error) {
    console.error('Error fetching center by admin ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch center details.',
    });
  }
};


/**
 * Fetch all centers for the state where the authenticated user is the state_admin,
 * including the center_admin's name.
 */
const getCentersForStateAdmin = async (req, res) => {
  try {
    // Get the user ID from the JWT token
    const userId = req.user.id;

    // Get the state_id where this user is the state_admin
    const { data: stateData, error: stateError } = await supabase
      .from('states')
      .select('state_id')
      .eq('state_admin', userId)
      .single();

    if (stateError || !stateData) {
      return res.status(404).json({
        success: false,
        message: 'State not found for this admin.',
      });
    }

    // Fetch centers for this state_id, including center_admin's name
    const { data: centers, error: centersError } = await supabase
      .from('centers')
      .select(`
        center_id,
        center_name,
        created_at,
        state,
        center_admin,
        admin:users!center_admin(id, name)
      `)
      .eq('state', stateData.state_id);

    if (centersError) throw centersError;

    // Transform the response to include center_admin_name and remove nested object
    const transformedCenters = centers.map(center => ({
      ...center,
      center_admin_name: center.admin?.name,
      admin: undefined // Remove the nested object
    }));

    res.status(200).json({
      success: true,
      data: transformedCenters,
    });
  } catch (error) {
    console.error('Error fetching centers for state admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch centers for this state admin.',
    });
  }
};

module.exports = {
  getAllCenters,
  getCenterById,
  getCenterByAdminId,
  getCentersForStateAdmin,
};

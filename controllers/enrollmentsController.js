// controllers/enrollmentsController.js

const supabase = require('../config/supabaseClient');

/**
 * Fetch all enrollments with optional pagination.
 */
const getAllEnrollments = async (req, res) => {
  try {

    const { data, error } = await supabase
      .from('enrollment')
      .select('enrollment_id, created_at, student, batch, status, end_date')

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments.',
    });
  }
};

/**
 * Fetch a single enrollment by its ID.
 */
const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('enrollment')
      .select('enrollment_id, created_at, student, batch, status, end_date')
      .eq('enrollment_id', id)
      .single();

    if (error) {
      // Supabase may return an error if no record found, so we handle that.
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found.',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching enrollment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment details.',
    });
  }
};

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
};

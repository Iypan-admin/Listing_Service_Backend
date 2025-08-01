// controllers/batchesController.js

const supabase = require('../config/supabaseClient');

/**
 * Fetch all batches with optional pagination.
 */
const getAllBatches = async (req, res) => {
  try {

    const { data, error } = await supabase
      .from('batches')
      .select('batch_id, created_at, batch_name, duration, center, teacher, course_id')

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches.',
    });
  }
};

/**
 * Fetch a single batch by its ID with course details.
 */
const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('batches')
      .select(`
        batch_id,
        created_at,
        batch_name,
        duration,
        center,
        teacher,
        course_id,
        course:courses(course_name),
        center_details:centers!inner(
          center_id,
          center_name
        )
      `)
      .eq('batch_id', id)
      .single();

    if (error) {
      // When record not found, return 404.
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Batch not found.',
        });
      }
      throw error;
    }

    // Transform the response to flatten the structure
    const transformedData = {
      ...data,
      course_name: data.course?.course_name,
      center_name: data.center_details?.center_name,
      course: undefined, // Remove nested object
      center_details: undefined // Remove nested object
    };

    res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('Error fetching batch by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch details.',
    });
  }
};

/**
 * Fetch all batches from a specific center
 */
const getBatchesByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;

    const { data, error } = await supabase
      .from('batches')
      .select(`
        batch_id,
        created_at,
        batch_name,
        duration,
        center,
        teacher,
        course_id,
        course:courses(course_name, type),
        center_details:centers(center_id, center_name),
        teacher_details:teachers(
          teacher_id,
          teacher:users(
            id,
            name
          )
        )
      `)
      .eq('center', centerId);

    if (error) throw error;

    // Transform the response to flatten the nested structure
    const transformedData = data.map(batch => ({
      ...batch,
      course_name: batch.course?.course_name,
      course_type: batch.course?.type,
      center_name: batch.center_details?.center_name,
      teacher_name: batch.teacher_details?.teacher?.name,
      course: undefined,
      center_details: undefined,
      teacher_details: undefined
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching center batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches for this center.'
    });
  }
};

module.exports = {
  getAllBatches,
  getBatchById,
  getBatchesByCenter  // Add this line
};

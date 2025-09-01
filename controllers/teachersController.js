// controllers/teachersController.js

const { supabase, supabaseAdmin } = require("../config/supabaseClient");

/**
 * Fetch all teachers with optional pagination.
 */
const getAllTeachers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        teacher_id,
        created_at,
        center,
        teacher,
        teacher_info:users!inner(id, name)
      `);

    if (error) throw error;

    // Transform the response to include teacher name and remove nested object
    const transformedData = data.map(teacher => ({
      ...teacher,
      teacher_name: teacher.teacher_info?.name,
      center_id: teacher.center,
      teacher_info: undefined // Remove the nested object
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers.'
    });
  }
};

/**
 * Fetch a single teacher by their ID.
 */
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('teachers')
      .select('teacher_id, created_at, center, teacher')
      .eq('teacher_id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found.',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching teacher by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher details.',
    });
  }
};

/**
 * Fetch all batches assigned to a teacher
 */
const getTeacherBatches = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Get user_id from auth middleware

    // First, get the teacher record for this user
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('teacher_id')
      .eq('teacher', user_id)
      .single();

    if (teacherError || !teacherData) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found for this user.',
      });
    }

    const teacher_id = teacherData.teacher_id;

    // Now fetch the batches with the teacher_id and include course details
    const { data, error } = await supabase
      .from('batches')
      .select(`
        batch_id,
        batch_name,
        duration,
        created_at,
        center,
        course_id,
        center_details:centers(center_id, center_name),
        course_details:courses(course_name, type)
      `)
      .eq('teacher', teacher_id);

    if (error) throw error;

    // Transform the response to include center name and course details
    const transformedData = data.map(batch => ({
      ...batch,
      center_name: batch.center_details?.center_name,
      course_name: batch.course_details?.course_name,
      course_type: batch.course_details?.type,
      center_details: undefined, // Remove nested object
      course_details: undefined, // Remove nested object
    }));

    res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('Error fetching teacher batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher batches.',
    });
  }
};

/**
 * Fetch all students assigned to a teacher (across all batches)
 */
const getStudentsByTeacher = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Get user_id from auth middleware

    // First, get the teacher record for this user
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('teacher_id')
      .eq('teacher', user_id)
      .single();

    if (teacherError || !teacherData) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found for this user.',
      });
    }

    const teacher_id = teacherData.teacher_id;

    // First, get all batches for this teacher
    const { data: batches, error: batchError } = await supabase
      .from('batches')
      .select('batch_id')
      .eq('teacher', teacher_id);

    if (batchError) throw batchError;

    if (!batches.length) {
      return res.status(200).json({
        success: true,
        data: [] // No batches, so no students
      });
    }

    // Get batch IDs
    const batchIds = batches.map(batch => batch.batch_id);

    // Get all students enrolled in these batches
    const { data, error } = await supabase
      .from('enrollment')
      .select(`
        enrollment_id,
        batch,
        student:students (
          student_id,
          registration_number,
          name,
          email,
          phone,
          status,
          center_details:centers (center_id, center_name)
        ),
        batch_details:batches (batch_id, batch_name)
      `)
      .in('batch', batchIds)
      .eq('status', true); // Only active enrollments

    if (error) throw error;

    // Transform the response to flatten the structure
    const transformedData = data.map(enrollment => ({
      enrollment_id: enrollment.enrollment_id,
      batch_id: enrollment.batch,
      batch_name: enrollment.batch_details?.batch_name,
      ...enrollment.student,
      center_name: enrollment.student?.center_details?.center_name,
      center_details: undefined,
      student: undefined,
      batch_details: undefined
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students assigned to teacher.'
    });
  }
};

/**
 * Get students from a specific batch assigned to a teacher
 */
const getTeacherBatchStudents = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Get user_id from auth middleware
    const { batchId } = req.params; // Get batch ID from route params

    // First, verify this teacher exists and get teacher_id
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('teacher_id')
      .eq('teacher', user_id)
      .single();

    if (teacherError || !teacherData) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found for this user.'
      });
    }

    // Verify this batch belongs to this teacher
    const { data: batchData, error: batchError } = await supabase
      .from('batches')
      .select('batch_id')
      .eq('teacher', teacherData.teacher_id)
      .eq('batch_id', batchId)
      .single();

    if (batchError || !batchData) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this batch or batch does not exist.'
      });
    }

    // Get students enrolled in this batch
    const { data, error } = await supabase
      .from('enrollment')
      .select(`
        enrollment_id,
        batch,
        student:students (
          student_id,
          registration_number,
          name,
          email,
          phone,
          status,
          center_details:centers (center_id, center_name)
        ),
        batch_details:batches (batch_id, batch_name)
      `)
      .eq('batch', batchId)
      .eq('status', true); // Only active enrollments

    if (error) throw error;

    // Transform the response to flatten the structure
    const transformedData = data.map(enrollment => ({
      enrollment_id: enrollment.enrollment_id,
      batch_id: enrollment.batch,
      batch_name: enrollment.batch_details?.batch_name,
      ...enrollment.student,
      center_name: enrollment.student?.center_details?.center_name,
      center_details: undefined,
      student: undefined,
      batch_details: undefined
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching batch students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students in this batch.'
    });
  }
};

/**
 * Fetch all teachers from a specific center
 */
const getTeachersByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;

    const { data, error } = await supabase
      .from('teachers')
      .select(`
        teacher_id,
        created_at,
        center,
        teacher,
        teacher_info:users!inner(
          id, 
          name
        )
      `)
      .eq('center', centerId);

    if (error) throw error;

    // Transform the response
    const transformedData = data.map(teacher => ({
      ...teacher,
      teacher_name: teacher.teacher_info?.name,
      email: teacher.teacher_info?.email,
      teacher_info: undefined // Remove the nested object
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching center teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers for this center.'
    });
  }
};

// Update the module exports to include the new function
module.exports = {
  getAllTeachers,
  getTeacherById,
  getTeacherBatches,
  getStudentsByTeacher,
  getTeacherBatchStudents,
  getTeachersByCenter  // Add this line
};

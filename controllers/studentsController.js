// controllers/studentsController.js

const { supabase, supabaseAdmin } = require("../config/supabaseClient");

/**
 * Fetch all students without pagination, including first batch name.
 */
const getAllStudents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        student_id, 
        created_at, 
        registration_number, 
        name, 
        state, 
        center,
        email, 
        phone, 
        status,
        center_details:centers(center_id, center_name),
        enrollments:enrollment (
          batch:batches(batch_id, batch_name)
        )
      `);

    if (error) throw error;

    // Transform the response to include center name and first batch
    const transformedData = data.map(student => ({
      ...student,
      center_name: student.center_details?.center_name,
      batch_name: student.enrollments?.[0]?.batch?.batch_name || "N/A",
      center_details: undefined, // Remove the nested object
      enrollments: undefined // Remove nested enrollments
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students.'
    });
  }
};

/**
 * Fetch a single student by its ID.
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('students')
      .select('student_id, created_at, registration_number, name, state, center, email, phone, status')
      .eq('student_id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student details.',
    });
  }
};

/**
 * Fetch students by batch with optional pagination.
 * We will use this for teachers dashboard
 */
const getStudentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('enrollment')
      .select(`
        student:students (
          student_id,
          registration_number,
          name,
          email,
          phone,
          status,
          center_details:centers (center_id, center_name)
        )
      `)
      .eq('batch', batchId)
      .eq('status', true) // Only get active enrollments
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    // Transform the response to flatten the structure and include center name
    const transformedData = data.map(enrollment => ({
      ...enrollment.student,
      center_name: enrollment.student.center_details?.center_name,
      center_details: undefined
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Error fetching students by batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students for this batch.'
    });
  }
};

/**
 * Fetch all batches assigned to a teacher
 */
const getTeacherBatches = async (req, res) => {
  try {
    const { teacher_id } = req.user; // Assuming this is available from auth middleware

    const { data, error } = await supabase
      .from('batches')
      .select(`
        batch_id,
        batch_name,
        language,
        type,
        duration,
        created_at,
        center,
        center_details:centers(center_id, center_name)
      `)
      .eq('teacher', teacher_id);

    if (error) throw error;

    // Transform the response to include center name
    const transformedData = data.map(batch => ({
      ...batch,
      center_name: batch.center_details?.center_name,
      center_details: undefined // Remove the nested object
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching teacher batches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher batches.'
    });
  }
};

/**
 * Fetch all students assigned to a teacher (across all batches)
 */
const getStudentsByTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.user; // Assuming this is available from auth middleware

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
 * Fetch teacher's schedule (classes, meetings, etc.)
 */
const getTeacherSchedule = async (req, res) => {
  try {
    const { teacher_id } = req.user; // Assuming this is available from auth middleware

    // Fetch scheduled classes
    const { data: classes, error: classesError } = await supabase
      .from('schedule')
      .select(`
        schedule_id,
        day,
        start_time,
        end_time,
        batch_details:batches (
          batch_id,
          batch_name,
          type
        )
      `)
      .eq('teacher', teacher_id)
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });

    if (classesError) throw classesError;

    // Transform the data
    const transformedData = classes.map(schedule => ({
      schedule_id: schedule.schedule_id,
      day: schedule.day,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      batch_id: schedule.batch_details?.batch_id,
      batch_name: schedule.batch_details?.batch_name,
      class_type: schedule.batch_details?.type,
      batch_details: undefined
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher schedule.'
    });
  }
};

/**
 * Fetch all students from a specific center
 */
const getStudentsByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;

    const { data, error } = await supabase
      .from('students')
      .select(`
        student_id,
        created_at,
        registration_number,
        name,
        email,
        phone,
        status,
        center,
        center_details:centers(center_id, center_name),
        state_details:state(state_name)
      `)
      .eq('center', centerId);

    if (error) throw error;

    // Transform the response to include center name and state name
    const transformedData = data.map(student => ({
      ...student,
      center_name: student.center_details?.center_name,
      state_name: student.state_details?.state_name,
      center_details: undefined,
      state_details: undefined
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching center students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students for this center.',
    });
  }
};
/**
 * Fetch student by register number
 */
// Get student name by registration number
const getStudentNameByRegisterNumber = async (req, res) => {
  const { registerNumber } = req.params;

  const { data, error } = await supabase
    .from('students')
    .select('name')
    .eq('registration_number', registerNumber)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Student not found' });
  }

  res.json({ name: data.name });
};



// Update module exports to include the new functions
module.exports = {
  getAllStudents,
  getStudentById,
  getStudentsByBatch,
  getTeacherBatches,
  getStudentsByTeacher,
  getTeacherSchedule,
  getStudentsByCenter,
  getStudentNameByRegisterNumber,
};

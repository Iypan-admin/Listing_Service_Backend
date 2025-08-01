const supabase = require('../config/supabaseClient');

/**
 * Add new elite card entry
 */
const addEliteCard = async (req, res) => {
    try {
        const { student_name, register_number, card_number, card_type } = req.body;

        const { data, error } = await supabase
            .from('student_elite_cards')
            .insert([{ student_name, register_number, card_number, card_type }]);

        if (error) throw error;

        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Add Elite Card Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add elite card.' });
    }
};

/**
 * Fetch all elite cards
 */
const getEliteCards = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('student_elite_cards')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Fetch Elite Cards Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch elite cards.' });
    }
};

module.exports = { addEliteCard, getEliteCards };
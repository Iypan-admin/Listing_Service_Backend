const { supabase, supabaseAdmin } = require("../config/supabaseClient");
// Add a new elite card entry
const addEliteCard = async (req, res) => {
    try {
        const { student_name, register_number, card_number, card_type } = req.body;
        const user_id = req.user?.id; // user_id from token (set by authMiddleware)

        if (!user_id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: user ID not found in token' });
        }

        const { data, error } = await supabase
            .from('student_elite_cards')
            .insert([
                {
                    student_name,
                    register_number,
                    card_number,
                    card_type,
                    user_id, // store user_id for filtering
                },
            ]);

        if (error) throw error;

        return res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Add Elite Card Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to add elite card.' });
    }
};

// Get elite cards belonging to the logged-in user
const getEliteCards = async (req, res) => {
    try {
        const user_id = req.user?.id;

        if (!user_id) {
            return res.status(401).json({ success: false, message: 'Unauthorized: user ID not found in token' });
        }

        const { data, error } = await supabase
            .from('student_elite_cards')
            .select('*')
            .eq('user_id', user_id) // only show cards of that user
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Fetch Elite Cards Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch elite cards.' });
    }
};

module.exports = {
    addEliteCard,
    getEliteCards,
};

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

app.use(cors());
// Import routes
const usersRoutes = require('./routes/usersRoutes');
const academicCoordinatorsRoutes = require('./routes/academicCoordinatorsRoutes');
const centersRoutes = require('./routes/centerRoutes');
const batchesRoutes = require('./routes/batchesRoutes');
const enrollmentsRoutes = require('./routes/enrollmentsRouter');
const financialPartnersRoutes = require('./routes/financialPartnersRoutes');
const managerRoutes = require('./routes/managerRoutes');
const notesRoutes = require('./routes/notesRoutes');
const statesRoutes = require('./routes/stateRoute');
const studentsRoutes = require('./routes/studentRoute');
const teachersRoutes = require('./routes/teacherRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const eliteCardRoutes = require('./routes/eliteCardRoutes');
const cardActivationsRoutes = require("./routes/cardActivationsRoutes");
const influencerRoutes = require("./routes/influencerRoutes");


// Mount all routes under a common API prefix
app.use('/api', usersRoutes);
app.use('/api', academicCoordinatorsRoutes);
app.use('/api', centersRoutes);
app.use('/api', batchesRoutes);
app.use('/api', enrollmentsRoutes);
app.use('/api', financialPartnersRoutes);
app.use('/api', managerRoutes);
app.use('/api', notesRoutes);
app.use('/api', statesRoutes);
app.use('/api', studentsRoutes);
app.use('/api', teachersRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', coursesRoutes);
app.use('/api', eliteCardRoutes);
app.use("/api/cards", cardActivationsRoutes);
app.use("/api", influencerRoutes);

// Start the server
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

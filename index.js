const express = require('express');
const connectDB = require('./config/config');
const categoryRoutes = require('./routes/categoryRoutes');
const app = express();

app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Define routes
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

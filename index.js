const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 8000;
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=> console.log('Database Connected'))
.catch((err)=> console.log(err));



app.listen(port , ()=>{
    console.log(`Server running on port ${port}`);
})
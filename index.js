const express = require('express');
const cors = require('cors');
const proxyRoutes = require('./routes/proxy');
const generateNft = require('./routes/generateNft');
const counter = require('./routes/counter');
const collection = require('./routes/collection');
const position = require('./routes/position');
const connectDb = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/proxy', proxyRoutes);
app.use('/generateNft', generateNft);
app.use('/counter', counter);
app.use('/collection', collection);
app.use('/position', position);

connectDb();

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

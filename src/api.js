// dependencies
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

// instantiate express
const app = express();

const router = express.Router();

// middleware
app.use(cors());

router.get('/', (req, res) => {
	res.json({ message: 'hi!' });
});

router.get('/test', (req, res) => {
	res.json({ message: 'you are testing!' });
});

app.use(`/.netlify/functions/api`, router);

// module.exports = app;
if (process.env.NODE_ENV === 'development') {
	const port = process.env.PORT;
	app.listen(port, () => {
		console.log(`\n\n*** Server running on port ${port} ***\n\n`);
	});
} else {
	module.exports.handler = serverless(app);
}

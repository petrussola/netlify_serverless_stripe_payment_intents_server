// dependencies
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// data
const data = require('../data/data');

// instantiate express
const app = express();

const router = express.Router();

// middleware
app.use(cors());
app.use(express.json());

// return product data
router.get('/', (req, res) => {
	res.json({ data: data });
});

// generate payment intent
router.post('/secret', async (req, res) => {
	try {
		const { amountCart } = req.body;
		const amountInCents = amountCart * 100;
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInCents,
			currency: 'eur',
			// Verify your integration in this guide by including this parameter
			metadata: { integration_check: 'accept_a_payment' },
		});
		res.status(200).json({ client_secret: paymentIntent.client_secret });
	} catch (error) {
		console.log(error);
	}
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

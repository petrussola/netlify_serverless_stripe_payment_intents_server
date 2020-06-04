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
		const { amount, shipping } = req.body;
		const amountInCents = amount * 100;
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInCents,
			currency: 'eur',
			shipping,
			// Verify your integration in this guide by including this parameter
			metadata: { integration_check: 'accept_a_payment' },
		});
		res.status(200).json({ client_secret: paymentIntent.client_secret });
	} catch (error) {
		console.log(error);
	}
});

// payment intents demo endpoint
router.get('/pi-demo', async (req, res) => {
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: 1099,
			currency: 'usd',
			// Verify your integration in this guide by including this parameter
			metadata: { integration_check: 'accept_a_payment' },
			capture_method: 'manual',
		});
		res.json({
			message: 'success',
			client_secret: paymentIntent.client_secret,
			id: paymentIntent.id,
		});
	} catch (error) {
		res.json({ message: 'There was an error' });
	}
});

router.post('/pi-demo-capture', async (req, res) => {
	const { paymentIntentId } = req.body;
	try {
		const intent = await stripe.paymentIntents.capture(paymentIntentId);
		res.json(intent);
	} catch (error) {
		console.log(error);
	}
});

router.post('/refund', async (req, res) => {
	const { paymentIntentId } = req.body;
	try {
		const refund = await stripe.refunds.create({
			amount: 500,
			payment_intent: paymentIntentId,
		});
		res.json(refund);
	} catch (error) {
		console.log(error);
	}
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

import { json } from '@sveltejs/kit';
import webPush from 'web-push';
import type { RequestEvent } from './$types';
import { VAPID_CONTACT, VAPID_PRIVATE, VAPID_PUBLIC } from '$env/static/private';

export async function POST({ request }: RequestEvent) {
	webPush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC, VAPID_PRIVATE);

	const body: PushSubscriptionJSON = await request.json();

	if (!body.endpoint || !body.keys) {
		return json({ ok: false });
	}

	// Create subscription. You should store this and associate with user
	const pushSubscription = {
		endpoint: body.endpoint,
		keys: {
			p256dh: body.keys.p256dh,
			auth: body.keys.auth
		}
	};

	// Send notification
	const result = await webPush.sendNotification(pushSubscription, 'hello world');
	console.log(result);

	return json({ ok: true });
}

// Sends the public key back to the client for registration
export function GET() {
	return json({
		key: VAPID_PUBLIC
	});
}

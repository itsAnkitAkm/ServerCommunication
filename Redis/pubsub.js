/**
 * 📘 Redis Pub/Sub (Publish / Subscribe)
 * --------------------------------------
 * Pub/Sub is a messaging system where:
 *   - Publishers send messages to a channel
 *   - Subscribers listen to that channel and receive the messages in real time
 * 
 * 🔹 Use Cases:
 *   - Chat applications
 *   - Real-time notifications (e.g., live scores, stock prices)
 *   - Event broadcasting (system-wide updates)
 * 
 * ⚠️ Important:
 *   - Messages are NOT stored → if nobody is subscribed at the time of publish, message is lost
 *   - For persistence → use Redis Streams instead
 */

// pubsub.js
import { createClient } from "redis";

async function runPubSub() {
  // Publisher
  const publisher = createClient();
  await publisher.connect();

  // Subscriber
  const subscriber = createClient();
  await subscriber.connect();

  await subscriber.subscribe("my-channel", (message) => {
    console.log(`📩 Received message: ${message}`);
  });

  // Publish a test message every 2s
  setInterval(async () => {
    const msg = `Hello @ ${new Date().toISOString()}`;
    await publisher.publish("my-channel", msg);
    console.log(`📤 Published: ${msg}`);
  }, 2000);
}

runPubSub().catch(console.error);

/**
 * 🖥️ CLI Testing:
 * ----------------
 * Terminal 1 (Subscriber):
 *    redis-cli SUBSCRIBE news
 *
 * Terminal 2 (Publisher):
 *    redis-cli PUBLISH news "Hello Redis!"
 *
 * ✅ You’ll see "Hello Redis!" appear in Terminal 1
 */

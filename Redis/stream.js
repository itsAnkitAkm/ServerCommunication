// stream.js
// ========================================
// REDIS STREAMS (Introduced in Redis 5)
// ========================================
// Streams = append-only log of events, each entry has:
//   - ID (time-seq: <ms-timestamp>-<counter>)
//   - Key-value fields (like a mini hash)
//
// Key Features:
//   - Consumer Groups (like Kafka/RabbitMQ style) for scaling
//   - Reliable delivery (pending list until acknowledged)
//   - Time-series friendly (IDs are chronological)
//   - Ordered, append-only (cannot reorder)
//
// Performance:
//   - XADD (append): O(1)
//   - XRANGE (read range): O(log N + M) [M=messages fetched]
//   - XREAD (stream read): O(1) for each message delivered
//   - Consumer groups add minimal overhead (pending tracking)
//
// Use Cases:
//   1. **Event sourcing** (track changes in order)
//   2. **Message queue** (Kafka-lite inside Redis)
//   3. **IoT telemetry** (sensors producing streams)
//   4. **Logging & monitoring** (system events)
//   5. **Data pipelines** (feed ML or analytics jobs)
//
// Real-World Requirements:
//   - If "at least once delivery" is needed → Consumer groups
//   - If "real-time pub/sub" only → consider Pub/Sub instead
//   - Use TTLs or capped stream length to prevent memory bloat
//
// Limitations:
//   - Stream max size ~ billions of entries (memory-bound)
//   - Persistence = depends on Redis persistence (RDB/AOF)
//   - Ordering = strict within a stream, not across streams
//
// ========================================

const client = require("./client");

async function init() {
  try {
    // ✅ 1. Add events to a stream
    // XADD mystream * field value field value ...
    await client.xadd("mystream", "*", "event", "user_signup", "userId", "101");
    await client.xadd("mystream", "*", "event", "order_placed", "orderId", "5001");
    await client.xadd("mystream", "*", "event", "payment_done", "amount", "250");
    console.log("✅ Added 3 events to stream");

    // ✅ 2. Read all events from start (0 means from the beginning)
    // XREAD STREAMS mystream 0
    const allEvents = await client.xread("STREAMS", "mystream", "0");
    console.log("\n📌 All Events in Stream:");
    console.dir(allEvents, { depth: null });

    // ✅ 3. Blocking read (like Kafka consumer style)
    // This waits for new events if none are available
    // BLOCK 5000 → wait max 5 sec
    // $ → read only new events (not past ones)
    console.log("\n⏳ Waiting for new events (blocking read)...");
    const newEvents = await client.xread(
      "BLOCK",
      5000, // wait 5 sec
      "STREAMS",
      "mystream",
      "$" // last seen ID ($ means only new ones)
    );

    if (newEvents) {
      console.log("\n📌 New Events (Blocking Read):");
      console.dir(newEvents, { depth: null });
    } else {
      console.log("\n⌛ No new events in last 5 seconds");
    }

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    client.quit();
  }
}

init();

/*
 Deep Dive Notes on Streams

📌 Why use Streams vs Lists / PubSub?

Lists = simple queues, no consumer groups, no replay.

Pub/Sub = fire-and-forget, no history, no persistence.

Streams = hybrid → replayable, persistent, ordered, consumer-grouped.

📌 Example Use Cases in Industry

FinTech → Transactions log (event-sourcing with replay).

IoT → Millions of device telemetry readings.

Gaming → Player activity feed + real-time updates.

Analytics → Stream pipeline for ML model input.

E-commerce → Order → Payment → Delivery events tracked in one stream.

📌 Real-world requirements & trade-offs

If you need exactly-once delivery, Redis Streams alone won’t do (requires external deduplication).

For at-most-once delivery, use XREAD without ACK.

For at-least-once delivery, use XREADGROUP with ACK.

Streams grow fast → use MAXLEN to cap size (XADD mystream MAXLEN ~1000 * ...).
*/
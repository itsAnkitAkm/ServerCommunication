/**
 * Redis Strings Playground with ioredis
 * --------------------------------------
 * Strings are the most basic Redis data type.
 * They can store text, numbers, JSON, or binary data up to 512 MB.
 *
 * This file demonstrates the most commonly used String commands in Redis,
 * with short examples and explanations.
 *
 * Run: node string.js
 */

const client = require("./client"); // ioredis client instance

async function init() {
  /**
   * 1. SET and GET
   * ---------------
   * SET creates or updates a key with a string value.
   * GET retrieves the value of a key.
   */
  await client.set("msg:1", "Hello, Redis!");
  const msg1 = await client.get("msg:1");
  console.log("GET msg:1 =>", msg1); // Output: Hello, Redis!

  /**
   * 2. EXPIRE (TTL)
   * ----------------
   * You can set a time-to-live (TTL) for a key using EXPIRE or directly with SET + EX.
   */
  await client.set("temp:key", "This will expire", "EX", 5); // EX = expire in seconds
  console.log("temp:key set with 5s TTL");

  /**
   * 3. INCR / DECR
   * ----------------
   * If a value is a number (as string), Redis can increment/decrement it atomically.
   */
  await client.set("counter", 0);
  await client.incr("counter"); // counter = 1
  await client.incrby("counter", 5); // counter = 6
  await client.decr("counter"); // counter = 5
  const counterVal = await client.get("counter");
  console.log("Counter =>", counterVal);

  /**
   * 4. APPEND
   * ----------
   * Append a value to an existing key.
   */
  await client.set("greeting", "Hello");
  await client.append("greeting", ", World!");
  const greeting = await client.get("greeting");
  console.log("Greeting =>", greeting); // "Hello, World!"

  /**
   * 5. MSET / MGET
   * ---------------
   * Set or get multiple keys in a single command.
   */
  await client.mset({
    user: "Ankit",
    age: "23",
    city: "Delhi",
  });
  const values = await client.mget("user", "age", "city");
  console.log("MGET user, age, city =>", values); // ["Ankit", "23", "Delhi"]

  /**
   * 6. EXISTS and DEL
   * -----------------
   * Check if a key exists, and delete it if needed.
   */
  const exists = await client.exists("msg:1");
  console.log("Does msg:1 exist? =>", exists ? "Yes" : "No");

  await client.del("msg:1");
  console.log("msg:1 deleted.");

  /**
   * 7. SETNX (Set if Not Exists)
   * -----------------------------
   * Useful for locks or ensuring a key is only created once.
   */
  const setnx1 = await client.setnx("lock:key", "locked");
  console.log("SETNX first attempt =>", setnx1); // 1 (success)
  const setnx2 = await client.setnx("lock:key", "locked");
  console.log("SETNX second attempt =>", setnx2); // 0 (already exists)

  /**
   * Done
   */
  await client.quit(); // Close Redis connection when done
}

init();

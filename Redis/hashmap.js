/**
 * Redis Hashes (HashMaps) Playground with ioredis
 * -----------------------------------------------
 * Hashes store field-value pairs under a single key.
 * Think of them like objects (key → { field: value }).
 *
 * ✅ Use cases:
 *  - User profiles
 *  - Product details
 *  - Caching structured data
 *
 * ⚡ Performance & Limits:
 *  - Max fields per hash: ~4 billion (2^32 - 1)
 *  - Field size: up to 512 MB (like strings)
 *  - Time complexity:
 *      HSET / HDEL              => O(1)
 *      HGET / HEXISTS           => O(1)
 *      HGETALL / HKEYS / HVALS  => O(n) (n = number of fields)
 *      HLEN                     => O(1)
 *      HMSET / HMGET            => O(n) (n = number of fields processed)
 *
 * Run: node hash.js
 */

const client = require("./client"); // ioredis client instance

async function init() {
  // Clear old data
  await client.del("user:100");

  /**
   * 1. HSET
   * O(1)
   * Set field-value pairs inside a hash.
   */
  await client.hset("user:100", "name", "Ankit", "age", "23", "city", "Delhi");

  /**
   * 2. HGET
   * O(1)
   * Get the value of a specific field.
   */
  const name = await client.hget("user:100", "name");
  console.log("Name =>", name);

  /**
   * 3. HMGET
   * O(n)
   * Get multiple field values at once.
   */
  const values = await client.hmget("user:100", "name", "age");
  console.log("HMGET (name, age) =>", values);

  /**
   * 4. HGETALL
   * O(n)
   * Get all fields and values (like returning an object).
   */
  const allFields = await client.hgetall("user:100");
  console.log("HGETALL =>", allFields); // { name: 'Ankit', age: '23', city: 'Delhi' }

  /**
   * 5. HKEYS / HVALS
   * O(n)
   * Get only keys or only values of a hash.
   */
  const keys = await client.hkeys("user:100");
  const vals = await client.hvals("user:100");
  console.log("Fields =>", keys);
  console.log("Values =>", vals);

  /**
   * 6. HEXISTS
   * O(1)
   * Check if a field exists in the hash.
   */
  const exists = await client.hexists("user:100", "city");
  console.log("Does field 'city' exist? =>", exists ? "Yes" : "No");

  /**
   * 7. HINCRBY
   * O(1)
   * Increment (or decrement) a numeric field value.
   */
  await client.hincrby("user:100", "age", 1); // increment age by 1
  console.log("Age after increment =>", await client.hget("user:100", "age"));

  /**
   * 8. HDEL
   * O(1)
   * Delete one or more fields from the hash.
   */
  await client.hdel("user:100", "city");
  console.log("After HDEL =>", await client.hgetall("user:100"));

  /**
   * 9. HLEN
   * O(1)
   * Get number of fields in a hash.
   */
  const fieldCount = await client.hlen("user:100");
  console.log("Total fields =>", fieldCount);

  /**
   * Done
   */
  await client.quit();
}

init();

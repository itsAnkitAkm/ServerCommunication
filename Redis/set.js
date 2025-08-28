/**
 * Redis Sets Playground with ioredis
 * ----------------------------------
 * Redis Sets are unordered collections of unique strings.
 * No duplicates are allowed, and most operations are O(1).
 *
 * ✅ Use cases:
 *  - Unique tags, categories, user groups
 *  - Removing duplicates
 *  - Set math: union, intersection, difference
 *
 * ⚡ Performance & Limits:
 *  - Max elements: ~4 billion (2^32 - 1)
 *  - Max element size: 512 MB
 *  - Time complexity:
 *      SADD / SREM         => O(1)
 *      SISMEMBER           => O(1)
 *      SCARD               => O(1)
 *      SMEMBERS            => O(n) (n = set size)
 *      SUNION / SINTER / SDIFF => O(n) (depends on input sets)
 *
 * Run: node set.js
 */

const client = require("./client"); // ioredis client instance

async function init() {
  // Clear old data
  await client.del("users", "admins", "guests");

  /**
   * 1. SADD
   * O(1)
   * Add one or more members to a set (ignores duplicates).
   */
  await client.sadd("users", "ankit", "raj", "neha");
  await client.sadd("users", "ankit"); // duplicate ignored
  const allUsers = await client.smembers("users");
  console.log("Users set =>", allUsers); // unordered list

  /**
   * 2. SISMEMBER
   * O(1)
   * Check if a value is part of the set.
   */
  const isMember = await client.sismember("users", "raj");
  console.log("Is raj a user? =>", isMember ? "Yes" : "No");

  /**
   * 3. SCARD
   * O(1)
   * Get the number of elements in a set.
   */
  const userCount = await client.scard("users");
  console.log("Total users =>", userCount);

  /**
   * 4. SREM
   * O(1)
   * Remove one or more members from a set.
   */
  await client.srem("users", "raj");
  console.log("Users after removing raj =>", await client.smembers("users"));

  /**
   * 5. SUNION
   * O(n)
   * Get all unique elements from multiple sets (set union).
   */
  await client.sadd("admins", "ankit", "priya");
  const union = await client.sunion("users", "admins");
  console.log("Users ∪ Admins =>", union);

  /**
   * 6. SINTER
   * O(n)
   * Get common elements from multiple sets (set intersection).
   */
  const inter = await client.sinter("users", "admins");
  console.log("Users ∩ Admins =>", inter);

  /**
   * 7. SDIFF
   * O(n)
   * Get elements in the first set but not in the others (set difference).
   */
  const diff = await client.sdiff("users", "admins");
  console.log("Users - Admins =>", diff);

  /**
   * 8. SRANDMEMBER
   * O(1) or O(n)
   * Get one or more random elements from the set.
   */
  const randomUser = await client.srandmember("users");
  console.log("Random user =>", randomUser);

  /**
   * 9. SPOP
   * O(1)
   * Pop (remove + return) a random element from the set.
   */
  const poppedUser = await client.spop("users");
  console.log("Popped random user =>", poppedUser);
  console.log("Remaining users =>", await client.smembers("users"));

  /**
   * Done
   */
  await client.quit();
}

init();

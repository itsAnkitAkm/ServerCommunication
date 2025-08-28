/**
 * Redis Lists Playground with ioredis
 * -----------------------------------
 * Redis Lists are ordered collections of strings.
 * They are implemented as linked lists, so pushing/popping from
 * either end is very fast.
 *
 * Common use cases:
 *  - Queues (FIFO)
 *  - Stacks (LIFO)
 *  - Recent activity feeds
 *
 * Run: node list.js
 */

const client = require("./client"); // ioredis client instance

async function init() {
  /**
   * 1. LPUSH / RPUSH
   * ----------------
   * Add elements to the head (LPUSH) or tail (RPUSH) of a list.
   */
  await client.del("tasks"); // clear old data
  await client.lpush("tasks", "task1"); // tasks = [task1]
  await client.rpush("tasks", "task2"); // tasks = [task1, task2]
  await client.lpush("tasks", "task0"); // tasks = [task0, task1, task2]

  /**
   * 2. LRANGE
   * ----------
   * Get a range of elements from a list (start, stop).
   * Use -1 as stop to get till the end.
   */
  const tasks = await client.lrange("tasks", 0, -1);
  console.log("All tasks =>", tasks); // ["task0","task1","task2"]

  /**
   * 3. LPOP / RPOP
   * ---------------
   * Remove and return the first (LPOP) or last (RPOP) element.
   */
  const firstTask = await client.lpop("tasks");
  console.log("LPOP =>", firstTask); // "task0"

  const lastTask = await client.rpop("tasks");
  console.log("RPOP =>", lastTask); // "task2"

  /**
   * 4. LLEN
   * --------
   * Get the length of a list.
   */
  const len = await client.llen("tasks");
  console.log("Length of tasks =>", len); // 1 (only "task1" left)

  /**
   * 5. LINDEX
   * ----------
   * Get element at a specific index.
   */
  const taskAt0 = await client.lindex("tasks", 0);
  console.log("Element at index 0 =>", taskAt0);

  /**
   * 6. LREM
   * --------
   * Remove occurrences of a value from the list.
   * Syntax: LREM key count value
   * - count > 0: remove first `count` occurrences
   * - count < 0: remove from the tail
   * - count = 0: remove all
   */
  await client.rpush("tasks", "task2", "task2", "task3"); // tasks = [task1, task2, task2, task3]
  await client.lrem("tasks", 1, "task2"); // remove 1 occurrence of "task2"
  const afterLrem = await client.lrange("tasks", 0, -1);
  console.log("After LREM =>", afterLrem);

  /**
   * 7. BLPOP / BRPOP (Blocking)
   * ----------------------------
   * Pop an element from a list, waiting if the list is empty.
   * Useful for job queues.
   * (Here we just demonstrate with timeout = 1s)
   */
  console.log("Trying BLPOP (1s timeout)...");
  const blpopResult = await client.blpop("emptylist", 1); // null if timeout
  console.log("BLPOP result =>", blpopResult);

  /**
   * Done
   */
  await client.quit();
}

init();

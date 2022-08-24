/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("room", (table) => {
    table.increments();
    table.string("name");
    table.timestamps();
  });
  await knex.schema.createTable("user", (table) => {
    table.increments();
    table.string("name");
  });

  await knex.schema.createTable("messages", (table) => {
    table.increments();
    table.string("message");
    table.string("room");
    table.string("user");
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};

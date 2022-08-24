// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection:
      "postgresql://postgres:AW7Zs3sEU4d1FKWbJjCa@containers-us-west-87.railway.app:7910/railway",

    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

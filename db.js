import pg from "pg"

const {Pool} = pg;

const pool = new Pool({
    user: "zamora17",
    host: "localhost",
    database: "film",
    password: "161224",
    port: 5432,
});

console.log("Database Connected");

export default pool;
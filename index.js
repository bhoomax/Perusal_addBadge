
const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");

dotenv.config();

const saltRounds = 10;
const port = 5000;
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Perusal",
    password: process.env.PASSWORD,
    port: 5432, // Default PostgreSQL port
});

pool.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the database");
    }
});

// Add badge
app.post("/add", async (req, res) => {
    const { badge, username } = req.body;

    try {
        const checkResult = await pool.query(
            `SELECT userid FROM users WHERE username=$1`,
            [username]
        );

        if (checkResult.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const userid = checkResult.rows[0].userid;

        const badgeCheckResult = await pool.query(
            `SELECT userid FROM ${badge} WHERE userid=$1`,
            [userid]
        );

        if (badgeCheckResult.rows.length > 0) {
            res.status(400).json({ message: "Domain already chosen!" });
            return;
        }

        await pool.query(
            `INSERT INTO ${badge} (userid) VALUES ($1) RETURNING *`,
            [userid]
        );

        res.status(200).json({ message: "Badge added successfully!", username, badge });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred." });
    }
});

// Get user profile
app.get("/profile/:username", async (req, res) => {
    const username = req.params.username;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE username=$1", [username]);

        if (userResult.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const user = userResult.rows[0];

        const badges = await Promise.all([
            pool.query("SELECT * FROM aiml WHERE userid=$1", [user.userid]),
            pool.query("SELECT * FROM appdev WHERE userid=$1", [user.userid]),
            pool.query("SELECT * FROM cybersec WHERE userid=$1", [user.userid]),
            pool.query("SELECT * FROM devops WHERE userid=$1", [user.userid]),
            pool.query("SELECT * FROM webdev WHERE userid=$1", [user.userid]),
        ]);

        const badgeNames = ["aiml", "appdev", "cybersec", "devops", "webdev"];
        const userBadges = badges
            .map((badge, index) => (badge.rows.length > 0 ? badgeNames[index] : null))
            .filter((badge) => badge !== null);

        res.status(200).json({ user, badges: userBadges });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred." });
    }
});

app.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});



// const express = require("express");
// const pg = require("pg");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcrypt");
// const env = require("dotenv");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const path = require("path");


// const saltRounds = 10;
// const port = 5000;
// const app = express();
// env.config();
// app.use(express.static("public"));
// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());

// const pool = new pg.Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "Perusal",
//   password: process.env.PASSWORD,
//   port: 5432, // Default PostgreSQL port
// });

// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//   } else {
//     console.log('Connected to the database');
//     // Start your application logic here
//     app.listen(port, () => {
//       console.log(`Server has started on port ${port}`);
//     });
//   }
// });

// // Add badge
// app.post("/add", async (req, res) => {
//   const { badge, username } = req.body;

//   try {
//     const checkResult = await pool.query(
//       `SELECT userid FROM ${pg.Client.prototype.escapeIdentifier(badge)} NATURAL JOIN users WHERE users.username=$1`,
//       [username]
//     );

//     if (checkResult.rows.length > 0) {
//       res.status(400).json({ message: "Domain already chosen!" });
//       return;
//     }

//     const user = await pool.query("SELECT userid FROM users WHERE username=$1", [username]);

//     if (user.rows.length === 0) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     const userid = user.rows[0].userid;

//     await pool.query(
//       `INSERT INTO ${pg.Client.prototype.escapeIdentifier(badge)} (userid) VALUES ($1) RETURNING *`,
//       [userid]
//     );

//     res.status(200).json({ message: "Badge added successfully!", username, badge });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "An error occurred." });
//   }
// });

// // Get user profile
// app.get("/profile/:username", async (req, res) => {
//   const username = req.params.username;

//   try {
//     const userResult = await pool.query("SELECT * FROM users WHERE username=$1", [username]);

//     if (userResult.rows.length === 0) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     const user = userResult.rows[0];

//     const badges = await Promise.all([
//       pool.query("SELECT * FROM aiml WHERE userid=$1", [user.userid]),
//       pool.query("SELECT * FROM appdev WHERE userid=$1", [user.userid]),
//       pool.query("SELECT * FROM cybersec WHERE userid=$1", [user.userid]),
//       pool.query("SELECT * FROM devops WHERE userid=$1", [user.userid]),
//       pool.query("SELECT * FROM webdev WHERE userid=$1", [user.userid]),
//     ]);

//     const badgeNames = ["aiml", "appdev", "cybersec", "devops", "webdev"];
//     const userBadges = badges
//       .map((badge, index) => (badge.rows.length > 0 ? badgeNames[index] : null))
//       .filter((badge) => badge !== null);

//     res.status(200).json({ user, badges: userBadges });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "An error occurred." });
//   }
// });
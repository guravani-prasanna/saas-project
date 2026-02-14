const express = require("express");
const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tenants", require("./routes/tenants"));
app.use("/api/users", require("./routes/users"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

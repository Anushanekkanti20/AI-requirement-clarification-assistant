const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 5001

// 🧠 Temporary storage (acts like DB)
let users = []

// ================= REGISTER =================
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body

  // Check if user already exists
  const existingUser = users.find(u => u.email === email)

  if (existingUser) {
    return res.status(400).json({
      error: "User already exists"
    })
  }

  const newUser = { name, email, password }
  users.push(newUser)

  console.log("Registered users:", users)

  res.json({
    message: "Registration successful"
  })
})

// ================= LOGIN =================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body

  const user = users.find(
    u => u.email === email && u.password === password
  )

  if (user) {
    res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email }
    })
  } else {
    res.status(401).json({
      error: "Invalid email or password"
    })
  }
})

// ================= ANALYZE =================
app.post("/api/analyze", (req, res) => {
  const { text } = req.body

  res.json({
    result: `✅ AI Analysis:\n\n"${text}" is a valid requirement.\n\n✔ Clear\n✔ Functional\n✔ Improve with constraints`
  })
})

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
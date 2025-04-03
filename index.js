const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const users = []
const exercises = new Map()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const username = req.body.username
  const _id = new Date().getTime().toString()
  users.push({ username, _id })
  console.log(users)
  res.json({ username, _id })
})

// 6. Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
app.get('/api/users', (req, res) => {
  res.json(users)
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body
  const user = users.find(user => user._id == _id)
  console.log(user)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const exerciseDate = date ? new Date(date) : new Date()
  const exercise = {
    username: user.username,
    description,
    duration: Number(duration),
    date: exerciseDate.toDateString()
  }

  if (!exercises.has(_id)) {
    exercises.set(_id, [])
  }
  exercises.get(_id).push(exercise)

  res.json({ ...exercise, _id })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query
  const user = users.find(user => user._id == _id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  let userExercises = exercises.get(_id) || []
  if (from) {
    userExercises = userExercises.filter(exercise => new Date(exercise.date) >= new Date(from))
  }
  if (to) {
    userExercises = userExercises.filter(exercise => new Date(exercise.date) <= new Date(to))
  }
  if (limit) {
    userExercises = userExercises.slice(0, limit)
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id,
    log: userExercises
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

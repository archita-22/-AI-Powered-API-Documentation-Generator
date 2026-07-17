const code = `
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello mars' });
});
`;

const response = await fetch('http://localhost:5000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code }),
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));

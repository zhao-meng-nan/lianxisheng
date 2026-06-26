const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ADMIN_PWD = 'zhaocaihua';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) } catch(e) { return [] }
}
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)) }

// 获取所有记录
app.get('/api/records', (req, res) => res.json(readData()));

// 新增记录
app.post('/api/records', (req, res) => {
  let data = readData();
  let rec = req.body;
  rec.id = data.length ? Math.max(...data.map(x=>x.id||0)) + 1 : 1;
  rec.time = new Date().toLocaleString();
  data.push(rec);
  saveData(data);
  res.json(rec);
});

// 更新记录
app.put('/api/records/:id', (req, res) => {
  let data = readData();
  let idx = data.findIndex(x => x.id == req.params.id);
  if (idx < 0) return res.status(404).json({error:'not found'});
  Object.assign(data[idx], req.body);
  saveData(data);
  res.json(data[idx]);
});

// 删除记录
app.delete('/api/records/:id', (req, res) => {
  let data = readData().filter(x => x.id != req.params.id);
  saveData(data);
  res.json({ok:true});
});

// 管理员验证
app.post('/api/auth', (req, res) => {
  res.json({ok: req.body.password === ADMIN_PWD});
});

app.listen(PORT, () => console.log('Server running on port ' + PORT));

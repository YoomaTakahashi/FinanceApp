const catService = require('../services/categoryService');

async function list(req, res, next) {
  try {
    const cats = await catService.getAll(req.user.id);
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
}

async function show(req, res, next) {
  try {
    const cat = await catService.getById(parseInt(req.params.id), req.user.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const cat = await catService.create(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Category created', data: cat });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const cat = await catService.update(parseInt(req.params.id), req.user.id, req.body);
    res.json({ success: true, message: 'Category updated', data: cat });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await catService.remove(parseInt(req.params.id), req.user.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
}

module.exports = { list, show, create, update, remove };

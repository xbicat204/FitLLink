// src/controllers/ptMaterialController.js
import PTMaterial from '~/models/PTMaterial'
import fs from 'fs'
import path from 'path'

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/materials/${req.file.filename}`

    return res.json({ url: fileUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ message: 'Upload failed' })
  }
}

async function getMyMaterials(req, res) {
  try {
    const mats = await PTMaterial.find({ pt: req.user._id })
      .populate('sharedWithPackages', 'name totalSessions durationDays')
      .sort({ updatedAt: -1 })

    return res.json({ data: mats })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to load materials' })
  }
}

async function createMaterial(req, res) {
  try {
    const mat = await PTMaterial.create({ ...req.body, pt: req.user._id })
    return res.json({ data: mat })
  } catch (err) {
    console.error(err)
    return res.status(400).json({ message: 'Failed to create material' })
  }
}

async function updateMaterial(req, res) {
  try {
    const mat = await PTMaterial.findOneAndUpdate(
      { _id: req.params.id, pt: req.user._id },
      req.body,
      { new: true }
    )
    return res.json({ data: mat })
  } catch (err) {
    console.error(err)
    return res.status(400).json({ message: 'Failed to update material' })
  }
}

async function deleteMaterial(req, res) {
  try {
    const mat = await PTMaterial.findOne({ _id: req.params.id, pt: req.user._id })
    if (!mat) return res.status(404).json({ message: 'Material not found' })

    if (mat.url && mat.url.includes('/uploads/materials/')) {
      const filename = path.basename(mat.url)
      const filePath = path.join('uploads', 'materials', filename)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await PTMaterial.deleteOne({ _id: req.params.id })
    return res.json({ message: 'Material deleted' })
  } catch (err) {
    console.error(err)
    return res.status(400).json({ message: 'Failed to delete material' })
  }
}

async function shareMaterial(req, res) {
  try {
    const { packageIds } = req.body
    await PTMaterial.findOneAndUpdate(
      { _id: req.params.id, pt: req.user._id },
      { sharedWithPackages: packageIds }
    )
    return res.json({ message: 'Shared successfully' })
  } catch (err) {
    console.error(err)
    return res.status(400).json({ message: 'Failed to share material' })
  }
}

// 💡 giống mấy controller khác trong project: export object
export const ptMaterialController = {
  uploadFile,
  getMyMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  shareMaterial
}

import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({})

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname)
  if (!['.jpg', '.jpeg', '.png'].includes(ext.toLowerCase())) {
    return cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png)!'), false)
  }
  cb(null, true)
}

const upload = multer({ storage, fileFilter })
export default upload

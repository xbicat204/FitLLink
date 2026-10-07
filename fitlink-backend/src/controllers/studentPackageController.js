import StudentPackage from '../models/StudentPackage.js'

/**
 * ✅ [GET] /api/student-packages/my-packages
 * -> Dành cho học viên xem danh sách gói tập
 */
export const getMyStudentPackages = async (req, res) => {
  try {
    const userId = req.user._id
    const role = req.user.role

    if (role !== 'student') {
      return res
        .status(403)
        .json({ message: 'Chỉ học viên mới được xem danh sách gói.' })
    }

    const { status, page = 1, limit = 10 } = req.query
    const filter = { student: userId }
    if (status) filter.status = status

    const total = await StudentPackage.countDocuments(filter)

    const packages = await StudentPackage.find(filter)
      .populate('pt', 'name email phone') // ✅ Sửa fullName → name
      .populate('package', 'name totalSessions price description')
      .populate('transaction', 'amount status createdAt')
      .populate('sessions', 'date status note')
      .populate('booking', 'slotKey')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      data: packages
    })
  } catch (error) {
    console.error('❌ Lỗi getMyStudentPackages:', error)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

/**
 * ✅ [GET] /api/student-packages/my-packages/:id
 * -> Dành cho học viên xem chi tiết gói tập
 */
export const getMyStudentPackageById = async (req, res) => {
  try {
    const userId = req.user._id
    const role = req.user.role
    const { id } = req.params

    if (role !== 'student') {
      return res
        .status(403)
        .json({ message: 'Chỉ học viên mới được xem chi tiết gói.' })
    }

    const packageItem = await StudentPackage.findOne({
      _id: id,
      student: userId
    })
      .populate('pt', 'name email phone') // ✅ Sửa fullName → name
      .populate('package', 'name totalSessions price description')
      .populate('transaction', 'amount status paymentMethod createdAt')
      .populate('sessions', 'date status note')
      .populate('booking', 'date slot location')
      .lean()

    if (!packageItem) {
      return res.status(404).json({ message: 'Không tìm thấy gói tập.' })
    }

    res.status(200).json(packageItem)
  } catch (error) {
    console.error('❌ Lỗi getMyStudentPackageById:', error)
    res.status(500).json({ message: 'Lỗi server', error: error.message })
  }
}

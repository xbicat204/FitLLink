// /models/index.js
// ✅ Centralized export of all Mongoose models
// Giúp import ngắn gọn, dễ maintain và dùng trong seed/migrate scripts.

import ActivityLog from './ActivityLog.js'
import Chat from './Chat.js'
import Feedback from './Feedback.js'
import MealPlan from './MealPlan.js'
import Message from './Message.js'
import Notification from './Notification.js'
import Package from './Package.js'
import PendingRegistration from './PendingRegistration.js'
import PTProfile from './PTProfile.js'
import PTWallet from './PTWallet.js'
import PTWalletTransaction from './PTWalletTransaction.js'
import Session from './Session.js'
import StudentPackage from './StudentPackage.js'
import Transaction from './Transaction.js'
import User from './User.js'
import UserMetric from './UserMetric.js'
import WorkoutItem from './WorkoutItem.js'

export {
  ActivityLog,
  Chat,
  Feedback,
  MealPlan,
  Message,
  Notification,
  Package,
  PendingRegistration,
  PTProfile,
  PTWallet,
  PTWalletTransaction,
  Session,
  StudentPackage,
  Transaction,
  User,
  UserMetric,
  WorkoutItem
}

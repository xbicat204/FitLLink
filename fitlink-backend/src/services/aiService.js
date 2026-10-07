// // src/services/aiService.js
// import "dotenv/config";
// import OpenAI from "openai";

// const apiKey = process.env.OPENAI_API_KEY;
// let client = null;

// if (!apiKey) {
//   console.warn(
//     "⚠️ OPENAI_API_KEY chưa được cấu hình. Tính năng chat AI sẽ không hoạt động."
//   );
// } else {
//   client = new OpenAI({ apiKey });
// }

// /**
//  * messages: [{ role: 'system'|'user'|'assistant', content: '...' }]
//  */
// export const chatWithAI = async (messages) => {
//   if (!client) {
//     throw new Error("AI is not configured. Missing OPENAI_API_KEY.");
//   }

//   const model = process.env.AI_MODEL || "gpt-4o-mini";

//   const res = await client.chat.completions.create({
//     model,
//     messages,
//     max_tokens: 512,
//     temperature: 0.7,
//   });

//   const choice = res.choices?.[0]?.message;
//   return {
//     role: choice.role,
//     content: choice.content,
//   };
// };

// src/services/aiService.js
// ❌ KHÔNG dùng OpenAI nữa để tránh lỗi quota
// => File này mock câu trả lời AI cho mục đích demo

/**
 * messages: [{ role: 'system'|'user'|'assistant', content: '...' }]
 * Trả về: { role: 'assistant', content: '...' }
 */
// src/services/aiService.js
// Mock AI cho demo – không gọi OpenAI, không cần API key.

/**
 * Bỏ dấu + lowercase để dễ match từ khoá
 */
const normalizeText = (str = '') => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ') // bỏ ký tự lạ
    .replace(/\s+/g, ' ')
    .trim()
}

const hasAny = (text, keywords = []) => keywords.some((keyword) => text.includes(keyword))

const mentionsService = (text) =>
  hasAny(text, [
    'dich vu',
    'fitlink la gi',
    'fitlink co gi',
    'nen tang',
    'ung dung',
    'web nay'
  ])

const mentionsPTSearch = (text) =>
  hasAny(text, [
    'tim pt',
    'trainer',
    'huan luyen vien',
    'gps',
    'tinh thanh',
    'gan toi',
    'gan ban',
    'list pt'
  ])

const mentionsProgramsPricing = (text) =>
  hasAny(text, [
    'pricing',
    'bang gia',
    'gia goi',
    'muc gia',
    'program',
    'chuong trinh',
    'goi tap',
    'goi nao'
  ])

const mentionsBooking = (text) =>
  hasAny(text, [
    'booking',
    'dat lich',
    'book',
    'mua goi',
    'mua package',
    'chon pt',
    'dat buoi'
  ])

const mentionsPayment = (text) =>
  hasAny(text, [
    'thanh toan',
    'payos',
    'qr',
    'checkout',
    'tra tien',
    'payment'
  ])

const mentionsAfterPurchase = (text) =>
  hasAny(text, [
    'sau khi mua',
    'mua xong',
    'lich cua toi',
    'my packages',
    'training calendar',
    'xem goi da mua',
    'xem lich tap'
  ])

const mentionsContactSupport = (text) =>
  hasAny(text, [
    'lien he',
    'contact',
    'ho tro',
    'support',
    'tu van',
    'phan hoi'
  ])

const mentionsAccount = (text) =>
  hasAny(text, [
    'dang ky',
    'dang nhap',
    'login',
    'register',
    'tao tai khoan',
    'quen mat khau'
  ])

/**
 * messages: [{ role: 'system'|'user'|'assistant', content: '...' }]
 * return: { role: 'assistant', content: '...' }
 */
export const chatWithAI = async (messages) => {
  const last = messages[messages.length - 1]
  const rawQuestion = last?.content || ''
  const q = normalizeText(rawQuestion)

  let answer = ''

  // --- 1. Dịch vụ FitLink ---
  if (mentionsService(q)) {
    answer =
      'FitLink là nền tảng kết nối học viên với Personal Trainer. Bạn có thể:\n\n' +
      '• Tìm PT theo tỉnh/thành hoặc GPS\n' +
      '• Xem hồ sơ PT và các gói tập\n' +
      '• Đặt lịch học theo wizard booking\n' +
      '• Thanh toán online qua PayOS\n' +
      '• Theo dõi gói đã mua và lịch tập sau khi thanh toán\n\n' +
      'Nếu bạn muốn, mình có thể chỉ tiếp cho bạn luồng mua gói hoặc tìm PT.'
  }

  else if (mentionsPTSearch(q)) {
    answer =
      'Để tìm PT trên FitLink:\n\n' +
      '1️⃣ Vào trang danh sách PT `/list-pt`\n' +
      '2️⃣ Chọn tìm theo GPS hoặc tỉnh/thành\n' +
      '3️⃣ Lọc thêm theo mục tiêu như giảm mỡ, tăng cơ, sức khỏe tổng quát\n' +
      '4️⃣ Bấm vào PT để xem profile và gói tập\n\n' +
      'Nếu GPS không ra kết quả, bạn nên thử tìm theo tỉnh/thành. Kết quả còn phụ thuộc PT trong hệ thống đã có profile, địa chỉ và gói tập chưa.'
  }

  else if (mentionsProgramsPricing(q)) {
    answer =
      'Trang `Programs` và `Pricing` trên FitLink hiện đóng vai trò giới thiệu. Để mua gói thật, bạn nên:\n\n' +
      '• Vào `/list-pt` để tìm PT phù hợp\n' +
      '• Mở trang chi tiết PT\n' +
      '• Bấm `Book` hoặc `Mua gói ngay`\n' +
      '• Chọn package trong flow booking\n\n' +
      'Nếu bạn chưa biết chọn gói nào, bạn có thể nói mục tiêu của bạn để mình gợi ý nên ưu tiên giảm mỡ, tăng cơ hay sức khỏe tổng quát.'
  }

  else if (mentionsBooking(q)) {
    answer =
      'Luồng đặt lịch/mua gói trên FitLink như sau:\n\n' +
      '1️⃣ Tìm PT trong `/list-pt`\n' +
      '2️⃣ Vào trang chi tiết của PT\n' +
      '3️⃣ Bấm `Book` để vào `/booking/:id`\n' +
      '4️⃣ Chọn gói tập, địa điểm, lịch học, ngày bắt đầu\n' +
      '5️⃣ Xác nhận preview và checkout\n\n' +
      'Nếu PT chưa có package công khai, bạn sẽ chưa đặt được. Khi đó bạn nên đổi PT khác hoặc liên hệ hỗ trợ.'
  }

  else if (mentionsPayment(q)) {
    answer =
      'Hiện tại FitLink đang đi theo luồng thanh toán online qua PayOS.\n\n' +
      '• Sau khi chọn xong package và lịch học, hệ thống tạo giao dịch checkout\n' +
      '• Bạn được chuyển sang trang thanh toán/QR của PayOS\n' +
      '• Thanh toán thành công thì kết quả trả về web và kích hoạt gói học\n\n' +
      'Nếu bạn bị dừng ở bước payment, hãy kiểm tra lại thông tin booking và trang kết quả thanh toán.'
  }

  else if (mentionsAfterPurchase(q)) {
    answer =
      'Sau khi mua gói thành công, bạn có thể theo dõi ở:\n\n' +
      '• `/my-packages` để xem gói đã mua\n' +
      '• `/training-calendar` để xem lịch tập\n' +
      '• Trang kết quả thanh toán để quay lại đúng luồng tiếp theo\n\n' +
      'Nếu lịch chưa hiện ngay, thử refresh lại sau khi payment được xác nhận.'
  }

  else if (mentionsContactSupport(q)) {
    answer =
      'Bạn có thể vào trang `/contact` để gửi yêu cầu hỗ trợ booking hoặc tư vấn. Ngoài ra, bạn cũng có thể:\n\n' +
      '• Nhập thông tin trong form liên hệ\n' +
      '• Tìm PT trong `/list-pt`\n' +
      '• Nếu đang đăng nhập là student, có thể chat trực tiếp với PT sau khi vào luồng chat\n\n' +
      'Nếu bạn nói rõ vấn đề đang gặp, mình có thể chỉ bạn đúng page/flow cần vào.'
  }

  else if (mentionsAccount(q)) {
    answer =
      'Bạn có thể đăng ký hoặc đăng nhập ngay trên FitLink:\n\n' +
      '• `/register` để tạo tài khoản\n' +
      '• `/login` để đăng nhập\n' +
      '• `/forgot-password` nếu quên mật khẩu\n\n' +
      'Student sẽ dùng tài khoản để tìm PT, mua gói và theo dõi lịch. PT sẽ cần hồ sơ PT và package để xuất hiện trong tìm kiếm.'
  }

  // --- 2. Chào hỏi / xã giao ---
  else if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'alo' ||
    q.startsWith('chao') ||
    q.includes('xin chao')
  ) {
    answer =
      'Chào bạn 👋 Mình là trợ lý AI của FitLink. Bạn đang quan tâm đến **lịch tập**, **dinh dưỡng** hay **giảm mỡ / tăng cơ**?'
  }

  // --- 3. Cảm ơn / kết thúc ---
  else if (q.includes('cam on') || q.includes('thanks') || q.includes('thank you')) {
    answer =
      'Không có gì, rất vui được hỗ trợ bạn 🤝. Nếu có câu hỏi thêm về tập luyện hay ăn uống, cứ nhắn cho mình nha!'
  } else if (q.includes('bye') || q.includes('tam biet')) {
    answer = 'Tạm biệt bạn 👋. Chúc bạn tập luyện hiệu quả và luôn khoẻ mạnh!'
  }

  // --- 4. Lịch tập theo số buổi / tuần ---
  else if (q.includes('lich tap') || q.includes('lich 3 buoi') || q.includes('tap 3 buoi')) {
    answer =
      'Gợi ý **lịch tập 3 buổi/tuần cho người mới**:\n\n' +
      '• Buổi 1: Ngực + tay sau + bụng\n' +
      '• Buổi 2: Lưng + tay trước\n' +
      '• Buổi 3: Chân + vai + bụng\n\n' +
      'Mỗi buổi 3–4 bài chính, 3 hiệp, 8–12 reps. Giữa các buổi nên nghỉ ít nhất 1 ngày để hồi phục.'
  } else if (q.includes('lich 4 buoi') || q.includes('tap 4 buoi')) {
    answer =
      'Gợi ý **lịch tập 4 buổi/tuần**:\n\n' +
      '• Buổi 1: Ngực + tay sau\n' +
      '• Buổi 2: Lưng + tay trước\n' +
      '• Buổi 3: Chân + mông\n' +
      '• Buổi 4: Vai + bụng + cardio nhẹ\n\n' +
      'Nếu bận rộn, bạn có thể gộp Buổi 3 và 4 thành 1 buổi full body.'
  } else if (q.includes('lich 5 buoi') || q.includes('tap 5 buoi')) {
    answer =
      'Gợi ý **lịch tập 5 buổi/tuần (mức trung cấp)**:\n\n' +
      '• Thứ 2: Ngực\n' +
      '• Thứ 3: Lưng\n' +
      '• Thứ 4: Chân\n' +
      '• Thứ 5: Vai + tay\n' +
      '• Thứ 6: Full body + cardio\n\n' +
      'Thứ 7, CN nghỉ hoặc đi bộ nhẹ, giãn cơ để cơ bắp phục hồi.'
  } else if (q.includes('tap tai nha') || q.includes('khong den phong')) {
    answer =
      'Nếu không đến phòng gym, bạn có thể **tập tại nhà** với bodyweight:\n\n' +
      '• Squat, lunge (cho chân)\n' +
      '• Chống đẩy, dips ghế (cho ngực + tay sau)\n' +
      '• Plank, crunch (cho bụng)\n\n' +
      'Tập 3–4 buổi/tuần, mỗi buổi 20–30 phút là đã ổn cho người mới bắt đầu.'
  }

  // --- 5. Giảm cân / giảm mỡ ---
  else if (q.includes('giam can') || q.includes('giam mo') || q.includes('giam beo')) {
    answer =
      'Để giảm mỡ an toàn:\n\n' +
      '1️⃣ Ăn **ít hơn nhu cầu** khoảng 300–500 kcal/ngày (không nhịn ăn hoàn toàn).\n' +
      '2️⃣ Ưu tiên **đạm cao** (thịt nạc, cá, trứng, sữa chua, đậu) để giữ cơ.\n' +
      '3️⃣ Tập tạ 3 buổi/tuần + thêm 2 buổi đi bộ nhanh/cardio nhẹ.\n' +
      '4️⃣ Ngủ đủ 7–8 tiếng, uống nhiều nước, hạn chế đồ ngọt – đồ chiên.\n\n' +
      'Nếu bạn cho mình chiều cao, cân nặng và giới tính, mình có thể gợi ý chi tiết hơn (demo).'
  } else if (q.includes('an gi giam mo') || q.includes('an gi giam can')) {
    answer =
      'Một số món ăn phù hợp để **giảm mỡ**:\n\n' +
      '• Sáng: Yến mạch + sữa không đường + trái cây\n' +
      '• Trưa: Cơm gạo lứt + ức gà/cá + thật nhiều rau\n' +
      '• Tối: Salad + trứng luộc/đậu hũ/cá\n' +
      '• Snack: Sữa chua không đường, hạt, trái cây tươi\n\n' +
      'Quan trọng nhất là **tổng lượng calo trong ngày**, chứ không phải một món “thần thánh” nào cả.'
  }

  // --- 6. Tăng cân / tăng cơ ---
  else if (q.includes('tang can') || q.includes('tang co') || q.includes('bulk')) {
    answer =
      'Tăng cơ/tăng cân lành mạnh:\n\n' +
      '• Ăn **dư nhẹ** 250–400 kcal/ngày so với nhu cầu.\n' +
      '• Đạm khoảng **2g/kg cân nặng** (ví dụ 60kg → ~120g đạm/ngày).\n' +
      '• Tập tạ 3–5 buổi/tuần, tập nặng vừa, kỹ thuật chuẩn.\n' +
      '• Ngủ đủ giấc, hạn chế thức khuya và rượu bia.\n\n' +
      'Đừng nóng vội, hãy xem tiến triển theo từng tháng chứ không phải từng ngày.'
  } else if (q.includes('protein') || q.includes('dam') || q.includes('bao nhieu gam dam')) {
    answer =
      'Lượng **protein (đạm)** gợi ý:\n\n' +
      '• Người tập gym: khoảng **1.6–2.2g/kg cân nặng**.\n' +
      'Ví dụ: 60kg → từ 100–130g đạm/ngày.\n\n' +
      'Nên chia đều 3–5 bữa, ưu tiên nguồn đạm tốt: thịt nạc, cá, trứng, sữa chua Hy Lạp, đậu, whey (nếu có điều kiện).'
  }

  // --- 7. Recovery / đau cơ / đau lưng gối nhẹ ---
  else if (q.includes('dau co') || q.includes('nhuc') || q.includes('met') || q.includes('recovery')) {
    answer =
      'Đau cơ sau tập (DOMS) nhẹ là bình thường trong 1–3 ngày đầu:\n\n' +
      '• Ưu tiên **giãn cơ nhẹ**, đi bộ, vận động nhẹ để máu lưu thông.\n' +
      '• Uống nhiều nước, ngủ đủ, có thể massage/ chườm ấm.\n' +
      '• Tránh cố gắng tập nặng lại nhóm cơ đó khi đang đau nhiều.\n\n' +
      'Nếu đau kiểu nhói, tê, lan xuống tay/chân hoặc kéo dài nhiều ngày → nên đi khám bác sĩ chuyên khoa.'
  } else if (q.includes('dau lung') || q.includes('dau goi') || q.includes('chan thuong')) {
    answer =
      'Với các vấn đề **đau lưng, đau gối**:\n\n' +
      '• Tránh các bài nặng lên vùng đang đau (ví dụ squat nặng khi đau gối, deadlift nặng khi đau lưng).\n' +
      '• Tập nhẹ, tập cải thiện kỹ thuật, core và cơ hỗ trợ.\n' +
      '• Nếu đau kéo dài, sưng, khó vận động → nên đi khám bác sĩ/ vật lý trị liệu, không nên tự cố gắng tập nặng.\n\n' +
      'PT chỉ hỗ trợ gợi ý chung, không thay thế chẩn đoán y khoa.'
  }

  // --- 8. Thời gian tập / nên tập lúc nào / bao lâu ---
  else if (q.includes('tap bao lau') || q.includes('bao nhieu phut') || q.includes('tap bao nhieu phut')) {
    answer =
      'Thông thường **1 buổi tập** nên kéo dài khoảng **45–75 phút**:\n\n' +
      '• 5–10 phút khởi động\n' +
      '• 30–50 phút cho các bài chính\n' +
      '• 5–10 phút thả lỏng, giãn cơ\n\n' +
      'Không cần tập 2–3 tiếng mỗi buổi, quan trọng là chất lượng bài tập và sự đều đặn.'
  } else if (q.includes('tap luc nao') || q.includes('tap buoi sang') || q.includes('tap buoi toi')) {
    answer =
      'Bạn có thể tập buổi sáng hoặc chiều/ tối, miễn là **hợp với lịch sinh hoạt**:\n\n' +
      '• Sáng: tinh thần thoải mái, nhưng nhớ ăn nhẹ trước khi tập.\n' +
      '• Chiều/tối: cơ thể đã ấm, thường khoẻ hơn, nhưng tránh tập quá sát giờ ngủ.\n\n' +
      'Quan trọng nhất là chọn khung giờ mà bạn có thể **duy trì lâu dài**.'
  }

  // --- 9. Fallback chung / không nhận ra intent ---
  else {
    answer =
      'Mình là trợ lý AI của FitLink 🤖.\n\n' +
      'Mình có thể giúp bạn về:\n' +
      '• Dịch vụ FitLink: tìm PT, gói tập, booking, thanh toán, hỗ trợ\n' +
      '• Gợi ý **lịch tập** 3–5 buổi/tuần\n' +
      '• Tư vấn **ăn uống giảm mỡ / tăng cơ**\n' +
      '• Hướng dẫn **recovery, giảm đau cơ nhẹ**\n\n' +
      'Bạn thử hỏi cụ thể hơn một chút, ví dụ:\n' +
      '• "Mua gói tập ở đâu?"\n' +
      '• "Tìm PT bằng GPS như thế nào?"\n' +
      '• "Thanh toán trên FitLink ra sao?"\n' +
      '• "Lịch tập 4 buổi/tuần cho người mới" \n' +
      '• "Ăn gì để giảm mỡ bụng?" \n' +
      '• "Nam 60kg cần bao nhiêu gram protein mỗi ngày?"'
  }

  // Giả lập thời gian suy nghĩ cho giống AI thật 😄
  await new Promise((resolve) => setTimeout(resolve, 700))

  return {
    role: 'assistant',
    content: answer
  }
}

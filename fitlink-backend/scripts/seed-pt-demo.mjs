import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "./.env" });

const now = new Date();
const defaultPassword = "Fitlink123!";

const workingHours = [
  { dayOfWeek: 1, intervals: [{ start: "06:00", end: "10:00" }, { start: "17:00", end: "20:00" }] },
  { dayOfWeek: 3, intervals: [{ start: "06:00", end: "10:00" }, { start: "17:00", end: "20:00" }] },
  { dayOfWeek: 5, intervals: [{ start: "06:00", end: "10:00" }, { start: "17:00", end: "20:00" }] },
];

const demoPTs = [
  {
    name: "Nguyen Minh Khoa",
    email: "pt.hcm.demo@fitlink.vn",
    phone: "0912345001",
    gender: "male",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80",
    bio: "Chuyen giam mo va cai thien the luc cho nguoi di lam, lich tap linh hoat vao sang som va buoi toi.",
    specialties: ["weight_loss", "general_health", "endurance"],
    yearsExperience: 6,
    areaNote: "Quan 1, Quan 3, Binh Thanh, Ho Chi Minh, Sai Gon",
    primaryGym: {
      name: "FitLink District 1 Studio",
      address: "42 Nguyen Hue, Ben Nghe, Quan 1, Ho Chi Minh",
      location: { type: "Point", coordinates: [106.7021, 10.7746] },
    },
    packages: [
      {
        name: "Starter Fat Loss",
        description: "Goi co ban cho nguoi muon giam mo va tao nen nep tap luyen.",
        price: 320000,
        totalSessions: 8,
        sessionDurationMin: 60,
        durationDays: 30,
        tags: ["weight_loss", "general_health"],
      },
      {
        name: "Transformation 1:1",
        description: "Dong hanh 1:1 de giam mo, theo doi chi so va dieu chinh bai tap hang tuan.",
        price: 450000,
        totalSessions: 16,
        sessionDurationMin: 60,
        durationDays: 60,
        tags: ["weight_loss", "endurance"],
      },
    ],
  },
  {
    name: "Tran Ha Linh",
    email: "pt.hn.demo@fitlink.vn",
    phone: "0912345002",
    gender: "female",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80",
    bio: "Tap trung vao posture, strength va cai thien voc dang cho hoc vien van phong tai Ha Noi.",
    specialties: ["posture", "strength", "muscle_gain"],
    yearsExperience: 5,
    areaNote: "Hoan Kiem, Ba Dinh, Cau Giay, Ha Noi, Thu Do",
    primaryGym: {
      name: "FitLink Hoan Kiem Lab",
      address: "12 Trang Tien, Hoan Kiem, Ha Noi",
      location: { type: "Point", coordinates: [105.8554, 21.0245] },
    },
    packages: [
      {
        name: "Posture Reset",
        description: "Sua tu the, tang suc manh nen va giam dau moi vai gay.",
        price: 350000,
        totalSessions: 10,
        sessionDurationMin: 60,
        durationDays: 35,
        tags: ["posture", "general_health"],
      },
      {
        name: "Lean Strength Builder",
        description: "Tang suc manh va khoi co cho hoc vien da co nen tap co ban.",
        price: 480000,
        totalSessions: 16,
        sessionDurationMin: 75,
        durationDays: 56,
        tags: ["strength", "muscle_gain"],
      },
    ],
  },
  {
    name: "Pham Duc An",
    email: "pt.dn.demo@fitlink.vn",
    phone: "0912345003",
    gender: "male",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80",
    bio: "PT cho nguoi moi bat dau, uu tien suc ben, phuc hoi van dong va general fitness tai Da Nang.",
    specialties: ["general_health", "endurance", "rehab"],
    yearsExperience: 4,
    areaNote: "Hai Chau, Son Tra, Da Nang, Danang",
    primaryGym: {
      name: "FitLink Da Nang Hub",
      address: "88 Bach Dang, Hai Chau, Da Nang",
      location: { type: "Point", coordinates: [108.2242, 16.0718] },
    },
    packages: [
      {
        name: "General Fitness Kickoff",
        description: "Xay dung nen tang the luc, tim lai nhiem tap on dinh va an toan.",
        price: 300000,
        totalSessions: 8,
        sessionDurationMin: 60,
        durationDays: 28,
        tags: ["general_health", "endurance"],
      },
      {
        name: "Recovery and Mobility",
        description: "Danh cho hoc vien can tap phuc hoi, mo khoi co va tang linh hoat.",
        price: 380000,
        totalSessions: 12,
        sessionDurationMin: 60,
        durationDays: 42,
        tags: ["rehab", "posture"],
      },
    ],
  },
];

const upsertDemoPT = async ({ users, ptprofiles, packages, passwordHash }, pt) => {
  const userUpdate = {
    $set: {
      name: pt.name,
      email: pt.email,
      phone: pt.phone,
      password: passwordHash,
      role: "pt",
      gender: pt.gender,
      avatar: pt.avatar,
      isActive: true,
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
    },
  };

  await users.updateOne({ email: pt.email }, userUpdate, { upsert: true });
  const user = await users.findOne({ email: pt.email }, { projection: { _id: 1 } });

  await ptprofiles.updateOne(
    { user: user._id },
    {
      $set: {
        user: user._id,
        primaryGym: pt.primaryGym,
        deliveryModes: {
          atPtGym: true,
          atClient: true,
          atOtherGym: false,
        },
        travelPolicy: {
          enabled: true,
          freeRadiusKm: 5,
          maxTravelKm: 15,
          feePerKm: 10000,
        },
        coverImage: pt.coverImage,
        bio: pt.bio,
        specialties: pt.specialties,
        yearsExperience: pt.yearsExperience,
        certificates: [
          {
            name: "Certified Personal Trainer",
            issuer: "FitLink Academy",
            year: 2023,
            url: "",
          },
        ],
        workingHours,
        defaultBreakMin: 15,
        areaNote: pt.areaNote,
        availableForNewClients: true,
        verified: true,
        ratingAvg: 4.8,
        ratingCount: 12,
        videoIntroUrl: "",
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );

  for (const pkg of pt.packages) {
    await packages.updateOne(
      { pt: user._id, name: pkg.name },
      {
        $set: {
          pt: user._id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          recurrence: { daysOfWeek: [[1, 3, 5]] },
          totalSessions: pkg.totalSessions,
          sessionDurationMin: pkg.sessionDurationMin,
          durationDays: pkg.durationDays,
          isActive: true,
          visibility: "public",
          supports: {
            atPtGym: true,
            atClient: true,
            atOtherGym: false,
          },
          travelPricing: {
            enabled: false,
            freeRadiusKm: 5,
            maxTravelKm: 15,
            feePerKm: 10000,
          },
          tags: pkg.tags,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );
  }

  return { email: pt.email, phone: pt.phone, password: defaultPassword, name: pt.name };
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.db;
  const users = db.collection("users");
  const ptprofiles = db.collection("ptprofiles");
  const packages = db.collection("packages");
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const createdAccounts = [];
  for (const pt of demoPTs) {
    const account = await upsertDemoPT({ users, ptprofiles, packages, passwordHash }, pt);
    createdAccounts.push(account);
  }

  const totalPtUsers = await users.countDocuments({ role: "pt" });
  const totalProfiles = await ptprofiles.countDocuments();
  const totalPackages = await packages.countDocuments();

  console.log(
    JSON.stringify(
      {
        message: "Seed demo PTs completed",
        totalPtUsers,
        totalProfiles,
        totalPackages,
        accounts: createdAccounts,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

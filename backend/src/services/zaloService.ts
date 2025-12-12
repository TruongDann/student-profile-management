import { StudentProfile } from "../types.js";

interface ZaloConfig {
  oaId?: string;
  accessToken?: string;
  adminZaloId?: string;
}

const config: ZaloConfig = {
  oaId: process.env.ZALO_OA_ID,
  accessToken: process.env.ZALO_ACCESS_TOKEN,
  adminZaloId: process.env.ZALO_ADMIN_ID,
};

// Send notification to admin about new profile
export const sendNewProfileNotification = async (
  profile: StudentProfile
): Promise<boolean> => {
  console.log(`[Zalo Service] Sending notification for profile: ${profile.id}`);

  // If no Zalo config, just log
  if (!config.oaId || !config.accessToken || !config.adminZaloId) {
    console.log(`[Zalo Mock] New profile notification:`);
    console.log(`
      🔔 HỒ SƠ MỚI
      ----------------
      CTV: ${profile.collaboratorName}
      Học viên: ${profile.studentName}
      SĐT: ${profile.studentPhone}
      Ảnh: ${profile.photos.length} hình
      Ghi chú: ${profile.notes || "Không có"}
      ----------------
      Thời gian: ${new Date(profile.timestamp).toLocaleString("vi-VN")}
    `);
    return true;
  }

  // Real Zalo API integration would go here
  try {
    const message = {
      recipient: { user_id: config.adminZaloId },
      message: {
        text: `🔔 HỒ SƠ MỚI\nCTV: ${profile.collaboratorName}\nHọc viên: ${profile.studentName}\nSĐT: ${profile.studentPhone}\nẢnh: ${profile.photos.length} hình`,
      },
    };

    // TODO: Call Zalo OA API
    // const response = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
    //   method: 'POST',
    //   headers: {
    //     'access_token': config.accessToken!,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(message)
    // });

    console.log("[Zalo] Message would be sent:", message);
    return true;
  } catch (error) {
    console.error("[Zalo] Error sending notification:", error);
    return false;
  }
};

// Send daily report
export const sendDailyReport = async (
  profiles: StudentProfile[]
): Promise<boolean> => {
  const today = new Date();
  const todayStr = today.toLocaleDateString("vi-VN");

  const count = profiles.length;
  const distinctCollaborators = new Set(profiles.map((p) => p.collaboratorName))
    .size;

  console.log(`[Zalo Service] Sending daily report`);

  if (!config.oaId || !config.accessToken || !config.adminZaloId) {
    console.log(`[Zalo Mock] Daily Report:`);
    console.log(`
      📊 BÁO CÁO CUỐI NGÀY ${todayStr}
      ----------------
      Đã nhận: ${count} hồ sơ
      Số CTV hoạt động: ${distinctCollaborators}
      ----------------
    `);
    return true;
  }

  // Real Zalo API integration
  try {
    const message = {
      recipient: { user_id: config.adminZaloId },
      message: {
        text: `📊 BÁO CÁO CUỐI NGÀY ${todayStr}\nĐã nhận: ${count} hồ sơ\nSố CTV: ${distinctCollaborators}`,
      },
    };

    // TODO: Call Zalo OA API
    console.log("[Zalo] Report would be sent:", message);
    return true;
  } catch (error) {
    console.error("[Zalo] Error sending report:", error);
    return false;
  }
};

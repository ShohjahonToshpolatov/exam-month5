const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");
const layout = (title, content) => `<!DOCTYPE html>
<html lang="uz">
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
 <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
  <tr>
   <td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
     <tr>
      <td style="background:#0f766e;padding:20px 28px;color:#ffffff;font-size:22px;font-weight:bold;">Topildi</td>
     </tr>
     <tr>
      <td style="padding:28px;color:#1f2937;font-size:15px;line-height:1.6;">
       <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml(title)}</h2>
       ${content}
      </td>
     </tr>
     <tr>
      <td style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:12px;">
       Bu xabar Topildi platformasi tomonidan avtomatik yuborildi.
      </td>
     </tr>
    </table>
   </td>
  </tr>
 </table>
</body>
</html>`;
const paragraph = (text) => `<p style="margin:0 0 14px;">${text}</p>`;
const infoBox = (rows) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;margin:16px 0;">
 ${rows
  .map(([label, value]) => `<tr>
  <td style="padding:10px 14px;color:#6b7280;width:38%;">${escapeHtml(label)}</td>
  <td style="padding:10px 14px;color:#111827;font-weight:bold;">${escapeHtml(value)}</td>
 </tr>`)
  .join("")}
</table>`;
const codeBox = (code) => `<div style="margin:20px 0;text-align:center;font-size:34px;letter-spacing:10px;font-weight:bold;color:#0f766e;background:#f0fdfa;border:1px dashed #0f766e;border-radius:8px;padding:16px;">${escapeHtml(code)}</div>`;
const otpEmail = (fullName, code, purpose) => {
  const isReset = purpose === "reset";
  const title = isReset ? "Parolni tiklash kodi" : "Emailni tasdiqlash kodi";
  const text = isReset
    ? "Parolingizni tiklash uchun quyidagi koddan foydalaning."
    : "Ro'yxatdan o'tishni yakunlash uchun quyidagi koddan foydalaning.";
  return {
    subject: isReset ? "Parolni tiklash kodi" : "Tasdiqlash kodi",
    html: layout(title, paragraph(`Assalomu alaykum, <b>${escapeHtml(fullName)}</b>!`) +
      paragraph(text) +
      codeBox(code) +
      paragraph("Kod <b>5 daqiqa</b> davomida amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, xabarni e'tiborsiz qoldiring.")),
  };
};
const claimReceivedEmail = (ownerName, itemTitle, claimantName, message) => ({
  subject: `«${itemTitle}» e'loningizga da'vo keldi`,
  html: layout("E'loningizga da'vo keldi", paragraph(`Assalomu alaykum, <b>${escapeHtml(ownerName)}</b>!`) +
    paragraph(`<b>«${escapeHtml(itemTitle)}»</b> e'loningizga maxfiy savolga <b>to'g'ri javob</b> bergan foydalanuvchidan da'vo keldi.`) +
    infoBox([
      ["Da'vogar", claimantName],
      ["Xabari", message || "Xabar qoldirilmagan"],
    ]) +
    paragraph("Da'voni ko'rib chiqib, tasdiqlashingiz yoki rad etishingiz mumkin.")),
});
const claimApprovedEmail = (recipientName, itemTitle, otherRole, otherName, otherPhone) => ({
  subject: `«${itemTitle}» bo'yicha da'vo tasdiqlandi`,
  html: layout("Da'vo tasdiqlandi", paragraph(`Assalomu alaykum, <b>${escapeHtml(recipientName)}</b>!`) +
    paragraph(`<b>«${escapeHtml(itemTitle)}»</b> bo'yicha da'vo tasdiqlandi. Buyumni topshirish uchun ${escapeHtml(otherRole)} bilan bog'laning:`) +
    infoBox([
      ["Ismi", otherName],
      ["Telefon raqami", otherPhone],
    ])),
});
const claimRejectedEmail = (claimantName, itemTitle) => ({
  subject: `«${itemTitle}» bo'yicha da'vo rad etildi`,
  html: layout("Da'vo rad etildi", paragraph(`Assalomu alaykum, <b>${escapeHtml(claimantName)}</b>!`) +
    paragraph(`Afsuski, <b>«${escapeHtml(itemTitle)}»</b> e'loni bo'yicha yuborgan da'vongiz e'lon egasi tomonidan <b>rad etildi</b>.`)),
});
const reportEmail = (ownerName, itemTitle, finderName, finderPhone, message) => ({
  subject: `«${itemTitle}» buyumingiz topildi`,
  html: layout("Yo'qotgan buyumingiz topilgan bo'lishi mumkin", paragraph(`Assalomu alaykum, <b>${escapeHtml(ownerName)}</b>!`) +
    paragraph(`<b>«${escapeHtml(itemTitle)}»</b> e'loningiz bo'yicha bir foydalanuvchi buyumni topganini xabar qildi.`) +
    infoBox([
      ["Topgan odam", finderName],
      ["Telefon raqami", finderPhone],
      ["Xabari", message || "Xabar qoldirilmagan"],
    ]) +
    paragraph("U bilan bog'lanib, buyumni qaytarib olishingiz mumkin.")),
});
export { otpEmail, claimReceivedEmail, claimApprovedEmail, claimRejectedEmail, reportEmail, };

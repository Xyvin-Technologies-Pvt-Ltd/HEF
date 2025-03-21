const ExcelJS = require("exceljs");
exports.generateDuplicateExcel = async (duplicatePhones) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Duplicate Phones");

  worksheet.columns = [{ header: "Phone Number", key: "phone", width: 20 }];

  duplicatePhones.forEach((phone) => {
    worksheet.addRow({ phone });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer.toString("base64");
};

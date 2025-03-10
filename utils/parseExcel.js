const xlsx = require("xlsx");

/**
 * Parses an Excel (.xls) file buffer into structured quiz data.
 * @param {Buffer} fileBuffer - The uploaded Excel file as a buffer.
 * @returns {Array} - An array of question objects.
 */
function parseExcel(fileBuffer) {
    try {
        const workbook = xlsx.read(fileBuffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        return jsonData.map(row => ({
            type: row.type ? row.type.trim().toLowerCase() : "text",
            questionText: row.questionText ? row.questionText.trim() : "",
            options: row.options ? row.options.split(",").map(opt => opt.trim()) : [],
            correctAnswers: row.correctAnswers ? row.correctAnswers.toString().split(",").map(opt => opt.trim()) : [],
            mediaType: row.mediaType ? row.mediaType.trim().toLowerCase() : "none", // 'image', 'video', 'audio', or 'none'
            mediaURL: row.mediaURL ? row.mediaURL.trim() : ""
        }));
    } catch (error) {
        console.error("Error parsing Excel file:", error);
        return [];
    }
}

module.exports = parseExcel;

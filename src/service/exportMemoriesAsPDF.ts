import jsPDF from "jspdf";
import { Memory } from "../model/Memory";

export function exportMemoriesAsPDF(memories: Memory[]) {
	const doc = new jsPDF();

	memories.forEach((memory, index) => {
		if (index > 0) doc.addPage();

		doc.setFontSize(16);
		doc.text(memory.title, 10, 20);

		doc.setFontSize(12);
		if (memory.author) doc.text(`Shared by: ${memory.author}`, 10, 28);
		if (memory.date) doc.text(`Date: ${memory.date}`, 10, 36);
		if (memory.place) doc.text(`Place: ${memory.place}`, 10, 44);

		doc.setFontSize(11);
		const textY = memory.place ? 56 : memory.date ? 50 : 44; // adjusts spacing based on fields
		doc.text(doc.splitTextToSize(memory.memory, 180), 10, textY);

		if (memory.image) {
			const format = memory.image.startsWith("data:image/png") ? "PNG" : "JPEG";
			doc.addImage(memory.image, format, 10, textY + 40, 180, 100);
		}
	});

	doc.save("memories.pdf");
}

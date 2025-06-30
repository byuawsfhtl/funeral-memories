import jsPDF from "jspdf";
import { Memory } from "../model/Memory";

export function exportMemoriesAsPDF(name: string, memories: Memory[]) {
	const doc = new jsPDF();

	memories.forEach((memory, index) => {
		if (index > 0) {
			doc.addPage();
		} else {
			// Add a centered title to the first page
			const titleText = `Memories for ${name}`;
			doc.setFontSize(20);
			doc.setFont("helvetica", "bold");

			const pageWidth = doc.internal.pageSize.getWidth();
			const textWidth = doc.getTextWidth(titleText);
			const x = (pageWidth - textWidth) / 2;

			doc.text(titleText, x, 15);
		}

		// Reset font for memory content
		doc.setFont("helvetica", "normal");
		doc.setFontSize(16);
		doc.text(memory.title, 10, 30);

		doc.setFontSize(12);
		if (memory.author) doc.text(`Shared by: ${memory.author}`, 10, 38);
		if (memory.date) doc.text(`Date: ${memory.date}`, 10, 46);
		if (memory.place) doc.text(`Place: ${memory.place}`, 10, 54);

		doc.setFontSize(11);
		const textY = memory.place ? 66 : memory.date ? 60 : 54;
		doc.text(doc.splitTextToSize(memory.memory, 180), 10, textY);

		if (memory.image) {
			const format = memory.image.startsWith("data:image/png") ? "PNG" : "JPEG";
			doc.addImage(memory.image, format, 10, textY + 40, 180, 100);
		}
	});

	doc.save("memories.pdf");
}

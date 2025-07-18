import jsPDF from "jspdf";
import { Memory } from "../model/Memory";

export async function exportMemoriesAsPDF(name: string, memories: Memory[]) {
	const doc = new jsPDF();

	for (const [index, memory] of memories.entries()) {
		if (index > 0) {
			doc.addPage();
		} else {
			const titleText = `Memories for ${name}`;
			doc.setFontSize(20);
			doc.setFont("helvetica", "bold");
			const pageWidth = doc.internal.pageSize.getWidth();
			const textWidth = doc.getTextWidth(titleText);
			const x = (pageWidth - textWidth) / 2;
			doc.text(titleText, x, 15);
		}

		doc.setFont("helvetica", "normal");
		doc.setFontSize(16);
		doc.text(memory.title, 10, 30);

		// --- Metadata ---
		doc.setFontSize(12);
		let currentY = 38;

		if (memory.author) {
			doc.text(`Shared by: ${memory.author}`, 10, currentY);
			currentY += 6;
		}
		if (memory.date) {
			doc.text(`Date: ${memory.date}`, 10, currentY);
			currentY += 6;
		}
		if (memory.place) {
			doc.text(`Place: ${memory.place}`, 10, currentY);
			currentY += 6;
		}

		// --- Image ---
		if (memory.image) {
			const imgProps = await loadImageDimensions(memory.image);
			const maxWidth = 180;
			const aspectRatio = imgProps.width / imgProps.height;
			let imgWidth = maxWidth;
			let imgHeight = imgWidth / aspectRatio;

			if (imgHeight > 100) {
				imgHeight = 100;
				imgWidth = imgHeight * aspectRatio;
			}

			// Add a small gap before image
			currentY += 5;

			doc.addImage(
				memory.image,
				imgProps.format,
				10,
				currentY,
				imgWidth,
				imgHeight
			);
			currentY += imgHeight + 10; // Add gap after image
		} else {
			currentY += 5;
		}

		// --- Memory Text ---
		doc.setFontSize(11);
		doc.text(doc.splitTextToSize(memory.memory, 180), 10, currentY);
	}

	doc.save(`${name}_memories.pdf`);
}

async function loadImageDimensions(
	dataUrl: string
): Promise<{ width: number; height: number; format: "PNG" | "JPEG" }> {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = dataUrl;
		img.onload = () => {
			const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
			resolve({ width: img.width, height: img.height, format });
		};
	});
}

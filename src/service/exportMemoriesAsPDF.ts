import jsPDF from "jspdf";
import { Memory } from "../model/Memory";

/** Minimal ancestor fields stored on the group for the PDF cover. */
export type PersonForPdfCover = {
	birthDate?: string;
	deathDate?: string;
};

function formatLifeDates(person: PersonForPdfCover | null | undefined): string | null {
	if (!person) return null;
	let birth: number | null = null;
	let death: number | null = null;
	if (person.birthDate) {
		const y = new Date(person.birthDate).getUTCFullYear();
		if (Number.isFinite(y)) birth = y;
	}
	if (person.deathDate) {
		const y = new Date(person.deathDate).getUTCFullYear();
		if (Number.isFinite(y)) death = y;
	}
	if (birth != null && death != null) return `${birth} – ${death}`;
	if (birth != null) return `Born ${birth}`;
	if (death != null) return `Died ${death}`;
	return null;
}

/**
 * Export memories to PDF with an optional cover page (name + life dates + portrait).
 */
export async function exportMemoriesAsPDF(
	name: string,
	memories: Memory[],
	portraitUrl?: string | null,
	person?: PersonForPdfCover | null
) {
	const doc = new jsPDF();

	await renderTitlePage(doc, name, portraitUrl, person);

	for (const memory of memories) {
		doc.addPage();
		doc.setFont("helvetica", "normal");
		doc.setFontSize(16);
		doc.text(memory.title, 10, 30);

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

			currentY += 5;

			doc.addImage(
				memory.image,
				imgProps.format,
				10,
				currentY,
				imgWidth,
				imgHeight
			);
			currentY += imgHeight + 10;
		} else {
			currentY += 5;
		}

		doc.setFontSize(11);
		doc.text(doc.splitTextToSize(memory.memory, 180), 10, currentY);
	}

	doc.save(`${name}_memories.pdf`);
}

async function renderTitlePage(
	doc: jsPDF,
	name: string,
	portraitUrl?: string | null,
	person?: PersonForPdfCover | null
) {
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const cx = pageWidth / 2;

	const life = formatLifeDates(person);

	type ImgBox = {
		dataUrl: string;
		format: "PNG" | "JPEG";
		w: number;
		h: number;
	};
	let imgBox: ImgBox | null = null;
	if (portraitUrl?.trim()) {
		try {
			const dataUrl = await loadImageAsDataUrl(portraitUrl);
			const imgProps = await loadImageDimensions(dataUrl);
			const maxW = 75;
			const maxH = 85;
			const aspect = imgProps.width / imgProps.height;
			let w = maxW;
			let h = w / aspect;
			if (h > maxH) {
				h = maxH;
				w = h * aspect;
			}
			imgBox = { dataUrl, format: imgProps.format, w, h };
		} catch {
			// CORS or network: text-only cover
		}
	}

	const lineTitle = 12;
	const lineSub = 8;
	const lineLife = life ? 8 : 0;
	const gapBeforePortrait = imgBox ? 6 : 0;
	const portraitH = imgBox ? imgBox.h : 0;
	const totalBlock =
		lineTitle + lineSub + lineLife + gapBeforePortrait + portraitH;

	const margin = 15;
	let y = (pageHeight - totalBlock) / 2;
	if (y < margin) {
		y = margin;
	}

	doc.setFontSize(22);
	doc.setFont("helvetica", "bold");
	doc.text(`Memories for ${name}`, cx, y, { align: "center" });
	y += lineTitle;

	doc.setFont("helvetica", "normal");
	doc.setFontSize(12);
	doc.text("Memory Wall", cx, y, { align: "center" });
	y += lineSub;

	if (life) {
		doc.setFontSize(11);
		doc.text(life, cx, y, { align: "center" });
		y += lineLife;
	}

	if (imgBox) {
		y += gapBeforePortrait;
		const x = (pageWidth - imgBox.w) / 2;
		const imgY = Math.min(y, pageHeight - imgBox.h - margin);
		doc.addImage(
			imgBox.dataUrl,
			imgBox.format,
			x,
			imgY,
			imgBox.w,
			imgBox.h
		);
	}
}

async function loadImageAsDataUrl(src: string): Promise<string> {
	if (src.startsWith("data:image/")) {
		return src;
	}
	const res = await fetch(src, { mode: "cors" });
	if (!res.ok) {
		throw new Error(`Image fetch failed: ${res.status}`);
	}
	const blob = await res.blob();
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("Could not read image"));
			}
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}

async function loadImageDimensions(
	dataUrl: string
): Promise<{ width: number; height: number; format: "PNG" | "JPEG" }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
			resolve({ width: img.width, height: img.height, format });
		};
		img.onerror = () => reject(new Error("Image load failed"));
		img.src = dataUrl;
	});
}
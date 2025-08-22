interface DateDict {
  original?: string | null;
  formal?: string | null;
  normalized?: Array<{ lang: string; value: string }> | null;
}

interface UploadPersonParams {
  name: string;
  sex: string;
  birthDate?: { year?: string; month?: string; day?: string };
  deathDate?: { year?: string; month?: string; day?: string };
  marriageDate?: { year?: string; month?: string; day?: string };
  photo: File;
  token: string;
  fstoken: string;
}

// Helper to format GEDCOM X compliant date fact object
function formatDateFact(
  type: string,
  date?: { year?: string; month?: string; day?: string }
) {
  if (!date || !date.year) return null;

  const { year, month, day } = date;

  // Format original, formal, normalized strings as your colleague does
  const original = [year, month, day].filter(Boolean).join("-");
  const formal = `+${year}${month ? "-" + month.padStart(2, "0") : ""}${
    day ? "-" + day.padStart(2, "0") : ""
  }`;
  const normalized = [
    { lang: "en", value: month && day ? `${month}/${day}/${year}` : year },
  ];

  return {
    type,
    date: {
      original,
      formal,
      normalized,
    },
  };
}

function formatNameForms(name: string) {
  if (!name || !name.trim()) return [];

  const nameParts = name.trim().split(/\s+/); // split on any whitespace
  let given = "";
  let surname = "";

  if (nameParts.length === 1) {
    given = nameParts[0];
  } else if (nameParts.length > 1) {
    given = nameParts.slice(0, -1).join(" ");
    surname = nameParts[nameParts.length - 1];
  }

  const parts = [];

  if (given) {
    parts.push({ type: "http://gedcomx.org/Given", value: given });
  }

  if (surname) {
    parts.push({ type: "http://gedcomx.org/Surname", value: surname });
  }

  if (!parts.length) {
    // no valid name parts formed
    return [];
  }

  return [
    {
      fullText: name.trim(),
      parts,
    },
  ];
}

export async function uploadPersonAndPortrait({
  name,
  sex,
  birthDate,
  deathDate,
  marriageDate,
  photo,
  token,
  fstoken,
}: UploadPersonParams): Promise<{ pid: string; memoryUrl: string }> {
  // Validate and prepare nameForms
  console.log("Name to upload:", JSON.stringify(name));

  const nameForms = formatNameForms(name);
  console.log("Formatted nameForms:", JSON.stringify(nameForms, null, 2));

  if (!nameForms.length || !nameForms[0].fullText) {
    throw new Error("Invalid name format");
  }

  // Validate gender input, fallback to Unknown
  const allowedGenders = ["Male", "Female"];
  const genderType = allowedGenders.includes(sex)
    ? `http://gedcomx.org/${sex}`
    : "http://gedcomx.org/Unknown";

  // Format facts
  const facts = [];
  const birthFact = formatDateFact("http://gedcomx.org/Birth", birthDate);
  const deathFact = formatDateFact("http://gedcomx.org/Death", deathDate);
  const marriageFact = formatDateFact(
    "http://gedcomx.org/Marriage",
    marriageDate
  );

  if (birthFact) facts.push(birthFact);
  if (deathFact) facts.push(deathFact);
  if (marriageFact) facts.push(marriageFact);

  const personPayload = {
    persons: [
      {
        living: false,
        gender: {
          type: genderType,
          attribution: { changeMessage: "Gender added via AddPerson form" },
        },
        names: [
          {
            type: "http://gedcomx.org/BirthName",
            preferred: true,
            attribution: { changeMessage: "Name added via AddPerson form" },
            nameForms,
          },
        ],
        facts,
        attribution: {
          changeMessage: "Person data uploaded via AddPerson form",
        },
      },
    ],
  };

  console.log(personPayload);

  // 1. Upload person
  const personResponse = await fetch(
    "https://api.familysearch.org/platform/tree/persons",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-fs-v1+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(personPayload),
    }
  );

  if (!personResponse.ok) {
    const text = await personResponse.text();
    throw new Error(
      `Person upload failed: ${personResponse.status} ${personResponse.statusText}\n${text}`
    );
  }

  const pid = personResponse.headers.get("x-entity-id");
  if (!pid) {
    throw new Error("No person ID returned from FamilySearch");
  }

  // 2. Upload photo (Memories)
  const formData = new FormData();
  formData.append("artifact", photo);
  formData.append("title", "Portrait Photo");
  formData.append("filename", photo.name);

  const memoryResponse = await fetch(
    "https://api.familysearch.org/platform/memories/memories",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fstoken}`,
        // no Content-Type header when sending FormData
      },
      body: formData,
    }
  );

  if (!memoryResponse.ok) {
    const text = await memoryResponse.text();
    throw new Error(
      `Memory upload failed: ${memoryResponse.status} ${memoryResponse.statusText}\n${text}`
    );
  }

  const memoryUrl =
    memoryResponse.headers.get("content-location") ||
    memoryResponse.headers.get("Content-Location");
  if (!memoryUrl) {
    throw new Error("Memory URL missing in response");
  }

  // 3. Attach portrait to person
  const portraitPayload = {
    persons: [
      {
        media: [
          {
            description: memoryUrl,
            attribution: {
              changeMessage: "Portrait added from AddPerson form",
            },
          },
        ],
      },
    ],
  };

  const portraitResponse = await fetch(
    `https://api.familysearch.org/platform/tree/persons/${pid}/portraits`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-gedcomx-v1+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(portraitPayload),
    }
  );

  if (!portraitResponse.ok) {
    const text = await portraitResponse.text();
    throw new Error(
      `Portrait upload failed: ${portraitResponse.status} ${portraitResponse.statusText}\n${text}`
    );
  }

  return { pid, memoryUrl };
}

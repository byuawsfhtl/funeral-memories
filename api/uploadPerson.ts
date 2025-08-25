interface DateFact {
  type: string;
  date: {
    original: string;
    formal: string;
    normalized: Array<{ lang: string; value: string }>;
  };
}

interface UploadPersonParams {
  name: string;
  sex: string;
  birthDate?: { year?: string; month?: string; day?: string } | null;
  deathDate?: { year?: string; month?: string; day?: string } | null;
  marriageDate?: { year?: string; month?: string; day?: string } | null;
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

function extractActualAccessToken(jwt: string): string | null {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.fs_access_token;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
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
  const actual_token = extractActualAccessToken(fstoken);

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
  let birthFact: DateFact | null = null;
  let deathFact: DateFact | null = null;
  let marriageFact: DateFact | null = null;

  if (birthDate != null) {
    birthFact = formatDateFact("http://gedcomx.org/Birth", birthDate);
    facts.push(birthFact);
  }

  if (deathDate != null) {
    deathFact = formatDateFact("http://gedcomx.org/Death", deathDate);
    facts.push(deathFact);
  }

  if (marriageDate != null) {
    marriageFact = formatDateFact("http://gedcomx.org/Marriage", marriageDate);
    facts.push(marriageFact);
  }

  const personPayload = {
    persons: [
      {
        living: false,
        gender: {
          type: genderType,
          // attribution: { changeMessage: "Gender added via AddPerson form" },
        },
        names: [
          {
            type: "http://gedcomx.org/BirthName",
            preferred: true,
            nameForms: nameForms,
            //attribution: { changeMessage: "Name added via AddPerson form" },
            //nameForms,
          },
        ],
        facts: facts,
        // attribution: {
        //   changeMessage: "Person data uploaded via AddPerson form",
        // },
      },
    ],
  };

  console.log(personPayload);
  console.log(
    "Uploading personPayload:",
    JSON.stringify(personPayload, null, 2)
  );

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
  console.log(pid);

  // 2. Upload photo (Memories)
  const formData = new FormData();
  formData.append("artifact", photo);
  formData.append("title", "Portrait Photo");
  formData.append("filename", photo.name);
  formData.append("type", "Photo");

  const description = `Portrait Photo for ${name}`;

  formData.append("description", description);

  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
  console.log("fstoken: ", fstoken);

  const memoryResponse = await fetch(
    `https://api.familysearch.org/platform/tree/persons/${pid}/memories`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${actual_token}`,
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
  const uploadedMemoryId = memoryResponse.headers.get("x-entity-id");
  if (!uploadedMemoryId) {
    throw new Error(
      "No memory ID returned in header 'x-entity-id' from memory upload"
    );
  }

  const memoriesListResponse = await fetch(
    `https://api.familysearch.org/platform/tree/persons/${pid}/memories`,
    {
      headers: { Authorization: `Bearer ${actual_token}` },
    }
  );

  if (!memoriesListResponse.ok) {
    throw new Error(
      `Failed to fetch memories list: ${memoriesListResponse.statusText}`
    );
  }

  const memoriesList = await memoriesListResponse.json();

  const memoryEntry = memoriesList.sourceDescriptions[0]; // Assuming this is your uploaded memory

  if (!memoryEntry || !memoryEntry.id) {
    throw new Error("Invalid sourceDescription in memories list");
  }

  const memoryDetailsResponse = await fetch(
    `https://api.familysearch.org/platform/memories/memories/${uploadedMemoryId}`,
    {
      headers: { Authorization: `Bearer ${actual_token}` },
    }
  );

  if (!memoryDetailsResponse.ok) {
    const text = await memoryDetailsResponse.text();
    throw new Error(
      `Failed to fetch memory details: ${memoryDetailsResponse.status} ${memoryDetailsResponse.statusText}\n${text}`
    );
  }

  const memoryDetails = await memoryDetailsResponse.json();

  const media = memoryDetails.sourceDescriptions[0];

  if (!memoryEntry || !memoryEntry.id || !memoryEntry.links?.artifact?.href) {
    throw new Error(
      "Invalid or incomplete sourceDescription data for portrait"
    );
  }

  if (!media) {
    throw new Error("No media found in uploaded memory details");
  }

  const mediaId = media.id;
  if (!mediaId) {
    throw new Error("No media ID found in memory details");
  }

  const sourceDescUri = `https://api.familysearch.org/platform/memories/memories/${mediaId}`;
  if (!sourceDescUri) {
    throw new Error("Artifact link missing from media item");
  }

  // 3. Attach portrait to person
  const portraitPayload = {
    persons: [
      {
        media: [
          {
            id: memoryEntry.id,
            attribution: {
              changeMessage: "...change message...",
            },
            description: sourceDescUri,
            qualifiers: [
              {
                value: "0,0,1,1",
                name: "http://gedcomx.org/RectangleRegion",
              },
            ],
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
        Authorization: `Bearer ${actual_token}`,
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

  return { pid, memoryUrl: sourceDescUri };
}

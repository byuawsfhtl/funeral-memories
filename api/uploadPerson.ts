// uploadPerson.ts

export interface UploadPersonParams {
  name: string;
  sex: string;
  birthDate?: string;
  deathDate?: string;
  photo: File;
  token: string;
}

export async function uploadPersonAndPortrait({
  name,
  sex,
  birthDate,
  deathDate,
  photo,
  token,
}: UploadPersonParams): Promise<{ pid: string; memoryUrl: string }> {
  // 1. Format gender and names
  const genderType = sex
    ? `http://gedcomx.org/${sex}`
    : "http://gedcomx.org/Unknown";
  const nameForms = [
    {
      fullText: name,
      parts: [{ type: "http://gedcomx.org/Given", value: name }],
      // Expand to split given/family if desired
    },
  ];
  // TODO: Format birth/death dates into facts if needed

  const personPayload = {
    persons: [
      {
        living: false,
        gender: {
          type: genderType,
          attribution: { changeMessage: "Added via AddPerson form" },
        },
        names: [
          {
            type: "http://gedcomx.org/BirthName",
            preferred: true,
            attribution: { changeMessage: "Name added via form" },
            nameForms,
          },
        ],
        // facts: [], // Add birth/death date facts if needed
      },
    ],
  };

  // 2. Create person (POST)
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
    throw new Error(`Person upload failed: ${personResponse.statusText}`);
  }
  const pid = personResponse.headers.get("x-entity-id");
  if (!pid) {
    throw new Error("Could not get person ID from response");
  }

  // 3. Upload photo to Memories
  const memoryResponse = await fetch(
    "https://api.familysearch.org/platform/memories/memories",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData in browser
      },
      body: photo,
    }
  );
  if (!memoryResponse.ok) {
    throw new Error(`Memory upload failed: ${memoryResponse.statusText}`);
  }
  const memoryUrl =
    memoryResponse.headers.get("content-location") ||
    memoryResponse.headers.get("Content-Location");

  if (!memoryUrl) {
    throw new Error("Could not get memory URL from response");
  }

  // 4. Attach memory as portrait
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
    throw new Error(`Portrait upload failed: ${portraitResponse.statusText}`);
  }

  return { pid, memoryUrl };
}

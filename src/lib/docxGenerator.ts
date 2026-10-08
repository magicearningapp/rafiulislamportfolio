import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  ImageRun,
  ShadingType,
} from "docx";
import { ProfileData, ContactData } from "../types";

/**
 * Converts an image URL or Base64 string to a Uint8Array for docx embedding.
 */
async function getImageBuffer(urlOrBase64: string): Promise<Uint8Array | null> {
  try {
    if (urlOrBase64.startsWith("data:")) {
      const base64Data = urlOrBase64.split(",")[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      const response = await fetch(urlOrBase64);
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
  } catch (err) {
    console.warn("Could not load image for docx embedding, generating without photo:", err);
    return null;
  }
}

/**
 * Generates an exact authentic Microsoft Word (.docx) document matching
 * Md. Rafiul Islam's official boxed curriculum vitae.
 */
export async function generateWordCvDocument(
  profile: ProfileData,
  contact: ContactData
): Promise<Blob> {
  const photoBuffer = profile.photo ? await getImageBuffer(profile.photo) : null;
  const pd = profile.cvPersonalDetails;

  const FONT_NAME = "Calibri";
  const BORDER_BLACK = { style: BorderStyle.SINGLE, size: 8, color: "000000" };
  const BORDER_NONE = { style: BorderStyle.NONE, size: 0, color: "auto" };
  const SHADING_HEADER = "D9D9D9"; // Gray shaded bar

  // Standard boxed table helper with left label cell and right content cell
  const createBoxedRow = (
    leftLabel: string,
    rightParagraphs: Paragraph[],
    leftWidthPct = 25,
    rightWidthPct = 75
  ): Table => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: leftWidthPct, type: WidthType.PERCENTAGE },
              borders: {
                top: BORDER_BLACK,
                bottom: BORDER_BLACK,
                left: BORDER_BLACK,
                right: BORDER_BLACK,
              },
              shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 140, after: 140 },
                  children: [
                    new TextRun({
                      text: leftLabel,
                      bold: true,
                      font: FONT_NAME,
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: rightWidthPct, type: WidthType.PERCENTAGE },
              borders: {
                top: BORDER_BLACK,
                bottom: BORDER_BLACK,
                left: BORDER_BLACK,
                right: BORDER_BLACK,
              },
              shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
              children: rightParagraphs,
            }),
          ],
        }),
      ],
    });
  };

  // 1. Header with Picture Box
  const headerCells: TableCell[] = [
    new TableCell({
      width: { size: 75, type: WidthType.PERCENTAGE },
      borders: {
        top: BORDER_NONE,
        bottom: BORDER_NONE,
        left: BORDER_NONE,
        right: BORDER_NONE,
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "CURRICULUM VITAE",
              bold: true,
              font: FONT_NAME,
              size: 32, // 16pt
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "of",
              italics: true,
              font: FONT_NAME,
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: "MD. RAFIUL ISLAM",
              bold: true,
              font: FONT_NAME,
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Contact Phone: ${contact.whatsapp || "+8801784-275274"}`,
              bold: true,
              font: FONT_NAME,
              size: 20,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `E-mail: ${contact.email || "rafiulislam125@gmail.com"}`,
              bold: true,
              font: FONT_NAME,
              size: 20,
              color: "0563C1",
              underline: {},
            }),
          ],
        }),
      ],
    }),
    new TableCell({
      width: { size: 25, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
        bottom: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
        left: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
        right: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
      },
      children: [
        photoBuffer
          ? new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: photoBuffer,
                  transformation: {
                    width: 105,
                    height: 125,
                  },
                  type: "jpg",
                }),
              ],
            })
          : new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
              children: [
                new TextRun({
                  text: "Picture",
                  bold: true,
                  font: FONT_NAME,
                  size: 22,
                }),
              ],
            }),
      ],
    }),
  ];

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells })],
  });

  // 2. Objectives Career
  const objectivesTable = createBoxedRow(
    "Objectives Career",
    [
      new Paragraph({
        spacing: { before: 80, after: 80 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "❖ To work in an responsible position where I could use my Interpersonal skills, Creative and above all my learning experience in order to develop my career as well as to contribution in any sector.",
            font: FONT_NAME,
            size: 21,
            bold: true,
          }),
        ],
      }),
    ],
    25,
    75
  );

  // 3. Educational Qualification Header
  const eduHeaderTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: SHADING_HEADER, type: ShadingType.CLEAR },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: "Educational Qualification",
                    bold: true,
                    font: FONT_NAME,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Helper for bullet list in education & personal details
  const makeInfoLines = (items: { label: string; value: string }[]): Paragraph[] => {
    return items.map(
      (item) =>
        new Paragraph({
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({ text: ` ${item.label.padEnd(16, " ")} : `, bold: true, font: FONT_NAME, size: 20 }),
            new TextRun({ text: item.value, font: FONT_NAME, size: 20 }),
          ],
        })
    );
  };

  // HSC Box
  const hscTable = createBoxedRow(
    "Higher Secondary\nCertificate\n(H.S.C)",
    makeInfoLines([
      { label: "Institute", value: pd?.hsc?.institute || "Shahid Bulbul Govt. College, Pabna" },
      { label: "Group", value: pd?.hsc?.group || "Humanities" },
      { label: "Board", value: pd?.hsc?.board || "Rajshahi" },
      { label: "Duration", value: pd?.hsc?.duration || "2 Years" },
      { label: "Passing year", value: pd?.hsc?.passingYear || "2013" },
      { label: "Result", value: pd?.hsc?.result || "GPA- 3.40 out of 5.00" },
    ]),
    25,
    75
  );

  // SSC Box
  const sscTable = createBoxedRow(
    "Secondary School\nCertificate\n(S.S.C)",
    makeInfoLines([
      { label: "Institute", value: pd?.ssc?.institute || "Gopal Chandra Institution, Pabna" },
      { label: "Group", value: pd?.ssc?.group || "Humanities" },
      { label: "Board", value: pd?.ssc?.board || "Rajshahi" },
      { label: "Duration", value: pd?.ssc?.duration || "2 Years" },
      { label: "Passing year", value: pd?.ssc?.passingYear || "2011" },
      { label: "Result", value: pd?.ssc?.result || "GPA- 4.19 out of 5.00" },
    ]),
    25,
    75
  );

  // Personal Information Box
  const personalInfoTable = createBoxedRow(
    "Personal\nInformation",
    makeInfoLines([
      { label: "Name", value: "Md. Rafiul Islam" },
      { label: "Father’s Name", value: pd?.fatherName || "Md. Shawkat Ali" },
      { label: "Mother’s Name", value: pd?.motherName || "Most. Shahana Begum" },
      { label: "Date of Birth", value: pd?.dateOfBirth || "1st December, 1996" },
      { label: "Nationality", value: pd?.nationality || "Bangladeshi (By birth)" },
      { label: "Religion", value: pd?.religion || "Islam (Sunni)" },
      { label: "Sex", value: pd?.gender || "Male" },
      { label: "Marital Status", value: pd?.maritalStatus || "Unmarried" },
      { label: "Height", value: pd?.height || "5'- 7\"" },
      { label: "Weight", value: pd?.weight || "69 Kg" },
      { label: "Contact No", value: pd?.contactNo || "+8801701- 008254" },
    ]),
    25,
    75
  );

  // Permanent Address Box
  const permAddr = pd?.permanentAddress || {
    name: "Md. Rafiul Islam",
    careOf: "Md. Shawkat Ali",
    village: "South Ramchandrapur",
    post: "Pabna",
    policeStation: "Pabna Sadar",
    district: "Pabna",
  };
  const permanentAddressTable = createBoxedRow(
    "Permanent Address",
    makeInfoLines([
      { label: "Name", value: permAddr.name || "Md. Rafiul Islam" },
      { label: "C/O", value: permAddr.careOf || "Md. Shawkat Ali" },
      { label: "Vill", value: permAddr.village || "South Ramchandrapur" },
      { label: "Post", value: permAddr.post || "Pabna" },
      { label: "P.S", value: permAddr.policeStation || "Pabna Sadar" },
      { label: "Dist", value: permAddr.district || "Pabna" },
    ]),
    25,
    75
  );

  // Present Address Box
  const presAddr = pd?.presentAddress || permAddr;
  const presentAddressTable = createBoxedRow(
    "Present Address",
    makeInfoLines([
      { label: "Name", value: presAddr.name || "Md. Rafiul Islam" },
      { label: "C/O", value: presAddr.careOf || "Md. Shawkat Ali" },
      { label: "Vill", value: presAddr.village || "South Ramchandrapur" },
      { label: "Post", value: presAddr.post || "Pabna" },
      { label: "P.S", value: presAddr.policeStation || "Pabna Sadar" },
      { label: "Dist", value: presAddr.district || "Pabna" },
    ]),
    25,
    75
  );

  // Language Skills Table
  const langSkillsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnSpan: 3,
            shading: { fill: SHADING_HEADER, type: ShadingType.CLEAR },
            borders: {
              top: BORDER_BLACK,
              bottom: BORDER_BLACK,
              left: BORDER_BLACK,
              right: BORDER_BLACK,
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: "Language Skills",
                    bold: true,
                    font: FONT_NAME,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "Language", bold: true, font: FONT_NAME, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "Writing /Reading", bold: true, font: FONT_NAME, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "Spoken", bold: true, font: FONT_NAME, size: 20 })],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bengali", font: FONT_NAME, size: 20 })] })],
          }),
          new TableCell({
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Excellent", font: FONT_NAME, size: 20 })] })],
          }),
          new TableCell({
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Excellent", font: FONT_NAME, size: 20 })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "English", font: FONT_NAME, size: 20 })] })],
          }),
          new TableCell({
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Good", font: FONT_NAME, size: 20 })] })],
          }),
          new TableCell({
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Good", font: FONT_NAME, size: 20 })] })],
          }),
        ],
      }),
    ],
  });

  // Interested Box
  const interestedTable = createBoxedRow(
    "Interested",
    [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: ` ${pd?.interests || "I have interested about sports, film, traveling, reading & the story etc."}`,
            bold: true,
            font: FONT_NAME,
            size: 20,
          }),
        ],
      }),
    ],
    25,
    75
  );

  // Hobby Box
  const hobbyTable = createBoxedRow(
    "Hobby",
    [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: ` ${pd?.hobby || "Reading Books and News Paper."}`,
            bold: true,
            font: FONT_NAME,
            size: 20,
          }),
        ],
      }),
    ],
    25,
    75
  );

  // Declaration Box
  const declarationTable = createBoxedRow(
    "Declaration",
    [
      new Paragraph({
        spacing: { before: 60, after: 60 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: ` ${pd?.declaration || "I, Undersigned certify that to the best of my knowledge and belief this resume correctly describes my qualifications and me. Any willful misstatement described herein may lead to my disqualification or dismissal, if employed."}`,
            bold: true,
            font: FONT_NAME,
            size: 20,
          }),
        ],
      }),
    ],
    25,
    75
  );

  // Signature and Date Box
  const signatureTable = new Table({
    width: { size: 65, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: "Signature", bold: true, font: FONT_NAME, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Md. Rafiul Islam",
                    font: FONT_NAME,
                    italics: true,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: "Date", bold: true, font: FONT_NAME, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: { top: BORDER_BLACK, bottom: BORDER_BLACK, left: BORDER_BLACK, right: BORDER_BLACK },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: new Date().toLocaleDateString("en-GB"),
                    font: FONT_NAME,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const spacingPara = () => new Paragraph({ spacing: { after: 120 }, children: [] });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          headerTable,
          spacingPara(),
          objectivesTable,
          spacingPara(),
          eduHeaderTable,
          hscTable,
          sscTable,
          spacingPara(),
          personalInfoTable,
          spacingPara(),
          permanentAddressTable,
          spacingPara(),
          presentAddressTable,
          spacingPara(),
          langSkillsTable,
          spacingPara(),
          interestedTable,
          spacingPara(),
          hobbyTable,
          spacingPara(),
          declarationTable,
          spacingPara(),
          signatureTable,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

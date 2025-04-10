// import type { Metadata } from "next";
// import { db } from "@/lib/db";
// import VCardClientPage from "./VCardClientPage";

// interface PageProps {
//   params: {
//     id: string;
//   };
// }

// export async function generateMetadata({
//   params,
// }: PageProps): Promise<Metadata> {
//   const { id } = await params;

//   try {
//     //! First, try to find by publicId
//     let vcard = null;
//     const publicLink = await db.vCardPublic.findUnique({
//       where: {
//         publicId: id,
//       },
//       include: {
//         vCard: true,
//       },
//     });

//     if (publicLink) {
//       vcard = publicLink.vCard;
//     } else {
//       //todo: If not found by publicId, try to find by ID
//       vcard = await db.vCard.findUnique({
//         where: {
//           id: id,
//         },
//       });
//     }

//     if (!vcard) {
//       return {
//         title: "vCard Not Found",
//         description: "The requested vCard could not be found.",
//       };
//     }

//     return {
//       title: `${vcard.name} | Digital Business Card`,
//       description: vcard.bio || `Digital business card for ${vcard.name}`,
//       openGraph: {
//         title: `${vcard.name} | Digital Business Card`,
//         description: vcard.bio || `Digital business card for ${vcard.name}`,
//         type: "profile",
//         ...(vcard.profileImageUrl && { images: [vcard.profileImageUrl] }),
//       },
//     };
//   } catch (error) {
//     console.error("Error generating metadata:", error);
//     return {
//       title: "Digital Business Card",
//       description: "View digital business card",
//     };
//   }
// }

// export default async function VCardPage({ params }: PageProps) {
//   const { id } = await params;

//   try {
//     console.log("VCardPage: Looking up vCard with ID/publicId:", id);

//     // First, check all public links in the database to help with debugging
//     const allPublicLinks = await db.vCardPublic.findMany({
//       take: 10,
//       select: {
//         publicId: true,
//         vCardId: true,
//       },
//     });

//     console.log("Available public links:", allPublicLinks);

//     // First, try to find by publicId
//     let vcard = null;
//     let vcardId = id;

//     const publicLink = await db.vCardPublic.findUnique({
//       where: {
//         publicId: id,
//       },
//       include: {
//         vCard: {
//           include: {
//             socialLinks: true,
//           },
//         },
//       },
//     });

//     if (publicLink && publicLink.vCard) {
//       console.log("Found vCard via publicId:", publicLink.vCard.id);
//       vcard = publicLink.vCard;
//       vcardId = publicLink.vCard.id;
//     } else {
//       // If not found by publicId, try to find by ID
//       console.log("Not found by publicId, trying direct ID lookup");
//       vcard = await db.vCard.findUnique({
//         where: {
//           id: id,
//         },
//         include: {
//           socialLinks: true,
//         },
//       });

//       if (vcard) {
//         console.log("Found vCard via direct ID:", vcard.id);
//       }
//     }

//     if (!vcard) {
//       console.log("vCard not found with ID or publicId:", id);
//       // Try to list some vCards to help debugging
//       const sampleVCards = await db.vCard.findMany({
//         take: 5,
//         select: { id: true, name: true },
//       });
//       console.log("Sample vCards in database:", sampleVCards);

//       return (
//         <div className="flex h-screen items-center justify-center p-4">
//           <div className="text-center max-w-md">
//             <h1 className="text-2xl font-bold text-red-600 mb-2">
//               vCard Not Found
//             </h1>
//             <p>The requested vCard could not be found or has been deleted.</p>
//             <div className="mt-4 text-sm">
//               <p>Debug Info:</p>
//               <p>Requested ID: {id}</p>
//               <p>Available vCards: {sampleVCards.length}</p>
//               <p>Available public links: {allPublicLinks.length}</p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     // Log scan
//     try {
//       await db.scanLog.create({
//         data: {
//           vCardId: vcardId,
//           scanType: "QR",
//           deviceType: "Unknown", // This would be determined client-side
//         },
//       });
//     } catch (error) {
//       console.error("Error logging scan:", error);
//     }

//     return <VCardClientPage id={vcardId} />;
//   } catch (error) {
//     console.error("Error fetching vCard:", error);
//     return (
//       <div className="flex h-screen items-center justify-center p-4">
//         <div className="text-center max-w-md">
//           <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
//           <p>There was a problem loading this vCard. Please try again later.</p>
//           <p className="mt-4 text-sm text-gray-500">
//             Error details:{" "}
//             {error instanceof Error ? error.message : String(error)}
//           </p>
//         </div>
//       </div>
//     );
//   }
// }

import type { Metadata } from "next"
import { db } from "@/lib/db"
import VCardClientPage from "./VCardClientPage"

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  try {
    //! First, try to find by publicId
    let vcard = null
    const publicLink = await db.vCardPublic.findUnique({
      where: {
        publicId: id,
      },
      include: {
        vCard: true,
      },
    })

    if (publicLink) {
      vcard = publicLink.vCard
    } else {
      //todo: If not found by publicId, try to find by ID
      vcard = await db.vCard.findUnique({
        where: {
          id: id,
        },
      })
    }

    if (!vcard) {
      return {
        title: "vCard Not Found",
        description: "The requested vCard could not be found.",
      }
    }

    return {
      title: `${vcard.name} | Digital Business Card`,
      description: vcard.bio || `Digital business card for ${vcard.name}`,
      openGraph: {
        title: `${vcard.name} | Digital Business Card`,
        description: vcard.bio || `Digital business card for ${vcard.name}`,
        type: "profile",
        ...(vcard.profileImageUrl && { images: [vcard.profileImageUrl] }),
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Digital Business Card",
      description: "View digital business card",
    }
  }
}

export default async function VCardPage({ params }: PageProps) {
  const { id } = await params

  try {
    console.log("VCardPage: Looking up vCard with ID/publicId:", id)

    // First, check all public links in the database to help with debugging
    const allPublicLinks = await db.vCardPublic.findMany({
      take: 10,
      select: {
        publicId: true,
        vCardId: true,
      },
    })

    console.log("Available public links:", allPublicLinks)

    // First, try to find by publicId
    let vcard = null
    let vcardId = id
    let publicLink = null

    publicLink = await db.vCardPublic.findUnique({
      where: {
        publicId: id,
      },
      include: {
        vCard: {
          include: {
            socialLinks: true,
          },
        },
      },
    })

    if (publicLink && publicLink.vCard) {
      console.log("Found vCard via publicId:", publicLink.vCard.id)
      vcard = publicLink.vCard
      vcardId = publicLink.vCard.id
    } else {
      // If not found by publicId, try to find by ID
      console.log("Not found by publicId, trying direct ID lookup")
      vcard = await db.vCard.findUnique({
        where: {
          id: id,
        },
        include: {
          socialLinks: true,
        },
      })

      if (vcard) {
        console.log("Found vCard via direct ID:", vcard.id)
      }
    }

    if (!vcard) {
      console.log("vCard not found with ID or publicId:", id)
      // Try to list some vCards to help debugging
      const sampleVCards = await db.vCard.findMany({
        take: 5,
        select: { id: true, name: true },
      })
      console.log("Sample vCards in database:", sampleVCards)

      return (
        <div className="flex h-screen items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-2">vCard Not Found</h1>
            <p>The requested vCard could not be found or has been deleted.</p>
            <div className="mt-4 text-sm">
              <p>Debug Info:</p>
              <p>Requested ID: {id}</p>
              <p>Available vCards: {sampleVCards.length}</p>
              <p>Available public links: {allPublicLinks.length}</p>
            </div>
          </div>
        </div>
      )
    }

    // Log scan
    try {
      await db.scanLog.create({
        data: {
          vCardId: vcardId,
          scanType: "QR",
          deviceType: "Unknown", // This would be determined client-side
        },
      })
    } catch (error) {
      console.error("Error logging scan:", error)
    }

    // Pass both the ID and the public ID to the client component
    return <VCardClientPage id={vcardId} publicId={publicLink?.publicId || null} />
  } catch (error) {
    console.error("Error fetching vCard:", error)
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p>There was a problem loading this vCard. Please try again later.</p>
          <p className="mt-4 text-sm text-gray-500">
            Error details: {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    )
  }
}

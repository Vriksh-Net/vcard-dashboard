"use client";

import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
  Download,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  vCardId: string;
}

interface VCard {
  id: string;
  name: string;
  email: string;
  phone: string;
  website?: string | null;
  company?: string | null;
  position?: string | null;
  address?: string | null;
  bio?: string | null;
  enableNFC: boolean;
  template: string;
  primaryColor: string;
  profileImageUrl?: string | null;
  socialLinks: SocialLink[];
}

interface DebugInfo {
  requestedId: string;
  sampleIds?: string[];
  error?: string;
  message?: string;
}

export default function VCardClientPage({ id }: { id: string }) {
  const [vCard, setVCard] = useState<VCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchVCard = async () => {
      try {
        setLoading(true);
        console.log("Fetching vCard with ID:", id);

        // Fetch vCard data from the API
        const response = await fetch(`/api/vcards/${id}`);

        if (!response.ok) {
          console.error(
            "API response not OK:",
            response.status,
            response.statusText
          );
          // Try to parse error response for better debugging
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            console.error("API Error Response:", errorData);
            setDebugInfo({
              requestedId: id,
              sampleIds: errorData.sampleIds,
              error: errorData.error,
              message: errorData.message,
            });
          } catch (e) {
            console.error(`API Error (${response.status}):`, errorText);
          }
          throw new Error(`Failed to fetch vCard data: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched vCard data:", JSON.stringify(data, null, 2));

        // Ensure socialLinks is always an array
        if (!data.socialLinks) {
          console.warn(
            "No socialLinks property found in response, initializing empty array"
          );
          data.socialLinks = [];
        } else if (!Array.isArray(data.socialLinks)) {
          console.warn(
            "socialLinks is not an array, converting to array:",
            data.socialLinks
          );
          // If socialLinks is not an array, convert it to an array
          const links = [];
          if (
            typeof data.socialLinks === "object" &&
            data.socialLinks !== null
          ) {
            for (const [platform, url] of Object.entries(data.socialLinks)) {
              if (url && typeof url === "string" && url.trim() !== "") {
                links.push({
                  platform,
                  url,
                  id: `temp-${platform}`,
                  vCardId: data.id,
                });
              }
            }
          }
          data.socialLinks = links;
        }

        console.log("Social links processed:", data.socialLinks.length);
        data.socialLinks.forEach(
          (link: { platform: any; url: any }, index: number) => {
            console.log(
              `Social link ${index + 1}: ${link.platform} - ${link.url}`
            );
          }
        );

        setVCard(data);
      } catch (error) {
        console.error("Error fetching vCard:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load vCard data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVCard();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading vCard...</p>
        </div>
      </div>
    );
  }

  if (error || !vCard) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p>{error || "vCard not found"}</p>

          {debugInfo && (
            <div className="mt-4">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-blue-600 underline"
              >
                {showDebug ? "Hide Debug Info" : "Show Debug Info"}
              </button>

              {showDebug && (
                <div className="mt-2 text-left bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                  <h3 className="font-bold">Debug Information:</h3>
                  <p>Requested ID: {debugInfo.requestedId}</p>

                  {debugInfo.error && (
                    <p className="text-red-500">Error: {debugInfo.error}</p>
                  )}

                  {debugInfo.message && <p>Message: {debugInfo.message}</p>}

                  {debugInfo.sampleIds && debugInfo.sampleIds.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">
                        Available vCard IDs in database:
                      </p>
                      <ul className="list-disc pl-5">
                        {debugInfo.sampleIds.map((id, index) => (
                          <li key={index} className="break-all">
                            <a
                              href={`/vcard/${id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {id}
                            </a>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm">
                        Click on an ID above to try viewing that vCard instead.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Function to generate vCard file content
  const generateVCardFile = () => {
    let vcardContent = `BEGIN:VCARD
    VERSION:3.0
    FN:${vCard.name}
    N:${vCard.name};;;
    ORG:${vCard.company || ""}
    TITLE:${vCard.position || ""}
    TEL;TYPE=WORK,VOICE:${vCard.phone}
    EMAIL;TYPE=WORK:${vCard.email}
    URL:${vCard.website || ""}
    ADR;TYPE=WORK:;;${vCard.address || ""};;;
    NOTE:${vCard.bio || ""}
`;

    // Add social media URLs as URLs with labels
    if (vCard.socialLinks && vCard.socialLinks.length > 0) {
      vCard.socialLinks.forEach((link) => {
        vcardContent += `URL;TYPE=${link.platform.toUpperCase()}:${link.url}\n`;
      });
    }

    vcardContent += "END:VCARD";
    return vcardContent;
  };

  // Function to download vCard
  const downloadVCard = () => {
    const vcardContent = generateVCardFile();
    const blob = new Blob([vcardContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${vCard.name.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function to get social icon
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-6 w-6 " />;
      case "twitter":
        return <Twitter className="h-6 w-6" />;
      case "instagram":
        return <Instagram className="h-6 w-6" />;
      case "linkedin":
        return <Linkedin className="h-6 w-6" />;
      case "youtube":
        return <Youtube className="h-6 w-6" />;
      default:
        return <Globe className="h-6 w-6" />;
    }
  };

  //! Set primary color from vCard or default to green
  const primaryColor = vCard.primaryColor || "#2B7A0B";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top curved design */}
      <div className="relative">
        <svg viewBox="0 0 1440 200" className="w-full">
          <path
            fill={primaryColor}
            d="M0,160L80,144C160,128,320,96,480,96C640,96,800,128,960,138.7C1120,149,1280,139,1360,133.3L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* Profile section */}
      <div className="flex flex-col items-center -mt-16 z-10 px-4">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
          {vCard.profileImageUrl ? (
            <img
              src={vCard.profileImageUrl || "/placeholder.svg"}
              alt={vCard.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {vCard.name.charAt(0)}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-center">{vCard.name}</h1>
        {vCard.position && (
          <p className="text-gray-600 text-center">{vCard.position}</p>
        )}
        {vCard.company && (
          <p className="text-gray-600 text-center">{vCard.company}</p>
        )}
      </div>

      {/* Contact buttons */}
      <div className="px-4 mt-6 space-y-2">
        <a href={`tel:${vCard.phone}`} className="block">
          <Button
            className="w-full py-6 text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Phone className="h-5 w-5" />
            <span>Phone (Work)</span>
          </Button>
        </a>
        <a href={`mailto:${vCard.email}`} className="block">
          <Button
            className="w-full py-6 text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Mail className="h-5 w-5" />
            <span>Email</span>
          </Button>
        </a>
        {vCard.website && (
          <a
            href={vCard.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              className="w-full py-6 text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Globe className="h-5 w-5" />
              <span>Website</span>
            </Button>
          </a>
        )}
      </div>

      {/* Contact details */}
      <div className="px-4 mt-8 space-y-6">
        <div className="flex items-start gap-3 border-b pb-4">
          <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <a href={`tel:${vCard.phone}`} className="text-gray-800">
              {vCard.phone}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3 border-b pb-4">
          <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <a
              href={`mailto:${vCard.email}`}
              className="text-gray-800 break-all"
            >
              {vCard.email}
            </a>
          </div>
        </div>

        {vCard.position && vCard.company && (
          <div className="flex items-start gap-3 border-b pb-4">
            <div className="h-5 w-5 text-gray-500 mt-0.5 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Position</p>
              <p className="text-gray-800">{vCard.position}</p>
              <p className="text-gray-800">{vCard.company}</p>
            </div>
          </div>
        )}

        {vCard.address && (
          <div className="flex items-start gap-3 border-b pb-4">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-gray-800">{vCard.address}</p>
            </div>
          </div>
        )}

        {vCard.website && (
          <div className="flex items-start gap-3 border-b pb-4">
            <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <a
                href={vCard.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 break-all"
              >
                {vCard.website}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Social Media */}
      {vCard.socialLinks && vCard.socialLinks.length > 0 ? (
        <div className="px-4 mt-8">
          <h2 className="text-center text-gray-500 mb-4">Social Media</h2>
          <div className="flex justify-center gap-4">
            {vCard.socialLinks.map((link, index) => (
              <a
                key={link.id || `link-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {getSocialIcon(link.platform)}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 mt-8 text-center text-gray-500">
          <p>No social media links available</p>
        </div>
      )}

      {/* Download vCard button */}
      <div className="px-4 mt-8 mb-8">
        <Button
          onClick={downloadVCard}
          className="w-full py-6 text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          <Download className="h-5 w-5" />
          <span>Download vCard</span>
        </Button>
      </div>
    </div>
  );
}

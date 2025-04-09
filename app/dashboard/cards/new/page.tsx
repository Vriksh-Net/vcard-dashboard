"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  Check,
  Copy,
  LinkIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "../../../hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Template designs
const templates = [
  {
    id: "template1",
    name: "Classic Green",
    previewImage: "/templates/template1.png",
    primaryColor: "#2B7A0B",
    layout: "vertical",
  },
  {
    id: "template2",
    name: "Curved Blue",
    previewImage: "/templates/template2.png",
    primaryColor: "#4285F4",
    layout: "curved",
  },
  {
    id: "template3",
    name: "Centered White",
    previewImage: "/templates/template3.png",
    primaryColor: "#4285F4",
    layout: "centered",
  },
  {
    id: "template4",
    name: "Modern Blue",
    previewImage: "/templates/template4.png",
    primaryColor: "#4285F4",
    layout: "modern",
  },
  {
    id: "template5",
    name: "Clean White",
    previewImage: "/templates/template5.png",
    primaryColor: "#4285F4",
    layout: "clean",
  },
];

export default function NewCardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [vCardCreated, setVCardCreated] = useState(false);
  const [vCardLink, setVCardLink] = useState("");
  const [vCardData, setVCardData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    company: "",
    position: "",
    address: "",
    bio: "",
    enableNFC: false,
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      youtube: "",
    },
    template: templates[0].id,
    primaryColor: templates[0].primaryColor,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, enableNFC: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      //! For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      toast({
        title: "Profile Image Uploaded",
        description: "Your profile image has been successfully uploaded.",
        style: { backgroundColor: "green", color: "white" },
        className: "bg-green-500 text-white",
      });
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData((prev) => ({
        ...prev,
        template: templateId,
        primaryColor: template.primaryColor,
      }));

      //! Find the index of the selected template
      const index = templates.findIndex((t) => t.id === templateId);
      setCurrentTemplateIndex(index);
    }
  };

  const handleNextTemplate = () => {
    const nextIndex = (currentTemplateIndex + 1) % templates.length;
    setCurrentTemplateIndex(nextIndex);
    handleTemplateChange(templates[nextIndex].id);
  };

  const handlePrevTemplate = () => {
    const prevIndex =
      (currentTemplateIndex - 1 + templates.length) % templates.length;
    setCurrentTemplateIndex(prevIndex);
    handleTemplateChange(templates[prevIndex].id);
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(vCardLink)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link Copied",
          description: "The vCard link has been copied to your clipboard.",
          style: { backgroundColor: "green", color: "white" },
          className: "bg-green-500 text-white",
        });
        setTimeout(() => {
          setCopied(false);
        }, 2000); //! Reset copied state after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        toast({
          title: "Error",
          description: "Failed to copy the vCard link.",
          className: "bg-red-500 text-white",
        });
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setDebugInfo(null);

    try {
      //todo Convert socialLinks from object to array format
      const socialLinksArray = [];

      //todo Process each social link and only include non-empty ones
      for (const [platform, url] of Object.entries(formData.socialLinks)) {
        if (url && typeof url === "string" && url.trim() !== "") {
          socialLinksArray.push({
            platform,
            url: url.trim(),
          });
        }
      }

      console.log(
        "Social links to be submitted:",
        JSON.stringify(socialLinksArray, null, 2)
      );

      //todo Make sure we're sending the array format, not the object format
      const payload = {
        ...formData,
        profileImageUrl: profileImage,
        socialLinks: socialLinksArray, //! Ensure we're sending the array format
      };

      console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      //todo Use the correct API endpoint
      const response = await fetch("/api/vcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${
              errorData.error || errorData.details || "Unknown error"
            }`
          );
        } catch (e) {
          throw new Error(
            `HTTP error! status: ${response.status}, response: ${errorText}`
          );
        }
      }

      const data = await response.json();
      console.log("vCard creation response:", JSON.stringify(data, null, 2));

      // Verify social links were returned
      if (data.socialLinks) {
        console.log(
          "Social links in response:",
          JSON.stringify(data.socialLinks, null, 2)
        );
      } else {
        console.warn("No social links in response!");
      }

      // Save the vCard data
      setVCardData(data);
      setDebugInfo(data);

      // Generate the vCard link with the publicId from the response
      let newVCardLink = "";
      if (data.publicId) {
        console.log("Using publicId for link:", data.publicId);
        newVCardLink = `${window.location.origin}/vcard/${data.publicId}`;
        setVCardLink(newVCardLink);
      } else {
        console.log("No publicId found, using direct ID:", data.id);
        newVCardLink = `${window.location.origin}/vcard/${data.id}`;
        setVCardLink(newVCardLink);
      }

      setVCardCreated(true);

      // Success toast
      toast({
        title: "vCard Created",
        description: (
          <div>
            <p>Your vCard has been successfully created.</p>
            <p className="mt-2">
              <strong>vCard Link:</strong>{" "}
              <a
                href={newVCardLink}
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {newVCardLink}
              </a>
            </p>
            <p className="mt-2 text-sm">Use this link with your NFC tool.</p>
          </div>
        ),
        style: { backgroundColor: "green", color: "white" },
        className: "bg-green-500 text-white",
        duration: 10000, // Show for 10 seconds due to the link
      });
    } catch (error) {
      console.error("Error creating vCard:", error);
      const errorAsError = error as Error;
      setError(
        errorAsError.message ||
          "There was a problem creating your vCard. Please try again."
      );
      toast({
        title: "Error Creating vCard",
        description:
          errorAsError.message ||
          "There was a problem creating your vCard. Please try again.",
        style: { backgroundColor: "red", color: "white" },
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  //! Function to test the vCard link
  const testVCardLink = async () => {
    if (!vCardLink) return;

    try {
      const response = await fetch(
        vCardLink.replace(window.location.origin, "")
      );
      const status = response.status;

      if (response.ok) {
        toast({
          title: "Link Test Successful",
          description: "Your vCard link is working correctly!",
          style: { backgroundColor: "green", color: "white" },
          className: "bg-green-500 text-white",
        });
      } else {
        toast({
          title: "Link Test Failed",
          description: `Error ${status}: The vCard link is not working correctly.`,
          style: { backgroundColor: "red", color: "white" },
          className: "bg-red-500 text-white",
        });
      }
    } catch (error) {
      console.error("Error testing vCard link:", error);
      toast({
        title: "Link Test Failed",
        description: "Could not test the vCard link. Please try again.",
        style: { backgroundColor: "red", color: "white" },
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cards">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New vCard
          </h1>
          <p className="text-muted-foreground">
            Add contact information to create a new digital vCard
          </p>
        </div>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200 text-red-900">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {vCardCreated && (
        <Alert className="bg-green-50 border-green-200 text-green-900">
          <LinkIcon className="h-4 w-4" />
          <AlertTitle>vCard Created Successfully</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              Your vCard has been created and is ready to be shared or
              programmed to an NFC card.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Input value={vCardLink} readOnly className="flex-1" />
              <Button size="sm" onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
              </Button>
              <Button size="sm" variant="outline" onClick={testVCardLink}>
                Test Link
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/cards")}
              >
                View All vCards
              </Button>
              {vCardData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard/cards/${vCardData.id}/nfc`)
                  }
                >
                  Configure NFC
                </Button>
              )}
            </div>
            {debugInfo && (
              <div className="mt-4 text-xs bg-gray-50 p-2 rounded">
                <p className="font-semibold">Debug Info:</p>
                <p>vCard ID: {debugInfo.id}</p>
                <p>Public ID: {debugInfo.publicId || "Not available"}</p>
                <p>Social Links: {debugInfo.socialLinks?.length || 0}</p>
                {debugInfo.socialLinks && debugInfo.socialLinks.length > 0 && (
                  <div>
                    <p>Social Links Details:</p>
                    <ul className="pl-4 list-disc">
                      {debugInfo.socialLinks.map((link: any, index: number) => (
                        <li key={index}>
                          {link.platform}: {link.url}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="work">Work Details</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit}>
              <TabsContent value="template" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Choose a Template Design
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select a template design for your vCard. This will determine
                    how your vCard appears when shared.
                  </p>

                  <div className="relative mt-6 overflow-hidden rounded-lg border">
                    <div className="flex items-center justify-center p-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 z-10 h-8 w-8 rounded-full bg-background/80"
                        onClick={handlePrevTemplate}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="relative h-[400px] w-full max-w-[250px] overflow-hidden rounded-lg border">
                        <img
                          src={`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-27%20103835-hHYQ5gPvz7mBv5qBUciWE8vWxyyqqm.png`}
                          alt={`Template ${currentTemplateIndex + 1}`}
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{
                            objectPosition: `${-currentTemplateIndex * 20}% 0`,
                          }}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 z-10 h-8 w-8 rounded-full bg-background/80"
                        onClick={handleNextTemplate}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-center p-4">
                      <div className="flex space-x-2">
                        {templates.map((template, index) => (
                          <button
                            key={template.id}
                            type="button"
                            className={`h-2.5 w-2.5 rounded-full ${
                              currentTemplateIndex === index
                                ? "bg-primary"
                                : "bg-gray-300"
                            }`}
                            onClick={() => {
                              setCurrentTemplateIndex(index);
                              handleTemplateChange(template.id);
                            }}
                            aria-label={`Select template ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Template Name</Label>
                    <p className="text-sm font-medium">
                      {templates[currentTemplateIndex].name}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage || ""} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      {formData.name
                        ? formData.name.charAt(0).toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid w-full gap-2">
                    <Label htmlFor="profile-image">Profile Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                      <Button type="button" size="icon" variant="outline">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="A short description about yourself"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </TabsContent>
              <TabsContent value="work" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Acme Inc"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="CEO"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="123 Main St, City, State, ZIP"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </TabsContent>
              <TabsContent value="social" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.socialLinks.linkedin}
                    onChange={handleSocialChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    placeholder="https://twitter.com/username"
                    value={formData.socialLinks.twitter}
                    onChange={handleSocialChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    placeholder="https://facebook.com/username"
                    value={formData.socialLinks.facebook}
                    onChange={handleSocialChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder="https://instagram.com/username"
                    value={formData.socialLinks.instagram}
                    onChange={handleSocialChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    name="youtube"
                    placeholder="https://youtube.com/c/username"
                    value={formData.socialLinks.youtube}
                    onChange={handleSocialChange}
                  />
                </div>
              </TabsContent>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="nfc-toggle">Enable NFC</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow this vCard to be programmed to NFC cards for tap
                    sharing
                  </p>
                </div>
                <Switch
                  id="nfc-toggle"
                  checked={formData.enableNFC}
                  onCheckedChange={handleSwitchChange}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save vCard"}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">vCard Preview</h2>
                <p className="text-sm text-muted-foreground">
                  This is how your vCard will appear when shared
                </p>
              </div>
              <div className="mt-6 rounded-lg border p-4">
                {formData.name ? (
                  <div className="relative h-[400px] w-full max-w-[250px] mx-auto overflow-hidden rounded-lg border">
                    <div
                      className="absolute inset-0 flex flex-col"
                      style={{
                        backgroundColor: "#ffffff",
                      }}
                    >
                      {/*//! Top curved design */}
                      <div className="relative h-24 w-full">
                        <svg
                          viewBox="0 0 1440 200"
                          className="absolute top-0 left-0 w-full"
                        >
                          <path
                            fill={formData.primaryColor}
                            d="M0,160L80,144C160,128,320,96,480,96C640,96,800,128,960,138.7C1120,149,1280,139,1360,133.3L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
                          ></path>
                        </svg>
                      </div>

                      {/*//! Profile section */}
                      <div className="flex flex-col items-center -mt-8 z-10 px-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg mb-2">
                          {profileImage ? (
                            <img
                              src={profileImage || "/placeholder.svg"}
                              alt={formData.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                              style={{ backgroundColor: formData.primaryColor }}
                            >
                              {formData.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-center">
                          {formData.name}
                        </h3>
                        {formData.position && (
                          <p className="text-xs text-gray-600 text-center">
                            {formData.position}
                          </p>
                        )}
                        {formData.company && (
                          <p className="text-xs text-gray-600 text-center">
                            {formData.company}
                          </p>
                        )}
                      </div>

                      {/*//! Contact buttons */}
                      <div className="px-4 mt-2 space-y-1">
                        <div
                          className="w-full py-1 text-white text-xs flex items-center justify-center gap-1 rounded"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          <span>Phone (Work)</span>
                        </div>
                        <div
                          className="w-full py-1 text-white text-xs flex items-center justify-center gap-1 rounded"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          <span>Email</span>
                        </div>
                        {formData.website && (
                          <div
                            className="w-full py-1 text-white text-xs flex items-center justify-center gap-1 rounded"
                            style={{ backgroundColor: formData.primaryColor }}
                          >
                            <span>Website</span>
                          </div>
                        )}
                      </div>

                      {/*//! Contact details */}
                      <div className="px-4 mt-4 space-y-2 text-xs">
                        <div className="flex items-start gap-1 border-b pb-1">
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-gray-800">
                              {formData.phone || "Your phone number"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-1 border-b pb-1">
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-gray-800 break-all">
                              {formData.email || "Your email"}
                            </p>
                          </div>
                        </div>

                        {(formData.position || formData.company) && (
                          <div className="flex items-start gap-1 border-b pb-1">
                            <div>
                              <p className="text-xs text-gray-500">Position</p>
                              <p className="text-gray-800">
                                {formData.position || "Your position"}
                              </p>
                              <p className="text-gray-800">
                                {formData.company || "Your company"}
                              </p>
                            </div>
                          </div>
                        )}

                        {formData.address && (
                          <div className="flex items-start gap-1 border-b pb-1">
                            <div>
                              <p className="text-xs text-gray-500">Address</p>
                              <p className="text-gray-800">
                                {formData.address}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/*//! Social Media */}
                      {Object.values(formData.socialLinks).some(
                        (link) => link.trim() !== ""
                      ) && (
                        <div className="px-4 mt-4">
                          <h2 className="text-center text-xs text-gray-500 mb-2">
                            Social Media
                          </h2>
                          <div className="flex justify-center gap-2">
                            {Object.entries(formData.socialLinks).map(
                              ([platform, url]) => {
                                if (url.trim() === "") return null;
                                return (
                                  <div
                                    key={platform}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                                    style={{
                                      backgroundColor: formData.primaryColor,
                                    }}
                                  >
                                    <span className="text-[8px]">
                                      {platform.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                      {/*//! Download vCard button */}
                      <div className="px-4 mt-auto mb-4">
                        <div
                          className="w-full py-1 text-white text-xs flex items-center justify-center gap-1 rounded"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          <span>Save vCard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-center">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Fill out the form to see a preview of your vCard
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "../../../../hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { use } from "react";

//! Sample data for demonstration
const sampleVCards = [
  {
    id: "1",
    name: "John Doe",
    email: "john@acme.com",
    phone: "+1 (555) 123-4567",
    website: "https://acme.com",
    company: "Acme Inc",
    position: "CEO",
    address: "123 Main St, San Francisco, CA 94105",
    bio: "Experienced executive with a passion for innovation and technology.",
    enableNFC: true,
    profileImage: null,
    socialLinks: {
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
      facebook: "https://facebook.com/johndoe",
      instagram: "https://instagram.com/johndoe",
    },
  },
  {
    id: "2",
    name: "Marketing Team",
    email: "marketing@acme.com",
    phone: "+1 (555) 987-6543",
    website: "https://acme.com/marketing",
    company: "Acme Inc",
    position: "Department",
    address: "123 Main St, San Francisco, CA 94105",
    bio: "Creative marketing team focused on growth and brand awareness.",
    enableNFC: true,
    profileImage: null,
    socialLinks: {
      linkedin: "https://linkedin.com/company/acme",
      twitter: "https://twitter.com/acmemarketing",
      facebook: "https://facebook.com/acmemarketing",
      instagram: "https://instagram.com/acmemarketing",
    },
  },
];

export default function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  //? Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
    },
  });

  //todo Load vCard data
  useEffect(() => {
    const vCard = sampleVCards.find((card) => card.id === id);

    if (vCard) {
      setFormData({
        name: vCard.name,
        email: vCard.email,
        phone: vCard.phone,
        website: vCard.website || "",
        company: vCard.company || "",
        position: vCard.position || "",
        address: vCard.address || "",
        bio: vCard.bio || "",
        enableNFC: vCard.enableNFC,
        socialLinks: vCard.socialLinks,
      });

      if (vCard.profileImage) {
        setProfileImage(vCard.profileImage);
      }
    }
  }, [id]);

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
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      toast({
        title: "Profile Image Updated",
        description: "Your profile image has been successfully updated.",
        variant: "success",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      //? Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      //! Success toast
      toast({
        title: "vCard Updated",
        description: "Your vCard has been successfully updated.",
        variant: "success",
      });

      //todo Redirect to card detail
      router.push(`/dashboard/cards/${id}`);
    } catch (error) {
      //! Error toast
      toast({
        title: "Error Updating vCard",
        description:
          "There was a problem updating your vCard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/cards/${id}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit vCard</h1>
          <p className="text-muted-foreground">
            Update contact information for this vCard
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="work">Work Details</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit}>
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
                  {isSubmitting ? "Saving..." : "Save Changes"}
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
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img
                          src={profileImage || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-semibold text-primary">
                          {formData.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{formData.name}</h3>
                      {formData.position && formData.company && (
                        <p className="text-sm text-muted-foreground">
                          {formData.position} at {formData.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Email:</span>
                        <span>{formData.email}</span>
                      </div>
                    )}
                    {formData.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Phone:</span>
                        <span>{formData.phone}</span>
                      </div>
                    )}
                    {formData.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Website:</span>
                        <span>{formData.website}</span>
                      </div>
                    )}
                    {formData.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Address:</span>
                        <span>{formData.address}</span>
                      </div>
                    )}
                  </div>

                  {formData.bio && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Bio:</span>
                      <p className="text-sm">{formData.bio}</p>
                    </div>
                  )}

                  {(formData.socialLinks.linkedin ||
                    formData.socialLinks.twitter ||
                    formData.socialLinks.facebook ||
                    formData.socialLinks.instagram) && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Social:</span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(formData.socialLinks).map(
                          ([key, value]) =>
                            value && (
                              <div
                                key={key}
                                className="rounded-md bg-muted px-2 py-1 text-xs"
                              >
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}

                  {formData.enableNFC && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                        NFC Enabled
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

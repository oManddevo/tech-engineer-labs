import { Mail } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import site from "./site.json";

const { email, whatsapp, linkedin, github } = site.contact;

// Links for the hero sidebar and the contact section, built from site.json; empty fields are left out.
export const socialLinks = [
  { label: "Email", href: email && `mailto:${email}`, Icon: Mail },
  { label: "LinkedIn", href: linkedin, Icon: FaLinkedinIn, external: true },
  { label: "WhatsApp", href: whatsapp && `https://wa.me/${whatsapp.replace(/\D/g, "")}`, Icon: FaWhatsapp, external: true },
  { label: "GitHub", href: github, Icon: FaGithub, external: true },
].filter((link) => link.href);

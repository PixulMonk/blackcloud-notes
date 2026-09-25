import { useState } from "react";

import { axiosInstance } from "@/lib/axios";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import faqSections from "@/lib/support/faq";

const MAX_MESSAGE_LENGTH = 1500;

function SupportPage() {
  const [formState, setFormState] = useState({
    subject: "",
    message: "",
    honeypot: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const charCount = formState.message.length;
  const wordCount = formState.message.trim()
    ? formState.message.trim().split(/\s+/).length
    : 0;
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isOverLimit) return;

    setStatus("loading");

    try {
      const res = await axiosInstance.post("/support/submit", {
        subject: formState.subject,
        message: formState.message,
        honeypot: formState.honeypot,
      });

      if (!res.data?.success) throw new Error("Request failed");

      setStatus("success");
      setFormState({ subject: "", message: "", honeypot: "" });
    } catch (error) {
      console.error("Support submission failed:", error);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto py-8">
      <h1 className="text-lg font-semibold mb-1">Help & Support</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Answers to common questions, or reach out below.
      </p>

      <div className="flex flex-col gap-8 mb-12">
        {faqSections.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {section.category}
            </h2>
            <Accordion type="single" collapsible>
              {section.items.map((item, i) => (
                <AccordionItem key={i} value={`${section.category}-${i}`}>
                  <AccordionTrigger className="text-sm text-left">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="text-sm font-semibold mb-1">Still need help?</h2>
        <p className="text-xs text-muted-foreground mb-6">
          Send us a message and we'll get back to you.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="website"
            value={formState.honeypot}
            onChange={(e) =>
              setFormState({ ...formState, honeypot: e.target.value })
            }
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div>
            <Label htmlFor="contact-subject">Subject</Label>
            <Input
              id="contact-subject"
              className="mt-1.5"
              value={formState.subject}
              onChange={(e) =>
                setFormState({ ...formState, subject: e.target.value })
              }
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="contact-message">Message</Label>
              <span
                className={`text-xs ${
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {wordCount} words · {charCount}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <Textarea
              id="contact-message"
              rows={5}
              value={formState.message}
              onChange={(e) =>
                setFormState({ ...formState, message: e.target.value })
              }
              required
            />
          </div>

          <Button
            type="submit"
            className="self-start"
            disabled={status === "loading" || isOverLimit}
          >
            {status === "loading" ? "Sending..." : "Send message"}
          </Button>

          {status === "success" && (
            <p className="text-xs text-emerald-600">
              Message sent — we'll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-destructive">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default SupportPage;
